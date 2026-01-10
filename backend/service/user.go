package service

import (
	"blog-server/internal/code"
	"blog-server/internal/config"
	"blog-server/internal/dto"
	"blog-server/internal/logger"
	"blog-server/internal/models"
	"blog-server/internal/mq"
	"blog-server/internal/redis"
	"blog-server/internal/rsa"
	"blog-server/internal/utils"
	"context"
	"encoding/json"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// RegisterUserService 用户注册服务结构体
// 用于处理用户注册的请求和业务逻辑
type RegisterUserService struct {
	UserName         string `json:"user_name" form:"user_name" binding:"required"`         // 用户名，必填
	Password         string `json:"password" form:"password" binding:"required"`         // 密码，必填
	Email            string `json:"email" form:"email" binding:"required"`                // 邮箱，必填
	VerificationCode string `json:"verification_code" form:"verification_code" binding:"required"` // 邮箱验证码，必填
}

// Register 用户注册
// 验证验证码、检查用户名是否已存在、创建用户并保存到数据库
// 返回可能的错误
func (service *RegisterUserService) Register() error {
	postgreDB := models.DB
	var count int64
	
	// 验证验证码长度
	if len(service.VerificationCode) != 6 {
		return code.ErrVerificationCodeLength
	} else {
		// 从Redis获取验证码
		redisClient := redis.GetRedisClient()
		if v, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrefix+":verification_code:"+service.Email).Result(); err != nil {
			logger.Logger.Errorf("redis get verification code failed: %v", err)
			return code.ErrVerificationCodeInvalid
		} else {
			// 验证验证码是否匹配
			if v != service.VerificationCode {
				return code.ErrVerificationCodeInvalid
			}
			// 验证成功，删除验证码
			if err := redisClient.Del(context.Background(), config.Conf.Redis.KeyPrefix+":verification_code:"+service.Email).Err(); err != nil {
				logger.Logger.Errorf("redis delete verification code failed: %v", err)
				return code.ErrVerificationCodeInvalid
			}
		}
	}
	
	// 查询该用户的用户名是否已经存在
	if err := postgreDB.Model(&models.User{}).Where("user_name = ?", service.UserName).Count(&count).Error; err != nil {
		logger.Logger.Errorf("check user failed: %v", err)
		return code.ErrDatabase
	}
	if count > 0 {
		return code.ErrUserExistBefore
	}
	
	// 建立用户信息
	user := generateDefaultUser()
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
	
	// 设置用户角色, 以及激活信息
	user.Role = "user"
	user.Status = "active"
	user.IsActive = true
	
	// 创建用户
	if err := postgreDB.Create(&user).Error; err != nil {
		logger.Logger.Errorf("create user failed: %v", err)
		return code.ErrUserCreate
	}
	return nil
}

// LoginUserService 用户登录服务结构体
// 用于处理用户登录的请求和业务逻辑
type LoginUserService struct {
	Account  string `json:"account" form:"account" binding:"required"`   // 账号（用户名/邮箱/手机号），必填
	Password string `json:"password" form:"password" binding:"required"` // 密码，必填
}

