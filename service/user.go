package service

import (
	"blog-server/internal/code"
	"blog-server/internal/models"
	"time"
)

type ResigterUserService struct {
	UserName string `json:"user_name" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required"`
}

func (service *ResigterUserService) Register() error {
	postgreDB := models.DB
	var count int64
	if postgreDB.Model(&models.User{}).Where("user_name = ?", service.UserName).Count(&count).Error != nil {
		return code.ErrDatabase
	}
	if count > 0 {
		return code.ErrUserExistBefor
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
		return err
	}
	// TODO: 邮箱验证+发送邮件(使用消息队列)
	user.Role = "user"
	if postgreDB.Create(&user).Error != nil {
		return code.ErrUserCreate
	}
	return nil
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
