package service

import (
	"blog-server/internal/code"
	"blog-server/internal/models"
	"blog-server/internal/oss"
	"blog-server/internal/redis"
	"blog-server/internal/logger"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"io"
	"log"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// validateImageURL 验证是否为有效的HTTP/HTTPS链接
func validateImageURL(imageURL string) bool {
	if imageURL == "" {
		return false
	}

	// 使用正则表达式验证URL格式
	urlPattern := `^https?://[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$`
	matched, err := regexp.MatchString(urlPattern, imageURL)
	if err != nil || !matched {
		return false
	}

	// 尝试解析URL
	_, err = url.Parse(imageURL)
	return err == nil
}

// validateBase64Image 验证是否为有效的Base64编码图片
func validateBase64Image(base64Data string) bool {
	if base64Data == "" {
		return false
	}

	// 检查是否包含data:image前缀
	if !strings.HasPrefix(base64Data, "data:image/") {
		return false
	}

	// 提取Base64编码部分
	parts := strings.SplitN(base64Data, ",", 2)
	if len(parts) != 2 {
		return false
	}

	// 尝试解码Base64数据
	_, err := base64.StdEncoding.DecodeString(parts[1])
	return err == nil
}

// uploadBase64ImageToOSS 将Base64编码的图片上传到OSS
func uploadBase64ImageToOSS(base64Data string) (string, error) {
	// 提取Base64编码部分
	parts := strings.SplitN(base64Data, ",", 2)
	if len(parts) != 2 {
		log.Printf("无效的Base64图片格式: 缺少data:image前缀或编码部分")
		return "", code.ErrArticleCoverImageInvalid
	}

	// 解码Base64数据
	imageData, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		log.Printf("Base64解码失败: %v", err)
		return "", code.ErrArticleCoverImageInvalid
	}

	// 创建一个Reader
	reader := bytes.NewReader(imageData)

	// 尝试解码图片以验证其有效性
	_, format, err := image.Decode(reader)
	if err != nil {
		log.Printf("无效的图片格式: %v", err)
		return "", code.ErrArticleCoverImageInvalid
	}

	// 重置Reader位置
	reader.Seek(0, io.SeekStart)

	// 生成唯一的对象名称
	objectName := fmt.Sprintf("article-cover-%s.%s", uuid.New().String(), format)
	bucketName := "moity-blog" // 与photo.go中保持一致

	// 确定内容类型
	contentType := "image/" + format
	if format == "jpg" {
		contentType = "image/jpeg"
	}

	// 记录上传开始
	log.Printf("开始上传图片到OSS: bucket=%s, object=%s, contentType=%s", bucketName, objectName, contentType)

	// 上传到OSS，添加重试机制
	maxRetries := 3
	var uploadErr error
	for i := 0; i < maxRetries; i++ {
		// 重置Reader位置
		reader.Seek(0, io.SeekStart)
		
		if uploadErr = oss.UploadFileMinio(bucketName, objectName, reader, contentType); uploadErr != nil {
			log.Printf("上传图片到OSS失败 (尝试 %d/%d): %v", i+1, maxRetries, uploadErr)
			if i < maxRetries-1 {
				// 等待一段时间后重试
				time.Sleep(time.Second * time.Duration(i+1))
			}
			continue
		}
		break
	}
	
	if uploadErr != nil {
		log.Printf("上传图片到OSS最终失败: %v", uploadErr)
		return "", code.ErrArticleCoverImageInvalid
	}

	// 生成公开访问URL
	imageURL := oss.GeneratePublicURLMinio(bucketName, objectName)
	log.Printf("成功上传图片到OSS: %s", imageURL)
	return imageURL, nil
}

