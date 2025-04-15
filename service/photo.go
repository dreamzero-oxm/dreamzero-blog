package service

type UploadPhotoService struct {
	Photos []string `form:"photos" json:"photos" binding:"required"`
}

func (service *UploadPhotoService) UploadPhoto() ([]string, error) {
	var photos []string
	for _, photo := range service.Photos {
		photos = append(photos, photo)
	}
	return photos, nil
}