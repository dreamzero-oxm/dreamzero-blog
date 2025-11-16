package v1

import (
	"blog-server/internal"
	"blog-server/internal/code"
	"blog-server/internal/middleware"
	"blog-server/service"
	"blog-server/internal/utils"

	"fmt"
	"github.com/gin-gonic/gin"
)

type UserController struct {
}

// @Summary 用户登录
// @Description 用户登录
// @Tags user
// @Accept multipart/form-data
// @Produce json
// @Success 200 {object} internal.Response{data=string}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20104 {object} internal.Response{data=string}
// @Failure 20114 {object} internal.Response{data=string}
// @Failure 20115 {object} internal.Response{data=string}
// @Failure 20116 {object} internal.Response{data=string}
// @Router /user/login [post]
func Login(c *gin.Context) {
	var service service.LoginUserService
	if err := c.ShouldBind(&service); err == nil {
		user, accessToken, refreshToken, err := service.Login()
		if err != nil {
			internal.APIResponse(c, err, gin.H{
				"success": false,
			})
		} else {
			internal.APIResponse(c, nil, gin.H{
				"success": true,
				"user":    user,
				"access_token":  accessToken,
				"refresh_token": refreshToken,
			})
		}
	} else {
		internal.APIResponse(c, code.ErrBind, nil)
	}
}

// @Summary 用户注册
// @Description 用户注册
// @Tags user
// @Accept multipart/form-data
// @Produce json
// @Success 200 {object} internal.Response{data=string}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20105 {object} internal.Response{data=string}
// @Failure 20106 {object} internal.Response{data=string}
// @Router /user/register [post]
func Register(c *gin.Context) {
	var service service.RegisterUserService
	if err := c.ShouldBind(&service); err == nil {
		if err := service.Register(); err != nil {
			internal.APIResponse(c, err, nil)
		} else {
			internal.APIResponse(c, code.OK, nil)
		}
	} else {
		internal.APIResponse(c, code.ErrBind, nil)
	}
}

// @Summary 获取邮箱验证码
// @Description 获取邮箱验证码
// @Tags user
// @Accept multipart/form-data
// @Produce json
// @Success 200 {object} internal.Response{data=string}
// @Router /user/emailVerificationCode [post]
func GetEmailVerificationCode(c *gin.Context) {
	var service service.EmailVerificationCodeService
	if err := c.ShouldBind(&service); err == nil {
		if err := service.SendEmailVerificationCode(); err != nil {
			internal.APIResponse(c, err, nil)
		} else {
			internal.APIResponse(c, code.OK, nil)
		}
	} else {
		internal.APIResponse(c, code.ErrBind, nil)
	}
}

// @Summary 验证邮箱验证码
// @Description 验证邮箱验证码
// @Tags user
// @Accept multipart/form-data
// @Produce json
// @Success 200 {object} internal.Response{data=string}
// @Router /user/verifyEmailVerificationCode [post]
func VerifyEmailVerificationCode(c *gin.Context) {
	var service service.VerifyEmailVerificationCodeService
	if err := c.ShouldBind(&service); err == nil {
		if err := service.VerifyEmailVerificationCode(); err != nil {
			internal.APIResponse(c, err, nil)
		} else {
			internal.APIResponse(c, code.OK, nil)
		}
	} else {
		internal.APIResponse(c, code.ErrBind, nil)
	}
}

// @Summary 验证用户名是否存在
// @Description 验证用户名是否存在
// @Tags user
// @Accept json
// @Produce json
// @Success 200 {object} internal.Response{data=string}
// @Router /user/checkUserName [get]
func CheckUserName(c *gin.Context) {
	var service service.UserNameService
	if err := c.ShouldBind(&service); err == nil {
		if err := service.CheckUserName(); err != nil {
			internal.APIResponse(c, err, nil)
		} else {
			internal.APIResponse(c, code.OK, nil)
		}
	} else {
		internal.APIResponse(c, code.ErrBind, nil)
	}
}

// @Summary 验证邮箱是否存在
// @Description 验证邮箱是否存在
// @Tags user
// @Accept json
// @Produce json
// @Success 200 {object} internal.Response{data=string}
// @Router /user/checkUserEmail [get]
func CheckUserEmail(c *gin.Context) {
	var service service.UserEmailService
	if err := c.ShouldBind(&service); err == nil {
		if err := service.CheckUserEmail(); err != nil {
			internal.APIResponse(c, err, nil)
		} else {
			internal.APIResponse(c, code.OK, nil)
		}
	}
}

