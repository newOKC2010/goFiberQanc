package serviceQanc

import (
	"database/sql"
	"errors"
	"strings"

	qancUtils "qanc/src/controllers/qanc/user/utils"
	"qanc/src/i18n"
)

// GetMyBooking - ดึงข้อมูลการจองของตัวเองด้วย cid หรือ passport_no
func GetMyBooking(db *sql.DB, cid, passportNo, lang string) (*qancUtils.BookingDetail, error) {
	var row *sql.Row

	if strings.TrimSpace(cid) != "" {
		row = db.QueryRow(`
			SELECT b.id, s.slot_date::text, b.queue_no, b.full_name, b.phone, b.status, b.created_at::text
			FROM anc_bookings b
			JOIN anc_slots s ON s.id = b.slot_id
			WHERE b.cid = $1 AND b.status = 'booked'
			ORDER BY b.created_at DESC LIMIT 1
		`, cid)
	} else {
		row = db.QueryRow(`
			SELECT b.id, s.slot_date::text, b.queue_no, b.full_name, b.phone, b.status, b.created_at::text
			FROM anc_bookings b
			JOIN anc_slots s ON s.id = b.slot_id
			WHERE b.passport_no = $1 AND b.status = 'booked'
			ORDER BY b.created_at DESC LIMIT 1
		`, passportNo)
	}

	var b qancUtils.BookingDetail
	if err := row.Scan(&b.ID, &b.SlotDate, &b.QueueNo, &b.FullName, &b.Phone, &b.Status, &b.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New(i18n.T(lang, "ไม่พบรายการจองที่ active อยู่", "No active booking found"))
		}
		return nil, err
	}
	return &b, nil
}
