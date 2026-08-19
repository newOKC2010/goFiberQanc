package handlerAdminQanc

import (
	"fmt"
	"strings"
	"time"

	adminUtils "qanc/src/controllers/qanc/admin/utils"
)

// ValidateBulkSlotRequest - ตรวจสอบ bulk request
func ValidateBulkSlotRequest(req adminUtils.BulkSlotRequest) string {
	if len(req.SlotDates) == 0 {
		return "กรุณาเลือกอย่างน้อย 1 วัน"
	}
	if req.MaxQueue <= 0 {
		return "จำนวนคิวต้องมากกว่า 0"
	}
	today := time.Now().Truncate(24 * time.Hour)
	for _, d := range req.SlotDates {
		t, err := time.Parse("2006-01-02", strings.TrimSpace(d))
		if err != nil {
			return fmt.Sprintf("รูปแบบวันที่ไม่ถูกต้อง: %s", d)
		}
		if !t.After(today) {
			return fmt.Sprintf("วันที่ %s ต้องเป็นวันในอนาคต", d)
		}
	}
	return ""
}
