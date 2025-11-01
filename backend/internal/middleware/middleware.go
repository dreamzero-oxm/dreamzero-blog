package middleware

import "blog-server/internal/server"

func InitMiddleware(s *server.Server) {
	s.GinEngine.Use(CorsMiddleware())
}
