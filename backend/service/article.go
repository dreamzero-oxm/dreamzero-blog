package service

import (
	"errors"
	"strings"
	"blog-server/internal/models"
	"blog-server/internal/code"
	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// CreateArticleService 创建文章服务结构体
// 用于处理创建文章的请求和业务逻辑
type CreateArticleService struct {
	Title     string `json:"title" binding:"required"`        // 文章标题，必填
	Content   string `json:"content" binding:"required"`      // 文章内容，必填
	Summary   string `json:"summary"`                           // 文章摘要，可选
	Status    models.ArticleStatus `json:"status" binding:"required"` // 文章状态，必填
	Tags      []string `json:"tags"`                           // 文章标签数组，可选
	CoverImage string `json:"cover_image"`                      // 文章封面图片URL，可选
	UserID    string `json:"user_id"`                          // 作者用户ID，必填
}

// Create 创建新文章
// 验证文章数据并保存到数据库
// 返回创建的文章对象和可能的错误
func (s *CreateArticleService) Create() (*models.Article, error) {
	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		return nil, code.ErrInvalidUserID
	}
	
	// 创建文章对象
	article := &models.Article{
		Title:     s.Title,
		Content:   s.Content,
		Summary:   s.Summary,
		Status:    s.Status,
		TagsArray: s.Tags,
		CoverImage: s.CoverImage,
		UserID:    userID,
	}

	// 验证文章数据
	if err := article.Validate(); err != nil {
		return nil, err
	}

	// 保存文章到数据库
	if err := models.DB.Create(article).Error; err != nil {
		return nil, code.ErrArticleCreateFailed
	}

	return article, nil
}

// UpdateArticleService 更新文章服务结构体
// 用于处理更新文章的请求和业务逻辑
type UpdateArticleService struct {
	ID        string `uri:"id" binding:"required"`             // 文章ID，从URL路径获取，必填
	Title     string `json:"title" binding:"required"`        // 文章标题，必填
	Content   string `json:"content" binding:"required"`      // 文章内容，必填
	Summary   string `json:"summary"`                           // 文章摘要，可选
	Status    models.ArticleStatus `json:"status" binding:"required"` // 文章状态，必填
	Tags      []string `json:"tags"`                           // 文章标签数组，可选
	CoverImage string `json:"cover_image"`                      // 文章封面图片URL，可选
	UserID    string `json:"user_id"`                          // 作者用户ID，用于权限验证
}

// Update 更新现有文章
// 验证权限并更新文章数据
// 返回更新后的文章对象和可能的错误
func (s *UpdateArticleService) Update() (*models.Article, error) {
	// 查找要更新的文章
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, code.ErrArticleNotFound
		}
		return nil, code.ErrArticleGetFailed
	}

	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		return nil, code.ErrInvalidUserID
	}
	
	// 检查权限：只有文章作者可以更新文章
	if article.UserID != userID {
		return nil, code.ErrArticlePermissionDenied
	}

	// 更新文章数据
	article.Title = s.Title
	article.Content = s.Content
	article.Summary = s.Summary
	article.Status = s.Status
	article.TagsArray = s.Tags
	article.CoverImage = s.CoverImage

	// 验证更新后的文章数据
	if err := article.Validate(); err != nil {
		return nil, err
	}

	// 保存更新后的文章
	if err := models.DB.Save(&article).Error; err != nil {
		return nil, code.ErrArticleUpdateFailed
	}

	return &article, nil
}

// DeleteArticleService 删除文章服务结构体
// 用于处理删除文章的请求和业务逻辑
type DeleteArticleService struct {
	ID     string `uri:"id" binding:"required"` // 文章ID，从URL路径获取，必填
	UserID string `json:"user_id"`              // 作者用户ID，用于权限验证
}

// Delete 删除指定文章
// 验证权限并从数据库中删除文章
// 返回可能的错误
func (s *DeleteArticleService) Delete() error {
	// 查找要删除的文章
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return code.ErrArticleNotFound
		}
		return code.ErrArticleGetFailed
	}

	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		return code.ErrInvalidUserID
	}
	
	// 检查权限：只有文章作者可以删除文章
	if article.UserID != userID {
		return code.ErrArticlePermissionDenied
	}

	// 从数据库中删除文章
	if err := models.DB.Delete(&article).Error; err != nil {
		return code.ErrArticleDeleteFailed
	}

	return nil
}

// GetArticleService 获取文章服务结构体
// 用于处理获取单个文章的请求和业务逻辑
type GetArticleService struct {
	ID     string `uri:"id" binding:"required"` // 文章ID，从URL路径获取，必填
	UserID string `json:"user_id"`              // 请求用户ID，用于权限验证
}

// Get 获取指定文章
// 验证权限并返回文章数据，同时增加浏览次数
// 返回文章对象和可能的错误
func (s *GetArticleService) Get() (*models.Article, error) {
	// 查找文章
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, code.ErrArticleNotFound
		}
		return nil, code.ErrArticleGetFailed
	}

	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		return nil, code.ErrInvalidUserID
	}
	
	// 检查权限：
	// 1. 如果是文章作者本人，无条件获取
	// 2. 如果不是文章作者本人，则文章需要是已发布状态才能获取
	if article.UserID != userID && article.Status != models.ArticleStatusPublished {
		return nil, code.ErrArticlePermissionDenied
	}

	// 增加浏览次数
	article.ViewCount++
	models.DB.Save(&article)

	return &article, nil
}

