package service

import (
	"blog-server/internal/code"
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"blog-server/internal/models"
	"blog-server/internal/mq"
	"blog-server/internal/redis"
	"blog-server/internal/rsa"
	"blog-server/internal/utils"
	"blog-server/internal/dto"
	"context"
	"time"
	"encoding/json"

	"github.com/golang-jwt/jwt/v5"
)

type RegisterUserService struct {
	UserName         string `json:"user_name" form:"user_name" binding:"required"`
	Password         string `json:"password" form:"password" binding:"required"`
	Email            string `json:"email" form:"email" binding:"required"`
	VerificationCode string `json:"verification_code" form:"verification_code" binding:"required"`
}

func (service *RegisterUserService) Register() error {
	postgreDB := models.DB
	var count int64
	if len(service.VerificationCode) != 6 {
		return code.ErrVerificationCodeLength
	} else {
		// 验证验证码
		redisClient := redis.GetRedisClient()
		if v, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrifex+":verification_code:"+service.Email).Result(); err != nil {
			logger.Logger.Errorf("redis get verification code failed: %v", err)
			return code.ErrVerificationCodeInvalid
		} else {
			if v != service.VerificationCode {
				return code.ErrVerificationCodeInvalid
			}
			// 验证成功，删除验证码
			if err := redisClient.Del(context.Background(), config.Conf.Redis.KeyPrifex+":verification_code:"+service.Email).Err(); err != nil {
				logger.Logger.Errorf("redis delete verification code failed: %v", err)
				return code.ErrVerificationCodeInvalid
			}
		}
	}
	if err := postgreDB.Model(&models.User{}).Where("user_name = ?", service.UserName).Count(&count).Error; err != nil {
		logger.Logger.Errorf("check user failed: %v", err)
		return code.ErrDatabase
	}
	if count > 0 {
		return code.ErrUserExistBefore
	}
	user := generateDefualtUser()
	user.UserName = service.UserName
	user.Password = service.Password
	user.Email = service.Email
	// 验证用户信息
	if err := user.Validate(); err != nil {
		return err
	}
	// 加密密码
	if err := user.GenerateEncryptedPassword(); err != nil {
		logger.Logger.Errorf("generate encrypted password failed: %v", err)
		return err
	}
	// TODO: 邮箱验证+发送邮件(使用消息队列)
	user.Role = "user"
	if err := postgreDB.Create(&user).Error; err != nil {
		logger.Logger.Errorf("create user failed: %v", err)
		return code.ErrUserCreate
	}
	return nil
}

type LoginUserService struct {
	Account  string `json:"account" form:"account" binding:"required"`
	Password string `json:"password" form:"password" binding:"required"`
}

func (service *LoginUserService) Login() (*models.User, string, error) {
	postgreDB := models.DB
	var user models.User
	if postgreDB.Where("user_name = ? OR email = ? OR phone = ?", service.Account, service.Account, service.Account).First(&user).Error != nil {
		return nil, "", code.ErrUserNotFound
	}
	// TODO: 可以用Redis存储Lock信息，防止用户频繁登录
	if user.IsLocked && user.LockUntil.After(time.Now()) {
		user.LastFailedLogin = time.Now()
		user.LastFailedReason = "user locked"
		if postgreDB.Save(&user).Error != nil {
			return nil, "", code.ErrDatabase
		}
		return nil, "", code.ErrUserLocked
	} else if user.IsLocked && user.LockUntil.Before(time.Now()) {
		user.IsLocked = false
		user.LockUntil = time.Now()
	}
	// 验证密码
	if !user.ComparePassword(service.Password) {
		user.FailedLoginCount++
		user.LastFailedLogin = time.Now()
		user.LastFailedReason = "password incorrect"
		// TODO: 失败次数过多，锁定用户
		if user.FailedLoginCount > 5 {
			user.IsLocked = true
			user.LockUntil = time.Now().Add((time.Duration(user.FailedLoginCount - 5)) * time.Minute)
		}
		if postgreDB.Save(&user).Error != nil {
			return nil, "", code.ErrDatabase
		}
		return nil, "", code.ErrPasswordIncorrect
	}
	// 验证用户是否被封号
	switch user.Status {
	case "suspended":
		return nil, "", code.ErrUserSuspended
	case "inactive":
		user.Status = "active"
	}
	// 验证用户是否激活
	if !user.IsActive {
		return nil, "", code.ErrUserInactive
	}
	// 处理用户的失败登录记录
	if user.FailedLoginCount > 0 {
		user.FailedLoginCount = 0
		user.LastFailedLogin = time.Now()
	}

	var token string
	redisClient := redis.GetRedisClient()
	if v, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrifex+":user_token:"+user.Email).Result(); err == nil {
		token = v
	} else {
		// TODO:生成JWT
		// 生成JWT
		claims := jwt.MapClaims{
			// 发行者
			"iss": "moity",
			// 用户ID
			"sub": user.ID,
			// 过期时间
			"exp": time.Now().Add(time.Duration(config.Conf.App.JwtExpirationTime) * time.Hour).Unix(),
			// 生效时间
			"nbf": time.Now().Unix(),
			// 签发时间
			"iat": time.Now().Unix(),
		}
		jwtToken, err := utils.GenerateJWT(claims, rsa.PrivateKey)
		if err != nil {
			return nil, "jwt", code.ErrGenerateJWT
		}
		token = jwtToken
		// 将JWT存入Redis
		if err := redisClient.Set(context.Background(), config.Conf.Redis.KeyPrifex+":user_token:"+user.Email, jwtToken, time.Duration(config.Conf.App.JwtExpirationTime)*time.Hour).Err(); err != nil {
			logger.Logger.Errorf("redis set user token failed: %v", err)
			return nil, "", err
		}
	}

	// 更新用户的登录记录
	user.LastLogin = time.Now()
	user.LoginCount++
	// 更新用户的信息
	if err := postgreDB.Save(&user).Error; err != nil {
		logger.Logger.Errorf("update user failed: %v", err)
		return nil, "", code.ErrDatabase
	}
	return &user, token, nil
}

