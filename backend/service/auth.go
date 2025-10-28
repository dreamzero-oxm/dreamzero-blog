package service

import (
	"context"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"blog-server/internal/code"
	"blog-server/internal/models"
	"blog-server/internal/utils"
	"blog-server/internal/rsa"
	"blog-server/internal/config"
	"blog-server/internal/redis"
	"blog-server/internal/logger"
)

// RefreshTokenService 刷新token服务
type RefreshTokenService struct {
	Token string `json:"refresh_token" form:"refresh_token" binding:"required"`
}

// RefreshToken 刷新access token
func (service *RefreshTokenService) RefreshToken() (*models.User, string, error) {
	// 验证refresh token
	claims, err := utils.ValidateJWT(service.Token, rsa.PublicKey)
	if err != nil {
		return nil, "", code.ErrRefreshTokenInvalid
	}

	// 检查token类型是否为refresh
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != "refresh" {
		return nil, "", code.ErrRefreshTokenInvalid
	}

	// 获取用户ID
	userID, ok := claims["sub"].(string)
	if !ok {
		return nil, "", code.ErrRefreshTokenInvalid
	}

	// 查询用户
	postgreDB := models.DB
	var user models.User
	if err := postgreDB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, "", code.ErrUserNotFound
	}

	// 验证用户状态
	if user.Status == "suspended" {
		return nil, "", code.ErrUserSuspended
	}
	if !user.IsActive {
		return nil, "", code.ErrUserInactive
	}

	redisClient := redis.GetRedisClient()

	// 检查refresh token是否在Redis中存在且匹配
	storedRefreshToken, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrifex+":refresh_token:"+user.Email).Result()
	// 如果不存在，或者不匹配，返回错误
	if err == redis.Nil || storedRefreshToken != service.Token {
		return nil, "", code.ErrRefreshTokenInvalid
	}
	if err != nil {
		logger.Logger.Errorf("redis get refresh token failed: %v", err)
		return nil, "", code.ErrDatabase
	}

	// 生成新的Access Token
	accessClaims := jwt.MapClaims{
		"iss":  "moity",
		"sub":  user.ID,
		"type": "access",
		"exp":  time.Now().Add(time.Duration(config.Conf.App.JwtExpirationTime) * time.Minute).Unix(),
		"nbf":  time.Now().Unix(),
		"iat":  time.Now().Unix(),
	}
	accessJwtToken, err := utils.GenerateJWT(accessClaims, rsa.PrivateKey)
	if err != nil {
		return nil, "", code.ErrGenerateJWT
	}

	// 更新Redis中的token
	if err := redisClient.Set(context.Background(), 
				config.Conf.Redis.KeyPrifex+":access_token:"+user.Email,
				accessJwtToken,
			time.Duration(config.Conf.App.JwtExpirationTime)*time.Minute).Err(); err != nil {
		logger.Logger.Errorf("redis set access token failed: %v", err)
		return nil, "", code.ErrDatabase
	}


	return &user, accessJwtToken, nil
}