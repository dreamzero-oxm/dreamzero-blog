package models

import (
	"blog-server/internal/config"
	"fmt"
	"blog-server/internal/logger"

	"gorm.io/gorm"
	"gorm.io/driver/postgres"
)

var DB *gorm.DB

func Init(postgresConfig config.PostgresConfig) error {
	DB_DSN := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Shanghai", 
	postgresConfig.Host, 
		postgresConfig.Username, 
		postgresConfig.Password, 
		postgresConfig.DBName, 
		postgresConfig.Port,
		postgresConfig.Sslmode,
	)
	db, err := gorm.Open(postgres.Open(DB_DSN), &gorm.Config{})
	if err != nil {
		logger.Logger.Errorf("Failed to connect to Postgres! [Error]: %v", err)
		return err
	}
	DB = db
	logger.Logger.Info("Connected to Postgres!")
	return nil
}