// ListArticleService 文章列表服务结构体
// 用于处理获取文章列表的请求和业务逻辑
type ListArticleService struct {
	Page     int    `form:"page" binding:"min=1"`           // 页码，最小为1
	PageSize int    `form:"page_size" binding:"min=1,max=100"` // 每页数量，最小1，最大100
	Status   *models.ArticleStatus   `form:"status"`         // 可选，用于筛选状态
	UserID   *string  `form:"user_id"`                        // 可选，用于筛选用户
	Tag      string `form:"tag"`                             // 可选，用于筛选标签（单个标签）
	Tags     []string `form:"tags"`                          // 可选，用于筛选多个标签
	IsAdmin  bool   // 是否为管理员，用于权限控制
	c        *gin.Context // Gin上下文，用于获取JWT信息
}

// SetContext 设置Gin上下文并提取JWT信息
// 从JWT中获取用户ID和角色信息，用于权限控制
func (s *ListArticleService) SetContext(c *gin.Context) {
	s.c = c
	
	// 从JWT中获取用户ID和角色
	userID, exists := c.Get("userID")
	if !exists {
		// 如果用户未登录，设置UserID为nil
		s.UserID = nil
		s.IsAdmin = false
	} else {
		// 设置当前用户ID
		if uid, ok := userID.(uuid.UUID); ok {
			uidStr := uid.String()
			// 如果请求中指定了UserID且不是管理员，检查是否为本人
			if s.UserID != nil && *s.UserID != uidStr {
				// 非管理员只能查看自己的文章
				*s.UserID = uidStr
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

// List 获取文章列表
// 根据查询条件、分页参数和权限控制获取文章列表
// 返回文章列表、总数和可能的错误
func (s *ListArticleService) List() ([]models.Article, int64, error) {
	// 设置默认分页参数
	if s.Page == 0 {
		s.Page = 1
	}
	if s.PageSize == 0 {
		s.PageSize = 10
	}

	var articles []models.Article
	var total int64

	// 构建查询
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
			// 将字符串类型的UserID转换为UUID类型
			userID, err := uuid.Parse(*s.UserID)
			if err != nil {
				return nil, 0, code.ErrInvalidUserID
			}
			query = query.Where("user_id = ?", userID)
		}
	} else {
		// 管理员可以查看所有状态的文章
		if s.Status != nil {
			query = query.Where("status = ?", *s.Status)
		}
		
		// 管理员可以查看所有用户的文章
		if s.UserID != nil {
			// 将字符串类型的UserID转换为UUID类型
			userID, err := uuid.Parse(*s.UserID)
			if err != nil {
				return nil, 0, code.ErrInvalidUserID
			}
			query = query.Where("user_id = ?", userID)
		}
	}
	
	// 标签筛选对所有用户都适用
	if s.Tag != "" {
		// 单个标签查询，使用数组包含操作符
		query = query.Where("tags_array @> ?", "[\""+s.Tag+"\"]")
	}
	
	// 多个标签查询，使用OR条件
	if len(s.Tags) > 0 {
		tagConditions := make([]string, len(s.Tags))
		tagValues := make([]interface{}, len(s.Tags))
		for i, tag := range s.Tags {
			tagConditions[i] = "tags_array @> ?"
			tagValues[i] = "[\"" + tag + "\"]"
		}
		query = query.Where("(" + strings.Join(tagConditions, " OR ") + ")", tagValues...)
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

// LikeArticleService 点赞文章服务结构体
// 用于处理点赞文章的请求和业务逻辑
type LikeArticleService struct {
	ID string `uri:"id" binding:"required"` // 文章ID，从URL路径获取，必填
}

// Like 点赞文章
// 增加文章的点赞次数
// 返回可能的错误
func (s *LikeArticleService) Like() error {
	// 查找要点赞的文章
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

// UpdateArticleStatusService 更新文章状态服务结构体
// 用于处理更新文章状态的请求和业务逻辑
type UpdateArticleStatusService struct {
	ID     string `uri:"id" binding:"required"`             // 文章ID，从URL路径获取，必填
	Status models.ArticleStatus `json:"status" binding:"required"` // 新的文章状态，必填
	UserID string `json:"user_id"`                          // 作者用户ID，用于权限验证
}

// UpdateStatus 更新文章状态
// 验证权限并更新文章状态
// 返回可能的错误
func (s *UpdateArticleStatusService) UpdateStatus() error {
	// 查找要更新状态的文章
	var article models.Article
	if err := models.DB.First(&article, s.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return code.ErrArticleNotFound
		}
		return code.ErrArticleGetFailed
	}

	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		return code.ErrInvalidUserID
	}
	
	// 检查权限：只有文章作者可以更新文章状态
	if article.UserID != userID {
		return code.ErrArticlePermissionDenied
	}

	// 更新文章状态
	article.Status = s.Status
	if err := models.DB.Save(&article).Error; err != nil {
		return code.ErrArticleUpdateFailed
	}

	return nil
}