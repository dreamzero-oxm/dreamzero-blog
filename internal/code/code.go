package code

import "fmt"

// nolint: golint
var (
	// Common errors
	OK                  = &Errno{Code: 0, Message: "OK"}
	InternalServerError = &Errno{Code: 10001, Message: "Internal server error"}
	ErrBind             = &Errno{Code: 10002, Message: "Error occurred while binding the request body to the struct."}
	ErrParam            = &Errno{Code: 10003, Message: "参数有误"}
	ErrSignParam        = &Errno{Code: 10004, Message: "签名参数有误"}

	ErrValidation         			= &Errno{Code: 20001, Message: "Validation failed."}
	ErrDatabase           			= &Errno{Code: 20002, Message: "Database error."}
	ErrToken              			= &Errno{Code: 20003, Message: "Error occurred while signing the JSON web token."}
	ErrInvalidTransaction 			= &Errno{Code: 20004, Message: "invalid transaction."}
	ErrPasswordValidation 			= &Errno{Code: 20005, Message: "密码格式校验失败"}
	ErrRsaPrivateKeyPathError 		= &Errno{Code: 20006, Message: "RSA密钥路径错误"}
	ErrRsaPublicKeyPathError  		= &Errno{Code: 20007, Message: "RSA公钥路径错误"}
	
	// jwt errors
	ErrAuthorizationNotExist 		= &Errno{Code: 20101, Message: "Authorization不存在"}
	ErrGenerateJWT        			= &Errno{Code: 20102, Message: "生成JWT错误"}
	ErrTokenInvalid          		= &Errno{Code: 20103, Message: "Token错误"}
	ErrTokenExpired          		= &Errno{Code: 20104, Message: "Token已过期"}
	ErrTokenIssError         		= &Errno{Code: 20105, Message: "Token签发错误"}
	ErrTokenNbfError         		= &Errno{Code: 20106, Message: "Token生效时间错误"}

	// user errors
	ErrEncrypt               		= &Errno{Code: 20201, Message: "密码加密错误"}
	ErrUserNotFound          		= &Errno{Code: 20202, Message: "用户不存在"}
	ErrPasswordIncorrect     		= &Errno{Code: 20204, Message: "密码错误"}
	ErrUserExistBefore       		= &Errno{Code: 20205, Message: "用户已存在"}
	ErrUserCreate            		= &Errno{Code: 20206, Message: "用户创建错误"}
	ErrSendSMSTooMany        		= &Errno{Code: 20207, Message: "已超出当日限制，请明天再试"}
	ErrVerifyCode            		= &Errno{Code: 20208, Message: "验证码错误"}
	ErrEmailOrPassword       		= &Errno{Code: 20209, Message: "邮箱或密码错误"}
	ErrTwicePasswordNotMatch 		= &Errno{Code: 20210, Message: "两次密码输入不一致"}
	ErrRegisterFailed        		= &Errno{Code: 20211, Message: "注册失败"}
	ErrCreatedUser           		= &Errno{Code: 20212, Message: "用户创建失败"}
	ErrEmailValidation       		= &Errno{Code: 20213, Message: "邮箱格式不正确"}
	ErrUserLocked            		= &Errno{Code: 20214, Message: "用户已被锁定"}
	ErrUserInactive          		= &Errno{Code: 20215, Message: "用户未激活"}
	ErrUserSuspended         		= &Errno{Code: 20216, Message: "用户已被封禁"}
	ErrVerificationCodeInvalid 		= &Errno{Code: 20217, Message: "验证码无效"}
	ErrVerificationCodeLength 		= &Errno{Code: 20218, Message: "验证码长度不正确"}
	ErrSendEmailVerificationCode 	= &Errno{Code: 20219, Message: "发送邮件验证码失败"}
	ErrEmailExistBefore        		= &Errno{Code: 20220, Message: "邮箱已被注册"}

	// photo errors
	ErrPhotoUpload = &Errno{Code: 20301, Message: "图片上传失败"}
	ErrPhotoDelete = &Errno{Code: 20302, Message: "图片删除失败"}
	ErrPhotoList   = &Errno{Code: 20303, Message: "图片列表获取失败"}

	// article comment errors
	ErrArticalCommentCreateFailed = &Errno{Code: 20401, Message: "评论创建失败"}
	ErrArticalCommentListFailed   = &Errno{Code: 20402, Message: "评论列表获取失败"}

)

// Errno ...
type Errno struct {
	Code    int
	Message string
}

func (err Errno) Error() string {
	return err.Message
}

// Err represents an error
type Err struct {
	Code    int
	Message string
	Err     error
}

func (err *Err) Error() string {
	return fmt.Sprintf("Err - code: %d, message: %s, error: %s", err.Code, err.Message, err.Err)
}

// DecodeErr ...
func DecodeErr(err error) (int, string) {
	if err == nil {
		return OK.Code, OK.Message
	}

	switch typed := err.(type) {
	case *Err:
		return typed.Code, typed.Message
	case *Errno:
		return typed.Code, typed.Message
	default:
	}

	return InternalServerError.Code, err.Error()
}
