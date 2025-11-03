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
			internal.APIResponseUnauthorized(c, code.ErrAuthorizationNotExist, nil)
			return
		}

		// 1.1 检查并处理Bearer前缀
		tokenString := authHeader
		const bearerPrefix = "Bearer "
		if len(authHeader) > len(bearerPrefix) && authHeader[:len(bearerPrefix)] == bearerPrefix {
			// 如果有Bearer前缀，则去除前缀
			tokenString = authHeader[len(bearerPrefix):]
		} else if len(authHeader) > 0 && authHeader[:1] != "e" {
			// 如果没有Bearer前缀且不是以'e'开头(JWT通常以e开头)，则返回错误
			internal.APIResponseUnauthorized(c, code.ErrTokenInvalid, "Token格式错误，应以'Bearer '开头")
			return
		}

		// 2. 解析 Token
		claims, err := utils.ValidateJWT(tokenString, rsa.PublicKey)

		// 3. 验证 Token
		if err != nil {
			internal.APIResponseUnauthorized(c, code.ErrTokenInvalid, fmt.Sprintf("[%v] Token错误: %v", utils.GetFullCallerInfo(0), err))
			return
		}

		// 4. 验证发行者
		if claims["iss"].(string) != "moity" {
			internal.APIResponseUnauthorized(c, code.ErrTokenIssError, nil)
			return
		}

		// 5. 验证是否到时间可用
		// 处理JWT中时间字段可能是float64类型的情况
		nbf, ok := claims["nbf"].(float64)
		if !ok {
			internal.APIResponseUnauthorized(c, code.ErrTokenInvalid, "Token中的nbf字段格式错误")
			return
		}
		if int64(nbf) > time.Now().Unix() {
			internal.APIResponseUnauthorized(c, code.ErrTokenNbfError, nil)
			return
		}

		// 6. 验证是否过期
		exp, ok := claims["exp"].(float64)
		if !ok {
			internal.APIResponseUnauthorized(c, code.ErrTokenInvalid, "Token中的exp字段格式错误")
			return
		}
		if int64(exp) < time.Now().Unix() {
			internal.APIResponseUnauthorized(c, code.ErrTokenExpired, nil)
			return
		}

		// 7. 验证token类型是否为access
		tokenType, ok := claims["type"].(string)
		if !ok || tokenType != "access" {
			internal.APIResponseUnauthorized(c, code.ErrTokenInvalid, "Token类型错误")
			return
		}

		// 8. 将用户信息保存到上下文
		// 将字符串类型的用户ID转换为UUID类型
		userIDStr := claims["sub"].(string)
		c.Set("userID", userIDStr)
		c.Set("claims", claims)

		// 9. 继续处理请求
		c.Next()
	}
}
