package models

type ArticleComment struct {
	SwaggerGormModel `json:"-" gorm:"embedded"`
	Content          string `json:"content" gorm:"type:text;not null"`
	ArticleTitle     string `json:"article_title" gorm:"type:jsonb;not null"`
	IsNotify         bool   `json:"is_notify" gorm:"type:bool;not null;default:false"`
	IsRead           bool   `json:"is_read" gorm:"type:bool;not null;default:false"`
	IsPass           bool   `json:"is_pass" gorm:"type:bool;not null;default:false"`
}
