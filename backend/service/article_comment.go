package service

import (
	"blog-server/internal/models"
	"fmt"
	// "blog-server/internal/logger"
)

type AddCommentService struct {
	Comment      string `json:"comment" form:"comment" binding:"required"`
	ArticleTitle string `json:"article_title" form:"article_title" binding:"required"`
}

func (ac *AddCommentService) AddComment() error {
	comment := models.ArticleComment{
		Content:      ac.Comment,
		ArticleTitle: ac.ArticleTitle,
	}
	// logger.Logger.Infof("comment: %v, title: %v, comment: %v", ac.Comment, ac.ArticleTitle, comment)
	// return nil
	if err := models.DB.Create(&comment).Error; err != nil {
		return err
	}
	return nil
}

type ListCommentService struct {
	// 评论ID
	CommentID int `json:"comment_id" form:"comment_id"`
	// 文章标题
	ArticleTitle string `json:"article_title" form:"article_title"`
	// 相关内容
	Content string `json:"content" form:"content"`
	// 是否通知
	IsNotify bool `json:"is_notify" form:"is_notify"`
	// 是否已读
	IsRead bool `json:"is_read" form:"is_read"`
	// 是否通过审核
	IsPass bool `json:"is_pass" form:"is_pass"`
	// 排序
	NotifyDesc bool `json:"notify_desc" form:"notify_desc"`
	ReadDesc   bool `json:"read_desc" form:"read_desc"`
	PassDesc   bool `json:"pass_desc" form:"pass_desc"`
}

func (lc *ListCommentService) ListComment() ([]models.ArticleComment, error) {
	var comments []models.ArticleComment
	db := models.DB

	fmt.Println(lc)
	// 如果提供了文章标题，添加标题过滤条件
	if lc.ArticleTitle != "" {
		db = db.Where("article_title LIKE ?", "%"+lc.ArticleTitle+"%")
	}

	if lc.CommentID > 0 {
		db = db.Where("id =?", lc.CommentID)
	}

	if lc.Content != "" {
		db = db.Where("content LIKE ?", "%"+lc.Content+"%")
	}

	// 添加通知状态过滤
	if lc.IsNotify {
		db = db.Where("is_notify = ?", true)
	}

	// 添加已读状态过滤
	if lc.IsRead {
		db = db.Where("is_read = ?", true)
	}

	// 添加审核状态过滤
	if lc.IsPass {
		db = db.Where("is_pass = ?", true)
	}

	// 添加排序条件
	if lc.NotifyDesc {
		db = db.Order("is_notify DESC")
	}
	if lc.ReadDesc {
		db = db.Order("is_read DESC")
	}
	if lc.PassDesc {
		db = db.Order("is_pass DESC")
	}

	// 执行查询
	if err := db.Find(&comments).Error; err != nil {
		return nil, err
	}

	return comments, nil
}
