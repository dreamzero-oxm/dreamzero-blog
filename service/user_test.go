package service

import (
	"testing"
	"blog-server/internal/config"
	"blog-server/internal/models"
	"blog-server/internal/logger"
)

func initTestEnv(){
	if err := logger.InitLogger(); err!= nil {
		panic(err)
	}
	if err := config.Init("../config/config_original.yaml"); err!= nil {
		panic(err)
	}
	if err := models.Init(config.Conf.DataBase); err!= nil {
		panic(err)
	}
}

func TestRegister(t *testing.T) {
	initTestEnv()
	test := []struct{
		name string
		service *ResigterUserService
		wantErr bool
	}{
		{
			name: "register fail",
			service: &ResigterUserService{
				UserName: "test",
				Password: "test",
				Email: "test@test.com",
			},
			wantErr: true,
		},
		{
			name: "register success",
			service: &ResigterUserService{
				UserName: "test",
				Password: "123456789@qweASD",
				Email: "test@test.com",
			},
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.service.Register()
			if (err != nil) != tt.wantErr {
				t.Errorf("Register() error = %v, wantErr %v", err, tt.wantErr)
			}else {
				t.Logf("Register Err: %v", err)
			}
		})
	}
}