package redis

import (
	"blog-server/internal/config"
	"blog-server/internal/utils"
	"context"
	"sync"
	"fmt"

	"github.com/redis/go-redis/v9"
)

var (
	// RedisClient Redis客户端实例
	redisClient *redis.Client
	once sync.Once
)

func GetRedisClient() *redis.Client {
	return redisClient
}

// Init 初始化Redis客户端
func Init(conf config.RedisConfig) error {
	var initErr error
	once.Do(func() {
		redisClient = redis.NewClient(&redis.Options{
			Addr:         conf.Addr,
			Password:     conf.Password,
			DB:           conf.DB,
			DialTimeout:  conf.DialTimeout,
			ReadTimeout:  conf.ReadTimeout,
			WriteTimeout: conf.WriteTimeout,
			PoolSize:     conf.PoolSize,
		})
	
		// 通过 Ping 命令检查连接是否正常
		ctx := context.Background()
		if _, err := redisClient.Ping(ctx).Result(); err != nil {
			initErr = fmt.Errorf("[%s]: [%v]", utils.GetFullCallerInfo(0), err)
		}
	})
	return initErr
}

// Close 关闭Redis连接
func Close() error {
	if redisClient != nil {
		return redisClient.Close()
	}
	return nil
}