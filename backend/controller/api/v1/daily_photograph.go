package v1

import (
	"blog-server/internal"
	IError "blog-server/internal/code"
	logger "blog-server/internal/logger"
	"blog-server/internal/middleware"
	"blog-server/internal/models"
	"blog-server/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DailyPhotographController struct {
}

// @Summary 创建日常照片
// @Description 上传日常照片并关联到指定用户
// @Tags daily_photograph
// @Accept multipart/form-data
// @Produce json
// @Param user_id formData string true "用户ID"
// @Param photos formData file true "照片文件"
// @Param title formData string false "照片标题"
// @Param description formData string false "照片描述"
// @Param tags formData string false "照片标签，多个标签用逗号分隔"
// @Param taken_at formData string false "拍摄时间，格式：2006-01-02"
// @Param location formData string false "拍摄地点"
// @Param camera formData string false "相机型号"
// @Param lens formData string false "镜头型号"
// @Param iso formData int false "ISO值"
// @Param aperture formData string false "光圈值"
// @Param shutter_speed formData string false "快门速度"
// @Param focal_length formData int false "焦距"
// @Param is_public formData bool false "是否公开"
// @Success 200 {object} internal.Response{data=object{success=int, fail=int}}
// @Failure 20201 {object} internal.Response{data=string}
// @Router /daily_photograph/create [post]
func CreateDailyPhotograph(c *gin.Context) {
	var service service.CreateDailyPhotographService

	form, err := c.MultipartForm()
	if err != nil {
		internal.APIResponse(c, IError.ErrPhotoUpload, err.Error())
		return
	}
	files := form.File["photos"]
	if len(files) == 0 {
		internal.APIResponse(c, IError.ErrPhotoUpload, "no photo")
		return
	}
	// 绑定表单数据
	service.Photos = files

	// 从JWT中获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, IError.ErrUserNotFound, nil)
		return
	}
	// 将userID转换为字符串
	if res, err := uuid.Parse(userID.(string)); err == nil {
		service.UserID = res
	}else{
		internal.APIResponse(c, IError.ErrParam, nil)
		return
	}

	if err := c.ShouldBind(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}

	success, fail, err := service.CreateDailyPhotograph()
	// if err != nil {
	// 	internal.APIResponse(c, IError.ErrPhotoUpload, err.Error())
	// 	return
	// }
	// 返回成功或失败的照片数量
	data := struct {
		Success int `json:"success"`
		Fail    int `json:"fail"`
	}{
		Success: success,
		Fail:    fail,
	}
	internal.APIResponse(c, IError.OK, data)
}

// @Summary 获取用户日常照片列表
// @Description 获取指定用户的所有日常照片
// @Tags daily_photograph
// @Accept json
// @Produce json
// @Param user_id query string true "用户ID"
// @Param page query int false "页码，默认为1"
// @Param size query int false "每页数量，默认为10"
// @Success 200 {object} internal.Response{data=object{photos=[]models.DailyPhotograph, total=int64}}
// @Failure 20203 {object} internal.Response{data=string}
// @Router /daily_photograph/user/{user_id} [get]
func GetUserDailyPhotographs(c *gin.Context) {
	var service service.GetUserDailyPhotographsService

	// 绑定URI参数
	if err := c.ShouldBindUri(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}
	// 绑定查询参数
	if err := c.ShouldBindQuery(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}

	// 调用服务层获取用户日常照片列表
	photos, total, err := service.GetUserDailyPhotographs()
	if err != nil {
		internal.APIResponse(c, IError.ErrPhotoList, err.Error())
		return
	}

	data := struct {
		Photos []*models.DailyPhotograph `json:"photos"`
		Total  int64                     `json:"total"`
	}{
		Photos: photos,
		Total:  total,
	}
	internal.APIResponse(c, IError.OK, data)
}

// @Summary 按日期范围获取日常照片
// @Description 获取指定用户在指定日期范围内的日常照片
// @Tags daily_photograph
// @Accept json
// @Produce json
// @Param user_id query string true "用户ID"
// @Param start_date query string true "开始日期，格式：2006-01-02"
// @Param end_date query string true "结束日期，格式：2006-01-02"
// @Param page query int false "页码，默认为1"
// @Param size query int false "每页数量，默认为10"
// @Success 200 {object} internal.Response{data=object{photos=[]models.DailyPhotograph, total=int64}}
// @Failure 20203 {object} internal.Response{data=string}
// @Router /daily_photograph/date_range/{user_id} [get]
func GetDailyPhotographsByDateRange(c *gin.Context) {
	var service service.GetDailyPhotographsByDateRangeService

	// 绑定URI参数
	if err := c.ShouldBindUri(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}
	// 绑定查询参数
	if err := c.ShouldBindQuery(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}

	// 调用服务层获取按日期范围的日常照片列表
	photos, total, err := service.GetDailyPhotographsByDateRange()
	if err != nil {
		internal.APIResponse(c, IError.ErrPhotoList, err.Error())
		return
	}

	data := struct {
		Photos []*models.DailyPhotograph `json:"photos"`
		Total  int64                     `json:"total"`
	}{
		Photos: photos,
		Total:  total,
	}
	internal.APIResponse(c, IError.OK, data)
}

