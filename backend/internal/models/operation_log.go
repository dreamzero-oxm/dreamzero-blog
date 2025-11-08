package models

import (
	"github.com/google/uuid"
	"time"
)

// OperationLog 操作日志模型
type OperationLog struct {
	SwaggerGormModel `json:",inline" gorm:"embedded"`
	UserID           uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`                    // 用户ID
	UserName         string    `json:"user_name" gorm:"type:varchar(50);not null"`                  // 用户名
	OperationType    string    `json:"operation_type" gorm:"type:varchar(50);not null;index"`       // 操作类型
	OperationDesc    string    `json:"operation_desc" gorm:"type:varchar(255);not null"`            // 操作描述
	RequestIP        string    `json:"request_ip" gorm:"type:varchar(50)"`                          // 请求IP
	UserAgent        string    `json:"user_agent" gorm:"type:varchar(500)"`                         // 用户代理
	RequestData      string    `json:"request_data" gorm:"type:text"`                               // 请求数据
	ResponseData     string    `json:"response_data" gorm:"type:text"`                              // 响应数据
	Status           string    `json:"status" gorm:"type:varchar(20);not null;default:'success'"`   // 操作状态
	ErrorMessage     string    `json:"error_message" gorm:"type:text"`                             // 错误信息
	OperationTime    time.Time `json:"operation_time" gorm:"type:timestamp;not null"` // 操作时间
}

// TableName 指定表名
func (OperationLog) TableName() string {
	return "operation_logs"
}