// processCoverImage 处理封面图片
// 根据输入类型（空、URL或Base64）返回最终的图片URL
func processCoverImage(coverImage string) (string, error) {
	// 如果为空，直接返回空字符串
	if coverImage == "" {
		return "", nil
	}

	// 如果是有效的URL，直接返回
	if validateImageURL(coverImage) {
		return coverImage, nil
	}

	// 如果是有效的Base64图片，上传到OSS并返回URL
	if validateBase64Image(coverImage) {
		// 记录日志 - 开始上传Base64图片
		log.Printf("开始上传Base64编码的封面图片到OSS")
		
		imageURL, err := uploadBase64ImageToOSS(coverImage)
		if err != nil {
			// 记录错误日志
			log.Printf("上传Base64图片到OSS失败: %v", err)
			return "", code.ErrArticleCoverImageInvalid
		}
		
		// 记录成功日志
		log.Printf("成功上传Base64图片到OSS: %s", imageURL)
		return imageURL, nil
	}

	// 既不是URL也不是Base64，返回错误
	log.Printf("无效的封面图片格式: %s", code.ErrArticleCoverImageInvalid.Message)
	return "", code.ErrArticleCoverImageInvalid
}

// CreateArticleService 创建文章服务结构体
// 用于处理创建文章的请求和业务逻辑
type CreateArticleService struct {
	Title      string               `json:"title" binding:"required"`   // 文章标题，必填
	Content    string               `json:"content" binding:"required"` // 文章内容，必填
	Summary    string               `json:"summary"`                    // 文章摘要，可选
	Status     models.ArticleStatus `json:"status" binding:"required"`  // 文章状态，必填
	Tags       []string             `json:"tags"`                       // 文章标签数组，可选
	CoverImage string               `json:"cover_image"`                // 文章封面图片URL，可选
	UserID     string               `json:"user_id"`                    // 作者用户ID，必填
}

// Create 创建新文章
// 验证文章数据并保存到数据库
// 返回创建的文章对象和可能的错误
func (s *CreateArticleService) Create(c *gin.Context) (*models.Article, error) {
	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		// 记录操作日志 - 无效的用户ID
		if c != nil {
			go func() {
				_ = LogArticleCreate(c, uuid.Nil, "unknown", "", s.Title, false, "无效的用户ID")
			}()
		}
		return nil, code.ErrInvalidUserID
	}

	// 获取用户名
	userName := "unknown"
	if c != nil {
		if user, exists := c.Get("username"); exists {
			userName = user.(string)
		}
	}

	// 处理封面图片
	coverImageURL, err := processCoverImage(s.CoverImage)
	if err != nil {
		// 记录操作日志 - 封面图片处理失败
		if c != nil {
			go func() {
				_ = LogArticleCreate(c, userID, userName, "", s.Title, false, code.ErrArticleCoverImageInvalid.Message)
			}()
		}
		return nil, code.ErrArticleCoverImageInvalid
	}

	// 创建文章对象
	article := &models.Article{
		Title:      s.Title,
		Content:    s.Content,
		Summary:    s.Summary,
		Status:     s.Status,
		TagsArray:  s.Tags,
		CoverImage: coverImageURL,
		UserID:     userID,
	}

	// 验证文章数据
	if err := article.Validate(); err != nil {
		// 记录操作日志 - 文章验证失败
		if c != nil {
			go func() {
				_ = LogArticleCreate(c, userID, userName, "", s.Title, false, err.Error())
			}()
		}
		return nil, err
	}

	// 保存文章到数据库
	if err := models.DB.Create(article).Error; err != nil {
		// 记录操作日志 - 创建失败
		if c != nil {
			go func() {
				_ = LogArticleCreate(c, userID, userName, "", s.Title, false, "创建文章失败")
			}()
		}
		return nil, code.ErrArticleCreateFailed
	}

	// 记录操作日志 - 创建成功
	if c != nil {
		go func() {
			_ = LogArticleCreate(c, userID, userName, article.ID.String(), article.Title, true, "")
		}()
	}

	return article, nil
}

