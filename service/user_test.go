package service

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"blog-server/internal/models"
	"testing"
)

func initTestEnv() {
	if err := logger.InitLogger(); err != nil {
		panic(err)
	}
	if err := config.Init("../config/config_original.yaml"); err != nil {
		panic(err)
	}
	if err := models.Init(config.Conf.DataBase); err != nil {
		panic(err)
	}
}

func TestRegister(t *testing.T) {
	initTestEnv()
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
	initTestEnv()
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
			_, jwt, err := tt.service.Login()
			if (err != nil) != tt.wantErr {
				t.Errorf("Login() error = %v, wantErr %v", err, tt.wantErr)
			} else {
				t.Logf("Login JWT: %v", jwt)
			}
		})
	}
}
