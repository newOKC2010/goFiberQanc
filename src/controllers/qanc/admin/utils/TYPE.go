package adminQancUtils

// SlotRequest - ข้อมูลสำหรับเพิ่มวันเปิดจองใหม่
type SlotRequest struct {
	SlotDate string `json:"slot_date"` // วันที่เปิดจอง (YYYY-MM-DD)
	MaxQueue int    `json:"max_queue"` // จำนวนคิวสูงสุดต่อวัน
}

// ToggleSlotRequest - ข้อมูลสำหรับเปิด/ปิดรับจอง
type ToggleSlotRequest struct {
	ID       int  `json:"id"`        // รหัส slot ที่ต้องการแก้ไข
	IsActive bool `json:"is_active"` // true = เปิด, false = ปิด
}

// UpdateSlotRequest - ข้อมูลสำหรับแก้ไขจำนวนคิว
type UpdateSlotRequest struct {
	MaxQueue int `json:"max_queue"` // จำนวนคิวสูงสุดต่อวัน
}

// SlotInfo - ข้อมูลวันเปิดจอง (สำหรับ admin ดู)
type SlotInfo struct {
	ID       int    `json:"id"`        // รหัสช่วงเวลา
	SlotDate string `json:"slot_date"` // วันที่
	MaxQueue int    `json:"max_queue"` // จำนวนคิวสูงสุด
	Booked   int    `json:"booked"`    // จำนวนที่จองแล้ว
	IsActive bool   `json:"is_active"` // สถานะเปิด/ปิด
}

// BookingInfo - ข้อมูลการจองทั้งหมด (สำหรับ admin ดู)
type BookingInfo struct {
	ID                   int      `json:"id"`                    // รหัสการจอง
	SlotDate             string   `json:"slot_date"`             // วันที่จอง
	QueueNo              int      `json:"queue_no"`              // หมายเลขคิว
	FullName             string   `json:"full_name"`             // ชื่อ-นามสกุล
	Phone                string   `json:"phone"`                 // เบอร์โทร
	RightsType           string   `json:"rights_type"`           // ประเภทสิทธิ์
	IsFirstPregnancy     *bool    `json:"is_first_pregnancy"`    // ตั้งครรภ์ครั้งแรก?
	PreviousBirths       int      `json:"previous_births"`       // จำนวนครั้งที่คลอด
	PreviousMiscarriages int      `json:"previous_miscarriages"` // จำนวนครั้งที่แท้ง
	LmpDate              *string  `json:"lmp_date"`              // วันประจำเดือนครั้งสุดท้าย
	HasPriorAnc          *bool    `json:"has_prior_anc"`         // เคยฝากครรภ์ที่อื่น?
	ExpectedDueDate      *string  `json:"expected_due_date"`     // วันคลอดโดยประมาณ
	Diseases             []string `json:"diseases"`              // โรคประจำตัว
	Note                 string   `json:"note"`                  // หมายเหตุ
	Status               string   `json:"status"`                // สถานะ (booked/cancelled/completed)
	CreatedAt            string   `json:"created_at"`            // วันเวลาที่จอง
}

// Response - โครงสร้าง response มาตรฐาน
type Response struct {
	Success    bool        `json:"success"`              // สำเร็จ/ไม่สำเร็จ
	Message    string      `json:"message"`              // ข้อความ
	Data       interface{} `json:"data,omitempty"`       // ข้อมูล (ถ้ามี)
	Pagination *Pagination `json:"pagination,omitempty"` // ข้อมูล pagination (ถ้ามี)
}

// Pagination - ข้อมูล pagination
type Pagination struct {
	Count       int `json:"count"`        // จำนวน record ในหน้านี้
	TotalCount  int `json:"total_count"`  // จำนวน record ทั้งหมด
	TotalPages  int `json:"total_pages"`  // จำนวนหน้าทั้งหมด
	CurrentPage int `json:"current_page"` // หน้าปัจจุบัน
}