func generateDefualtUser() *models.User {
	return &models.User{
		UserName:         "guest",
		Password:         "guest",
		Nickname:         "guest",
		Email:            "guest@guest.com",
		Phone:            "12345678910",
		Avatar:           "",
		Role:             "guest",
		Status:           "inactive",
		LastLogin:        time.Now(),
		LastLogout:       time.Now(),
		LoginCount:       0,
		FailedLoginCount: 0,
		LastFailedLogin:  time.Now(),
		LastFailedReason: "",
		IsLocked:         false,
		LockUntil:        time.Now(),
		DeletedBy:        "",
		DeletedReason:    "",
		IsActive:         false,
	}
}

type EmailVerificationCodeService struct {
	Email string `json:"email" form:"email" binding:"required"`
}
func (service *EmailVerificationCodeService) SendEmailVerificationCode() error {
	var verificationCode string
	// 验证邮箱
	if !utils.ValidateEmail(service.Email) {
		return code.ErrEmailValidation
	}
	// 检查验证码是否存在
	redisClient := redis.GetRedisClient()
	if v, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrifex+":verification_code:"+service.Email).Result(); err == nil {
		verificationCode = v
	} else {
		// 生成验证码
		verificationCode = utils.GenerateVerificationCode()
		// 存在redis中，缓存时间为5分钟
		redisClient := redis.GetRedisClient()
		if err := redisClient.Set(context.Background(), config.Conf.Redis.KeyPrifex+":verification_code:"+service.Email, verificationCode, time.Minute*5).Err(); err != nil {
			logger.Logger.Errorf("redis set verification code failed: %v", err)
			return code.ErrSendEmailVerificationCode
		}
	}
	// TODO: 用消息队列发送邮件
	// 发送邮件
	if producer, err := mq.NewKafkaAsyncProducer(); err!= nil {
		logger.Logger.Errorf("new kafka producer failed: %v", err)
		return code.ErrSendEmailVerificationCode
	}else{
		message := dto.EmailVerificationMessage{
			Email:            service.Email,
			VerificationCode: verificationCode,
		}
		// 将message转换为JSON字符串
		messageJSON, err := json.Marshal(message)
		if err != nil {
			logger.Logger.Errorf("marshal message failed: %v", err)
			return code.ErrSendEmailVerificationCode
		}
		// 设置email为key，使同一个邮箱都到同一个分区中
		producer.SendMessage(context.Background(), "email_verification", service.Email, messageJSON)
	}
	// if err := email.SentVerifyCode(service.Email, verificationCode); err != nil {
	// 	logger.Logger.Errorf("send email verification code failed: %v", err)
	// 	return code.ErrSendEmailVerificationCode
	// }
	return nil
}
