package v1

import (
	"blog-server/internal"
	IError "blog-server/internal/code"
	"blog-server/service"

	"github.com/gin-gonic/gin"
)

type ArticleCommentController struct {
}

// @Summary 添加评论
// @Description 添加评论
// @Tags article_comment
// @Accept json
// @Produce json
// @Param comment body service.AddCommentService true "评论信息"
// @Success 200 {object} internal.Response{data=string}
// @Failure 20301 {object} internal.Response{data=string}
// @Router /article_comment/add [post]
func AddComment(c *gin.Context) {
	var service service.AddCommentService
	if err := c.ShouldBind(&service); err == nil {
		if err := service.AddComment(); err != nil {
			internal.APIResponse(c, IError.ErrArticleCommentCreateFailed, err.Error())
		} else {
			internal.APIResponse(c, IError.OK, nil)
		}
	} else {
		internal.APIResponse(c, IError.ErrBind, nil)
	}
}

// @Summary 获取评论列表
// @Description 获取评论列表
// @Tags article_comment
// @Accept json
// @Produce json
// @Param article_title query []string false "文章标题列表"
// @Param is_notify query bool false "是否通知"
// @Param is_read query bool false "是否已读"
// @Param is_pass query bool false "是否通过审核"
// @Param notify_desc query bool false "通知排序"
// @Param read_desc query bool false "已读排序"
// @Param pass_desc query bool false "通过审核排序"
// @Success 200 {object} internal.Response{data=[]models.ArticleComment}
// @Failure 20302 {object} internal.Response{data=string}
// @Router /article_comment/list [get]
func ListComment(c *gin.Context) {
	var service service.ListCommentService
	if err := c.ShouldBind(&service); err == nil {
		if res, err := service.ListComment(); err != nil {
			internal.APIResponse(c, IError.ErrArticleCommentListFailed, err.Error())
		} else {
			internal.APIResponse(c, IError.OK, res)
		}
	} else {
		internal.APIResponse(c, IError.ErrBind, nil)
	}
}

func (controller *ArticleCommentController) InitRouter(router *gin.RouterGroup) error {
	articleCommentGroup := router.Group("/article_comment")
	articleCommentGroup.POST("/add", AddComment)
	articleCommentGroup.GET("/list", ListComment)

	return nil
}
