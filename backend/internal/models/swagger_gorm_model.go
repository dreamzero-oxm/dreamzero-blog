package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type SwaggerGormModel struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primarykey;default:uuid_generate_v4()"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate GORM钩子，在创建记录前自动生成UUID
func (base *SwaggerGormModel) BeforeCreate(tx *gorm.DB) error {
	if base.ID == uuid.Nil {
		base.ID = uuid.New()
	}
	return nil
}
