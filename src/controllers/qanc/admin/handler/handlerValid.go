package handlerAdminQanc

import (
	"strings"
	"time"

	adminUtils "qanc/src/controllers/qanc/admin/utils"
)

// ValidateSlotRequest - ตรวจสอบความถูกต้องของข้อมูลวันเปิดจอง
// คืนค่า: "" ถ้าถูกต้อง, ข้อความ error ถ้าผิดพลาด
func ValidateSlotRequest(req adminUtils.SlotRequest) string {
	if strings.TrimSpace(req.SlotDate) == "" {
		return "กรุณาระบุวันที่"
	}

	slotDate, err := time.Parse("2006-01-02", strings.TrimSpace(req.SlotDate))
	if err != nil {
		return "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"
	}

	// ตรวจสอบว่าวันที่ต้องเป็นวันในอนาคต (ไม่ใช่วันนี้หรือวันที่ผ่านมาแล้ว)
	today := time.Now().Truncate(24 * time.Hour)
	if !slotDate.After(today) {
		return "ไม่สามารถเพิ่มวันที่ย้อนหลังหรือวันปัจจุบันได้ กรุณาเลือกวันในอนาคต"
	}

	if req.MaxQueue <= 0 {
		return "จำนวนคิวต้องมากกว่า 0"
	}
	return ""
}