// @Summary 刷新Token
// @Description 使用refresh token获取新的access token和refresh token
// @Tags user
// @Accept json
// @Produce json
// @Param refresh_token body string true "Refresh Token"
// @Success 200 {object} internal.Response{data=object}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20120 {object} internal.Response{data=string}
// @Failure 20121 {object} internal.Response{data=string}
// @Router /user/refreshToken [post]
func RefreshToken(c *gin.Context) {
	// 传入Refresh_Token
	var service service.RefreshTokenService
	if err := c.ShouldBindJSON(&service); err == nil {
		user, accessToken, err := service.RefreshToken()
		if err != nil {
			internal.APIResponse(c, err, gin.H{
				"success": false,
			})
		} else {
			internal.APIResponse(c, nil, gin.H{
				"success": true,
				"user":    user,
				"access_token":  accessToken,
			})
		}
	} else {
		internal.APIResponse(c, code.ErrBind, nil)
	}
}

// @Summary 验证Access Token
// @Description 验证access token是否有效
// @Tags user
// @Accept json
// @Produce json
// @Success 200 {object} internal.Response{data=object}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20117 {object} internal.Response{data=string}
// @Failure 20118 {object} internal.Response{data=string}
// @Failure 20119 {object} internal.Response{data=string}
// @Security ApiKeyAuth
// @Router /user/validateAccessToken [get]
func ValidateAccessToken(c *gin.Context) {
	// 返回验证成功信息
	internal.APIResponse(c, nil, gin.H{
		"valid": true,
	})
}

// @Summary 获取用户信息
// @Description 获取当前登录用户的详细信息
// @Tags user
// @Accept json
// @Produce json
// @Success 200 {object} internal.Response{data=models.User}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20101 {object} internal.Response{data=string}
// @Security ApiKeyAuth
// @Router /user/profile [get]
func GetUserProfile(c *gin.Context) {
	// 从JWT中获取用户ID并转换为UUID
	uid, err := utils.GetUserIDFromContext(c)
	if err != nil {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	
	// 创建服务并获取用户信息
	service := service.GetUserProfileService{
		ID: uid,
	}
	
	user, err := service.GetUserProfile()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}
	
	// 返回用户信息
	internal.APIResponse(c, nil, gin.H{
		"success": true,
		"user": user,
	})
}

// @Summary 更新用户信息
// @Description 更新当前登录用户的个人信息
// @Tags user
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param data body service.UpdateUserProfileService true "用户信息"
// @Success 200 {object} internal.Response{data=string}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20101 {object} internal.Response{data=string}
// @Router /user/profile [put]
func UpdateUserProfile(c *gin.Context) {
	// 从JWT中获取用户ID并转换为UUID
	uid, err := utils.GetUserIDFromContext(c)
	if err != nil {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	
	// 创建服务实例
	var service service.UpdateUserProfileService
	if err = c.ShouldBindJSON(&service); err != nil {
		internal.APIResponse(c, code.ErrBind, nil)
		return
	}
	
	// 设置用户ID
	service.ID = uid
	
	// 调用服务方法
	err = service.UpdateUserProfile()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}
	
	// 返回成功响应
	internal.APIResponse(c, nil, gin.H{
		"success": true,
		"message": "用户信息更新成功",
	})
}

// @Summary 上传头像
// @Description 上传当前登录用户的头像
// @Tags user
// @Accept multipart/form-data
// @Produce json
// @Security ApiKeyAuth
// @Param avatar formData file true "头像文件"
// @Success 200 {object} internal.Response{data=string}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20101 {object} internal.Response{data=string}
// @Router /user/avatar [post]
func UploadAvatar(c *gin.Context) {
	// 从JWT中获取用户ID并转换为UUID
	uid, err := utils.GetUserIDFromContext(c)
	if err != nil {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	
	// 获取上传的文件
	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		internal.APIResponse(c, code.ErrBind, nil)
		return
	}
	defer func() {
		if err := file.Close(); err != nil {
			// 记录关闭文件时的错误，但不影响主要流程
			fmt.Printf("关闭文件时出错: %v\n", err)
		}
	}()
	
	// 检查文件大小（限制为5MB）
	if header.Size > 5*1024*1024 {
		internal.APIResponse(c, code.ErrBind, nil)
		return
	}
	
	// 检查文件类型
	fileType := header.Header.Get("Content-Type")
	if fileType != "image/jpeg" && fileType != "image/png" && fileType != "image/gif" {
		internal.APIResponse(c, code.ErrBind, nil)
		return
	}
	
	// 生成文件名
	fileName := fmt.Sprintf("avatar_%s_%s", uid.String(), header.Filename)
	
	// 保存文件到本地
	avatarPath := fmt.Sprintf("uploads/avatars/%s", fileName)
	if err = c.SaveUploadedFile(header, avatarPath); err != nil {
		internal.APIResponse(c, err, nil)
		return
	}
	
	// 生成访问URL
	avatarURL := fmt.Sprintf("/uploads/avatars/%s", fileName)
	
	// 创建服务实例
	service := service.UploadAvatarService{
		ID: uid,
	}
	
	// 调用服务方法
	err = service.UploadAvatar()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}
	
	// 返回成功响应
	internal.APIResponse(c, nil, gin.H{
		"success": true,
		"message": "头像上传成功",
		"avatar_url": avatarURL,
	})
}

