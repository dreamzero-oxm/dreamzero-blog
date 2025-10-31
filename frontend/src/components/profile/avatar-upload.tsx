"use client";

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload as UploadIcon, Crop as CropIcon, Loader2 } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { validateImageFile } from '@/lib/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  username?: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatar, username, onAvatarChange }: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // 使用验证工具验证文件
      const validation = validateImageFile(file, 5 * 1024 * 1024);
      
      if (!validation.isValid) {
        const errorMessage = validation.errors.length > 0 ? validation.errors[0] : '\u6587\u4ef6\u9a8c\u8bc1\u5931\u8d25';
        setFileError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      setFileError('');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  const getCroppedImg = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!imgRef.current || !completedCrop) {
        resolve(new Blob());
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(new Blob());
        return;
      }

      // 设置裁剪后的图片尺寸
      const pixelRatio = window.devicePixelRatio || 1;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width * pixelRatio;
      canvas.height = completedCrop.height * pixelRatio;
      
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(new Blob());
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('\u8bf7\u5148\u9009\u62e9\u56fe\u7247');
      return;
    }

    setIsUploading(true);
    
    try {
      let fileToUpload: Blob = selectedFile;
      
      // \u5982\u679c\u7528\u6237\u8fdb\u884c\u4e86\u88c1\u526a\uff0c\u4f7f\u7528\u88c1\u526a\u540e\u7684\u56fe\u7247
      if (showCropper && completedCrop) {
        fileToUpload = await getCroppedImg();
      }
      
      const formData = new FormData();
      formData.append('avatar', fileToUpload, 'avatar.jpg');
      
      const response = await fetch('/api/v1/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '\u4e0a\u4f20\u5931\u8d25');
      }
      
      const data = await response.json();
      onAvatarChange(data.data.avatar_url);
      toast.success('\u5934\u50cf\u4e0a\u4f20\u6210\u529f');
      
      // \u91cd\u7f6e\u72b6\u6001
      setSelectedFile(null);
      setPreviewUrl('');
      setShowCropper(false);
      setCrop({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
      });
      setCompletedCrop(null);
    } catch (error) {
      console.error('\u4e0a\u4f20\u5934\u50cf\u5931\u8d25:', error);
      toast.error(error instanceof Error ? error.message : '\u4e0a\u4f20\u5934\u50cf\u5931\u8d25');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setShowCropper(false);
    setCrop({
      unit: '%',
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    });
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          \u5934\u50cf\u4e0a\u4f20
        </CardTitle>
        <CardDescription>
          \u4e0a\u4f20\u5e76\u88c1\u526a\u60a8\u7684\u4e2a\u4eba\u5934\u50cf
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={currentAvatar} alt={username} />
            <AvatarFallback className="text-lg">
              {username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {!showCropper ? (
          <div className="space-y-2">
            <Label htmlFor="avatar-upload">\u9009\u62e9\u56fe\u7247</Label>
            <div className={`border-2 ${fileError ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 ${fileError ? 'bg-red-50' : 'bg-gray-50'}`}>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="border-0 bg-transparent p-0"
              />
            </div>
            {fileError && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {fileError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={handleCropComplete}
                aspect={1}
                circularCrop
                keepSelection
              >
                <Image
                  ref={imgRef}
                  src={previewUrl}
                  alt="Preview"
                  width={256}
                  height={256}
                  className="max-h-64 object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </ReactCrop>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading || !completedCrop}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    \u4e0a\u4f20\u4e2d...
                  </>
                ) : (
                  <>
                    <CropIcon className="mr-2 h-4 w-4" />
                    \u88c1\u526a\u5e76\u4e0a\u4f20
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                \u53d6\u6d88
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}