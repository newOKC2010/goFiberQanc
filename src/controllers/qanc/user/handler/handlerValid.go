package handlerQanc

import (
	"strings"
	"time"

	qancUtils "qanc/src/controllers/qanc/user/utils"
	"qanc/src/i18n"
)

func ValidateBookingRequest(req qancUtils.BookingRequest, lang string) string {
	if strings.TrimSpace(req.SlotDate) == "" {
		return i18n.T(lang, "กรุณาระบุวันที่จอง", "Please specify a booking date")
	}
	parsedDate, err := time.Parse("2006-01-02", strings.TrimSpace(req.SlotDate))
	if err != nil {
		return i18n.T(lang, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)", "Invalid date format (YYYY-MM-DD)")
	}
	today := time.Now().Truncate(24 * time.Hour)
	if !parsedDate.After(today) {
		return i18n.T(lang, "ไม่สามารถจองวันที่ผ่านมาแล้วหรือวันนี้ได้ กรุณาเลือกวันในอนาคต", "Cannot book a past or today's date. Please select a future date")
	}
	cid := strings.TrimSpace(req.Cid)
	passport := strings.TrimSpace(req.PassportNo)
	if cid == "" && passport == "" {
		return i18n.T(lang, "กรุณาระบุเลขบัตรประชาชน หรือเลข Passport อย่างใดอย่างหนึ่ง", "Please provide either a Thai ID or Passport number")
	}
	if cid != "" && passport != "" {
		return i18n.T(lang, "กรุณาระบุเพียงอย่างใดอย่างหนึ่ง ไม่สามารถกรอกทั้งเลขบัตรประชาชนและ Passport พร้อมกันได้", "Please provide only one: Thai ID or Passport, not both")
	}
	if cid != "" && len(cid) != 13 {
		return i18n.T(lang, "เลขบัตรประชาชนต้องมี 13 หลัก", "Thai ID must be 13 digits")
	}
	if strings.TrimSpace(req.FullName) == "" {
		return i18n.T(lang, "กรุณาระบุชื่อ-นามสกุล", "Please provide your full name")
	}
	if strings.TrimSpace(req.Phone) == "" {
		return i18n.T(lang, "กรุณาระบุเบอร์โทรศัพท์", "Please provide a phone number")
	}
	return ""
}
