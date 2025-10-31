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

// RefreshTokenService 刷新token服务结构体
// 用于处理刷新访问令牌的请求和业务逻辑
type RefreshTokenService struct {
	Token string `json:"refresh_token" form:"refresh_token" binding:"required"` // 刷新令牌，必填
}

// RefreshToken 刷新访问令牌
// 验证刷新令牌的有效性，检查用户状态，并生成新的访问令牌
// 返回用户信息、新的访问令牌和可能的错误
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
	if err = postgreDB.Where("id = ?", userID).First(&user).Error; err != nil {
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
	storedRefreshToken, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrefix+":refresh_token:"+user.Email).Result()
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
		"iss":  "moity", // 签发者
		"sub":  user.ID.String(),  // 主题（用户ID）- 将UUID转换为字符串
		"type": "access", // 令牌类型
		"role": user.Role, // 用户角色
		"exp":  time.Now().Add(time.Duration(config.Conf.App.JwtExpirationTime) * time.Minute).Unix(), // 过期时间
		"nbf":  time.Now().Unix(), // 生效时间
		"iat":  time.Now().Unix(), // 签发时间
	}
	accessJwtToken, err := utils.GenerateJWT(accessClaims, rsa.PrivateKey)
	if err != nil {
		return nil, "", code.ErrGenerateJWT
	}

	// 更新Redis中的token
	if err := redisClient.Set(context.Background(), 
				config.Conf.Redis.KeyPrefix+":access_token:"+user.Email,
				accessJwtToken,
			time.Duration(config.Conf.App.JwtExpirationTime)*time.Minute).Err(); err != nil {
		logger.Logger.Errorf("redis set access token failed: %v", err)
		return nil, "", code.ErrDatabase
	}

	return &user, accessJwtToken, nil
}