// UpdateArticleService 更新文章服务结构体
// 用于处理更新文章的请求和业务逻辑
type UpdateArticleService struct {
	ID         string               `uri:"id" binding:"required"`        // 文章ID，从URL路径获取，必填
	Title      string               `json:"title" binding:"omitempty"`   // 文章标题，可选
	Content    string               `json:"content" binding:"omitempty"` // 文章内容，可选
	Summary    string               `json:"summary"`                     // 文章摘要，可选
	Status     models.ArticleStatus `json:"status" binding:"omitempty"`  // 文章状态，可选
	Tags       []string             `json:"tags"`                        // 文章标签数组，可选
	CoverImage string               `json:"cover_image"`                 // 文章封面图片URL，可选
	UserID     string               `json:"user_id"`                     // 作者用户ID，用于权限验证
}

// Update 更新现有文章
// 验证权限并更新文章数据
// 返回更新后的文章对象和可能的错误
func (s *UpdateArticleService) Update(c *gin.Context) (*models.Article, error) {
	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		// 记录操作日志 - 无效的用户ID
		if c != nil {
			go func() {
				_ = LogArticleUpdate(c, uuid.Nil, "unknown", s.ID, s.Title, false, "无效的用户ID")
			}()
		}
		return nil, code.ErrInvalidUserID
	}

	// 获取用户名
	userName := "unknown"
	if c != nil {
		if user, exists := c.Get("username"); exists {
			userName = user.(string)
		}
	}

	// 查找要更新的文章
	var article models.Article
	if err := models.DB.Where("id = ?", s.ID).First(&article).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 记录操作日志 - 文章不存在
			if c != nil {
				go func() {
					_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, "文章不存在")
				}()
			}
			return nil, code.ErrArticleNotFound
		}
		// 记录操作日志 - 查询失败
		if c != nil {
			go func() {
				_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, "查询文章失败")
			}()
		}
		return nil, code.ErrArticleGetFailed
	}

	// 检查权限：只有文章作者可以更新文章
	if article.UserID != userID {
		// 记录操作日志 - 权限不足
		if c != nil {
			go func() {
				_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, "权限不足")
			}()
		}
		return nil, code.ErrArticlePermissionDenied
	}

	// 验证输入数据 - 在赋值前验证
	if s.Title != "" && strings.TrimSpace(s.Title) == "" {
		// 记录操作日志 - 标题为空
		if c != nil {
			go func() {
				_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, "文章标题不能为空")
			}()
		}
		return nil, errors.New(code.ErrArticleTitleEmpty.Error())
	}
	if s.Content != "" && strings.TrimSpace(s.Content) == "" {
		// 记录操作日志 - 内容为空
		if c != nil {
			go func() {
				_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, "文章内容不能为空")
			}()
		}
		return nil, errors.New(code.ErrArticleContentEmpty.Error())
	}
	if s.Status != models.ArticleStatus("") {
		// 验证状态是否有效
		if s.Status != models.ArticleStatusDraft && s.Status != models.ArticleStatusPublished && s.Status != models.ArticleStatusPrivate {
			// 记录操作日志 - 状态无效
			if c != nil {
				go func() {
					_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, "无效的文章状态")
				}()
			}
			return nil, errors.New(code.ErrArticleStatusInvalid.Error())
		}
	}

	// 可选更新文章数据 - 只更新非空字段
	if s.Title != "" {
		article.Title = s.Title
	}
	if s.Content != "" {
		article.Content = s.Content
	}
	if s.Summary != "" {
		article.Summary = s.Summary
	}
	if s.Status != models.ArticleStatus("") {
		article.Status = s.Status
	}
	if s.Tags != nil && len(s.Tags) > 0 {
		article.TagsArray = s.Tags
	}
	if s.CoverImage != "" {
		// 处理封面图片
		coverImageURL, err := processCoverImage(s.CoverImage)
		if err != nil {
			// 记录操作日志 - 封面图片处理失败
			if c != nil {
				go func() {
					_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, code.ErrArticleCoverImageInvalid.Message)
				}()
			}
			return nil, code.ErrArticleCoverImageInvalid
		}
		article.CoverImage = coverImageURL
	}

	// 保存更新后的文章 - 只更新指定的字段
	if err := models.DB.Updates(&article).Error; err != nil {
		// 记录操作日志 - 更新失败
		if c != nil {
			go func() {
				_ = LogArticleUpdate(c, userID, userName, s.ID, s.Title, false, "更新文章失败")
			}()
		}
		return nil, code.ErrArticleUpdateFailed
	}

	// 记录操作日志 - 更新成功
	if c != nil {
		go func() {
			_ = LogArticleUpdate(c, userID, userName, article.ID.String(), article.Title, true, "")
		}()
	}

	return &article, nil
}

