package models

import (
	"blog-server/internal/code"
	"blog-server/internal/utils"
	"time"
)

type User struct {
	SwaggerGormModel `json:",inline" gorm:"embedded"`
	UserName         string    `json:"user_name" gorm:"type:varchar(50);unique;not null"`                                      // 用户名，唯一
	Password         string    `json:"-" gorm:"type:varchar(255);;not null"`                                                   // 密码，加密存储
	Nickname         string    `json:"nickname" gorm:"type:varchar(50);not null;index"`                                              // 昵称，默认为用户名
	Email            string    `json:"email" gorm:"type:varchar(100);not null"`                                                // 邮箱,
	Phone            string    `json:"phone" gorm:"type:varchar(20);not null"`                                                 // 手机号,暂不使用
	Avatar           string    `json:"avatar" gorm:"type:varchar(255)"`                                                        // 头像，默认为空
	Bio              string    `json:"bio" gorm:"type:varchar(255)"`                                                          // 个人简介
	Website          string    `json:"website" gorm:"type:varchar(255)"`                                                      // 个人网站
	Location         string    `json:"location" gorm:"type:varchar(100)"`                                                     // 所在地
	Birthday         string    `json:"birthday" gorm:"type:varchar(20)"`                                                      // 生日
	Gender           string    `json:"gender" gorm:"type:varchar(10)"`                                                         // 性别
	Role             string    `json:"-" gorm:"type:varchar(10);not null;check:role IN ('admin', 'user', 'guest')"`            // 角色，例如：admin, user, guest
	Status           string    `json:"-" gorm:"type:varchar(10);not null;check:status IN ('active', 'inactive', 'suspended')"` // 状态，例如：active, inactive, suspended
	LastLogin        time.Time `json:"-" gorm:"type:timestamp;not null"`                                                       // 上次登录时间
	LastLogout       time.Time `json:"-" gorm:"type:timestamp;not null"`                                                       // 上次登出时间
	LoginCount       int       `json:"-" gorm:"type:int;not null"`                                                             // 登录次数
	FailedLoginCount int       `json:"-" gorm:"type:int;not null"`                                                             // 失败登录次数
	LastFailedLogin  time.Time `json:"-" gorm:"type:timestamp;not null"`                                                       // 上次失败登录时间
	LastFailedReason string    `json:"-" gorm:"type:varchar(255)"`                                                             // 上次失败原因
	IsLocked         bool      `json:"is_locked" gorm:"type:boolean;not null;default:false"`                                   // 是否锁定
	LockUntil        time.Time `json:"lock_until" gorm:"type:timestamp"`                                                       // 锁定截止时间
	DeletedBy        string    `json:"-" gorm:"type:varchar(255)"`                                                             // 删除人
	DeletedReason    string    `json:"-" gorm:"type:varchar(255)"`                                                             // 删除原因
	IsActive         bool      `json:"-" gorm:"type:boolean;not null;default:false"`                                           // 是否激活
}

// 创建新用户的时候调用的方法
func (u *User) Validate() error {
	// TODO: 实现用户验证逻辑
	if !utils.ValidatePassword(u.Password, u.UserName) {
		return code.ErrPasswordValidation
	}
	if !utils.ValidateEmail(u.Email) {
		return code.ErrEmailValidation
	}

	return nil
}

func (u *User) GenerateEncryptedPassword() error {
	// TODO: 实现密码加密逻辑
	encryptedPassword, err := utils.GenerateEncryptedPassword(u.Password)
	if err != nil {
		return code.ErrEncrypt
	}
	u.Password = encryptedPassword
	return nil
}

func (u *User) ComparePassword(password string) bool {
	// TODO: 实现密码比较逻辑
	return utils.ComparePassword(password, u.Password)
}
