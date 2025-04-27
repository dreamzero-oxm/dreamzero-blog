package middleware

import "blog-server/internal/server"

func InitMiddleware(s *server.Server) error {
	s.GinEngine.Use(CorsMiddleware())
	return nil
}