// Login 用户登录
// 验证账号密码、检查用户状态、生成JWT令牌、更新登录记录
// 返回用户信息、访问令牌、刷新令牌和可能的错误
func (service *LoginUserService) Login() (*models.User, string, string, error) {
	postgreDB := models.DB
	var user models.User
	
	// 根据账号（用户名/邮箱/手机号）查询用户
	if postgreDB.Where("user_name = ? OR email = ? OR phone = ?", service.Account, service.Account, service.Account).First(&user).Error != nil {
		return nil, "", "", code.ErrUserNotFound
	}
	
	// TODO: 可以用Redis存储Lock信息，防止用户频繁登录
	// 检查用户是否被锁定
	if user.IsLocked && user.LockUntil.After(time.Now()) {
		user.LastFailedLogin = time.Now()
		user.LastFailedReason = "user locked"
		if postgreDB.Save(&user).Error != nil {
			return nil, "", "", code.ErrDatabase
		}
		return nil, "", "", code.ErrUserLocked
	} else if user.IsLocked && user.LockUntil.Before(time.Now()) {
		// 锁定时间已过，解锁用户
		user.IsLocked = false
		user.LockUntil = time.Now()
	}
	
	// 验证密码
	if !user.ComparePassword(service.Password) {
		user.FailedLoginCount++
		user.LastFailedLogin = time.Now()
		user.LastFailedReason = "password incorrect"
		
		// TODO: 失败次数过多，锁定用户
		// 失败次数超过5次，锁定用户
		if user.FailedLoginCount > 5 {
			user.IsLocked = true
			user.LockUntil = time.Now().Add((time.Duration(user.FailedLoginCount - 5)) * time.Minute)
		}
		
		if postgreDB.Save(&user).Error != nil {
			return nil, "", "", code.ErrDatabase
		}
		return nil, "", "", code.ErrPasswordIncorrect
	}
	
	// 验证用户是否被封号
	switch user.Status {
	case "suspended":
		return nil, "", "", code.ErrUserSuspended
	case "inactive":
		// 如果用户状态为inactive，则激活用户
		user.Status = "active"
	}
	
	// 验证用户是否激活
	if !user.IsActive {
		return nil, "", "", code.ErrUserInactive
	}
	
	// 处理用户的失败登录记录
	if user.FailedLoginCount > 0 {
		user.FailedLoginCount = 0
		user.LastFailedLogin = time.Now()
	}

	var accessToken, refreshToken string
	redisClient := redis.GetRedisClient()
	
	// 生成Access Token
	accessClaims := jwt.MapClaims{
		// 发行者
		"iss": "moity",
		// 用户ID
		"sub": user.ID.String(),
		// Token类型
		"type": "access",
		// 用户角色
		"role": user.Role,
		// 过期时间
		"exp": time.Now().Add(time.Duration(config.Conf.App.JwtExpirationTime) * time.Minute).Unix(),
		// 生效时间
		"nbf": time.Now().Unix(),
		// 签发时间
		"iat": time.Now().Unix(),
		// 用户名
		"username": user.UserName,
	}
	accessJwtToken, err := utils.GenerateJWT(accessClaims, rsa.PrivateKey)
	if err != nil {
		return nil, "", "", code.ErrGenerateJWT
	}
	accessToken = accessJwtToken
	
	// 生成Refresh Token
	refreshClaims := jwt.MapClaims{
		// 发行者
		"iss": "moity",
		// 用户ID
		"sub": user.ID.String(),
		// Token类型
		"type": "refresh",
		// 用户角色
		"role": user.Role,
		// 过期时间 (天)
		"exp": time.Now().Add(time.Duration(config.Conf.App.RefreshTokenExpiration) * time.Minute).Unix(),
		// 生效时间
		"nbf": time.Now().Unix(),
		// 签发时间
		"iat": time.Now().Unix(),
		// 用户名
		"username": user.UserName,
	}
	refreshJwtToken, err := utils.GenerateJWT(refreshClaims, rsa.PrivateKey)
	if err != nil {
		return nil, "", "", code.ErrGenerateJWT
	}
	refreshToken = refreshJwtToken
	
	// 将Access Token存入Redis
	if err := redisClient.Set(context.Background(), config.Conf.Redis.KeyPrefix+":access_token:"+user.Email, accessToken, time.Duration(config.Conf.App.JwtExpirationTime)*time.Minute).Err(); err != nil {
		logger.Logger.Errorf("redis set access token failed: %v", err)
		return nil, "", "", err
	}
	
	// 将Refresh Token存入Redis
	if err := redisClient.Set(context.Background(), config.Conf.Redis.KeyPrefix+":refresh_token:"+user.Email, refreshToken, time.Duration(config.Conf.App.RefreshTokenExpiration)*time.Minute).Err(); err != nil {
		logger.Logger.Errorf("redis set refresh token failed: %v", err)
		return nil, "", "", err
	}

	// 更新用户的登录记录
	user.LastLogin = time.Now()
	user.LoginCount++
	
	// 更新用户的信息
	if err := postgreDB.Save(&user).Error; err != nil {
		logger.Logger.Errorf("update user failed: %v", err)
		return nil, "", "", code.ErrDatabase
	}
	return &user, accessToken, refreshToken, nil
}

