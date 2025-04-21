package server

import (
	"github.com/gin-gonic/gin"
)

type Server struct {
	GinEngine *gin.Engine
}

func NewServer() *Server {
	server := &Server{
		GinEngine: gin.Default(),
	}
	return server
}