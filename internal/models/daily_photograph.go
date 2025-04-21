package models

// DailyPhotograph 日常照片
// @Description 日常照片
type DailyPhotograph struct {
	SwaggerGormModel `json:",inline" gorm:"embedded"`
	ImageUrl         string `json:"image_url"`
	Title            string `json:"title"`
}
