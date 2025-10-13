package controller

import (
	"net/http"

	"blog-server/internal"

	"blog-server/internal/version"

	"github.com/gin-gonic/gin"
)

// Health ...
func Health(c *gin.Context) {
	c.String(http.StatusOK, "ok")
}

// Version ...
func Version(c *gin.Context) {
	internal.APIResponse(c, nil, version.Get())
}
