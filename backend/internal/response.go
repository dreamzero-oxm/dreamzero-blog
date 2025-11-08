package internal

import (
	"net/http"

	"blog-server/internal/code"

	"github.com/gin-gonic/gin"
)

// Response ...
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

// APIResponse ....
func APIResponse(ctx *gin.Context, err error, data interface{}) {
	APIResponseWithStatus(ctx, err, data, http.StatusOK)
}

func APIResponseUnauthorized(ctx *gin.Context, err error, data interface{}) {
    APIResponseWithStatus(ctx, err, data, http.StatusUnauthorized)
    ctx.Abort() // 添加这行
}

func APIResponseForbidden(ctx *gin.Context, err error, data interface{}) {
	APIResponseWithStatus(ctx, err, data, http.StatusForbidden)
	ctx.Abort() // 添加这行
}

func APIResponseNotFound(ctx *gin.Context, err error, data interface{}) {
	APIResponseWithStatus(ctx, err, data, http.StatusNotFound)
	ctx.Abort() // 添加这行
}

func APIResponseBadRequest(ctx *gin.Context, err error, data interface{}) {
	APIResponseWithStatus(ctx, err, data, http.StatusBadRequest)
	ctx.Abort() // 添加这行
}

func APIResponseInternalServerError(ctx *gin.Context, err error, data interface{}) {
	APIResponseWithStatus(ctx, err, data, http.StatusInternalServerError)
	ctx.Abort() // 添加这行
}

func APIResponseWithStatus(ctx *gin.Context, err error, data interface{}, statusCode int) {
	code, message := code.DecodeErr(err)
	ctx.JSON(statusCode, Response{
		Code: code,
		Msg:  message,
		Data: data,
	})
}