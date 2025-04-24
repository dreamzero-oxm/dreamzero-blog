package v1

import (
	"blog-server/internal"
	"blog-server/internal/code"
	"blog-server/service"

	"github.com/gin-gonic/gin"
)

type UserController struct{
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
		user, jwt, err := service.Login()
		if err != nil {
			internal.APIResponse(c, err, nil)
		}else{
			internal.APIResponse(c, nil, gin.H{
				"user": user,
				"jwt": jwt,
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
		if err := service.Register(); err!= nil {
			internal.APIResponse(c, err, nil)
		}else{
			internal.APIResponse(c, code.OK, nil)
		}
	}else{
		internal.APIResponse(c, code.ErrBind, nil)
	}
}

func (controller *UserController) InitRouter(router *gin.RouterGroup) error {
	userGroup := router.Group("/user")
	// --------------------无需认证-------------------------
	
	// --------------------需要认证-------------------------
	authGroup := userGroup.Group("")
	authGroup.POST("/login", Login)
	authGroup.POST("/register", Register)	
	return nil
}