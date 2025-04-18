package oss

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MINIMO_CLIENT *minio.Client

func InitMinIO(minioConfig config.MinioConfig) error {
	minioClient, err := minio.New(minioConfig.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(minioConfig.AccessKeyID, minioConfig.SecretAccessKey, ""),
		Secure: minioConfig.UseSSL,
	})
	if err != nil {
		return err
	}
	MINIMO_CLIENT = minioClient
	logger.Logger.Infof("minio endpoint: %v", minioConfig.Endpoint)
	logger.Logger.Infof("minio bucket: %v", minioConfig.BucketName)
	logger.Logger.Infof("minio use ssl: %v", minioConfig.UseSSL)
	logger.Logger.Infof("minio access key id: %v", strings.Repeat("*", len(minioConfig.AccessKeyID)))
	logger.Logger.Infof("minio secret access key: %v", strings.Repeat("*", len(minioConfig.SecretAccessKey)))
	logger.Logger.Info("minio client init success")
	return nil
}