// DeleteArticleService 删除文章服务结构体
// 用于处理删除文章的请求和业务逻辑
type DeleteArticleService struct {
	ID     string    `uri:"id" binding:"required"` // 文章ID，从URL路径获取，必填
	UserID uuid.UUID `json:"user_id"`              // 作者用户ID，用于权限验证
}

// Delete 删除指定文章
// 验证权限并从数据库中删除文章
// 返回可能的错误
func (s *DeleteArticleService) Delete(c *gin.Context) error {
	// 获取用户名
	userName := "unknown"
	if c != nil {
		if user, exists := c.Get("username"); exists {
			userName = user.(string)
		}
	}

	// 查找要删除的文章
	var article models.Article
	if err := models.DB.Where("id = ?", s.ID).First(&article).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 记录操作日志 - 文章不存在
			if c != nil {
				go func() {
					_ = LogArticleDelete(c, s.UserID, userName, s.ID, "", false, "文章不存在")
				}()
			}
			return code.ErrArticleNotFound
		}
		// 记录操作日志 - 查询失败
		if c != nil {
			go func() {
				_ = LogArticleDelete(c, s.UserID, userName, s.ID, "", false, "查询文章失败")
			}()
		}
		return code.ErrArticleGetFailed
	}

	// 检查权限：只有文章作者可以删除文章
	if article.UserID != s.UserID {
		// 记录操作日志 - 权限不足
		if c != nil {
			go func() {
				_ = LogArticleDelete(c, s.UserID, userName, s.ID, article.Title, false, "权限不足")
			}()
		}
		return code.ErrArticlePermissionDenied
	}

	// 从数据库中删除文章
	if err := models.DB.Delete(&article).Error; err != nil {
		// 记录操作日志 - 删除失败
		if c != nil {
			go func() {
				_ = LogArticleDelete(c, s.UserID, userName, s.ID, article.Title, false, "删除文章失败")
			}()
		}
		return code.ErrArticleDeleteFailed
	}

	// 记录操作日志 - 删除成功
	if c != nil {
		go func() {
			_ = LogArticleDelete(c, s.UserID, userName, article.ID.String(), article.Title, true, "")
		}()
	}

	return nil
}

// GetArticlesByRoleService 根据用户角色获取文章服务
type GetArticlesByRoleService struct {
	Page     int      `json:"page" form:"page" binding:"min=1"`         // 页码，最小为1
	PageSize int      `json:"page_size" form:"page_size" binding:"min=1,max=100"` // 每页数量，最小为1，最大为100
	Status   string   `json:"status" form:"status"`                         // 文章状态筛选
	Tags     []string `json:"tags" form:"tags"`                            // 多个标签筛选
	Title    string   `json:"title" form:"title"`                          // 标题筛选
	// 排序相关参数
	SortBy   string   `json:"sort_by" form:"sort_by"`                      // 排序字段：created_at, updated_at, title, view_count, like_count, published_at
	SortDir  string   `json:"sort_dir" form:"sort_dir"`                     // 排序方向：asc(升序), desc(降序)
}

// SortDirection 排序方向枚举
type SortDirection string

const (
	SortDirectionAsc  SortDirection = "asc"  // 升序
	SortDirectionDesc SortDirection = "desc" // 降序
)

// SortField 排序字段枚举
type SortField string

