package mainQanc

import (
	"database/sql"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"

	handlerAdminQanc "qanc/src/controllers/qanc/admin/handler"
	serviceAdminQanc "qanc/src/controllers/qanc/admin/service"
	adminUtils "qanc/src/controllers/qanc/admin/utils"
	handlerQanc "qanc/src/controllers/qanc/user/handler"
	serviceQanc "qanc/src/controllers/qanc/user/service"
	qancUtils "qanc/src/controllers/qanc/user/utils"
	"qanc/src/i18n"
)

func GetSlots(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		lang := i18n.GetLang(c)
		slots, err := serviceQanc.GetAvailableSlots(db)
		if err != nil {
			return c.Status(500).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง", "Unable to fetch data, please try again")})
		}
		if len(slots) == 0 {
			return c.JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "ขณะนี้ยังไม่มีวันเปิดให้จอง", "No available dates at this time"), Data: []qancUtils.SlotInfo{}})
		}
		return c.JSON(qancUtils.Response{Success: true, Data: slots})
	}
}

func CreateBooking(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		lang := i18n.GetLang(c)
		var req qancUtils.BookingRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่งมา", "Invalid request format, please check your data")})
		}

		if errMsg := handlerQanc.ValidateBookingRequest(req, lang); errMsg != "" {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: errMsg})
		}

		queueNo, bookingID, err := serviceQanc.CreateBooking(db, req, lang)
		if err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(qancUtils.BookingResponse{
			Success:   true,
			Message:   i18n.T(lang, "จองคิวสำเร็จ", "Booking successful"),
			BookingID: bookingID,
			QueueNo:   queueNo,
		})
	}
}

func GetMyBooking(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		lang := i18n.GetLang(c)
		var req qancUtils.CheckBookingRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "รูปแบบข้อมูลไม่ถูกต้อง", "Invalid request format")})
		}
		if req.Cid == "" && req.PassportNo == "" {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "กรุณาระบุ cid หรือ passport_no", "Please provide cid or passport_no")})
		}
		if req.Cid != "" && req.PassportNo != "" {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "ระบุได้เพียงอย่างใดอย่างหนึ่ง", "Provide only one: cid or passport_no")})
		}
		booking, err := serviceQanc.GetMyBooking(db, req.Cid, req.PassportNo, lang)
		if err != nil {
			return c.Status(404).JSON(qancUtils.Response{Success: false, Message: err.Error()})
		}
		return c.JSON(qancUtils.Response{Success: true, Data: booking})
	}
}

func CancelBooking(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		lang := i18n.GetLang(c)
		var req qancUtils.CancelRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "รูปแบบข้อมูลไม่ถูกต้อง", "Invalid request format")})
		}
		if req.SlotID == 0 {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "กรุณาระบุ slot_id", "Please provide slot_id")})
		}
		if req.Cid == "" && req.PassportNo == "" {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: i18n.T(lang, "กรุณาระบุ cid หรือ passport_no", "Please provide cid or passport_no")})
		}
		if err := serviceQanc.CancelBooking(db, req, lang); err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: err.Error()})
		}
		return c.JSON(qancUtils.Response{Success: true, Message: i18n.T(lang, "ยกเลิกการจองสำเร็จ", "Booking cancelled successfully")})
	}
}

// --- Admin ---

func AdminGetSlots(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 10)
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}
		if limit > 1000 {
			limit = 1000
		}

		slots, pagination, err := serviceAdminQanc.GetAllSlots(db, page, limit)
		if err != nil {
			return c.Status(500).JSON(adminUtils.Response{Success: false, Message: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง"})
		}
		if len(slots) == 0 {
			return c.JSON(adminUtils.Response{Success: false, Message: "ยังไม่มีวันเปิดจองในระบบ", Data: []adminUtils.SlotInfo{}})
		}
		return c.JSON(adminUtils.Response{Success: true, Data: slots, Pagination: pagination})
	}
}

func AdminCreateBulkSlots(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req adminUtils.BulkSlotRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "รูปแบบข้อมูลไม่ถูกต้อง"})
		}
		if errMsg := handlerAdminQanc.ValidateBulkSlotRequest(req); errMsg != "" {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: errMsg})
		}
		results := serviceAdminQanc.CreateBulkSlots(db, req.SlotDates, req.MaxQueue)
		success := 0
		for _, r := range results {
			if r.Success {
				success++
			}
		}
		return c.JSON(fiber.Map{
			"success": true,
			"message": fmt.Sprintf("เพิ่มสำเร็จ %d/%d วัน", success, len(results)),
			"results": results,
		})
	}
}

func AdminUpdateSlot(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "id ไม่ถูกต้อง"})
		}
		var req adminUtils.UpdateSlotRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "รูปแบบข้อมูลไม่ถูกต้อง"})
		}
		if req.MaxQueue <= 0 {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "จำนวนคิวต้องมากกว่า 0"})
		}
		if err := serviceAdminQanc.UpdateSlotMaxQueue(db, id, req.MaxQueue); err != nil {
			if err.Error() == "sql: no rows in result set" {
				return c.Status(404).JSON(adminUtils.Response{Success: false, Message: "ไม่พบวันที่ต้องการแก้ไข"})
			}
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: err.Error()})
		}
		return c.JSON(adminUtils.Response{Success: true, Message: "แก้ไขจำนวนคิวสำเร็จ"})
	}
}

func AdminToggleSlot(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req adminUtils.ToggleSlotRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "รูปแบบข้อมูลไม่ถูกต้อง"})
		}
		if req.ID <= 0 {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "กรุณาระบุ id"})
		}
		if err := serviceAdminQanc.ToggleSlot(db, req.ID, req.IsActive); err != nil {
			if err == sql.ErrNoRows {
				return c.Status(404).JSON(adminUtils.Response{Success: false, Message: "ไม่พบวันที่ต้องการแก้ไข"})
			}
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: err.Error()})
		}
		return c.JSON(adminUtils.Response{Success: true, Message: "อัพเดทสำเร็จ"})
	}
}

func AdminGetBookings(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		slotDate := c.Query("slot_date")
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 10)
		if page < 1 {
			page = 1
		}
		if limit < 1 || limit > 100 {
			limit = 10
		}

		bookings, pagination, err := serviceAdminQanc.GetAllBookings(db, slotDate, page, limit)
		if err != nil {
			return c.Status(500).JSON(adminUtils.Response{Success: false, Message: "ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง"})
		}
		if len(bookings) == 0 {
			return c.JSON(adminUtils.Response{Success: false, Message: "ยังไม่มีรายการจอง", Data: []adminUtils.BookingInfo{}})
		}
		return c.JSON(adminUtils.Response{Success: true, Data: bookings, Pagination: pagination})
	}
}
