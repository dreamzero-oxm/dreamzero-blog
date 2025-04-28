package utils

import (
	"regexp"
	"math/big"
	"time"
	"crypto/rand"
)

// ValidatePassword 验证密码强度
// 要求：
// 1. 至少8个字符
// 2. 至少包含一个大写字母
// 3. 至少包含一个小写字母
// 4. 至少包含一个数字
// 5. 至少包含一个特殊字符
func ValidatePassword(password, userName string) bool {
	// 密码长度至少为8
	if len(password) < 8 {
		return false
	}
	if len(password) > 32 {
		return false
	}
	// 密码不能包含空格
	if regexp.MustCompile(`\s`).MatchString(password) {
		return false
	}
	// 密码不能包含用户名
	if userName != "" && regexp.MustCompile(`(?i)`+userName).MatchString(password) {
		return false
	}

	// 使用正则表达式检查密码要求
	hasUpperCase := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLowerCase := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	hasSpecialChar := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)

	// 所有条件都必须满足
	return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}

// ValidateEmail 验证邮箱格式是否正确
// 规则：
// 1. 用户名部分可以包含：字母、数字、点号(.)、下划线(_)、百分号(%)、加号(+)、减号(-)
// 2. @ 符号是必需的
// 3. 域名部分必须包含至少一个点号，且结尾必须是2个以上的字母
func ValidateEmail(email string) bool {
	// 邮箱正则表达式模式
	pattern := `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`

	// 编译正则表达式
	reg := regexp.MustCompile(pattern)

	// 返回匹配结果
	return reg.MatchString(email)
}

func GenerateVerificationCode() string {
	// 生成6位随机数字验证码
	const charset = "0123456789"
	const codeLength = 6
	
	// 使用 crypto/rand 包来生成安全的随机数
	code := make([]byte, codeLength)
	for i := range code {
		// 生成随机索引
		randomIndex, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			// 如果生成随机数失败，使用当前时间的纳秒作为备选方案
			randomIndex = big.NewInt(time.Now().UnixNano() % int64(len(charset)))
		}
		// 从字符集中选择一个字符
		code[i] = charset[randomIndex.Int64()]
	}
	
	return string(code)
}
