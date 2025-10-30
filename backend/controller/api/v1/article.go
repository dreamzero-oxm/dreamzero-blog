package v1

import (
	"blog-server/internal"
	"blog-server/internal/code"
	"blog-server/internal/middleware"
	"blog-server/service"

	"github.com/gin-gonic/gin"
)

type ArticleController struct{}

// CreateArticle 创建文章
// @Summary 创建文章
// @Description 创建一篇新文章
// @Tags article
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param article body service.CreateArticleService true "文章信息"
// @Success 200 {object} internal.Response{data=models.Article}
// @Router /articles [post]
func (a *ArticleController) CreateArticle(c *gin.Context) {
	var createService service.CreateArticleService
	// 绑定JSON请求体中的字段
	if err := c.ShouldBindJSON(&createService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	createService.UserID = userID.(uint)

	article, err := createService.Create()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, article)
}

// UpdateArticle 更新文章
// @Summary 更新文章
// @Description 更新一篇已存在的文章
// @Tags article
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param id path int true "文章ID"
// @Param article body service.UpdateArticleService true "文章信息"
// @Success 200 {object} internal.Response{data=models.Article}
// @Router /articles/{id} [put]
func (a *ArticleController) UpdateArticle(c *gin.Context) {
	var updateService service.UpdateArticleService
	// 先绑定URI参数中的ID
	if err := c.ShouldBindUri(&updateService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}
	// 再绑定JSON请求体中的其他字段
	if err := c.ShouldBindJSON(&updateService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	updateService.UserID = userID.(uint)

	article, err := updateService.Update()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, article)
}

// DeleteArticle 删除文章
// @Summary 删除文章
// @Description 删除一篇已存在的文章
// @Tags article
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param id path int true "文章ID"
// @Success 200 {object} internal.Response
// @Router /articles/{id} [delete]
func (a *ArticleController) DeleteArticle(c *gin.Context) {
	var deleteService service.DeleteArticleService
	// 绑定URI参数中的ID
	if err := c.ShouldBindUri(&deleteService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	deleteService.UserID = userID.(uint)

	if err := deleteService.Delete(); err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, nil)
}

// GetArticle 获取文章详情
// @Summary 获取文章详情
// @Description 获取一篇文章的详细信息
// @Tags article
// @Accept json
// @Produce json
// @Param id path int true "文章ID"
// @Success 200 {object} internal.Response{data=models.Article}
// @Router /articles/{id} [get]
func (a *ArticleController) GetArticle(c *gin.Context) {
	var getService service.GetArticleService
	// 绑定URI参数中的ID
	if err := c.ShouldBindUri(&getService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		// 如果用户未登录，设置UserID为0
		getService.UserID = 0
	} else {
		getService.UserID = userID.(uint)
	}

	article, err := getService.Get()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, article)
}

// ListArticles 获取文章列表
// @Summary 获取文章列表
// @Description 获取文章列表，支持分页和筛选。管理员可以查看所有状态、用户或标签的文章，非管理员只能查看公开文章。
// @Tags article
// @Accept json
// @Produce json
// @Param Authorization header string false "Bearer token"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Param status query string false "文章状态" Enums(draft,published,private)
// @Param user_id query int false "用户ID"
// @Param tag query string false "单个标签"
// @Param tags query []string false "多个标签"
// @Success 200 {object} internal.Response{data=object{list=[]models.Article,total=int64}}
// @Router /articles [get]
func (a *ArticleController) ListArticles(c *gin.Context) {
	var listService service.ListArticleService
	if err := c.ShouldBindQuery(&listService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 设置上下文并处理JWT信息
	listService.SetContext(c)

	articles, total, err := listService.List()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, gin.H{
		"articles": articles,
		"total":    total,
		"page":     listService.Page,
		"page_size": listService.PageSize,
	})
}

// LikeArticle 点赞文章
// @Summary 点赞文章
// @Description 为一篇文章点赞
// @Tags article
// @Accept json
// @Produce json
// @Param id path int true "文章ID"
// @Success 200 {object} internal.Response
// @Router /articles/{id}/like [post]
func (a *ArticleController) LikeArticle(c *gin.Context) {
	var likeService service.LikeArticleService
	// 绑定URI参数中的ID
	if err := c.ShouldBindUri(&likeService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	if err := likeService.Like(); err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, nil)
}

// UpdateArticleStatus 更新文章状态
// @Summary 更新文章状态
// @Description 更新一篇文章的状态（发布/草稿）
// @Tags article
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param id path int true "文章ID"
// @Param status body service.UpdateArticleStatusService true "文章状态(draft/published/private)"
// @Success 200 {object} internal.Response
// @Router /articles/{id}/status [put]
func (a *ArticleController) UpdateArticleStatus(c *gin.Context) {
	var updateStatusService service.UpdateArticleStatusService
	// 先绑定URI参数中的ID
	if err := c.ShouldBindUri(&updateStatusService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}
	// 再绑定JSON请求体中的其他字段
	if err := c.ShouldBindJSON(&updateStatusService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("user_id")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	updateStatusService.UserID = userID.(uint)

	if err := updateStatusService.UpdateStatus(); err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, nil)
}

// InitRouter 初始化文章路由
func (a *ArticleController) InitRouter(Router *gin.RouterGroup) error {
	articleRouter := Router.Group("articles")
	// --------------------无需认证-------------------------
	articleRouter.GET("", a.ListArticles)                      // 获取文章列表
	articleRouter.GET(":id", a.GetArticle)                    // 获取文章详情
	// --------------------需要认证-------------------------
	authGroup := articleRouter.Group("")
	authGroup.Use(middleware.JWTAuthMiddleware())
	authGroup.POST("", a.CreateArticle)                    // 创建文章
	authGroup.PUT(":id", a.UpdateArticle)                 // 更新文章
	authGroup.DELETE(":id", a.DeleteArticle)              // 删除文章
	authGroup.POST(":id/like", a.LikeArticle)             // 点赞文章
	authGroup.PUT(":id/status", a.UpdateArticleStatus)     // 更新文章状态
	return nil
}