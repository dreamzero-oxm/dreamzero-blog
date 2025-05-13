package middleware

import (
	"blog-server/internal"
	"blog-server/internal/code"
	"blog-server/internal/config"
	"blog-server/internal/redis"
	"blog-server/internal/rsa"
	"blog-server/internal/utils"
	"context"
	"fmt"
	"net/http"
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

		// 7. 将用户信息保存到上下文
		c.Set("userID", claims["sub"].(string))
		c.Set("claims", claims)

		// 7. 继续处理请求
		c.Next()
	}
}

// RateLimitMiddleware 限流中间件
func RateLimitMiddleware(limit int, duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取客户端IP
		clientIP := c.ClientIP()

		// 使用Redis实现计数器
		redisClient := redis.GetRedisClient()
		key := config.Conf.Redis.KeyPrifex + ":rate_limit:" + clientIP

		// 获取当前计数
		count, err := redisClient.Get(context.Background(), key).Int()
		if err == nil && count >= limit {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"code": 429,
				"msg":  "请求过于频繁，请稍后再试",
			})
			c.Abort()
			return
		}

		// 增加计数
		if err := redisClient.Incr(context.Background(), key).Err(); err != nil {
			c.Next()
			return
		}

		// 设置过期时间
		redisClient.Expire(context.Background(), key, duration)

		c.Next()
	}
}

// CORSMiddleware 跨域中间件
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
