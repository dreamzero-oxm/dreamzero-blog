package oss

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"context"
	"fmt"
	"os"
	"testing"
)

func preInit(t *testing.T) {
	// init logger
	logger.InitLogger()
	// 测试前准备：初始化配置和 minio 客户端
	if err := config.Init("../../config/config_original.yaml"); err != nil {
		t.Fatalf("初始化配置文件失败: %v", err)
	}
	if err := InitMinIO(config.Conf.Minio); err != nil {
		t.Fatalf("初始化 Minio 客户端失败: %v", err)
	}
}

func TestInitMinIO(t *testing.T) {
	// init logger
	logger.InitLogger()
	tests := []struct {
		name       string
		configPath string
		wantErr    bool
	}{
		{
			name:       "初始化成功",
			configPath: "../../config/config_original.yaml",
			wantErr:    false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := config.Init(tt.configPath); err != nil {
				t.Fatalf("初始化配置文件失败: %v", err)
			}
			if err := InitMinIO(config.Conf.Minio); err != nil {
				t.Errorf("InitMinIO() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("InitMinIO() success")
			}
		})
	}
}

func TestInitBucket(t *testing.T) {
	preInit(t)
	tests := []struct {
		name       string
		bucketName []string
		wantErr    bool
	}{
		{
			name:       "初始化成功",
			bucketName: []string{"test-bucket2", "test-bucket3"},
			wantErr:    false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := InitBucket(tt.bucketName); err != nil {
				t.Errorf("InitBucket() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("InitBucket() success")
			}
			// 测试后清理：删除测试用的桶
			ctx := context.Background()
			for _, bucketName := range tt.bucketName {
				if err := MINIMO_CLIENT.RemoveBucket(ctx, bucketName); err != nil {
					t.Logf("清理测试桶失败: %v", err)
				}
			}
		})
	}
}

func TestMakeBucket(t *testing.T) {
	preInit(t)
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
			err := MakeBucketMinio(tt.bucketName)
			if (err != nil) != tt.wantErr {
				t.Errorf("MakeBucket() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("MakeBucket() success")
			}
		})
	}

	// 测试后清理：删除测试用的桶
	ctx := context.Background()
	if err := MINIMO_CLIENT.RemoveBucket(ctx, "test-bucket"); err != nil {
		t.Logf("清理测试桶失败: %v", err)
	}
}

func TestUploadFile(t *testing.T) {
	preInit(t)

	tests := []struct {
		name     string
		filePath string
		wantErr  bool
	}{
		{
			name:     "上传文件1",
			filePath: "../../test_files/test.png",
			wantErr:  false,
		},
	}

	// 测试前准备：创建测试用的桶
	if err := MakeBucketMinio("test-bucket"); err != nil {
		t.Fatalf("创建测试桶失败: %v", err)
	}

	contentType := "application/octet-stream"
	for i, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			file, err := os.Open(tt.filePath)
			if err != nil {
				t.Fatalf("打开文件失败: %v", err)
			}
			defer file.Close()
			err = UploadFileMinio("test-bucket", fmt.Sprintf("testfile-%v.png", i), file, contentType)
			if (err != nil) != tt.wantErr {
				t.Errorf("UploadFile() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("UploadFile() success")
			}
		})
	}

	// 测试后清理：删除测试用的桶
	ctx := context.Background()
	if err := MINIMO_CLIENT.RemoveBucket(ctx, "test-bucket"); err != nil {
		t.Logf("清理测试桶失败: %v", err)
	}
}

func TestDeleteFileFromBucketMinio(t *testing.T) {
	preInit(t)
	tests := []struct {
		name       string
		bucketName string
		fileName   string
		wantErr    bool
	}{
		{
			name:       "删除存在的文件",
			bucketName: "test-bucket",
			fileName:   "test.png",
			wantErr:    false,
		},
	}
	// 测试前准备：创建测试用的桶和文件
	if err := MakeBucketMinio("test-bucket"); err != nil {
		t.Fatalf("创建测试桶失败: %v", err)
	}
	contentType := "application/octet-stream"
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 前期准备
			file, err := os.Open(fmt.Sprintf("../../test_files/%s", tt.fileName))
			if err != nil {
				t.Fatalf("打开文件失败: %v", err)
			}
			defer file.Close()
			if err = UploadFileMinio(tt.bucketName, tt.fileName, file, contentType); err != nil {
				t.Fatalf("上传文件失败: %v", err)
			}
			// 测试代码
			err = DeleteFileFromBucketMinio(tt.bucketName, tt.fileName)
			if (err != nil) != tt.wantErr {
				t.Errorf("DeleteFileFromBucketMinio() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("DeleteFileFromBucketMinio() success")
			}
		})
	}
	// 测试后清理：删除测试用的桶
	ctx := context.Background()
	if err := MINIMO_CLIENT.RemoveBucket(ctx, "test-bucket"); err != nil {
		t.Logf("清理测试桶失败: %v", err)
	}
}

func TestClearDeleteBucketMinio(t *testing.T) {
	preInit(t)
	tests := []struct {
		name       string
		bucketName string
		wantErr    bool
	}{
		{
			name:       "删除存在的桶",
			bucketName: "test-bucket",
			wantErr:    false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 前期准备
			if err := MakeBucketMinio(tt.bucketName); err != nil {
				t.Fatalf("创建测试桶失败: %v", err)
			}
			// 测试代码
			err := ClearDeleteBucketMinio(tt.bucketName)
			if (err != nil) != tt.wantErr {
				t.Errorf("ClearDeleteBucketMinio() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("ClearDeleteBucketMinio() success")
			}
		})
	}
}

func TestGeneratePublicURLMinio(t *testing.T) {
	preInit(t)
	tests := []struct {
		name       string
		bucketName string
		fileName   string
		wantResult string
	}{
		{
			name:       "生成公开访问的 URL",
			bucketName: "test-bucket",
			fileName:   "test.png",
			wantResult: fmt.Sprintf("http://%s/%s/%s", config.Conf.Minio.Endpoint, "test-bucket", "test.png"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GeneratePublicURLMinio(tt.bucketName, tt.fileName)
			if result != tt.wantResult {
				t.Errorf("GeneratePublicURLMinio() = %v, want %v", result, tt.wantResult)
			} else {
				t.Logf("GeneratePublicURLMinio() success")
			}
		})
	}
}