// generateDefaultUser 生成默认用户
// 返回一个带有默认值的用户对象
func generateDefaultUser() *models.User {
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

// EmailVerificationCodeService 邮箱验证码服务结构体
// 用于处理发送邮箱验证码的请求和业务逻辑
type EmailVerificationCodeService struct {
	Email string `json:"email" form:"email" binding:"required"` // 邮箱，必填
}

// SendEmailVerificationCode 发送邮箱验证码
// 验证邮箱格式、生成或获取验证码、存储到Redis、通过消息队列发送邮件
// 返回可能的错误
func (service *EmailVerificationCodeService) SendEmailVerificationCode() error {
	var verificationCode string
	
	// 验证邮箱格式
	if !utils.ValidateEmail(service.Email) {
		return code.ErrEmailValidation
	}
	
	// 检查验证码是否存在
	redisClient := redis.GetRedisClient()
	if v, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrefix+":verification_code:"+service.Email).Result(); err == nil {
		// 如果验证码已存在，使用现有验证码
		verificationCode = v
	} else {
		// 生成新的验证码
		verificationCode = utils.GenerateVerificationCode()
		// 存在redis中，缓存时间为5分钟
		redisClient := redis.GetRedisClient()
		if err := redisClient.Set(context.Background(), config.Conf.Redis.KeyPrefix+":verification_code:"+service.Email, verificationCode, time.Minute*5).Err(); err != nil {
			logger.Logger.Errorf("redis set verification code failed: %v", err)
			return code.ErrSendEmailVerificationCode
		}
	}
	
	// TODO: 用消息队列发送邮件
	// 发送邮件
	if producer, err := mq.NewKafkaAsyncProducer(); err != nil {
		logger.Logger.Errorf("new kafka producer failed: %v", err)
		return code.ErrSendEmailVerificationCode
	} else {
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
		if err := producer.SendMessage(context.Background(), "email_verification", service.Email, messageJSON); err != nil {
			logger.Logger.Errorf("send message to mq failed: %v", err)
			return code.ErrSendEmailVerificationCode
		}
	}
	// if err := email.SentVerifyCode(service.Email, verificationCode); err != nil {
	// 	logger.Logger.Errorf("send email verification code failed: %v", err)
	// 	return code.ErrSendEmailVerificationCode
	// }
	return nil
}

// VerifyEmailVerificationCodeService 验证邮箱验证码服务结构体
// 用于处理验证邮箱验证码的请求和业务逻辑
type VerifyEmailVerificationCodeService struct {
	Email            string `json:"email" form:"email" binding:"required"`                // 邮箱，必填
	VerificationCode string `json:"verification_code" form:"verification_code" binding:"required"` // 验证码，必填
}

// VerifyEmailVerificationCode 验证邮箱验证码
// 验证邮箱格式、从Redis获取验证码并验证
// 返回可能的错误
func (service *VerifyEmailVerificationCodeService) VerifyEmailVerificationCode() error {
	// 验证邮箱格式
	if !utils.ValidateEmail(service.Email) {
		return code.ErrEmailValidation
	}
	
	// 验证验证码
	redisClient := redis.GetRedisClient()
	logger.Logger.Infof("email: %s", service.Email)
	logger.Logger.Infof("verification code: %s", service.VerificationCode)
	if v, err := redisClient.Get(context.Background(), config.Conf.Redis.KeyPrefix+":verification_code:"+service.Email).Result(); err != nil {
		return code.ErrVerificationCodeInvalid
	} else if v != service.VerificationCode {
		return code.ErrVerificationCodeInvalid
	} else {
		return nil
	}
}

// UserNameService 用户名检查服务结构体
// 用于处理检查用户名是否已存在的请求和业务逻辑
type UserNameService struct {
	UserName string `json:"user_name" form:"user_name" binding:"required"` // 用户名，必填
}

// CheckUserName 检查用户名是否已存在
// 查询数据库检查用户名是否已被使用
// 返回可能的错误
func (service *UserNameService) CheckUserName() error {
	postgreDB := models.DB
	var count int64
	if err := postgreDB.Model(&models.User{}).Where("user_name =?", service.UserName).Count(&count).Error; err != nil {
		logger.Logger.Errorf("check user failed: %v", err)
		return code.ErrDatabase
	}
	if count > 0 {
		return code.ErrUserExistBefore
	}
	return nil
}

