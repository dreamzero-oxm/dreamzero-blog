package service

import (
	"blog-server/internal/models"
	"encoding/json"
	// "blog-server/internal/logger"
)

type AddCommentService struct {
	Comment      string   `json:"comment" form:"comment" binding:"required"`
	ArticalTitle []string `json:"artical_title" form:"artical_title" binding:"required"`
}

func (ac *AddCommentService) AddComment() error {
	jsonTitle, err := json.Marshal(ac.ArticalTitle)
	if err != nil {
		return err
	}
	comment := models.ArticleComment{
		Content:      ac.Comment,
		ArticleTitle: string(jsonTitle),
	}
	// logger.Logger.Infof("comment: %v, title: %v, comment: %v", ac.Comment, ac.ArticalTitle, comment)
	// return nil
	if err := models.DB.Create(&comment).Error; err != nil {
		return err
	}
	return nil
}
