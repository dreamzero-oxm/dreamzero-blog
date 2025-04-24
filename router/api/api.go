package api

import (
	v1 "blog-server/controller/api/v1"

	"github.com/gin-gonic/gin"
)

// RegisterAPIV1 ...
func RegisterAPIV1(apiGroup *gin.RouterGroup) {
	var (
		photoController          *v1.PhotoController
		articalCommentController *v1.ArticalCommentController
		userController           *v1.UserController
	)
	if err := photoController.InitRouter(apiGroup); err != nil {
		panic(err)
	}
	if err := articalCommentController.InitRouter(apiGroup); err != nil {
		panic(err)
	}
	if err := userController.InitRouter(apiGroup); err!= nil {
		panic(err)
	}
}
