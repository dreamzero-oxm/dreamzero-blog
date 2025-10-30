package api

import (
	v1 "blog-server/controller/api/v1"

	"github.com/gin-gonic/gin"
)

// RegisterAPIV1 ...
func RegisterAPIV1(apiGroup *gin.RouterGroup) {
	var (
		photoController          *v1.PhotoController
		articleCommentController *v1.ArticleCommentController
		userController           *v1.UserController
		articleController        *v1.ArticleController
	)
	if err := photoController.InitRouter(apiGroup); err != nil {
		panic(err)
	}
	if err := articleCommentController.InitRouter(apiGroup); err != nil {
		panic(err)
	}
	if err := userController.InitRouter(apiGroup); err != nil {
		panic(err)
	}
	if err := articleController.InitRouter(apiGroup); err != nil {
		panic(err)
	}
}
