package service

type UploadPhotoService struct {
	Photos []string `form:"photos" json:"photos" binding:"required"`
}

func (service *UploadPhotoService) UploadPhoto() ([]string, error) {
	photos := make([]string, 0, len(service.Photos))
	photos = append(photos, service.Photos...)
	return photos, nil
}
