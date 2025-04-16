package api

import (
	v1 "blog-server/controller/api/v1"
	"github.com/gin-gonic/gin"
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
