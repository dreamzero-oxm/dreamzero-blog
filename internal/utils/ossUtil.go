package utils

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"blog-server/internal/oss"
	"context"
	"io"

	"github.com/minio/minio-go/v7"
)

func MakeBucket(bucketName string) error {
	ctx := context.Background()
	err := oss.MINIMO_CLIENT.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{
		Region: config.Conf.Minio.Location,
	})
	if err != nil {
		// Check to see if we already own this bucket (which happens if you run this twice)
		exists, errBucketExists := oss.MINIMO_CLIENT.BucketExists(ctx, bucketName)
		if errBucketExists == nil && exists {
			logger.Logger.Debugf("We already own %s\n", bucketName)
			return nil
		} else {
			logger.Logger.Errorf("Minio Create Bucket Error: %v", err)
			return errBucketExists
		}
	} else {
		logger.Logger.Debugf("Successfully created %s\n", bucketName)
	}
	return nil
}

func UploadFile(bucketName string, objectName string, src io.Reader, contentType string) error {
	ctx := context.Background()
	if _, err := oss.MINIMO_CLIENT.PutObject(ctx, bucketName, objectName, src, -1, minio.PutObjectOptions{
		ContentType: contentType,
	}); err!= nil {
		logger.Logger.Errorf("Minio Upload File Error: %v", err)
		return err
	}
	return nil
}