const (
	SortFieldCreatedAt  SortField = "created_at"   // 创建时间
	SortFieldUpdatedAt  SortField = "updated_at"   // 更新时间
	SortFieldTitle     SortField = "title"        // 标题
	SortFieldViewCount SortField = "view_count"   // 浏览次数
	SortFieldLikeCount SortField = "like_count"   // 点赞次数
	SortFieldPublishedAt SortField = "published_at" // 发布时间
)

// GetSortOrder 获取排序字符串，用于GORM的Order方法
func (service *GetArticlesByRoleService) GetSortOrder() string {
	// 默认排序字段和方向
	field := string(SortFieldCreatedAt)
	direction := string(SortDirectionDesc)

	// 如果指定了排序字段，验证并使用
	if service.SortBy != "" {
		switch SortField(service.SortBy) {
		case SortFieldCreatedAt, SortFieldUpdatedAt, SortFieldTitle,
			SortFieldViewCount, SortFieldLikeCount, SortFieldPublishedAt:
			field = service.SortBy
		}
	}

	// 如果指定了排序方向，验证并使用
	if service.SortDir != "" {
		switch SortDirection(service.SortDir) {
		case SortDirectionAsc, SortDirectionDesc:
			direction = service.SortDir
		}
	}

	return field + " " + direction
}

// GetArticlesByRole 根据用户角色获取文章
// 管理员返回所有用户的全部文章，非管理员返回用户自己创建的文章
// 支持分页查询、筛选和自定义排序
// 
// 排序参数使用说明：
// - sort_by: 排序字段，可选值：created_at, updated_at, title, view_count, like_count, published_at
// - sort_dir: 排序方向，可选值：asc(升序), desc(降序)
// 
// 示例：
// - 按创建时间降序：sort_by=created_at&sort_dir=desc
// - 按浏览次数升序：sort_by=view_count&sort_dir=asc
// - 按标题降序：sort_by=title&sort_dir=desc
func (service *GetArticlesByRoleService) GetArticlesByRole(userID string, userRole string) ([]models.Article, int64, error) {
	postgreDB := models.DB
	var articles []models.Article
	var total int64

	// 构建查询
	query := postgreDB.Model(&models.Article{})

	// 根据用户角色添加筛选条件
	if userRole != "admin" {
		// 非管理员只能查看自己的文章
		query = query.Where("user_id = ?", userID)
	}

	// 添加状态筛选
	if service.Status != "" {
		query = query.Where("status = ?", service.Status)
	}

	// 添加多个标签筛选
	if len(service.Tags) > 0 {
		// 使用AND条件，确保文章包含所有指定的标签
		for _, tag := range service.Tags {
			query = query.Where("? = ANY (tags_array)", tag)
		}
	}

	// 添加标题筛选
	if service.Title != "" {
		query = query.Where("title ILIKE ?", "%"+service.Title+"%")
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, code.ErrDatabase
	}

	// 添加排序和分页
	offset := (service.Page - 1) * service.PageSize
	// 使用GetSortOrder方法获取排序字符串，支持自定义排序
	if err := query.Order(service.GetSortOrder()).Offset(offset).Limit(service.PageSize).Find(&articles).Error; err != nil {
		// 日志打印 完整sql语句
		logger.Logger.Error("获取文章列表失败", err)
		return nil, 0, code.ErrDatabase
	}

	// 结果不需要内容字段
	for i := range articles {
		articles[i].Content = ""
	}

	return articles, total, nil
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
func (s *GetArticleService) Get(c *gin.Context) (*models.Article, error) {
	// 查询文章是否存在
	var article models.Article
	if err := models.DB.Where("id = ?", s.ID).First(&article).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 记录操作日志 - 文章不存在
			var userID uuid.UUID
			var userName string
			
			if s.UserID == "" {
				// 游客访问
				userID = uuid.Nil
				userName = "guest"
			} else {
				// 登录用户访问
				userID, _ = uuid.Parse(s.UserID)
				userName = "unknown" // 可以从上下文获取用户名
				if user, exists := c.Get("user"); exists {
					if u, ok := user.(*models.User); ok {
						userName = u.Nickname
					}
				}
			}
			
			LogArticleAccessAttempt(c, userID, userName, s.ID, "", false, "文章不存在")
			return nil, code.ErrArticleNotFound
		}
		return nil, code.ErrArticleGetFailed
	}

	// 处理游客访问情况
	var userID uuid.UUID
	var userName string
	var isGuest bool
	
	if s.UserID == "" {
		// 游客访问
		userID = uuid.Nil
		userName = "guest"
		isGuest = true
	} else {
		// 登录用户访问
		var err error
		userID, err = uuid.Parse(s.UserID)
		if err != nil {
			// 记录操作日志 - 无效的用户ID
			LogArticleAccessAttempt(c, uuid.Nil, "unknown", s.ID, article.Title, false, "无效的用户ID")
			userName = "guest"
			isGuest = true
		} else {
			// 获取用户名（可以从上下文或数据库获取）
			userName = "unknown" // 可以从上下文获取用户名
			if user, exists := c.Get("user"); exists {
				if u, ok := user.(*models.User); ok {
					userName = u.Nickname
				}
			}
			isGuest = false
		}
	}
	
	// 如果不是文章作者本人，则增加浏览次数（包括游客）
	if isGuest || article.UserID != userID {
		article.ViewCount++
		models.DB.Save(&article)
	}
	
	// 记录操作日志 - 成功访问
	var accessDesc string
	if isGuest {
		accessDesc = "游客访问"
	} else if article.UserID == userID {
		accessDesc = "作者访问"
	} else {
		accessDesc = "用户访问"
	}
	LogArticleAccessAttempt(c, userID, userName, s.ID, article.Title, true, accessDesc)

	return &article, nil
}

