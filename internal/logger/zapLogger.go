package logger

import (
    "os"
    "path/filepath"
	"fmt"

    "github.com/natefinch/lumberjack"
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

func initZapLogger(baseDir string) (*zap.SugaredLogger, error) {
	// 添加颜色输出
	consoleEncoderConfig := zap.NewDevelopmentEncoderConfig()
	consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleEencoder := zapcore.NewConsoleEncoder(consoleEncoderConfig)
	// 日志文件不需要颜色
	fileEencoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())

	// 如果是相对路径，则基于项目根目录
	if !filepath.IsAbs(baseDir) {
		fmt.Println("baseDir is relative path, baseDir: ", baseDir)
		// 获取当前工作目录（项目根目录）
		pwd, err := os.Getwd()
		if err != nil {
			return nil, fmt.Errorf("获取工作目录失败: %w", err)
		}
		baseDir = filepath.Join(pwd, baseDir)
	}

	// 检查并创建日志输出目录
	if _, err := os.Stat(baseDir); err != nil {
		if os.IsNotExist(err) {
			// 目录不存在，尝试创建
			if err = os.MkdirAll(baseDir, 0755); err != nil {
				return nil, fmt.Errorf("创建日志目录失败: %w", err)
			}
		}
	}
	
	debugLogger := &lumberjack.Logger{
		Filename:   filepath.Join(baseDir, "debug.log"),
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
	}
	infoLogger := &lumberjack.Logger{
		Filename:   filepath.Join(baseDir, "info.log"),
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
	}
	errorLogger := &lumberjack.Logger{
		Filename:   filepath.Join(baseDir, "error.log"),
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
	}
	debugWriterSyncer := zapcore.AddSync(debugLogger)
	infoWriterSyncer := zapcore.AddSync(infoLogger)
	errorWriterSyncer := zapcore.AddSync(errorLogger)
	consoleSyncer := zapcore.AddSync(os.Stdout)

	core := zapcore.NewTee(
		zapcore.NewCore(fileEencoder, debugWriterSyncer, zapcore.DebugLevel),
		zapcore.NewCore(fileEencoder, infoWriterSyncer, zapcore.InfoLevel),
		zapcore.NewCore(fileEencoder, errorWriterSyncer, zapcore.ErrorLevel),
		zapcore.NewCore(consoleEencoder, consoleSyncer, zapcore.DebugLevel),
	)

	log := zap.New(core, zap.AddCaller())
	Logger = log.Sugar()
	Logger.Info("日志目录：", baseDir)
	return Logger, nil
}
