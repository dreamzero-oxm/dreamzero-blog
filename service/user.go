package service

import (
	"blog-server/internal/code"
	"blog-server/internal/models"
	"time"
)

type RegisterUserService struct {
	UserName string `json:"user_name" form:"user_name" binding:"required"`
	Password string `json:"password" form:"password" binding:"required"`
	Email    string `json:"email" form:"email" binding:"required"`
}

func (service *RegisterUserService) Register() error {
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
	// TODO:生成JWT
	// 更新用户的登录记录
	user.LastLogin = time.Now()
	user.LoginCount++
	// 更新用户的信息
	if postgreDB.Save(&user).Error != nil {
		return nil, "jwt", code.ErrDatabase
	}
	return &user, "jwt", nil
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
