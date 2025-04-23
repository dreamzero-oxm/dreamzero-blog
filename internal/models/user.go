package models

import (
	"blog-server/internal/code"
	"blog-server/internal/utils"
	"time"
)

type User struct {
	SwaggerGormModel `json:",inline" gorm:"embedded"`
	UserName         string    `json:"user_name" gorm:"unique;not null"`                                                         // 用户名，唯一
	Password         string    `json:"password" gorm:"type:text;not null"`                                                       // 密码，加密存储
	Nickname         string    `json:"nickname" gorm:"not null"`                                                                 // 昵称，默认为用户名
	Email            string    `json:"email" gorm:"not null;check:email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'"` // 邮箱,
	Phone            string    `json:"phone" gorm:"unique;not null"`                                                             // 手机号,暂不使用
	Avatar           string    `json:"avatar" `                                                                                  // 头像，默认为空
	Role             string    `json:"role" gorm:"not null;check:role IN ('admin', 'user', 'guest')"`                            // 角色，例如：admin, user, guest
	Status           string    `json:"status" gorm:"not null;check:status IN ('active', 'inactive', 'suspended')"`               // 状态，例如：active, inactive, suspended
	LastLogin        time.Time `json:"last_login" gorm:"not null"`                                                               // 上次登录时间
	LastLogout       time.Time `json:"last_logout" gorm:"not null"`                                                              // 上次登出时间
	LoginCount       int       `json:"login_count" gorm:"not null"`                                                              // 登录次数
	FailedLoginCount int       `json:"failed_login_count" gorm:"not null"`                                                       // 失败登录次数
	LastFailedLogin  time.Time `json:"last_failed_login" gorm:"not null"`                                                        // 上次失败登录时间
	LastFailedReason string    `json:"last_failed_reason" `                                                                      // 上次失败原因
	IsLocked         bool      `json:"is_locked" gorm:"not null"`                                                                // 是否锁定
	LockUntil        time.Time `json:"lock_until"`                                                                               // 锁定截止时间
	DeletedBy        string    `json:"deleted_by"`                                                                               // 删除人
	DeletedReason    string    `json:"deleted_reason"`                                                                           // 删除原因
	IsActive         bool      `json:"is_active" gorm:"not null"`                                                                // 是否激活
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
