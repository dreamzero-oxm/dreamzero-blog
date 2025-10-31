"use client";

// 第三方库导入
import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload as UploadIcon, Crop as CropIcon, Loader2, AlertCircle } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// 项目内部组件导入
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 工具函数/常量导入
import { validateImageFile } from '@/lib/validation';
import api from '@/lib/api';
import { post } from '@/utils/request';

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
        const errorMessage = validation.errors.length > 0 ? validation.errors[0] : '文件验证失败';
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
      toast.error('请先选择图片');
      return;
    }

    setIsUploading(true);
    
    try {
      let fileToUpload: Blob = selectedFile;
      
      // 如果用户进行了裁剪，使用裁剪后的图片
      if (showCropper && completedCrop) {
        fileToUpload = await getCroppedImg();
      }
      
      const formData = new FormData();
      formData.append('avatar', fileToUpload, 'avatar.jpg');
      
      // 使用 request.ts 中的 post 函数发送请求
      const data = await post(api.uploadAvatar, { body: formData });
      
      if (data.code === 200) {
        onAvatarChange(data.data.avatar_url);
        toast.success('头像上传成功');
        
        // 重置状态
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
      } else {
        throw new Error(data.msg || '上传失败');
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      toast.error(error instanceof Error ? error.message : '上传头像失败');
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
          头像上传
        </CardTitle>
        <CardDescription>
          上传并裁剪您的个人头像
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
            <Label htmlFor="avatar-upload">选择图片</Label>
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
                onChange={(c: Crop) => setCrop(c)}
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
                    上传中...
                  </>
                ) : (
                  <>
                    <CropIcon className="mr-2 h-4 w-4" />
                    裁剪并上传
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}