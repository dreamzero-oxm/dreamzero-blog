package logger

import (
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.SugaredLogger

func InitLogger() {
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

func GinLogger(logger *zap.SugaredLogger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		cost := time.Since(start)
		logger.Infow(path,
			"status", c.Writer.Status(),
			"method", c.Request.Method,
			"path", path,
			"query", query,
			"ip", c.ClientIP(),
			"user-agent", c.Request.UserAgent(),
			"errors", c.Errors.ByType(gin.ErrorTypePrivate).String(),
			"cost", cost,
		)
	}
}

// GinRecovery 使用 zap 捕获并记录 panic
func GinRecovery(logger *zap.SugaredLogger, stack bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				var brokenPipe bool
				if ne, ok := err.(*net.OpError); ok {
					if se, ok := ne.Err.(*os.SyscallError); ok {
						errStr := strings.ToLower(se.Error())
						if strings.Contains(errStr, "broken pipe") || strings.Contains(errStr, "connection reset by peer") {
							brokenPipe = true
						}
					}
				}

				httpRequest, _ := httputil.DumpRequest(c.Request, false)
				if brokenPipe {
					logger.Errorw(c.Request.URL.Path,
						"error", err,
						"request", string(httpRequest),
					)
					_ = c.Error(err.(error))
					c.Abort()
					return
				}

				if stack {
					logger.Errorw("[Recovery from panic]",
						"error", err,
						"request", string(httpRequest),
						"stack", string(debug.Stack()),
					)
				} else {
					logger.Errorw("[Recovery from panic]",
						"error", err,
						"request", string(httpRequest),
					)
				}
				c.AbortWithStatus(http.StatusInternalServerError)
			}
		}()
		c.Next()
	}
}
