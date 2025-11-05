package oss

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"context"
	"io"
	"strings"
	"sync"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var (
	minioClient *minio.Client
	once        sync.Once
)

// GetMinioClient 获取MinIO客户端实例（单例模式）
func GetMinioClient() *minio.Client {
	return minioClient
}

// InitMinIO 初始化minio客户端
// minioConfig: minio配置
// 返回值: error
func InitMinIO(minioConfig config.MinioConfig) error {
	var initErr error
	once.Do(func() {
		client, err := minio.New(minioConfig.Endpoint, &minio.Options{
			Creds:  credentials.NewStaticV4(minioConfig.AccessKeyID, minioConfig.SecretAccessKey, ""),
			Secure: minioConfig.UseSSL,
		})
		if err != nil {
			initErr = err
			return
		}
		minioClient = client
		logger.Logger.Infof("minio endpoint: %v", minioConfig.Endpoint)
		logger.Logger.Infof("minio bucket: %v", minioConfig.BucketNames)
		logger.Logger.Infof("minio use ssl: %v", minioConfig.UseSSL)
		logger.Logger.Infof("minio access key id: %v", strings.Repeat("*", len(minioConfig.AccessKeyID)))
		logger.Logger.Infof("minio secret access key: %v", strings.Repeat("*", len(minioConfig.SecretAccessKey)))

		// 初始化bucket
		if err := InitBucket(minioConfig.BucketNames); err != nil {
			logger.Logger.Errorf("minio init bucket error: %v", err)
			initErr = err
			return
		}

		logger.Logger.Info("minio client init success")
	})

	if initErr != nil {
		return initErr
	}

	// 初始化bucket
	if err := InitBucket(minioConfig.BucketNames); err != nil {
		logger.Logger.Errorf("minio init bucket error: %v", err)
		return err
	}

	logger.Logger.Info("minio client init success")
	return nil
}

// InitBucket 初始化bucket
// bucketNames: 桶名列表
// 返回值: error
func InitBucket(bucketNames []string) error {
	for _, bucketName := range bucketNames {
		if err := MakeBucketMinio(bucketName); err != nil {
			return err
		}
		// 设置桶为公开访问
		if err := SetBucketPublicPolicy(bucketName); err != nil {
			return err
		}
	}
	return nil
}

// MakeBucketMinio 创建桶
// bucketName: 桶名
// 返回值: error
func MakeBucketMinio(bucketName string) error {
	ctx := context.Background()
	err := GetMinioClient().MakeBucket(ctx, bucketName, minio.MakeBucketOptions{
		Region: config.Conf.Minio.Location,
	})
	if err != nil {
		// Check to see if we already own this bucket (which happens if you run this twice)
		exists, errBucketExists := minioClient.BucketExists(ctx, bucketName)
		if errBucketExists == nil && exists {
			logger.Logger.Debugf("We already own %s\n", bucketName)
			return nil
		} else {
			logger.Logger.Errorf("Minio Create Bucket Error: %v", err)
			return err
		}
	} else {
		logger.Logger.Debugf("Successfully created %s\n", bucketName)
	}
	return nil
}

// UploadFileMinio 上传文件到桶
// bucketName: 桶名
// objectName: 对象名
// src: 文件
// contentType: 文件类型
// 返回值: error
func UploadFileMinio(bucketName string, objectName string, src io.Reader, contentType string) error {
	ctx := context.Background()
	if _, err := minioClient.PutObject(ctx, bucketName, objectName, src, -1, minio.PutObjectOptions{
		ContentType: contentType,
		UserMetadata: map[string]string{
			"x-amz-acl": "public-read", // 设置对象为公开可读
		},
	}); err != nil {
		logger.Logger.Errorf("Minio Upload File Error: %v", err)
		return err
	}
	return nil
}

// DeleteFileFromBucketMinio 删除桶中的文件
// bucketName: 桶名
// fileName: 文件名称
// 返回值: error
func DeleteFileFromBucketMinio(bucketName string, fileName string) error {
	ctx := context.Background()
	if err := minioClient.RemoveObject(ctx, bucketName, fileName, minio.RemoveObjectOptions{}); err != nil {
		logger.Logger.Errorf("Minio Delete File Error: %v", err)
		return err
	}
	return nil
}

// ClearDeleteBucketMinio 清空桶并删除桶
// bucketName: 桶名
// 返回值: error
func ClearDeleteBucketMinio(bucketName string) error {
	ctx := context.Background()
	for obj := range minioClient.ListObjects(ctx, bucketName, minio.ListObjectsOptions{}) {
		if obj.Err != nil {
			logger.Logger.Errorf("Minio List Objects Error: %v", obj.Err)
			return obj.Err
		}
		if err := DeleteFileFromBucketMinio(bucketName, obj.Key); err != nil {
			logger.Logger.Errorf("Minio Delete File Error: %v", err)
			return err
		}
	}
	if err := minioClient.RemoveBucket(ctx, "test-bucket"); err != nil {
		logger.Logger.Errorf("清理测试桶失败: %v", err)
	}
	return nil
}

// GeneratePresignedURLMinio 生成预签名URL
// bucketName: 桶名
// objectName: 对象名
// expires: 有效期
func GeneratePresignedURLMinio(bucketName, objectName string, expires time.Duration) (string, error) {
	url, err := minioClient.PresignedGetObject(context.Background(), bucketName, objectName, expires, nil)
	if err != nil {
		logger.Logger.Fatal(err)
		return "", err
	}
	return url.String(), nil
}

// GeneratePublicURLMinio 生成公开访问的URL
// bucketName: 桶名
// objectName: 对象名
// 返回值: 公开访问的URL
func GeneratePublicURLMinio(bucketName, objectName string) string {
	// return minioClient.EndpointURL().String() + "/" + bucketName + "/" + objectName
	return "/" + bucketName + "/" + objectName
}

// SetBucketPublicPolicy 设置桶的公共访问策略
func SetBucketPublicPolicy(bucketName string) error {
	policy := `{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {"AWS": ["*"]},
				"Action": ["s3:GetObject"],
				"Resource": ["arn:aws:s3:::` + bucketName + `/*"]
			}
		]
	}`

	ctx := context.Background()
	err := minioClient.SetBucketPolicy(ctx, bucketName, policy)
	if err != nil {
		logger.Logger.Errorf("设置桶策略失败: %v", err)
		return err
	}
	return nil
}
