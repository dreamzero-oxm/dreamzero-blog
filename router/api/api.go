package api

import (
	"github.com/gin-gonic/gin"
	v1 "blog-server/controller/api/v1"
)

// RegisterAPIV1 ...
func RegisterAPIV1(apiGroup *gin.RouterGroup) {
	var (
		photoController *v1.PhotoController
	)
	if err := photoController.Init(apiGroup); err != nil {
		panic(err)
	}
}
