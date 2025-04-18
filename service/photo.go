package service

import (
	"blog-server/internal/utils"
	"fmt"
	"mime/multipart"

	"github.com/google/uuid"
)

type UploadPhotoService struct {
	Photos []*multipart.FileHeader `form:"photos" json:"photos" binding:"required"`
}

func (service *UploadPhotoService) UploadPhoto() (int, int, error) {
	bucketName := "daily-photo"
	if err := utils.MakeBucket(bucketName); err != nil {
		return 0, len(service.Photos), err
	}

	// upload photos
	success, fail := 0, 0
	finalError := error(nil)
	for _, file := range service.Photos {
		contentType := "application/octet-stream"
		objectName := fmt.Sprintf("%s-%s", uuid.New().String(), file.Filename)
		src, err := file.Open()
		if err != nil {
			finalError = err
			fail++
			continue
		}
		defer src.Close()
		if err := utils.UploadFile(bucketName, objectName, src, contentType); err!= nil {
			finalError = err
			fail++
			continue
		}
		success++
	}
	return success, fail, finalError
}
