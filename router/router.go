package router

import (
	"blog-server/controller"
	"blog-server/router/api"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Server struct {
	GinEngine *gin.Engine
}

func InitRouter() *Server {
	// 初始化gin
	server := new(Server)
	// 设置模式
	gin.SetMode(gin.DebugMode)
	// 获取gin实例
	server.GinEngine = gin.Default()
	// 设置gin-swagger路由
	server.GinEngine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	registerBaseAPI(server)
	// 注册v1版本路由
	apiGroupV1 := server.GinEngine.Group("/api/v1")
	api.RegisterAPIV1(apiGroupV1)

	return server
}

// registerBaseAPI ...
func registerBaseAPI(server *Server) {
	server.GinEngine.GET("/", controller.Health)
	server.GinEngine.GET("/version", controller.Version)
}
