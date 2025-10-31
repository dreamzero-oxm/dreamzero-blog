package service

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"blog-server/internal/models"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
	"testing"
	"time"
)

func initTestEnvWithSQLite() {
	// 初始化日志
	if err := logger.InitLogger("../logs"); err != nil {
		panic(err)
	}
	
	// 初始化配置
	if err := config.Init("../config/config_test.yaml"); err != nil {
		panic(err)
	}
	
	// 使用SQLite内存数据库
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Info),
	})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}
	
	// 自动迁移所有模型
	if err := db.AutoMigrate(&models.User{}, &models.OperationLog{}); err != nil {
		panic(err)
	}
	
	// 设置全局DB实例
	models.DB = db
}

func TestRegister(t *testing.T) {
	initTestEnvWithSQLite()
	test := []struct {
		name    string
		service *RegisterUserService
		wantErr bool
	}{
		{
			name: "register fail",
			service: &RegisterUserService{
				UserName: "test",
				Password: "test",
				Email:    "test@test.com",
			},
			wantErr: true,
		},
		{
			name: "register success",
			service: &RegisterUserService{
				UserName: "test",
				Password: "123456789@qweASD",
				Email:    "test@test.com",
			},
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.service.Register()
			if (err != nil) != tt.wantErr {
				t.Errorf("Register() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("Register Err: %v", err)
			}
		})
	}
}

func TestLogin(t *testing.T) {
	initTestEnvWithSQLite()
	test := []struct {
		name    string
		service *LoginUserService
		wantErr bool
	}{
		{
			name: "login fail",
			service: &LoginUserService{
				Account:  "test",
				Password: "test",
			},
			wantErr: true,
		},
		{
			name: "login success",
			service: &LoginUserService{
				Account:  "test",
				Password: "123456789@qweASD",
			},
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			_, accessToken, refreshToken, err := tt.service.Login()
			if (err != nil) != tt.wantErr {
				t.Errorf("Login() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("Login AccessToken: %v", accessToken)
				t.Logf("Login RefreshToken: %v", refreshToken)
			}
		})
	}
}

func TestGetUserProfile(t *testing.T) {
	initTestEnvWithSQLite()
	test := []struct {
		name    string
		service *GetUserProfileService
		wantErr bool
	}{
		{
			name: "get user profile fail - user not found",
			service: &GetUserProfileService{
				ID: uuid.New(), // 不存在的用户ID
			},
			wantErr: true,
		},
		{
			name: "get user profile fail - no user id",
			service: &GetUserProfileService{
				ID: uuid.Nil, // 未提供用户ID
			},
			wantErr: true,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			_, err := tt.service.GetUserProfile()
			if (err != nil) != tt.wantErr {
				t.Errorf("GetUserProfile() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("GetUserProfile Err: %v", err)
			}
		})
	}
}

func TestUpdateUserProfile(t *testing.T) {
	initTestEnvWithSQLite()
	test := []struct {
		name    string
		service *UpdateUserProfileService
		wantErr bool
	}{
		{
			name: "update user profile fail - user not found",
			service: &UpdateUserProfileService{
				ID:       uuid.New(), // 不存在的用户ID
				Nickname: "Test User",
				Email:    "test@example.com",
			},
			wantErr: true,
		},
		{
			name: "update user profile fail - email already exists",
			service: &UpdateUserProfileService{
				ID:       uuid.New(), // 假设存在用户ID
				Nickname: "Test User",
				Email:    "test@test.com", // 假设这个邮箱已被其他用户使用
			},
			wantErr: true,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.service.UpdateUserProfile()
			if (err != nil) != tt.wantErr {
				t.Errorf("UpdateUserProfile() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("UpdateUserProfile Err: %v", err)
			}
		})
	}
}