// @Summary 获取单张日常照片详情
// @Description 获取指定ID的日常照片详情
// @Tags daily_photograph
// @Accept json
// @Produce json
// @Param photo_id query string true "照片ID"
// @Success 200 {object} internal.Response{data=models.DailyPhotograph}
// @Failure 20203 {object} internal.Response{data=string}
// @Router /daily_photograph/detail/{photo_id} [get]
func GetDailyPhotograph(c *gin.Context) {
	
	var service service.GetDailyPhotographService
	if err := c.ShouldBindUri(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}

	photo, err := service.GetDailyPhotograph()
	if err != nil {
		internal.APIResponse(c, IError.ErrPhotoList, err.Error())
		return
	}

	internal.APIResponse(c, IError.OK, photo)
}

// @Summary 更新日常照片
// @Description 更新指定ID的日常照片信息
// @Tags daily_photograph
// @Accept json
// @Produce json
// @Param photo_id formData string true "照片ID"
// @Param user_id formData string true "用户ID，用于权限验证"
// @Param title formData string false "照片标题"
// @Param description formData string false "照片描述"
// @Param tags formData string false "照片标签，多个标签用逗号分隔"
// @Param taken_at formData string false "拍摄时间，格式：2006-01-02"
// @Param location formData string false "拍摄地点"
// @Param camera formData string false "相机型号"
// @Param lens formData string false "镜头型号"
// @Param iso formData int false "ISO值"
// @Param aperture formData string false "光圈值"
// @Param shutter_speed formData string false "快门速度"
// @Param focal_length formData int false "焦距"
// @Param is_public formData bool false "是否公开"
// @Success 200 {object} internal.Response{data=string}
// @Failure 20201 {object} internal.Response{data=string}
// @Router /daily_photograph/update [put]
func UpdateDailyPhotograph(c *gin.Context) {
	var service service.UpdateDailyPhotographService

	// 从JWT中获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, IError.ErrUserNotFound, nil)
		return
	}
	// 将userID转换为字符串
	if res, err := uuid.Parse(userID.(string)); err == nil {
		service.UserID = res
	}else{
		internal.APIResponse(c, IError.ErrParam, nil)
		return
	}

	if err := c.ShouldBind(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}

	if err := service.UpdateDailyPhotograph(); err != nil {
		internal.APIResponse(c, IError.ErrDailyPhotographUpdate, err.Error())
		return
	}

	internal.APIResponse(c, IError.OK, "更新成功")
}

// @Summary 删除日常照片
// @Description 删除指定ID的日常照片
// @Tags daily_photograph
// @Accept json
// @Produce json
// @Param photo_id query string true "照片ID"
// @Param user_id query string true "用户ID，用于权限验证"
// @Success 200 {object} internal.Response{data=string}
// @Failure 20201 {object} internal.Response{data=string}
// @Router /daily_photograph/delete/{photo_id} [delete]
func DeleteDailyPhotograph(c *gin.Context) {
	var service service.DeleteDailyPhotographService

	// 从JWT中获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		internal.APIResponse(c, IError.ErrUserNotFound, nil)
		return
	}
	// 将userID转换为字符串
	if res, err := uuid.Parse(userID.(string)); err == nil {
		service.UserID = res
	}else{
		internal.APIResponse(c, IError.ErrParam, nil)
		return
	}	

	// 绑定查询参数
	if err := c.ShouldBindUri(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}

	// 调用服务层删除日常照片
	if err := service.DeleteDailyPhotograph(); err != nil {
		internal.APIResponse(c, IError.ErrPhotoDelete, err.Error())
		return
	}

	internal.APIResponse(c, IError.OK, "删除成功")
}

// @Summary 点赞日常照片
// @Description 为指定ID的日常照片点赞
// @Tags daily_photograph
// @Accept json
// @Produce json
// @Param photo_id path string true "照片ID"
// @Success 200 {object} internal.Response{data=string}
// @Failure 20201 {object} internal.Response{data=string}
// @Router /daily_photograph/like/{photo_id} [post]
func LikeDailyPhotograph(c *gin.Context) {
	var service service.LikeDailyPhotographService

	if err := c.ShouldBindUri(&service); err != nil {
		internal.APIResponse(c, IError.ErrParam, err.Error())
		return
	}

	if err := service.LikeDailyPhotograph(); err != nil {
		internal.APIResponse(c, IError.ErrDailyPhotographLike, err.Error())
		return
	}

	internal.APIResponse(c, IError.OK, gin.H{"success": true})
}

func (controller *DailyPhotographController) InitRouter(engine *gin.RouterGroup) error {
	logger.Logger.Info("init daily photograph controller")

	dailyPhotographGroup := engine.Group("/daily_photograph")
	// --------------------无需认证-------------------------
	dailyPhotographGroup.GET("/user/:user_id", GetUserDailyPhotographs)
	dailyPhotographGroup.GET("/date_range/:user_id", GetDailyPhotographsByDateRange)
	dailyPhotographGroup.GET("/detail/:photo_id", GetDailyPhotograph)
	dailyPhotographGroup.POST("/like/:photo_id", LikeDailyPhotograph)
	// --------------------需要认证-------------------------
	authDailyPhotographGroup := dailyPhotographGroup.Group("")
	authDailyPhotographGroup.Use(middleware.JWTAuthMiddleware())
	authDailyPhotographGroup.POST("/create", CreateDailyPhotograph)
	authDailyPhotographGroup.PUT("/update", UpdateDailyPhotograph)
	authDailyPhotographGroup.DELETE("/delete/:photo_id", DeleteDailyPhotograph)

	return nil
}