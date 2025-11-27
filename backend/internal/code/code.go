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

	ErrValidation             = &Errno{Code: 20001, Message: "Validation failed."}
	ErrDatabase               = &Errno{Code: 20002, Message: "Database error."}
	ErrToken                  = &Errno{Code: 20003, Message: "Error occurred while signing the JSON web token."}
	ErrInvalidTransaction     = &Errno{Code: 20004, Message: "invalid transaction."}
	ErrPasswordValidation     = &Errno{Code: 20005, Message: "密码格式校验失败"}
	ErrRsaPrivateKeyPathError = &Errno{Code: 20006, Message: "RSA密钥路径错误"}
	ErrRsaPublicKeyPathError  = &Errno{Code: 20007, Message: "RSA公钥路径错误"}

	// jwt errors
	ErrAuthorizationNotExist = &Errno{Code: 20101, Message: "Authorization不存在"}
	ErrGenerateJWT           = &Errno{Code: 20102, Message: "生成JWT错误"}
	ErrTokenInvalid          = &Errno{Code: 20103, Message: "Token错误"}
	ErrTokenExpired          = &Errno{Code: 20104, Message: "Token已过期"}
	ErrTokenIssError         = &Errno{Code: 20105, Message: "Token签发错误"}
	ErrTokenNbfError         = &Errno{Code: 20106, Message: "Token生效时间错误"}
	ErrRefreshTokenInvalid   = &Errno{Code: 20107, Message: "Refresh token无效"}
	ErrRefreshTokenExpired   = &Errno{Code: 20108, Message: "Refresh token已过期"}

	// user errors
	ErrEncrypt                   = &Errno{Code: 20201, Message: "密码加密错误"}
	ErrUserNotFound              = &Errno{Code: 20202, Message: "用户不存在"}
	ErrInvalidUserID             = &Errno{Code: 20203, Message: "无效的用户ID"}
	ErrPasswordIncorrect         = &Errno{Code: 20204, Message: "密码错误"}
	ErrUserExistBefore           = &Errno{Code: 20205, Message: "用户已存在"}
	ErrUserCreate                = &Errno{Code: 20206, Message: "用户创建错误"}
	ErrSendSMSTooMany            = &Errno{Code: 20207, Message: "已超出当日限制，请明天再试"}
	ErrVerifyCode                = &Errno{Code: 20208, Message: "验证码错误"}
	ErrEmailOrPassword           = &Errno{Code: 20209, Message: "邮箱或密码错误"}
	ErrTwicePasswordNotMatch     = &Errno{Code: 20210, Message: "两次密码输入不一致"}
	ErrRegisterFailed            = &Errno{Code: 20211, Message: "注册失败"}
	ErrCreatedUser               = &Errno{Code: 20212, Message: "用户创建失败"}
	ErrEmailValidation           = &Errno{Code: 20213, Message: "邮箱格式不正确"}
	ErrUserLocked                = &Errno{Code: 20214, Message: "用户已被锁定"}
	ErrUserInactive              = &Errno{Code: 20215, Message: "用户未激活"}
	ErrUserSuspended             = &Errno{Code: 20216, Message: "用户已被封禁"}
	ErrVerificationCodeInvalid   = &Errno{Code: 20217, Message: "验证码无效"}
	ErrVerificationCodeLength    = &Errno{Code: 20218, Message: "验证码长度不正确"}
	ErrSendEmailVerificationCode = &Errno{Code: 20219, Message: "发送邮件验证码失败"}
	ErrEmailExistBefore          = &Errno{Code: 20220, Message: "邮箱已被注册"}

	// photo errors
	ErrPhotoUpload = &Errno{Code: 20301, Message: "图片上传失败"}
	ErrPhotoDelete = &Errno{Code: 20302, Message: "图片删除失败"}
	ErrPhotoList   = &Errno{Code: 20303, Message: "图片列表获取失败"}

	// daily photograph errors
	ErrDailyPhotographUserNotFound = &Errno{Code: 20601, Message: "用户不存在"}
	ErrDailyPhotographDateParse     = &Errno{Code: 20602, Message: "日期格式错误"}
	ErrDailyPhotographNotFound      = &Errno{Code: 20603, Message: "照片不存在"}
	ErrDailyPhotographPermission    = &Errno{Code: 20604, Message: "无权限操作此照片"}
	ErrDailyPhotographCreate        = &Errno{Code: 20605, Message: "创建照片失败"}
	ErrDailyPhotographUpdate        = &Errno{Code: 20606, Message: "更新照片失败"}
	ErrDailyPhotographDelete        = &Errno{Code: 20607, Message: "删除照片失败"}
	ErrDailyPhotographLike          = &Errno{Code: 20608, Message: "点赞照片失败"}
	ErrDailyPhotographList          = &Errno{Code: 20609, Message: "获取照片列表失败"}
	ErrDailyPhotographFileOpen      = &Errno{Code: 20610, Message: "打开文件失败"}
	ErrDailyPhotographFileUpload    = &Errno{Code: 20611, Message: "上传文件失败"}

	// article comment errors
	ErrArticleCommentCreateFailed = &Errno{Code: 20401, Message: "评论创建失败"}
	ErrArticleCommentListFailed   = &Errno{Code: 20402, Message: "评论列表获取失败"}

	// article errors
	ErrArticleTitleEmpty        = &Errno{Code: 20501, Message: "文章标题不能为空"}
	ErrArticleContentEmpty      = &Errno{Code: 20502, Message: "文章内容不能为空"}
	ErrArticleUserIDEmpty       = &Errno{Code: 20503, Message: "文章用户ID不能为空"}
	ErrArticleStatusInvalid     = &Errno{Code: 20504, Message: "文章状态无效"}
	ErrArticleNotFound          = &Errno{Code: 20505, Message: "文章不存在"}
	ErrArticleCreateFailed      = &Errno{Code: 20506, Message: "文章创建失败"}
	ErrArticleUpdateFailed      = &Errno{Code: 20507, Message: "文章更新失败"}
	ErrArticleDeleteFailed      = &Errno{Code: 20508, Message: "文章删除失败"}
	ErrArticleListFailed        = &Errno{Code: 20509, Message: "文章列表获取失败"}
	ErrArticleGetFailed         = &Errno{Code: 20510, Message: "文章获取失败"}
	ErrArticlePermissionDenied  = &Errno{Code: 20511, Message: "没有权限操作此文章"}
	ErrArticleCoverImageInvalid = &Errno{Code: 20512, Message: "封面图片必须是有效的URL或Base64编码的图片"}
	ErrInvalidArticleID         = &Errno{Code: 20513, Message: "无效的文章ID"}

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
