package models

import "gorm.io/gorm"

// DailyPhotograph 日常照片
type DailyPhotograph struct {
	gorm.Model
	ImageUrl string `json:"image_url"`
	Title string `json:"title"`
}