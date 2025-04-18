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

// @Summary 测试
// @Description 测试
// @Tags photo
// @Accept json
// @Produce json
// @Success 200 {object} internal.Response{data=string}
// @Router /photo/test [get]
func PhotoTestApi(c *gin.Context) {
	internal.APIResponse(c, IError.OK, "hello photo")
}

// @Summary 上传图片
// @Description 上传图片
// @Tags photo
// @Accept multipart/form-data
// @Produce json
// @Param photos formData file true "图片"
// @Success 200 {object} internal.Response{data=string}
// @Router /photo/upload [post]
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

// @Summary 获取图片列表
// @Description 获取图片列表
// @Tags photo
// @Accept json
// @Produce json
// @Success 200 {object} internal.Response{data=[]model.Photo}
// @Router /photo/list [get]
func ListPhoto(c *gin.Context) {
	var service service.ListPhotoService
	photos, err := service.ListPhoto()
	if err!= nil {
		internal.APIResponse(c, IError.ErrPhotoList, err.Error())
		return
	}
	internal.APIResponse(c, IError.OK, photos)
}

func (controller *PhotoController) Init(engine *gin.RouterGroup) error {
	logger.Logger.Info("init photo controller")
	engine = engine.Group("/photo")
	engine.GET("/test", PhotoTestApi)
	engine.POST("/upload", UploadPhoto)
	engine.GET("/list", ListPhoto)
	return nil
}
