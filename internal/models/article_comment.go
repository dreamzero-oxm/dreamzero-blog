package models

type ArticleComment struct {
	SwaggerGormModel `json:"-" gorm:"embedded"`
	Content string `json:"content" gorm:"type:text;not null"`
	ArticleTitle string `json:"article_title" gorm:"type:jsonb;not null"`
}