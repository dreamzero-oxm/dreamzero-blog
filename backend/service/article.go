package service

import (
	"errors"
	"blog-server/internal/models"
	"blog-server/internal/code"
	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type CreateArticleService struct {
	Title     string `json:"title" binding:"required"`
	Content   string `json:"content" binding:"required"`
	Summary   string `json:"summary"`
	Status    models.ArticleStatus `json:"status" binding:"required"`
	Tags      string `json:"tags"`
	CoverImage string `json:"cover_image"`
	UserID    uint   `json:"user_id"`
}

func (s *CreateArticleService) Create() (*models.Article, error) {
	article := &models.Article{
		Title:     s.Title,
		Content:   s.Content,
		Summary:   s.Summary,
		Status:    s.Status,
		Tags:      s.Tags,
		CoverImage: s.CoverImage,
		UserID:    s.UserID,
	}

	if err := article.Validate(); err != nil {
		return nil, err
	}

	if err := models.DB.Create(article).Error; err != nil {
		return nil, code.ErrArticleCreateFailed
	}

	return article, nil
}

type UpdateArticleService struct {
	ID        uint   `uri:"id" binding:"required"`
	Title     string `json:"title" binding:"required"`
	Content   string `json:"content" binding:"required"`
	Summary   string `json:"summary"`
	Status    models.ArticleStatus `json:"status" binding:"required"`
	Tags      string `json:"tags"`
	CoverImage string `json:"cover_image"`
	UserID    uint   `json:"user_id"`
}

func (s *UpdateArticleService) Update() (*models.Article, error) {
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, code.ErrArticleNotFound
		}
		return nil, code.ErrArticleGetFailed
	}

	// 检查权限
	if article.UserID != s.UserID {
		return nil, code.ErrArticlePermissionDenied
	}

	article.Title = s.Title
	article.Content = s.Content
	article.Summary = s.Summary
	article.Status = s.Status
	article.Tags = s.Tags
	article.CoverImage = s.CoverImage

	// 验证更新后的文章数据
	if err := article.Validate(); err != nil {
		return nil, err
	}

	if err := models.DB.Save(&article).Error; err != nil {
		return nil, code.ErrArticleUpdateFailed
	}

	return &article, nil
}

type DeleteArticleService struct {
	ID     uint `uri:"id" binding:"required"`
	UserID uint `json:"user_id"`
}

func (s *DeleteArticleService) Delete() error {
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return code.ErrArticleNotFound
		}
		return code.ErrArticleGetFailed
	}

	// 检查权限
	if article.UserID != s.UserID {
		return code.ErrArticlePermissionDenied
	}

	if err := models.DB.Delete(&article).Error; err != nil {
		return code.ErrArticleDeleteFailed
	}

	return nil
}

type GetArticleService struct {
	ID     uint `uri:"id" binding:"required"`
	UserID uint `json:"user_id"`
}

func (s *GetArticleService) Get() (*models.Article, error) {
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, code.ErrArticleNotFound
		}
		return nil, code.ErrArticleGetFailed
	}

	// 检查权限：如果是作者本人，无条件获取；如果不是作者本人，则文章需要是published状态才能获取
	if article.UserID != s.UserID && article.Status != models.ArticleStatusPublished {
		return nil, code.ErrArticlePermissionDenied
	}

	// 增加浏览次数
	article.ViewCount++
	models.DB.Save(&article)

	return &article, nil
}

type ListArticleService struct {
	Page     int    `form:"page" binding:"min=1"`
	PageSize int    `form:"page_size" binding:"min=1,max=100"`
	Status   *models.ArticleStatus   `form:"status"` // 可选，用于筛选状态
	UserID   *uint  `form:"user_id"` // 可选，用于筛选用户
	Tag      string `form:"tag"`     // 可选，用于筛选标签
	IsAdmin  bool   // 是否为管理员，用于权限控制
	c        *gin.Context // Gin上下文，用于获取JWT信息
}

