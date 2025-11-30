package v1

import (
	"blog-server/internal"
	"blog-server/internal/code"
	"blog-server/internal/middleware"
	"blog-server/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	// 将uuid.UUID转换为字符串
	createService.UserID = userID.(string)

	article, err := createService.Create(c)
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
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	// 将uuid.UUID转换为字符串
	updateService.UserID = userID.(string)

	article, err := updateService.Update(c)
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
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	// 将userID转换为字符串
	if res, err := uuid.Parse(userID.(string)); err == nil {
		deleteService.UserID = res
	} else {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	if err := deleteService.Delete(c); err != nil {
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
	userID, exists := c.Get("userID")
	if !exists {
		// 如果用户未登录，设置UserID为空字符串
		getService.UserID = ""
	} else {
		// 将uuid.UUID转换为字符串
		getService.UserID = userID.(string)
	}

	article, err := getService.Get(c)
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, article)
}

// ListArticles 获取文章列表
// @Summary 获取文章列表
// @Description 获取文章列表，支持分页和筛选。无需认证即可访问，默认返回已发布文章。
// @Tags article
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Param nickname query string false "作者昵称" 
// @Param tag query string false "单个标签"
// @Param title query string false "文章标题"
// @Param sort_by query string false "排序字段" Enums(view_count,like_count,created_at) default(created_at)
// @Param sort_order query string false "排序顺序" Enums(asc,desc) default(desc)
// @Success 200 {object} internal.Response{data=object{articles=[]object{id=string,title=string,nickname=string,published_at=time.Time,tags=[]string},total=int64}}
// @Router /articles [get]
func (a *ArticleController) ListArticles(c *gin.Context) {
	var listService service.ListArticleService
	if err := c.ShouldBindQuery(&listService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 设置上下文（不再需要JWT信息）
	listService.SetContext(c)

	articles, total, err := listService.List()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	// 只返回必要的字段：文章ID、标题、作者昵称、发布时间和标签列表
	for i := range articles {
		articles[i].Content = ""
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

	// 从JWT中获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	// 将uuid.UUID转换为字符串
	likeService.UserID = userID.(string)

	if err := likeService.Like(c); err != nil {
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
	// 绑定JSON请求体中的其他字段
	if err := c.ShouldBindJSON(&updateStatusService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 从JWT中获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	// 将uuid.UUID转换为字符串
	updateStatusService.UserID = userID.(string)

	if err := updateStatusService.UpdateStatus(c); err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	internal.APIResponse(c, nil, nil)
}

// GetArticlesByRole 根据用户角色获取文章
// @Summary 根据用户角色获取文章
// @Description 管理员返回所有用户的全部文章，非管理员返回用户自己创建的文章。支持多种排序方式。
// @Tags article
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Param status query string false "文章状态筛选"
// @Param tag query string false "标签筛选"
// @Param tags query []string false "多个标签筛选"
// @Param title query string false "标题筛选"
// @Param sort_by query string false "排序字段" Enums(created_at,updated_at,title,view_count,like_count,published_at) default("created_at")
// @Param sort_dir query string false "排序方向" Enums(asc,desc) default("desc")
// @Success 200 {object} internal.Response{data=object{articles=[]models.Article,total=int64}}
// @Router /articles/by-role [get]
func (a *ArticleController) GetArticlesByRole(c *gin.Context) {
	var getArticlesByRoleService service.GetArticlesByRoleService
	// 绑定查询参数
	if err := c.ShouldBindQuery(&getArticlesByRoleService); err != nil {
		internal.APIResponse(c, code.ErrParam, nil)
		return
	}

	// 处理tags参数
	tags := c.QueryArray("tags")
	if len(tags) > 0 {
		getArticlesByRoleService.Tags = tags
	}

	// 设置默认值
	if getArticlesByRoleService.Page == 0 {
		getArticlesByRoleService.Page = 1
	}
	if getArticlesByRoleService.PageSize == 0 {
		getArticlesByRoleService.PageSize = 10
	}

	// 从JWT中获取用户ID和角色
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}

	userRole, exists := c.Get("role")
	if !exists {
		// 如果JWT中没有角色信息，默认为普通用户
		userRole = "user"
	}

	// 调用服务获取文章
	articles, total, err := getArticlesByRoleService.GetArticlesByRole(userID.(string), userRole.(string))
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}

	// 返回结果
	result := map[string]interface{}{
		"articles": articles,
		"total":    total,
	}
	internal.APIResponse(c, nil, result)
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
	authGroup.GET("by-role", a.GetArticlesByRole)           // 根据用户角色获取文章
	return nil
}