// ListArticleService 文章列表服务结构体
// 用于处理获取文章列表的请求和业务逻辑
type ListArticleService struct {
	Page      int          `form:"page" binding:"min=1"`              // 页码，最小为1
	PageSize  int          `form:"page_size" binding:"min=1,max=100"` // 每页数量，最小1，最大100
	Nickname  string       `form:"nickname"`                          // 可选，用于按作者昵称模糊匹配
	Tag       string       `form:"tag"`                               // 可选，用于按标签模糊匹配
	Title     string       `form:"title"`                             // 可选，用于按文章标题模糊匹配
	SortBy    string       `form:"sort_by"`                           // 可选，排序字段(view_count,like_count,created_at)
	SortOrder string       `form:"sort_order"`                        // 可选，排序顺序(asc,desc)
	c         *gin.Context // Gin上下文
}

// SetContext 设置Gin上下文
func (s *ListArticleService) SetContext(c *gin.Context) {
	s.c = c
}

// List 获取文章列表
// 根据请求参数查询文章列表，支持分页和筛选
// 无需认证即可访问，默认返回已发布文章
func (s *ListArticleService) List() ([]models.Article, int64, error) {
	// 生成缓存键
	cacheKey := s.generateCacheKey()

	// 尝试从Redis获取缓存
	redisClient := redis.GetRedisClient()
	ctx := context.Background()
	cachedData, err := redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		// 缓存命中，解析缓存数据
		var cacheResult struct {
			Articles []models.Article `json:"articles"`
			Total    int64            `json:"total"`
		}
		if err := json.Unmarshal([]byte(cachedData), &cacheResult); err == nil {
			return cacheResult.Articles, cacheResult.Total, nil
		}
	}

	// 缓存未命中，查询数据库
	// 设置默认值
	if s.Page == 0 {
		s.Page = 1
	}
	if s.PageSize == 0 {
		s.PageSize = 10
	}
	if s.SortBy == "" {
		s.SortBy = "created_at"
	}
	if s.SortOrder == "" {
		s.SortOrder = "desc"
	}

	// 构建基础查询 - 只查询已发布的文章，并预加载用户信息
	query := models.DB.Model(&models.Article{}).Preload("User").Where("status = ?", models.ArticleStatusPublished)

	// 如果指定了作者昵称，则按昵称模糊匹配
	if s.Nickname != "" {
		query = query.Joins("JOIN users ON articles.user_id = users.id").
			Where("users.nickname LIKE ?", "%"+s.Nickname+"%")
	}

	// 如果指定了标签，则按标签模糊匹配
	if s.Tag != "" {
		query = query.Where("JSON_CONTAINS(tags_array, ?)", fmt.Sprintf(`"%s"`, s.Tag))
	}

	// 如果指定了标题，则按标题模糊匹配
	if s.Title != "" {
		query = query.Where("title LIKE ?", "%"+s.Title+"%")
	}

	// 获取总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 构建排序
	orderClause := "created_at DESC" // 默认按创建时间倒序
	switch s.SortBy {
	case "view_count":
		orderClause = "view_count " + s.SortOrder
	case "like_count":
		orderClause = "like_count " + s.SortOrder
	case "created_at":
		orderClause = "created_at " + s.SortOrder
	}

	// 分页查询
	offset := (s.Page - 1) * s.PageSize
	var articles []models.Article
	if err := query.Order(orderClause).Offset(offset).Limit(s.PageSize).Find(&articles).Error; err != nil {
		return nil, 0, err
	}

	// 结果不需要内容字段
	for i := range articles {
		articles[i].Content = ""
	}

	// 将结果存入缓存，缓存5分钟
	cacheData := struct {
		Articles []models.Article `json:"articles"`
		Total    int64            `json:"total"`
	}{
		Articles: articles,
		Total:    total,
	}

	if jsonData, err := json.Marshal(cacheData); err == nil {
		redisClient.Set(ctx, cacheKey, jsonData, 5*time.Minute)
	}

	return articles, total, nil
}

