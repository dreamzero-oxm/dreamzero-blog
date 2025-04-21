package oss

import (
	"blog-server/internal/config"

	"github.com/minio/minio-go/v7"
)

var MINIMO_CLIENT *minio.Client

func InitOSS() error {
	if err := InitMinIO(config.Conf.Minio); err != nil {
		return err
	}
	return nil
}
