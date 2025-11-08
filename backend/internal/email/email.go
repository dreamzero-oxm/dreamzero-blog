package email

import (
	"blog-server/internal/config"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"sync"

	"github.com/jordan-wright/email"
)

var (
	emailTemplate string
	once          sync.Once
)

func InitEmail() error {
	var resultErr error
	once.Do(func() {
		// 读取模板
		content, err := os.ReadFile(config.Conf.Email.EmailTemplate)
		if err != nil {
			resultErr = fmt.Errorf("读取邮件模板失败: %v", err)
		}
		emailTemplate = string(content)
	})
	return resultErr
}

func SentVerifyCode(to string, code string) error {
	subject := "MOITY - 邮箱验证"
	// 直接使用缓存的模板
	body := strings.ReplaceAll(emailTemplate, "{0}", code)
	return SendEmail(to, subject, body)
}

func SendEmail(to string, subject string, body string) error {
	e := email.NewEmail()
	e.From = fmt.Sprintf("%s <%s>", config.Conf.Email.SenderName, config.Conf.Email.SenderEmail)
	e.To = []string{to}
	e.Subject = subject
	e.HTML = []byte(body)
	smtpAddr := fmt.Sprintf("%s:%d", config.Conf.Email.SmtpHost, config.Conf.Email.SmtpPort)

	// 根据端口选择发送方式
	switch config.Conf.Email.SmtpPort {
	case 465:
		// SSL 方式
		tlsConfig := &tls.Config{
			ServerName:         config.Conf.Email.SmtpHost,
			InsecureSkipVerify: true, // 警告：跳过证书验证存在安全风险，仅用于测试环境
		}
		if err := e.SendWithTLS(smtpAddr, getStmpAuth(), tlsConfig); err != nil && !strings.Contains(err.Error(), "short response") {
			return fmt.Errorf("SSL发送失败: %v", err)
		}
		return nil
	case 587:
		// TLS 方式
		tlsConfig := &tls.Config{
			ServerName:         config.Conf.Email.SmtpHost,
			InsecureSkipVerify: true, // 警告：跳过证书验证存在安全风险，仅用于测试环境
		}
		if err := e.SendWithStartTLS(smtpAddr, getStmpAuth(), tlsConfig); err != nil && !strings.Contains(err.Error(), "short response") {
			return fmt.Errorf("TLS发送失败: %v", err)
		}
		return nil
	}

	// 不安全的方式（不推荐）
	if err := e.Send(smtpAddr, getStmpAuth()); err != nil {
		return fmt.Errorf("普通发送失败: %v", err)
	}
	return nil
}

func getStmpAuth() smtp.Auth {
	return smtp.PlainAuth("", config.Conf.Email.SmtpUsername, config.Conf.Email.SmtpPassword, config.Conf.Email.SmtpHost)
}