// generateCacheKey 生成缓存键
func (s *ListArticleService) generateCacheKey() string {
	// 使用查询参数生成唯一的缓存键
	return fmt.Sprintf("articles:list:%s:%s:%s:%s:%s:%d:%d",
		s.Nickname, s.Tag, s.Title, s.SortBy, s.SortOrder, s.Page, s.PageSize)
}

// LikeArticleService 点赞文章服务结构体
// 用于处理点赞文章的请求和业务逻辑
type LikeArticleService struct {
	ID     string `uri:"id" binding:"required"` // 文章ID，从URL路径获取，必填
	UserID string `json:"user_id"`              // 点赞用户ID，用于日志记录
}

// Like 点赞文章
// 增加文章的点赞次数
// 返回可能的错误
func (s *LikeArticleService) Like(c *gin.Context) error {
	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		// 记录操作日志 - 无效的用户ID
		if c != nil {
			go func() {
				_ = LogArticleLike(c, uuid.Nil, "unknown", s.ID, "", false, "无效的用户ID")
			}()
		}
		return code.ErrInvalidUserID
	}

	// 获取用户名
	userName := "unknown"
	if c != nil {
		if user, exists := c.Get("username"); exists {
			userName = user.(string)
		}
	}

	// 查找要点赞的文章
	var article models.Article
	if err := models.DB.Where("id = ?", s.ID).First(&article).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 记录操作日志 - 文章不存在
			if c != nil {
				go func() {
					_ = LogArticleLike(c, userID, userName, s.ID, "", false, "文章不存在")
				}()
			}
			return code.ErrArticleNotFound
		}
		// 记录操作日志 - 查询失败
		if c != nil {
			go func() {
				_ = LogArticleLike(c, userID, userName, s.ID, "", false, "查询文章失败")
			}()
		}
		return code.ErrArticleGetFailed
	}

	// 增加点赞次数
	article.LikeCount++
	if err := models.DB.Save(&article).Error; err != nil {
		// 记录操作日志 - 点赞失败
		if c != nil {
			go func() {
				_ = LogArticleLike(c, userID, userName, s.ID, article.Title, false, "点赞失败")
			}()
		}
		return code.ErrArticleUpdateFailed
	}

	// 记录操作日志 - 点赞成功
	if c != nil {
		go func() {
			_ = LogArticleLike(c, userID, userName, article.ID.String(), article.Title, true, "")
		}()
	}

	return nil
}

