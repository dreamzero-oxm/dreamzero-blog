package api

import (
	"blog-server/internal"
	IError "blog-server/internal/code"
	logger "blog-server/internal/logger"
	"blog-server/service"
	"github.com/gin-gonic/gin"
)

type PhotoController struct {
}

func PhotoTestApi(c *gin.Context) {
	var serive service.UploadPhotoService
	if err := c.ShouldBind(&serive); err != nil {
		internal.APIResponse(c, IError.ErrBind, err.Error())
		return
	}
	data, err := serive.UploadPhoto()
	if err != nil {
		internal.APIResponse(c, IError.ErrPhotoUpload, err.Error())
		return
	}
	internal.APIResponse(c, IError.OK, data)
}

func (controller *PhotoController) Init(engine *gin.RouterGroup) error {
	logger.Logger.Info("init photo controller")
	engine = engine.Group("/photo")
	engine.POST("/test", PhotoTestApi)
	return nil
}
