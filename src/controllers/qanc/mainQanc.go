package mainQanc

import (
	"database/sql"
	"strconv"

	"github.com/gofiber/fiber/v2"

	handlerAdminQanc "qanc/src/controllers/qanc/admin/handler"
	serviceAdminQanc "qanc/src/controllers/qanc/admin/service"
	adminUtils "qanc/src/controllers/qanc/admin/utils"
	handlerQanc "qanc/src/controllers/qanc/user/handler"
	serviceQanc "qanc/src/controllers/qanc/user/service"
	qancUtils "qanc/src/controllers/qanc/user/utils"
)

func GetSlots(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		slots, err := serviceQanc.GetAvailableSlots(db)
		if err != nil {
			return c.Status(500).JSON(qancUtils.Response{Success: false, Message: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง"})
		}
		if len(slots) == 0 {
			return c.JSON(qancUtils.Response{Success: false, Message: "ขณะนี้ยังไม่มีวันเปิดให้จอง", Data: []qancUtils.SlotInfo{}})
		}
		return c.JSON(qancUtils.Response{Success: true, Data: slots})
	}
}

func CreateBooking(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req qancUtils.BookingRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: "รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่งมา"})
		}

		if errMsg := handlerQanc.ValidateBookingRequest(req); errMsg != "" {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: errMsg})
		}

		queueNo, err := serviceQanc.CreateBooking(db, req)
		if err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: err.Error()})
		}

		return c.JSON(qancUtils.BookingResponse{
			Success: true,
			Message: "จองคิวสำเร็จ",
			QueueNo: queueNo,
		})
	}
}

func GetMyBooking(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req qancUtils.CheckBookingRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: "รูปแบบข้อมูลไม่ถูกต้อง"})
		}
		if req.Cid == "" && req.PassportNo == "" {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: "กรุณาระบุ cid หรือ passport_no"})
		}
		if req.Cid != "" && req.PassportNo != "" {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: "ระบุได้เพียงอย่างใดอย่างหนึ่ง"})
		}
		booking, err := serviceQanc.GetMyBooking(db, req.Cid, req.PassportNo)
		if err != nil {
			return c.Status(404).JSON(qancUtils.Response{Success: false, Message: err.Error()})
		}
		return c.JSON(qancUtils.Response{Success: true, Data: booking})
	}
}

func CancelBooking(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: "id ไม่ถูกต้อง"})
		}
		if err := serviceQanc.CancelBooking(db, id); err != nil {
			return c.Status(400).JSON(qancUtils.Response{Success: false, Message: err.Error()})
		}
		return c.JSON(qancUtils.Response{Success: true, Message: "ยกเลิกการจองสำเร็จ"})
	}
}

// --- Admin ---

func AdminGetSlots(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		slots, err := serviceAdminQanc.GetAllSlots(db)
		if err != nil {
			return c.Status(500).JSON(adminUtils.Response{Success: false, Message: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง"})
		}
		if len(slots) == 0 {
			return c.JSON(adminUtils.Response{Success: false, Message: "ยังไม่มีวันเปิดจองในระบบ", Data: []adminUtils.SlotInfo{}})
		}
		return c.JSON(adminUtils.Response{Success: true, Data: slots})
	}
}

func AdminCreateSlot(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req adminUtils.SlotRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่งมา"})
		}
		if errMsg := handlerAdminQanc.ValidateSlotRequest(req); errMsg != "" {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: errMsg})
		}
		if err := serviceAdminQanc.CreateSlot(db, req.SlotDate, req.MaxQueue); err != nil {
			return c.Status(400).JSON(adminUtils.Response{Success: false, Message: "ไม่สามารถเพิ่มวันได้ เนื่องจากวันนี้มีอยู่ในระบบแล้ว"})
		}
		return c.JSON(adminUtils.Response{Success: true, Message: "เพิ่มวันสำเร็จ"})
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
		bookings, err := serviceAdminQanc.GetAllBookings(db, slotDate)
		if err != nil {
			return c.Status(500).JSON(adminUtils.Response{Success: false, Message: "ไม่สามารถดึงข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง"})
		}
		if len(bookings) == 0 {
			return c.JSON(adminUtils.Response{Success: false, Message: "ยังไม่มีรายการจอง", Data: []adminUtils.BookingInfo{}})
		}
		return c.JSON(adminUtils.Response{Success: true, Data: bookings})
	}
}
