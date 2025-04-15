package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mlm.com/internal"
	"mlm.com/internal/version"
)

// Health ...
func Health(c *gin.Context) {
	c.String(http.StatusOK, "ok")
}

// Version ...
func Version(c *gin.Context) {
	internal.APIResponse(c, nil, version.Get())
}