// UserEmailService 用户邮箱检查服务结构体
// 用于处理检查用户邮箱是否已存在的请求和业务逻辑
type UserEmailService struct {
	Email string `json:"email" form:"email" binding:"required"` // 邮箱，必填
}

// CheckUserEmail 检查用户邮箱是否已存在
// 查询数据库检查邮箱是否已被使用
// 返回可能的错误
func (service *UserEmailService) CheckUserEmail() error {
	postgreDB := models.DB
	var count int64
	if err := postgreDB.Model(&models.User{}).Where("email =?", service.Email).Count(&count).Error; err != nil {
		logger.Logger.Debugf("check user email failed: %v", err)
		return code.ErrDatabase
	}
	if count > 0 {
		return code.ErrEmailExistBefore
	}
	return nil
}

// GetUserProfileService 获取用户资料服务结构体
// 用于处理获取用户资料的请求和业务逻辑
type GetUserProfileService struct {
	ID uuid.UUID `json:"id" form:"id"` // 用户ID，必填
}

// GetUserProfile 获取用户资料
// 根据用户ID查询用户信息
// 返回用户信息和可能的错误
func (service *GetUserProfileService) GetUserProfile() (*models.User, error) {
	postgreDB := models.DB
	var user models.User
	
	// 根据ID查询用户
	if err := postgreDB.First(&user, service.ID).Error; err != nil {
		logger.Logger.Errorf("get user profile failed: %v", err)
		return nil, code.ErrUserNotFound
	}
	return &user, nil
}

// UpdateUserProfileService 更新用户资料服务结构体
// 用于处理更新用户资料的请求和业务逻辑
type UpdateUserProfileService struct {
	ID       uuid.UUID `json:"id" form:"id"`                           // 用户ID，必填
	Nickname string    `json:"nickname" form:"nickname"`               // 昵称
	Email    string    `json:"email" form:"email"`                     // 邮箱
	Phone    string    `json:"phone" form:"phone"`                     // 手机号
	Bio      string    `json:"bio" form:"bio"`                         // 个人简介
	Website  string    `json:"website" form:"website"`                 // 个人网站
	Location string    `json:"location" form:"location"`               // 所在地
	Birthday string    `json:"birthday" form:"birthday"`               // 生日
	Gender   string    `json:"gender" form:"gender"`                   // 性别
}

// UpdateUserProfile 更新用户资料
// 根据用户ID更新用户信息
// 返回可能的错误
func (service *UpdateUserProfileService) UpdateUserProfile() error {
	postgreDB := models.DB
	var user models.User
	
	// 根据ID查询用户
	if err := postgreDB.First(&user, service.ID).Error; err != nil {
		logger.Logger.Errorf("get user profile failed: %v", err)
		return code.ErrUserNotFound
	}
	
	// 更新用户信息
	if service.Nickname != "" {
		user.Nickname = service.Nickname
	}
	if service.Email != "" {
		user.Email = service.Email
	}
	if service.Phone != "" {
		user.Phone = service.Phone
	}
	if service.Bio != "" {
		user.Bio = service.Bio
	}
	if service.Website != "" {
		user.Website = service.Website
	}
	if service.Location != "" {
		user.Location = service.Location
	}
	if service.Birthday != "" {
		user.Birthday = service.Birthday
	}
	if service.Gender != "" {
		user.Gender = service.Gender
	}
	
	// 保存用户信息
	if err := postgreDB.Save(&user).Error; err != nil {
		logger.Logger.Errorf("update user profile failed: %v", err)
		return code.ErrDatabase
	}
	return nil
}

// UploadAvatarService 上传头像服务结构体
// 用于处理上传用户头像的请求和业务逻辑
type UploadAvatarService struct {
	ID     uuid.UUID `json:"id" form:"id"`     // 用户ID，必填
	Avatar string    `json:"avatar" form:"avatar" binding:"required"` // 头像URL，必填
}

