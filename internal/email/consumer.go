package email

import (
	"blog-server/internal/code"
	"blog-server/internal/dto"
	"blog-server/internal/logger"
	"blog-server/internal/mq"
	"blog-server/internal/utils"
	"context"
	"encoding/json"
	"fmt"

	"github.com/IBM/sarama"
)

func InitEmailConsumer() error {
	consumer, err := mq.NewKafkaConsumer("email-group", []string{"email_verification"})
	if err != nil {
		return fmt.Errorf("[%v]init consumer failed, err: %v", utils.GetFullCallerInfo(0), err)
	}
	consumer.RegisterHandler("email_verification", func(message *sarama.ConsumerMessage) error {
		var emailMessage dto.EmailVerificationMessage
		err := json.Unmarshal(message.Value, &emailMessage)
		if err != nil {
			return fmt.Errorf("[%v]unmarshal message failed, err: %v", utils.GetFullCallerInfo(0), err)
		}
		// 发送邮件
		if err := SentVerifyCode(emailMessage.Email, emailMessage.VerificationCode); err != nil {
			logger.Logger.Errorf("send email verification code failed: %v", err)
			return code.ErrSendEmailVerificationCode
		}
		return nil
	})
	go consumer.Start(context.Background())
	return nil
}
