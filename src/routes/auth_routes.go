package routes

import (
	"database/sql"
	"time"

	loginMain "qanc/src/controllers/auth/login/otp"
	middleware "qanc/src/middleware"
	ratelimit "qanc/src/middleware/rateLimit"

	"github.com/gofiber/fiber/v2"
)

func SetupAuthRoutes(app fiber.Router, db *sql.DB) {
	prefix := app.Group("/auth")

	prefix.Post("/req", ratelimit.RateLimitByEmail(10, 10*time.Minute), loginMain.RequestOTP(db))
	prefix.Post("/verify", ratelimit.RateLimitByEmail(10, 10*time.Minute), loginMain.VerifyOTP(db))
	prefix.Get("/status", middleware.AuthGuards(db, nil), func(c *fiber.Ctx) error {
		user := c.Locals("user_qanc").(*middleware.UserQANCInfo)
		return c.JSON(struct {
			Success bool                     `json:"success"`
			User    *middleware.UserQANCInfo `json:"user"`
		}{
			Success: true,
			User:    user,
		})
	})

}
