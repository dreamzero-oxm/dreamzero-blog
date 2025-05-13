package oss

import (
	"blog-server/internal/config"
)

func InitOSS() error {
	if err := InitMinIO(config.Conf.Minio); err != nil {
		return err
	}
	return nil
}
