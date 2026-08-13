package handlerQanc

import (
	"strings"
	"time"

	qancUtils "qanc/src/controllers/qanc/user/utils"
)

func ValidateBookingRequest(req qancUtils.BookingRequest) string {
	if strings.TrimSpace(req.SlotDate) == "" {
		return "กรุณาระบุวันที่จอง"
	}
	if _, err := time.Parse("2006-01-02", strings.TrimSpace(req.SlotDate)); err != nil {
		return "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"
	}
	cid := strings.TrimSpace(req.Cid)
	passport := strings.TrimSpace(req.PassportNo)
	if cid == "" && passport == "" {
		return "กรุณาระบุเลขบัตรประชาชน หรือเลข Passport อย่างใดอย่างหนึ่ง"
	}
	if cid != "" && passport != "" {
		return "กรุณาระบุเพียงอย่างใดอย่างหนึ่ง ไม่สามารถกรอกทั้งเลขบัตรประชาชนและ Passport พร้อมกันได้"
	}
	if cid != "" && len(cid) != 13 {
		return "เลขบัตรประชาชนต้องมี 13 หลัก"
	}
	if strings.TrimSpace(req.FullName) == "" {
		return "กรุณาระบุชื่อ-นามสกุล"
	}
	if strings.TrimSpace(req.Phone) == "" {
		return "กรุณาระบุเบอร์โทรศัพท์"
	}
	return ""
}
