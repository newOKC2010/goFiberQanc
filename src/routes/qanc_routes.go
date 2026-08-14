package routes

import (
	"database/sql"
	"time"

	mainQanc "qanc/src/controllers/qanc"
	middleware "qanc/src/middleware"
	ratelimit "qanc/src/middleware/rateLimit"

	"github.com/gofiber/fiber/v2"
)

func SetupQancRoutes(app fiber.Router, db *sql.DB) {
	prefix := app.Group("/qanc")

	// User - เส้นทางสำหรับผู้ใช้ทั่วไป (ไม่ต้อง login)
	prefix.Get("/slots", ratelimit.RateLimitByIP(60, 1*time.Minute), mainQanc.GetSlots(db))                 // 60 req/นาที
	prefix.Post("/booking", ratelimit.RateLimitByIP(10, 1*time.Minute), mainQanc.CreateBooking(db))         // 10 req/นาที
	prefix.Post("/booking/check", ratelimit.RateLimitByIP(20, 1*time.Minute), mainQanc.GetMyBooking(db))    // 20 req/นาที
	prefix.Patch("/booking/cancel", ratelimit.RateLimitByIP(10, 1*time.Minute), mainQanc.CancelBooking(db)) // 10 req/นาที

	// Admin - เส้นทางสำหรับเจ้าหน้าที่ (ต้อง login + role: admin/super_admin)
	admin := prefix.Group("/admin", middleware.AuthGuards(db, []string{"admin", "super_admin"}), ratelimit.RateLimitByIP(60, 1*time.Minute))
	admin.Get("/slots", mainQanc.AdminGetSlots(db))           // ดูวันทั้งหมด + จำนวนจอง + สถานะ
	admin.Post("/slots", mainQanc.AdminCreateSlot(db))        // เพิ่มวันเปิดจองใหม่
	admin.Put("/slots/:id", mainQanc.AdminUpdateSlot(db))     // แก้ไขจำนวนคิวตาม id
	admin.Post("/slots/toggle", mainQanc.AdminToggleSlot(db)) // เปิด/ปิดรับจอง (body: { id, is_active })
	admin.Get("/bookings", mainQanc.AdminGetBookings(db))     // ดูรายการจอง (filter: ?slot_date=)
}
