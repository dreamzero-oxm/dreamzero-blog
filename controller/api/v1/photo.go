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
	internal.APIResponse(c, IError.OK, "hello photo")
}

func UploadPhoto(c *gin.Context) {
	form, err := c.MultipartForm()
	if err!= nil {
		internal.APIResponse(c, IError.ErrPhotoUpload, err.Error())
		return
	}
	files := form.File["photos"]
	if len(files) == 0 {
		internal.APIResponse(c, IError.ErrPhotoUpload, "no photo")
		return
	}
	var service service.UploadPhotoService
	service.Photos = files
	success, fail, err := service.UploadPhoto()
	if err != nil {
		internal.APIResponse(c, IError.ErrPhotoUpload, err.Error())
		return
	}
	data := struct{
		Success int `json:"success"`
		Fail    int `json:"fail"`
	}{
		Success: success,
		Fail:    fail,
	}
	internal.APIResponse(c, IError.OK, data)
}

func (controller *PhotoController) Init(engine *gin.RouterGroup) error {
	logger.Logger.Info("init photo controller")
	engine = engine.Group("/photo")
	engine.GET("/test", PhotoTestApi)
	engine.POST("/upload", UploadPhoto)
	return nil
}