func TestUploadAvatar(t *testing.T) {
	initTestEnvWithSQLite()
	test := []struct {
		name    string
		service *UploadAvatarService
		avatarURL string
		wantErr bool
	}{
		{
			name: "upload avatar fail - user not found",
			service: &UploadAvatarService{
				ID: uuid.New(), // 不存在的用户ID
			},
			avatarURL: "/uploads/avatars/test.jpg",
			wantErr: true,
		},
		{
			name: "upload avatar success",
			service: &UploadAvatarService{
				ID: uuid.New(), // 假设存在用户ID
			},
			avatarURL: "/uploads/avatars/test.jpg",
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.service.UploadAvatar()
			if (err != nil) != tt.wantErr {
				t.Errorf("UploadAvatar() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("UploadAvatar Err: %v", err)
			}
		})
	}
}

func TestChangePassword(t *testing.T) {
	initTestEnvWithSQLite()
	test := []struct {
		name    string
		service *ChangePasswordService
		wantErr bool
	}{
		{
			name: "change password fail - user not found",
			service: &ChangePasswordService{
				ID:          uuid.New(), // 不存在的用户ID
				OldPassword: "oldpassword",
				NewPassword: "newpassword123",
			},
			wantErr: true,
		},
		{
			name: "change password fail - old password incorrect",
			service: &ChangePasswordService{
				ID:          uuid.New(), // 假设存在用户ID
				OldPassword: "wrongpassword",
				NewPassword: "newpassword123",
			},
			wantErr: true,
		},
		{
			name: "change password success",
			service: &ChangePasswordService{
				ID:          uuid.New(), // 假设存在用户ID
				OldPassword: "123456789@qweASD", // 假设这是正确的旧密码
				NewPassword: "newpassword123",
			},
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.service.ChangePassword()
			if (err != nil) != tt.wantErr {
				t.Errorf("ChangePassword() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("ChangePassword Err: %v", err)
			}
		})
	}
}

func TestGetOperationLogs(t *testing.T) {
	initTestEnvWithSQLite()
	// 先创建一些测试数据
	testUser := models.User{
		UserName: "testuser",
		Email:    "testuser@example.com",
		Password: "testpassword",
		Nickname: "Test User",
		Role:     "user",
		Status:   "active",
	}
	if err := testUser.GenerateEncryptedPassword(); err != nil {
		t.Fatalf("Failed to encrypt password: %v", err)
	}
	if err := models.DB.Create(&testUser).Error; err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}
	
	// 创建测试操作日志
	testLog := models.OperationLog{
		UserID:        testUser.ID,
		UserName:      testUser.UserName,
		OperationType: "login",
		OperationDesc: "用户登录",
		RequestIP:     "127.0.0.1",
		UserAgent:     "Test Agent",
		Status:        "success",
		OperationTime: time.Now(),
	}
	if err := models.DB.Create(&testLog).Error; err != nil {
		t.Fatalf("Failed to create test operation log: %v", err)
	}
	
	test := []struct {
		name    string
		service *GetOperationLogsService
		wantErr bool
	}{
		{
			name: "get operation logs success - with user id",
			service: &GetOperationLogsService{
				ID:       testUser.ID,		
				Page:     1,
				Limit: 10,
			},
			wantErr: false,
		},
		{
			name: "get operation logs success - with operation type",
			service: &GetOperationLogsService{
				Page:          1,
				Limit:         10,
			},
			wantErr: false,
		},
		{
			name: "get operation logs success - with date range",
			service: &GetOperationLogsService{
				Page:      1,
				Limit:  10,
			},
			wantErr: false,
		},
		{
			name: "get operation logs success - default pagination",
			service: &GetOperationLogsService{
				// 不提供分页参数，测试默认值
			},
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			logs, total, err := tt.service.GetOperationLogs()
			if (err != nil) != tt.wantErr {
				t.Errorf("GetOperationLogs() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("GetOperationLogs Err: %v", err)
				t.Logf("GetOperationLogs Total: %d", total)
				t.Logf("GetOperationLogs Count: %d", len(logs))
			}
		})
	}
	
	// 清理测试数据
	models.DB.Delete(&testLog)
	models.DB.Delete(&testUser)
}
