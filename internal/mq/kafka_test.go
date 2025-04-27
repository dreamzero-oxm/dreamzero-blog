package mq

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"testing"
)

func initTestEnv() {
	if err := logger.InitLogger("../../logs"); err != nil {
		panic(err)
	}
	if err := config.Init("../../config/config_original.yaml"); err != nil {
		panic(err)
	}
}

func TestNewKafkaProducer(t *testing.T) {
	initTestEnv()
	test := []struct {
		name string
		wantErr bool
	}{
		{
			name: "测试创建kafka生产者",
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			_, err := NewKafkaProducer()
			if (err != nil) != tt.wantErr {
				t.Errorf("NewKafkaProducer() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}