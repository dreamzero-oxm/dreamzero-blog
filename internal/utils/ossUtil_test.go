package utils

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"blog-server/internal/oss"
	"context"
	"fmt"
	"os"
	"testing"
)

func TestMakeBucket(t *testing.T) {
	// init logger
	logger.InitLogger()
	// 测试前准备：初始化配置和 minio 客户端
	if err := config.Init("../../config/config_original.yaml"); err!= nil {
		t.Fatalf("初始化配置文件失败: %v", err)
	}
	if err := oss.InitMinIO(config.Conf.Minio); err != nil {
		t.Fatalf("初始化 Minio 客户端失败: %v", err)
	}
	tests := []struct {
		name       string
		bucketName string
		wantErr    bool
	}{
		{
			name:       "创建新桶",
			bucketName: "test-bucket",
			wantErr:    false,
		},
		{
			name:       "创建已存在的桶",
			bucketName: "test-bucket",
			wantErr:    false,
		},
		{
			name:       "无效桶名称",
			bucketName: "",
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := MakeBucket(tt.bucketName)
			if (err != nil) != tt.wantErr {
				t.Errorf("MakeBucket() error = %v, wantErr %v", err, tt.wantErr)
			}else{
				t.Logf("MakeBucket() success")
			}
		})
	}

	// 测试后清理：删除测试用的桶
	ctx := context.Background()
	if err := oss.MINIMO_CLIENT.RemoveBucket(ctx, "test-bucket"); err != nil {
		t.Logf("清理测试桶失败: %v", err)
	}
}

func TestUploadFile(t *testing.T) {
	// init logger
	logger.InitLogger()
	// 测试前准备：初始化配置和 minio 客户端
	if err := config.Init("../../config/config_original.yaml"); err!= nil {
		t.Fatalf("初始化配置文件失败: %v", err)
	}
	if err := oss.InitMinIO(config.Conf.Minio); err!= nil {
		t.Fatalf("初始化 Minio 客户端失败: %v", err)
	}

	tests := []struct {
		name       string
		filePath string
		wantErr    bool
	}{
		{
			name:       "上传文件1",
			filePath: 	"../../test_files/test.png",
			wantErr:    false,
		},
	}

	// 测试前准备：创建测试用的桶
	if err := MakeBucket("test-bucket"); err!= nil {
		t.Fatalf("创建测试桶失败: %v", err)
	}

	contentType := "application/octet-stream"
	for i, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			file, err := os.Open(tt.filePath)
			if err!= nil {
				t.Fatalf("打开文件失败: %v", err)
			}
			defer file.Close()
			err = UploadFile("test-bucket", fmt.Sprintf("testfile-%v", i), file, contentType)
			if (err!= nil)!= tt.wantErr {
				t.Errorf("UploadFile() error = %v, wantErr %v", err, tt.wantErr)
			}else{
				t.Logf("UploadFile() success")
			}
		})
	}

	// 测试后清理：删除测试用的桶
	ctx := context.Background()
	if err := oss.MINIMO_CLIENT.RemoveBucket(ctx, "test-bucket"); err!= nil {
		t.Logf("清理测试桶失败: %v", err)
	}
}