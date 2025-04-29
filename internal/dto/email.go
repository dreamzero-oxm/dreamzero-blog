package dto

type EmailVerificationMessage struct {
	Email            string `json:"email"`
	VerificationCode string `json:"verification_code"`
}