// UpdateArticleStatusService 更新文章状态服务结构体
// 用于处理更新文章状态的请求和业务逻辑
type UpdateArticleStatusService struct {
	ID     string               `uri:"id" json:"id" binding:"required"`      // 文章ID，从URL路径获取，必填
	Status models.ArticleStatus `json:"status" binding:"required"` // 新的文章状态，必填
	UserID string               `json:"user_id"`                   // 作者用户ID，用于权限验证
}

// UpdateStatus 更新文章状态
// 验证权限并更新文章状态
// 返回可能的错误
func (s *UpdateArticleStatusService) UpdateStatus(c *gin.Context) error {
	// 将字符串类型的ID转换为UUID类型
	articleID, err := uuid.Parse(s.ID)
	if err != nil {
		// 记录操作日志 - 无效的文章ID
		if c != nil {
			go func() {
				_ = LogArticleStatusUpdate(c, uuid.Nil, "unknown", s.ID, "", "", "", false, "无效的文章ID")
			}()
		}
		return code.ErrParam
	}

	// 将字符串类型的UserID转换为UUID类型
	userID, err := uuid.Parse(s.UserID)
	if err != nil {
		// 记录操作日志 - 无效的用户ID
		if c != nil {
			go func() {
				_ = LogArticleStatusUpdate(c, uuid.Nil, "unknown", s.ID, "", "", "", false, "无效的用户ID")
			}()
		}
		return code.ErrInvalidUserID
	}

	// 获取用户名
	userName := "unknown"
	if c != nil {
		if user, exists := c.Get("username"); exists {
			userName = user.(string)
		}
	}

	// 查询文章是否存在
	var article models.Article
	if err := models.DB.Where("id = ?", articleID).First(&article).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 记录操作日志 - 文章不存在
		if c != nil {
			go func() {
				_ = LogArticleStatusUpdate(c, userID, userName, s.ID, "", "", "", false, "文章不存在")
			}()
		}
		return code.ErrArticleNotFound
		}
		// 记录操作日志 - 查询失败
		if c != nil {
			go func() {
				_ = LogArticleStatusUpdate(c, userID, userName, s.ID, "", "", "", false, "查询文章失败")
			}()
		}
		return code.ErrDatabase
	}

	// 保存原始状态用于日志记录
	oldStatus := article.Status

	// 检查用户是否有权限更新文章状态
	if article.UserID != userID {
		// 记录操作日志 - 权限不足
		if c != nil {
			go func() {
				_ = LogArticleStatusUpdate(c, userID, userName, s.ID, article.Title, string(oldStatus), string(s.Status), false, "权限不足")
			}()
		}
		return code.ErrArticlePermissionDenied
	}

	// 验证状态是否有效
	if s.Status != models.ArticleStatusDraft && s.Status != models.ArticleStatusPublished && s.Status != models.ArticleStatusPrivate {
		// 记录操作日志 - 状态无效
		if c != nil {
			go func() {
				_ = LogArticleStatusUpdate(c, userID, userName, s.ID, article.Title, string(oldStatus), string(s.Status), false, "无效的文章状态")
			}()
		}
		return code.ErrArticleStatusInvalid
	}

	// 更新文章状态
	if err := models.DB.Model(&article).Update("status", s.Status).Error; err != nil {
		// 记录操作日志 - 更新失败
		if c != nil {
			go func() {
				_ = LogArticleStatusUpdate(c, userID, userName, s.ID, article.Title, string(oldStatus), string(s.Status), false, "更新文章状态失败")
			}()
		}
		return code.ErrArticleUpdateFailed
	}

	// 记录操作日志 - 更新成功
	if c != nil {
		go func() {
			_ = LogArticleStatusUpdate(c, userID, userName, article.ID.String(), article.Title, string(oldStatus), string(s.Status), true, "")
		}()
	}

	return nil
}
