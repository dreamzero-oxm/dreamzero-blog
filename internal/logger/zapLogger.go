package logger

import (
	"os"
	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func initZapLogger() {
	consoleEncoderConfig := zap.NewDevelopmentEncoderConfig()
	// 添加颜色输出
	consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleEencoder := zapcore.NewConsoleEncoder(consoleEncoderConfig)
	fileEencoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
	debugLogger := &lumberjack.Logger{
		Filename:   "./logs/debug.log",
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
	}
	infoLogger := &lumberjack.Logger{
		Filename:   "./logs/info.log",
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
	}
	errorLogger := &lumberjack.Logger{
		Filename:   "./logs/error.log",
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
}

