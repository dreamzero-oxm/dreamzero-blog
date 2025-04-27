package utils

import (
	"fmt"
	"runtime"
	"strings"
)

// GetCallerInfo 获取调用者的文件名和行号信息
// skip: 调用栈跳过的帧数，0表示当前函数，1表示上一层调用者，以此类推
// 返回值: 格式化后的调用位置信息，例如: "main.go:123"
func GetCallerInfo(skip int) string {
	_, file, line, ok := runtime.Caller(skip + 1)
	if !ok {
		return "unknown"
	}
	
	// 获取文件的短名称（去掉路径）
	shortFile := file
	if idx := strings.LastIndexByte(file, '/'); idx >= 0 {
		shortFile = file[idx+1:]
	}
	
	return fmt.Sprintf("%s:%d", shortFile, line)
}

// GetFullCallerInfo 获取完整的调用者信息，包含函数名
// skip: 调用栈跳过的帧数
// 返回值: 格式化后的完整调用信息，例如: "main.go:123 in function main.doSomething"
func GetFullCallerInfo(skip int) string {
	pc, file, line, ok := runtime.Caller(skip + 1)
	if !ok {
		return "unknown"
	}
	
	// 获取文件的短名称
	shortFile := file
	if idx := strings.LastIndexByte(file, '/'); idx >= 0 {
		shortFile = file[idx+1:]
	}
	
	// 获取函数名
	funcName := runtime.FuncForPC(pc).Name()
	if idx := strings.LastIndexByte(funcName, '.'); idx >= 0 {
		funcName = funcName[idx+1:]
	}
	
	return fmt.Sprintf("%s:%d in function %s", shortFile, line, funcName)
}