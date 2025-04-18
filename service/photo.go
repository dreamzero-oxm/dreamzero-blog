package service

import (
	"blog-server/internal/models"
	"blog-server/internal/oss"
	"fmt"
	"mime/multipart"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UploadPhotoService struct {
	Photos []*multipart.FileHeader `form:"photos" json:"photos" binding:"required"`
}

func (service *UploadPhotoService) UploadPhoto() (int, int, error) {
	bucketName := "moity-blog"
	
	// upload photos
	success, fail := 0, 0
	finalError := error(nil)

	for _, file := range service.Photos {
		contentType := "application/octet-stream"
		objectName := fmt.Sprintf("%s-%s", uuid.New().String(), file.Filename)
		models.DB.Transaction(func(tx *gorm.DB) error {
			src, err := file.Open()
			if err != nil {
				finalError = err
				fail++
				return err
			}
			defer src.Close()
			if err := oss.UploadFileMinio(bucketName, objectName, src, contentType); err != nil {
				finalError = err
				fail++
				return err
			}
			photo := models.DailyPhotograph{
				ImageUrl: oss.GeneratePublicURLMinio(bucketName, objectName),
				Title:    file.Filename,
			}
			if err := tx.Create(&photo).Error; err != nil {
				finalError = err
				fail++
				return err
			}
			success++
			return nil
		})
	}
	return success, fail, finalError
}
