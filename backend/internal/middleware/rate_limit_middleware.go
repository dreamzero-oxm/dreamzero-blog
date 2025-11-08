package middleware

import (
	"context"
	"time"
	"net/http"

	"blog-server/internal/config"
	"blog-server/internal/redis"

	"github.com/gin-gonic/gin"
)

// RateLimitMiddleware 限流中间件
func RateLimitMiddleware(limit int, duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取客户端IP
		clientIP := c.ClientIP()

		// 使用Redis实现计数器
		redisClient := redis.GetRedisClient()
		key := config.Conf.Redis.KeyPrefix + ":rate_limit:" + clientIP

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