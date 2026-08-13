package serviceAdminQanc

import (
	"database/sql"

	"github.com/lib/pq"

	adminUtils "qanc/src/controllers/qanc/admin/utils"
)

// GetBookingsBySlot - ดึงรายการจองทั้งหมดในวันนั้น (ตาม slot_id)
// เรียงตามหมายเลขคิว
func GetBookingsBySlot(db *sql.DB, slotID int) ([]adminUtils.BookingInfo, error) {
	rows, err := db.Query(`
		SELECT b.id, s.slot_date::text, b.queue_no, b.full_name, b.phone,
		       COALESCE(b.rights_type,''), b.is_first_pregnancy,
		       b.previous_births, b.previous_miscarriages,
		       b.lmp_date::text, b.has_prior_anc, b.expected_due_date::text,
		       b.diseases, COALESCE(b.note,''), b.status,
		       b.created_at::text
		FROM anc_bookings b
		JOIN anc_slots s ON s.id = b.slot_id
		WHERE b.slot_id = $1
		ORDER BY b.queue_no
	`, slotID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanBookings(rows)
}

// GetAllBookings - ดึงรายการจองทั้งหมด
// ถ้าระบุ slotDate จะกรองเฉพาะวันนั้น, ถ้าไม่ระบุจะดึงทุกวัน
func GetAllBookings(db *sql.DB, slotDate string) ([]adminUtils.BookingInfo, error) {
	query := `
		SELECT b.id, s.slot_date::text, b.queue_no, b.full_name, b.phone,
		       COALESCE(b.rights_type,''), b.is_first_pregnancy,
		       b.previous_births, b.previous_miscarriages,
		       b.lmp_date::text, b.has_prior_anc, b.expected_due_date::text,
		       b.diseases, COALESCE(b.note,''), b.status,
		       b.created_at::text
		FROM anc_bookings b
		JOIN anc_slots s ON s.id = b.slot_id
	`
	var rows *sql.Rows
	var err error
	if slotDate != "" {
		rows, err = db.Query(query+"WHERE s.slot_date = $1 ORDER BY b.queue_no", slotDate)
	} else {
		rows, err = db.Query(query + "ORDER BY s.slot_date, b.queue_no")
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanBookings(rows)
}

// scanBookings - helper function สำหรับแปลง SQL rows เป็น BookingInfo slice
// จัดการ diseases array และ null values
func scanBookings(rows *sql.Rows) ([]adminUtils.BookingInfo, error) {
	var bookings []adminUtils.BookingInfo
	for rows.Next() {
		var b adminUtils.BookingInfo
		var diseases pq.StringArray
		if err := rows.Scan(
			&b.ID, &b.SlotDate, &b.QueueNo, &b.FullName, &b.Phone,
			&b.RightsType, &b.IsFirstPregnancy,
			&b.PreviousBirths, &b.PreviousMiscarriages,
			&b.LmpDate, &b.HasPriorAnc, &b.ExpectedDueDate,
			&diseases, &b.Note, &b.Status, &b.CreatedAt,
		); err != nil {
			return nil, err
		}
		b.Diseases = []string(diseases)
		bookings = append(bookings, b)
	}
	return bookings, nil
}
