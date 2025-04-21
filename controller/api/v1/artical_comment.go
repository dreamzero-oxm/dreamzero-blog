package v1

import (
	"blog-server/internal"
	"blog-server/service"
	IError "blog-server/internal/code"

	"github.com/gin-gonic/gin"
)

type ArticalCommentController struct {
}

func AddComment(c *gin.Context) {
	var service service.AddCommentService
	if err := c.ShouldBind(&service); err == nil {
		if res := service.AddComment(); res != nil {
			internal.APIResponse(c, IError.ErrArticalCommentCreateFailed, nil)
		}
		internal.APIResponse(c, IError.OK, nil)
	} else {
		internal.APIResponse(c, IError.ErrBind, nil)
	}
}

func (controller *ArticalCommentController) InitRouter(router *gin.RouterGroup) error {
	router = router.Group("/artical_comment")
	router.POST("/add", AddComment)
	return nil
}
