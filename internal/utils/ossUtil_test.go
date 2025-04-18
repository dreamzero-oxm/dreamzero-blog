package utils

import (
	"blog-server/internal/config"
	"blog-server/internal/oss"
	"blog-server/internal/logger"
	"testing"
	"context"
	"fmt"
)

func TestMakeBucket(t *testing.T) {
	// init logger
	logger.InitLogger()
	// 测试前准备：初始化配置和 minio 客户端
	conf := config.MinioConfig{
		Endpoint: "10.21.23.14:10004",
		AccessKeyID: "***REMOVED***",
		SecretAccessKey: "***REMOVED***",
		UseSSL: false,
		BucketName: "moity-blog",
		Location: "cn-north-1",
	}
	fmt.Println(conf)
	if err := oss.InitMinIO(conf); err != nil {
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