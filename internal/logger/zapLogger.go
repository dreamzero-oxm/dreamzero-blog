package logger

import (
    "os"
    "path/filepath"

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

	// 检查并创建日志输出目录
	if _, err := os.Stat(baseDir); os.IsNotExist(err) {
	    if err := os.MkdirAll(baseDir, 0755); err != nil {
	        return nil, err
	    }
	}else if err != nil {
	    return nil, err
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
	return Logger, nil
}
