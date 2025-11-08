package service

import (
	"blog-server/internal/models"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateOperationLogService 创建操作日志服务结构体
// 用于处理创建操作日志的请求和业务逻辑
type CreateOperationLogService struct {
	UserID        uuid.UUID `json:"user_id"`                        // 用户ID
	UserName      string    `json:"user_name"`                      // 用户名
	OperationType string    `json:"operation_type"`                  // 操作类型
	OperationDesc string    `json:"operation_desc"`                  // 操作描述
	RequestIP     string    `json:"request_ip"`                      // 请求IP
	UserAgent     string    `json:"user_agent"`                      // 用户代理
	RequestData   string    `json:"request_data"`                    // 请求数据
	ResponseData  string    `json:"response_data"`                   // 响应数据
	Status        string    `json:"status"`                          // 操作状态
	ErrorMessage  string    `json:"error_message"`                  // 错误信息
}

// Create 创建操作日志
// 保存操作日志到数据库
// 返回可能的错误
func (s *CreateOperationLogService) Create() error {
	// 创建操作日志对象
	log := &models.OperationLog{
		UserID:        s.UserID,
		UserName:      s.UserName,
		OperationType: s.OperationType,
		OperationDesc: s.OperationDesc,
		RequestIP:     s.RequestIP,
		UserAgent:     s.UserAgent,
		RequestData:   s.RequestData,
		ResponseData:  s.ResponseData,
		Status:        s.Status,
		ErrorMessage:  s.ErrorMessage,
		OperationTime: time.Now(),
	}

	// 保存操作日志到数据库
	if err := models.DB.Create(log).Error; err != nil {
		return err
	}

	return nil
}

// LogArticleAccess 记录文章访问日志
// 这是一个便捷函数，用于记录文章访问操作
func LogArticleAccess(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle, status, errorMessage string) error {
	// 获取请求IP和用户代理
	requestIP := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	// 构建请求数据
	requestData := fmt.Sprintf(`{"article_id":"%s"}`, articleID)

	// 构建响应数据
	responseData := fmt.Sprintf(`{"article_title":"%s","status":"%s"}`, articleTitle, status)

	// 创建操作日志服务
	logService := &CreateOperationLogService{
		UserID:        userID,
		UserName:      userName,
		OperationType: "article_access",
		OperationDesc: fmt.Sprintf("访问文章: %s", articleTitle),
		RequestIP:     requestIP,
		UserAgent:     userAgent,
		RequestData:   requestData,
		ResponseData:  responseData,
		Status:        status,
		ErrorMessage:  errorMessage,
	}

	// 创建操作日志
	return logService.Create()
}

// LogArticleAccessAttempt 记录文章访问尝试日志
// 这是一个便捷函数，用于记录文章访问尝试操作（包括成功和失败）
func LogArticleAccessAttempt(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle string, success bool, errorMessage string) error {
	status := "success"
	if !success {
		status = "failed"
	}

	return LogArticleAccess(c, userID, userName, articleID, articleTitle, status, errorMessage)
}

// LogArticleOperation 记录文章操作日志
// 这是一个便捷函数，用于记录文章的各种操作（创建、更新、删除等）
func LogArticleOperation(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle, operationType, operationDesc string, success bool, errorMessage string) error {
	// 获取请求IP和用户代理
	requestIP := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	// 构建请求数据
	requestData := fmt.Sprintf(`{"article_id":"%s","article_title":"%s"}`, articleID, articleTitle)

	// 构建响应数据
	responseData := fmt.Sprintf(`{"status":"%s"}`, func() string {
		if success {
			return "success"
		}
		return "failed"
	}())

	// 设置状态
	status := "success"
	if !success {
		status = "failed"
	}

	// 创建操作日志服务
	logService := &CreateOperationLogService{
		UserID:        userID,
		UserName:      userName,
		OperationType: operationType,
		OperationDesc: operationDesc,
		RequestIP:     requestIP,
		UserAgent:     userAgent,
		RequestData:   requestData,
		ResponseData:  responseData,
		Status:        status,
		ErrorMessage:  errorMessage,
	}

	// 创建操作日志
	return logService.Create()
}

// LogArticleCreate 记录文章创建日志
func LogArticleCreate(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle string, success bool, errorMessage string) error {
	operationDesc := fmt.Sprintf("创建文章: %s", articleTitle)
	return LogArticleOperation(c, userID, userName, articleID, articleTitle, "article_create", operationDesc, success, errorMessage)
}

// LogArticleUpdate 记录文章更新日志
func LogArticleUpdate(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle string, success bool, errorMessage string) error {
	operationDesc := fmt.Sprintf("更新文章: %s", articleTitle)
	return LogArticleOperation(c, userID, userName, articleID, articleTitle, "article_update", operationDesc, success, errorMessage)
}

// LogArticleDelete 记录文章删除日志
func LogArticleDelete(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle string, success bool, errorMessage string) error {
	operationDesc := fmt.Sprintf("删除文章: %s", articleTitle)
	return LogArticleOperation(c, userID, userName, articleID, articleTitle, "article_delete", operationDesc, success, errorMessage)
}

// LogArticleLike 记录文章点赞日志
func LogArticleLike(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle string, success bool, errorMessage string) error {
	operationDesc := fmt.Sprintf("点赞文章: %s", articleTitle)
	return LogArticleOperation(c, userID, userName, articleID, articleTitle, "article_like", operationDesc, success, errorMessage)
}

// LogArticleStatusUpdate 记录文章状态更新日志
func LogArticleStatusUpdate(c *gin.Context, userID uuid.UUID, userName, articleID, articleTitle, oldStatus, newStatus string, success bool, errorMessage string) error {
	operationDesc := fmt.Sprintf("更新文章状态: %s (%s -> %s)", articleTitle, oldStatus, newStatus)
	return LogArticleOperation(c, userID, userName, articleID, articleTitle, "article_status_update", operationDesc, success, errorMessage)
}