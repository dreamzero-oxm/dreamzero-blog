package models

import (
	"blog-server/internal/config"
	"blog-server/internal/logger"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(databaseConfig config.DataBaseConfig) error {
	if err := createDB(databaseConfig); err != nil {
		return err
	}
	if err := migrate(); err != nil {
		return err
	}
	return nil
}

func createDB(databaseConfig config.DataBaseConfig) error {
	postgresConfig := databaseConfig.Postgres
	DB_DSN := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Shanghai",
		postgresConfig.Host,
		postgresConfig.Username,
		postgresConfig.Password,
		postgresConfig.DBName,
		postgresConfig.Port,
		postgresConfig.Sslmode,
	)
	db, err := gorm.Open(postgres.Open(DB_DSN), &gorm.Config{
		Logger: getGormLogger(databaseConfig.Gorm),
	})
	if err != nil {
		logger.Logger.Errorf("Failed to connect to Postgres! [Error]: %v", err)
		return err
	}
	DB = db
	logger.Logger.Info("Connected to Postgres!")
	return nil
}

func getGormLogger(gormConfig config.GormConfig) gormLogger.Interface {
	var writer io.Writer
	if gormConfig.LogOutputDir != "" {
		writer = createMultiWriter(gormConfig.LogOutputDir)
	} else {
		writer = os.Stdout
	}
	newLogger := gormLogger.New(
		log.New(writer, "\r\n", log.LstdFlags), // io writer
		gormLogger.Config{
			SlowThreshold:             time.Second,                       // Slow SQL threshold
			LogLevel:                  getLevelFlag(gormConfig.LogLevel), // Log level
			IgnoreRecordNotFoundError: true,                              // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      true,                              // Don't include params in the SQL log
			Colorful:                  false,                             // Disable color
		},
	)
	return newLogger
}

// 创建多路 Writer（输出到控制台 + 指定目录下的日志文件）
func createMultiWriter(logDir string) io.Writer {
	// 1. 确保日志目录存在（如果不存在则创建）
	err := os.MkdirAll(logDir, 0755) // 目录权限：755
	if err != nil {
		log.Fatalf("Failed to create log directory: %v", err)
	}

	// 2. 拼接日志文件完整路径（如 log/gorm.log）
	logPath := filepath.Join(logDir, "gorm.log")

	// 3. 打开日志文件（追加模式，不存在则创建）
	file, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666) // 文件权限：666
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}

	// 4. 组合多个 Writer：控制台 + 文件
	return io.MultiWriter(
		os.Stdout, // 控制台输出
		file,      // 文件输出
	)
}

func getLevelFlag(level string) gormLogger.LogLevel {
	level = strings.ToLower(level)
	switch level {
	case "silent":
		return gormLogger.Silent
	case "error":
		return gormLogger.Error
	case "warn":
		return gormLogger.Warn
	case "info":
		return gormLogger.Info
	default:
		return gormLogger.Info
	}
}

func migrate() error {
	if err := DB.AutoMigrate(&DailyPhotograph{}); err != nil {
		return err
	}
	if err := DB.AutoMigrate(&ArticleComment{}); err != nil {
		return err
	}
	if err := DB.AutoMigrate(&User{}); err != nil {
		return err
	}
	if err := DB.AutoMigrate(&Article{}); err != nil {
		return err
	}
	return nil
}

func Close() {
	sqlDB, err := DB.DB()
	if err != nil {
		logger.Logger.Errorf("Failed to close DB! [Error]: %v", err)
	}
	sqlDB.Close()
}
