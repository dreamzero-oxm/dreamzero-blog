package service

import (
	"blog-server/internal/models"
	"fmt"
	"github.com/google/uuid"
	// "blog-server/internal/logger"
)

// AddCommentService 添加评论服务结构体
// 用于处理添加文章评论的请求和业务逻辑
type AddCommentService struct {
	Comment      string `json:"comment" form:"comment" binding:"required"`        // 评论内容，必填
	ArticleTitle string `json:"article_title" form:"article_title" binding:"required"` // 文章标题，必填
}

// AddComment 添加新评论
// 创建评论对象并保存到数据库
// 返回可能的错误
func (ac *AddCommentService) AddComment() error {
	// 创建评论对象
	comment := models.ArticleComment{
		Content:      ac.Comment,
		ArticleTitle: ac.ArticleTitle,
	}
	
	// logger.Logger.Infof("comment: %v, title: %v, comment: %v", ac.Comment, ac.ArticleTitle, comment)
	// return nil
	
	// 保存评论到数据库
	if err := models.DB.Create(&comment).Error; err != nil {
		return err
	}
	return nil
}

// ListCommentService 评论列表服务结构体
// 用于处理获取评论列表的请求和业务逻辑
type ListCommentService struct {
	// 评论ID
	CommentID string `json:"comment_id" form:"comment_id"` // 评论ID，用于筛选特定评论
	// 文章标题
	ArticleTitle string `json:"article_title" form:"article_title"` // 文章标题，用于筛选特定文章的评论
	// 相关内容
	Content string `json:"content" form:"content"` // 评论内容，用于模糊搜索
	// 是否通知
	IsNotify bool `json:"is_notify" form:"is_notify"` // 是否通知，用于筛选需要通知的评论
	// 是否已读
	IsRead bool `json:"is_read" form:"is_read"` // 是否已读，用于筛选已读或未读的评论
	// 是否通过审核
	IsPass bool `json:"is_pass" form:"is_pass"` // 是否通过审核，用于筛选已通过或未通过审核的评论
	// 排序
	NotifyDesc bool `json:"notify_desc" form:"notify_desc"` // 是否按通知状态降序排列
	ReadDesc   bool `json:"read_desc" form:"read_desc"`     // 是否按已读状态降序排列
	PassDesc   bool `json:"pass_desc" form:"pass_desc"`     // 是否按审核状态降序排列
}

// ListComment 获取评论列表
// 根据查询条件和排序参数获取评论列表
// 返回评论列表和可能的错误
func (lc *ListCommentService) ListComment() ([]models.ArticleComment, error) {
	var comments []models.ArticleComment
	db := models.DB

	fmt.Println(lc)
	
	// 如果提供了文章标题，添加标题过滤条件
	if lc.ArticleTitle != "" {
		db = db.Where("article_title LIKE ?", "%"+lc.ArticleTitle+"%")
	}

	// 如果提供了评论ID，添加ID过滤条件
	if lc.CommentID != "" {
		// 将字符串类型的CommentID转换为UUID类型
		commentID, err := uuid.Parse(lc.CommentID)
		if err != nil {
			return nil, fmt.Errorf("无效的评论ID格式: %v", err)
		}
		db = db.Where("id =?", commentID)
	}

	// 如果提供了评论内容，添加内容模糊搜索条件
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
