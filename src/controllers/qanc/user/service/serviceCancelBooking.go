package serviceQanc

import (
	"database/sql"
	"errors"
	"strings"

	emailAlert "qanc/src/controllers/alert/email"
	mophAlert "qanc/src/controllers/alert/moph"
	qancUtils "qanc/src/controllers/qanc/user/utils"
	loadEnv "qanc/src/loadenv"
)

// CancelBooking - ยกเลิกการจองด้วย slot_id + cid หรือ passport_no
// ค้นหา booking ที่ status='booked' ล่าสุด แล้วเปลี่ยนเป็น 'cancelled'
func CancelBooking(db *sql.DB, req qancUtils.CancelRequest) error {
	var bookingID, queueNo int
	var fullName, phone, slotDate string

	cid := strings.TrimSpace(req.Cid)
	passport := strings.TrimSpace(req.PassportNo)

	var err error
	if cid != "" {
		err = db.QueryRow(`
			SELECT b.id, b.full_name, b.phone, s.slot_date::text, b.queue_no
			FROM anc_bookings b
			JOIN anc_slots s ON s.id = b.slot_id
			WHERE b.slot_id = $1 AND b.cid = $2 AND b.status = 'booked'
			ORDER BY b.id DESC LIMIT 1
		`, req.SlotID, cid).Scan(&bookingID, &fullName, &phone, &slotDate, &queueNo)
	} else {
		err = db.QueryRow(`
			SELECT b.id, b.full_name, b.phone, s.slot_date::text, b.queue_no
			FROM anc_bookings b
			JOIN anc_slots s ON s.id = b.slot_id
			WHERE b.slot_id = $1 AND b.passport_no = $2 AND b.status = 'booked'
			ORDER BY b.id DESC LIMIT 1
		`, req.SlotID, passport).Scan(&bookingID, &fullName, &phone, &slotDate, &queueNo)
	}
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("ไม่พบรายการจองที่ active สำหรับ slot นี้")
		}
		return err
	}

	if _, err = db.Exec(`UPDATE anc_bookings SET status = 'cancelled' WHERE id = $1`, bookingID); err != nil {
		return err
	}

	targets := loadEnv.LoadAlertTargets()
	go func() {
		mophAlert.SendCancelAlert(targets.CID, fullName, phone, slotDate, queueNo)
		if e := emailAlert.SendCancelAlertEmail(targets.Email, fullName, phone, slotDate, queueNo); e != nil {
			_ = e
		}
	}()

	return nil
}
