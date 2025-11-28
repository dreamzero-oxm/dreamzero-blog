package models

import (
	"time"

	"github.com/google/uuid"
)

// DailyPhotograph 日常照片
// @Description 日常照片
type DailyPhotograph struct {
	SwaggerGormModel `json:",inline" gorm:"embedded"`
	ImageUrl         string    `json:"image_url" gorm:"type:varchar(255);not null"` // 照片URL，必填
	Title            string    `json:"title" gorm:"type:varchar(100);not null"`    // 照片标题，必填
	Description      string    `json:"description" gorm:"type:text"`               // 照片描述，可选
	Tags             string    `json:"tags" gorm:"type:varchar(255)"`              // 照片标签，多个标签用逗号分隔
	UserID           uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`     // 用户ID，外键，必填
	User             User      `json:"-" gorm:"foreignKey:UserID"`               // 关联用户
	TakenAt          time.Time `json:"taken_at" gorm:"type:date"`                   // 拍摄日期，格式：YYYY-MM-DD
	Location         string    `json:"location" gorm:"type:varchar(100)"`          // 拍摄地点
	Camera           string    `json:"camera" gorm:"type:varchar(100)"`             // 相机型号
	Lens             string    `json:"lens" gorm:"type:varchar(100)"`               // 镜头型号
	ISO              float64   `json:"iso" gorm:"type:float"`                 		// ISO值
	Aperture         float64   `json:"aperture" gorm:"type:float"`                 	// 光圈值
	ShutterSpeed     float64   `json:"shutter_speed" gorm:"type:float"`             // 快门速度
	FocalLength      float64   `json:"focal_length" gorm:"type:float"`               // 焦距
	IsPublic         bool      `json:"is_public" gorm:"type:boolean;default:true"`  // 是否公开，默认公开
	Likes            int       `json:"likes" gorm:"type:int;default:0"`             // 点赞数
	Views            int       `json:"views" gorm:"type:int;default:0"`             // 浏览数
}
