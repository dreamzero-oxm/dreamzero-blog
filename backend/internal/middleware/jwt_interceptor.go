package middleware

import (
	"blog-server/internal"
	"blog-server/internal/code"
	"blog-server/internal/rsa"
	"blog-server/internal/utils"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

// JWTAuthMiddleware JWT认证中间件
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取 Authorization Header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			internal.APIResponse(c, code.ErrAuthorizationNotExist, nil)
			return
		}

		// 2. 解析 Token
		claims, err := utils.ValidateJWT(authHeader, rsa.PublicKey)

		// 3. 验证 Token
		if err != nil {
			internal.APIResponse(c, code.ErrTokenInvalid, fmt.Sprintf("[%v] Token错误: %v", utils.GetFullCallerInfo(0), err))
			return
		}

		// 4. 验证发行者
		if claims["iss"].(string) != "moity" {
			internal.APIResponse(c, code.ErrTokenIssError, nil)
			return
		}

		// 5. 验证是否到时间可用
		if claims["nbf"].(int64) > time.Now().Unix() {
			internal.APIResponse(c, code.ErrTokenNbfError, nil)
			return
		}

		// 6. 验证是否过期
		if claims["exp"].(int64) < time.Now().Unix() {
			internal.APIResponse(c, code.ErrTokenExpired, nil)
			return
		}

		// 7. 验证token类型是否为access
		tokenType, ok := claims["type"].(string)
		if !ok || tokenType != "access" {
			internal.APIResponse(c, code.ErrTokenInvalid, "Token类型错误")
			return
		}

		// 8. 将用户信息保存到上下文
		c.Set("userID", claims["sub"].(string))
		c.Set("claims", claims)

		// 9. 继续处理请求
		c.Next()
	}
}
