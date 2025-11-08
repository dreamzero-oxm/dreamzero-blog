package models

import (
	"blog-server/internal/code"
	"errors"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type ArticleStatus string

const (
	ArticleStatusDraft     ArticleStatus = "draft"     // 草稿
	ArticleStatusPublished ArticleStatus = "published" // 已发布
	ArticleStatusPrivate   ArticleStatus = "private"   // 私有
)

type Article struct {
	SwaggerGormModel
	Title       string        `json:"title" gorm:"type:varchar(255);not null;comment:文章标题;index"`
	Content     string        `json:"content" gorm:"type:text;not null;comment:文章内容(Markdown)"`
	Summary     string        `json:"summary" gorm:"type:varchar(500);comment:文章摘要"`
	Status      ArticleStatus `json:"status" gorm:"type:varchar(20);not null;default:'draft';comment:文章状态(draft/published/private);index"`
	ViewCount   uint          `json:"view_count" gorm:"type:int;default:0;comment:浏览次数;index"`
	LikeCount   uint          `json:"like_count" gorm:"type:int;default:0;comment:点赞次数;index"`
	UserID      uuid.UUID     `json:"user_id" gorm:"type:uuid;not null;comment:用户ID;index"`
	User        User          `json:"-" gorm:"foreignKey:UserID"`
	TagsArray   []string      `json:"tags" gorm:"type:text;serializer:json"`
	CoverImage  string        `json:"cover_image" gorm:"type:varchar(255);comment:封面图片URL"`
	PublishedAt *time.Time    `json:"published_at" gorm:"comment:发布时间;index"`
}

// Validate 验证文章数据
func (a *Article) Validate() error {
	if a.Title == "" {
		return errors.New(code.ErrArticleTitleEmpty.Error())
	}
	if a.Content == "" {
		return errors.New(code.ErrArticleContentEmpty.Error())
	}
	if a.UserID == uuid.Nil {
		return errors.New(code.ErrArticleUserIDEmpty.Error())
	}
	// 验证状态是否有效
	if a.Status != ArticleStatusDraft && a.Status != ArticleStatusPublished && a.Status != ArticleStatusPrivate {
		return errors.New(code.ErrArticleStatusInvalid.Error())
	}
	return nil
}

// BeforeCreate 在创建文章前的钩子
func (a *Article) BeforeCreate(tx *gorm.DB) error {
	if err := a.Validate(); err != nil {
		return err
	}
	return nil
}

// BeforeUpdate 在更新文章前的钩子
func (a *Article) BeforeUpdate(tx *gorm.DB) error {
	if err := a.Validate(); err != nil {
		return err
	}
	return nil
}

// BeforeSave 在保存文章前的钩子
func (a *Article) BeforeSave(tx *gorm.DB) error {
	// 如果状态是已发布，且发布时间为空，则设置发布时间为当前时间
	if a.Status == ArticleStatusPublished && a.PublishedAt == nil {
		now := time.Now()
		a.PublishedAt = &now
	}
	
	return nil
}