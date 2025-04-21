package models

// SwaggerGormModel swagger 文档用的 gorm.Model
type SwaggerGormModel struct {
	ID        uint   `json:"id" gorm:"primarykey"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
	DeletedAt string `json:"deleted_at,omitempty" gorm:"index"`
}