// @Summary 修改密码
// @Description 修改当前登录用户的密码
// @Tags user
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param data body service.ChangePasswordService true "密码信息"
// @Success 200 {object} internal.Response{data=string}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20101 {object} internal.Response{data=string}
// @Router /user/password [put]
func ChangePassword(c *gin.Context) {
	// 从JWT中获取用户ID并转换为UUID
	uid, err := utils.GetUserIDFromContext(c)
	if err != nil {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	
	// 创建服务实例
	var service service.ChangePasswordService
	if err = c.ShouldBindJSON(&service); err != nil {
		internal.APIResponse(c, code.ErrBind, nil)
		return
	}
	
	// 设置用户ID
	service.ID = uid
	
	// 调用服务方法
	err = service.ChangePassword()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}
	
	// 返回成功响应
	internal.APIResponse(c, nil, gin.H{
		"success": true,
		"message": "密码修改成功",
	})
}

// @Summary 获取操作日志
// @Description 获取用户操作日志
// @Tags user
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param operation_type query string false "操作类型"
// @Param start_date query string false "开始日期"
// @Param end_date query string false "结束日期"
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} internal.Response{data=map[string]interface{}}
// @Failure 20002 {object} internal.Response{data=string}
// @Failure 20101 {object} internal.Response{data=string}
// @Router /user/operation-logs [get]
func GetOperationLogs(c *gin.Context) {
	var service service.GetOperationLogsService
	if err := c.ShouldBindQuery(&service); err != nil {
		internal.APIResponse(c, code.ErrBind, nil)
		return
	}
	
	// 从JWT中获取用户ID并转换为UUID
	uid, err := utils.GetUserIDFromContext(c)
	if err != nil {
		internal.APIResponse(c, code.ErrUserNotFound, nil)
		return
	}
	
	// 设置用户ID
	service.ID = uid
	
	// 获取操作日志
	logs, total, err := service.GetOperationLogs()
	if err != nil {
		internal.APIResponse(c, err, nil)
		return
	}
	
	// 构建返回数据
	data := map[string]interface{}{
		"logs":  logs,
		"total": total,
		"page":  service.Page,
		"page_size": service.Limit,
	}
	
	internal.APIResponse(c, nil, gin.H{
		"success": true,
		"data": data,
		"message": "获取操作日志成功",
	})
}

func (controller *UserController) InitRouter(router *gin.RouterGroup) error {
	userGroup := router.Group("/user")
	// --------------------无需认证-------------------------
	userGroup.POST("/login", Login)
	userGroup.POST("/register", Register)
	userGroup.GET("/emailVerificationCode", GetEmailVerificationCode)
	userGroup.POST("/verifyEmailVerificationCode", VerifyEmailVerificationCode)
	userGroup.GET("/checkUserName", CheckUserName)
	userGroup.GET("/checkUserEmail", CheckUserEmail)
	userGroup.POST("/refreshToken", RefreshToken)
	// --------------------需要认证-------------------------
	authGroup := userGroup.Group("")
	authGroup.Use(middleware.JWTAuthMiddleware())
	authGroup.POST("/validateAccessToken", ValidateAccessToken)
	authGroup.GET("/validateAccessToken", ValidateAccessToken)
	authGroup.GET("/profile", GetUserProfile)
	authGroup.PUT("/profile", UpdateUserProfile)
	authGroup.POST("/avatar", UploadAvatar)
	authGroup.PUT("/password", ChangePassword)
	authGroup.GET("/operation-logs", GetOperationLogs)
	return nil
}
