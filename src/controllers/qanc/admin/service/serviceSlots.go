package serviceAdminQanc

import (
	"database/sql"
	"fmt"

	adminUtils "qanc/src/controllers/qanc/admin/utils"
)

// GetAllSlots - ดึงวันเปิดจองทั้งหมด (ตั้งแต่วันนี้เป็นต้นไป) แบบ pagination
func GetAllSlots(db *sql.DB, page, limit int) ([]adminUtils.SlotInfo, *adminUtils.Pagination, error) {
	offset := (page - 1) * limit

	var totalCount int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM anc_slots WHERE slot_date >= CURRENT_DATE
	`).Scan(&totalCount); err != nil {
		return nil, nil, err
	}

	rows, err := db.Query(`
		SELECT s.id, s.slot_date::text, s.max_queue, COUNT(b.id) AS booked, s.is_active
		FROM anc_slots s
		LEFT JOIN anc_bookings b ON b.slot_id = s.id AND b.status = 'booked'
		WHERE s.slot_date >= CURRENT_DATE
		GROUP BY s.id, s.slot_date, s.max_queue, s.is_active
		ORDER BY s.slot_date
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var slots []adminUtils.SlotInfo
	for rows.Next() {
		var s adminUtils.SlotInfo
		if err := rows.Scan(&s.ID, &s.SlotDate, &s.MaxQueue, &s.Booked, &s.IsActive); err != nil {
			return nil, nil, err
		}
		slots = append(slots, s)
	}

	totalPages := (totalCount + limit - 1) / limit
	if totalPages == 0 {
		totalPages = 1
	}
	pagination := &adminUtils.Pagination{
		Count:       len(slots),
		TotalCount:  totalCount,
		TotalPages:  totalPages,
		CurrentPage: page,
	}
	return slots, pagination, nil
}

// CreateBulkSlots - เพิ่มหลายวันพร้อมกัน คืนผลลัพธ์แต่ละวัน
func CreateBulkSlots(db *sql.DB, slotDates []string, maxQueue int) []adminUtils.BulkSlotResult {
	results := make([]adminUtils.BulkSlotResult, 0, len(slotDates))
	for _, date := range slotDates {
		_, err := db.Exec(`INSERT INTO anc_slots (slot_date, max_queue) VALUES ($1, $2)`, date, maxQueue)
		if err != nil {
			results = append(results, adminUtils.BulkSlotResult{SlotDate: date, Success: false, Message: "วันนี้มีอยู่ในระบบแล้ว"})
		} else {
			results = append(results, adminUtils.BulkSlotResult{SlotDate: date, Success: true})
		}
	}
	return results
}

// UpdateSlotMaxQueue - แก้ไขจำนวนคิวสูงสุดตาม id
// คืน sql.ErrNoRows ถ้าไม่พบ id
// จะ error ถ้า maxQueue น้อยกว่าจำนวนที่จองไปแล้ว
func UpdateSlotMaxQueue(db *sql.DB, id, maxQueue int) error {
	var booked int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM anc_bookings WHERE slot_id = $1 AND status = 'booked'
	`, id).Scan(&booked); err != nil {
		return err
	}
	if maxQueue < booked {
		return fmt.Errorf("ไม่สามารถลดคิวเหลือเป็น %d เพราะมีการจองแล้ว %d คิว", maxQueue, booked)
	}
	res, err := db.Exec(`UPDATE anc_slots SET max_queue = $1 WHERE id = $2`, maxQueue, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// ToggleSlot - เปิด/ปิดรับจองตาม id
// ห้ามปิดถ้า: มีการจองอยู่ (status='booked') หรือ วันผ่านมาแล้ว
func ToggleSlot(db *sql.DB, id int, isActive bool) error {
	// ตรวจสอบเฉพาะกรณีปิด (is_active = false)
	if !isActive {
		var slotDate string
		var booked int
		if err := db.QueryRow(`
			SELECT s.slot_date::text, COUNT(b.id)
			FROM anc_slots s
			LEFT JOIN anc_bookings b ON b.slot_id = s.id AND b.status = 'booked'
			WHERE s.id = $1
			GROUP BY s.slot_date
		`, id).Scan(&slotDate, &booked); err != nil {
			if err == sql.ErrNoRows {
				return sql.ErrNoRows
			}
			return err
		}
		if booked > 0 {
			return fmt.Errorf("ไม่สามารถปิดรับจองได้ เนื่องจากมีการจองอยู่แล้ว %d คิว", booked)
		}
		// ตรวจสอบว่าวันผ่านมาแล้วหรือยัง
		var isPast bool
		if err := db.QueryRow(`SELECT $1::date < CURRENT_DATE`, slotDate).Scan(&isPast); err != nil {
			return err
		}
		if isPast {
			return fmt.Errorf("ไม่สามารถแก้ไขวันที่ผ่านมาแล้วได้")
		}
	}

	res, err := db.Exec(`UPDATE anc_slots SET is_active = $1 WHERE id = $2`, isActive, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return sql.ErrNoRows
	}
	return nil
}