// SetContext 设置Gin上下文并提取JWT信息
func (s *ListArticleService) SetContext(c *gin.Context) {
	s.c = c
	
	// 从JWT中获取用户ID和角色
	userID, exists := c.Get("user_id")
	if !exists {
		// 如果用户未登录，设置UserID为nil
		s.UserID = nil
		s.IsAdmin = false
	} else {
		// 设置当前用户ID
		if uid, ok := userID.(uint); ok {
			// 如果请求中指定了UserID且不是管理员，检查是否为本人
			if s.UserID != nil && *s.UserID != uid {
				// 非管理员只能查看自己的文章
				*s.UserID = uid
			}
		}
		
		// 获取用户角色信息
		claims, exists := c.Get("claims")
		if exists {
			// 从JWT中获取用户角色
			if claimMap, ok := claims.(jwt.MapClaims); ok {
				if role, ok := claimMap["role"].(string); ok && role == "admin" {
					s.IsAdmin = true
				} else {
					s.IsAdmin = false
				}
			} else {
				s.IsAdmin = false
			}
		} else {
			s.IsAdmin = false
		}
	}
}

func (s *ListArticleService) List() ([]models.Article, int64, error) {
	if s.Page == 0 {
		s.Page = 1
	}
	if s.PageSize == 0 {
		s.PageSize = 10
	}

	var articles []models.Article
	var total int64

	query := models.DB.Model(&models.Article{})

	// 根据用户角色添加筛选条件
	if !s.IsAdmin {
		// 非管理员只能查看已发布的文章
		if s.Status != nil {
			// 如果非管理员指定了状态，只能查看已发布的文章
			if *s.Status != models.ArticleStatusPublished {
				return nil, 0, code.ErrArticlePermissionDenied
			}
			query = query.Where("status = ?", *s.Status)
		} else {
			// 如果非管理员没有指定状态，默认只显示已发布的文章
			query = query.Where("status = ?", models.ArticleStatusPublished)
		}
		
		// 非管理员只能查看自己的文章或已发布的文章
		if s.UserID != nil {
			query = query.Where("user_id = ?", *s.UserID)
		}
	} else {
		// 管理员可以查看所有状态的文章
		if s.Status != nil {
			query = query.Where("status = ?", *s.Status)
		}
		
		// 管理员可以查看所有用户的文章
		if s.UserID != nil {
			query = query.Where("user_id = ?", *s.UserID)
		}
	}
	
	// 标签筛选对所有用户都适用
	if s.Tag != "" {
		query = query.Where("tags LIKE ?", "%"+s.Tag+"%")
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, code.ErrArticleListFailed
	}

	// 分页查询
	offset := (s.Page - 1) * s.PageSize
	if err := query.Offset(offset).Limit(s.PageSize).Order("created_at DESC").Find(&articles).Error; err != nil {
		return nil, 0, code.ErrArticleListFailed
	}

	return articles, total, nil
}

type LikeArticleService struct {
	ID uint `uri:"id" binding:"required"`
}

func (s *LikeArticleService) Like() error {
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return code.ErrArticleNotFound
		}
		return code.ErrArticleGetFailed
	}

	// 增加点赞次数
	article.LikeCount++
	if err := models.DB.Save(&article).Error; err != nil {
		return code.ErrArticleUpdateFailed
	}

	return nil
}

type UpdateArticleStatusService struct {
	ID     uint `uri:"id" binding:"required"`
	Status models.ArticleStatus `json:"status" binding:"required"`
	UserID uint `json:"user_id"`
}

func (s *UpdateArticleStatusService) UpdateStatus() error {
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return code.ErrArticleNotFound
		}
		return code.ErrArticleGetFailed
	}

	// 检查权限
	if article.UserID != s.UserID {
		return code.ErrArticlePermissionDenied
	}

	article.Status = s.Status
	if err := models.DB.Save(&article).Error; err != nil {
		return code.ErrArticleUpdateFailed
	}

	return nil
}