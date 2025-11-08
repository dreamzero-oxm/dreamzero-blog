package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CorsMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		origin := context.Request.Header.Get("Origin")
		if origin != "" {
			// 允许所有来源
			context.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			context.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}

		// 允许客户端发送 cookie
		context.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		// 允许的请求方法
		context.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS")

		// 允许的请求头
		context.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Content-Length, Accept, Accept-Encoding, X-CSRF-Token, X-Requested-With, Range")

		// 允许浏览器访问的响应头
		context.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Authorization")

		// 预检请求的缓存时间
		context.Writer.Header().Set("Access-Control-Max-Age", "86400")

		// 处理预检请求
		if context.Request.Method == "OPTIONS" {
			context.AbortWithStatus(http.StatusNoContent)
			return
		}

		context.Next()
	}
}