// UploadAvatar 上传头像
// 根据用户ID更新用户头像
// 返回可能的错误
func (service *UploadAvatarService) UploadAvatar() error {
	postgreDB := models.DB
	var user models.User
	
	// 根据ID查询用户
	if err := postgreDB.First(&user, service.ID).Error; err != nil {
		logger.Logger.Errorf("get user profile failed: %v", err)
		return code.ErrUserNotFound
	}
	
	// 更新用户头像
	user.Avatar = service.Avatar
	
	// 保存用户信息
	if err := postgreDB.Save(&user).Error; err != nil {
		logger.Logger.Errorf("update user avatar failed: %v", err)
		return code.ErrDatabase
	}
	return nil
}

// ChangePasswordService 修改密码服务结构体
// 用于处理修改用户密码的请求和业务逻辑
type ChangePasswordService struct {
	ID          uuid.UUID `json:"id" form:"id"`          // 用户ID，必填
	OldPassword string    `json:"old_password" form:"old_password" binding:"required"` // 旧密码，必填
	NewPassword string    `json:"new_password" form:"new_password" binding:"required"` // 新密码，必填
}

// ChangePassword 修改密码
// 验证旧密码、更新新密码
// 返回可能的错误
func (service *ChangePasswordService) ChangePassword() error {
	postgreDB := models.DB
	var user models.User
	
	// 根据ID查询用户
	if err := postgreDB.First(&user, service.ID).Error; err != nil {
		logger.Logger.Errorf("get user profile failed: %v", err)
		return code.ErrUserNotFound
	}
	
	// 验证旧密码
	if !user.ComparePassword(service.OldPassword) {
		return code.ErrPasswordIncorrect
	}
	
	// 更新密码
	user.Password = service.NewPassword
	
	// 加密密码
	if err := user.GenerateEncryptedPassword(); err != nil {
		logger.Logger.Errorf("generate encrypted password failed: %v", err)
		return err
	}
	
	// 保存用户信息
	if err := postgreDB.Save(&user).Error; err != nil {
		logger.Logger.Errorf("update user password failed: %v", err)
		return code.ErrDatabase
	}
	return nil
}

// GetOperationLogsService 获取操作日志服务结构体
// 用于处理获取用户操作日志的请求和业务逻辑
type GetOperationLogsService struct {
	ID     uuid.UUID `json:"id" form:"id"`     // 用户ID，必填
	Page   int       `json:"page" form:"page"`                     // 页码
	Limit  int       `json:"limit" form:"limit"`                   // 每页数量
	Sort   string    `json:"sort" form:"sort"`                     // 排序字段
	Order  string    `json:"order" form:"order"`                   // 排序方向
	Search string    `json:"search" form:"search"`                 // 搜索关键词
}

// GetOperationLogs 获取操作日志
// 根据用户ID查询用户操作日志
// 返回操作日志列表和可能的错误
func (service *GetOperationLogsService) GetOperationLogs() ([]models.OperationLog, int64, error) {
	postgreDB := models.DB
	var logs []models.OperationLog
	var total int64
	
	// 设置默认值
	if service.Page <= 0 {
		service.Page = 1
	}
	if service.Limit <= 0 {
		service.Limit = 10
	}
	if service.Sort == "" {
		service.Sort = "created_at"
	}
	if service.Order == "" {
		service.Order = "desc"
	}
	
	// 构建查询
	query := postgreDB.Model(&models.OperationLog{}).Where("user_id = ?", service.ID)
	
	// 添加搜索条件
	if service.Search != "" {
		query = query.Where("action LIKE ? OR ip LIKE ? OR user_agent LIKE ?", "%"+service.Search+"%", "%"+service.Search+"%", "%"+service.Search+"%")
	}
	
	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		logger.Logger.Errorf("get operation logs count failed: %v", err)
		return nil, 0, code.ErrDatabase
	}
	
	// 添加排序和分页
	offset := (service.Page - 1) * service.Limit
	if err := query.Order(service.Sort + " " + service.Order).Offset(offset).Limit(service.Limit).Find(&logs).Error; err != nil {
		logger.Logger.Errorf("get operation logs failed: %v", err)
		return nil, 0, code.ErrDatabase
	}
	
	return logs, total, nil
}
