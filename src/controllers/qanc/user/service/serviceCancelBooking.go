package serviceQanc

import (
	"database/sql"
	"errors"
)

// CancelBooking - ยกเลิกการจองตาม booking id
// ตรวจสอบว่า booking นั้น status = 'booked' อยู่ก่อน แล้วค่อยเปลี่ยนเป็น 'cancelled'
func CancelBooking(db *sql.DB, bookingID int) error {
	var status string
	if err := db.QueryRow(`
		SELECT status FROM anc_bookings WHERE id = $1
	`, bookingID).Scan(&status); err != nil {
		if err == sql.ErrNoRows {
			return errors.New("ไม่พบรายการจองนี้")
		}
		return err
	}

	if status != "booked" {
		return errors.New("รายการจองนี้ไม่สามารถยกเลิกได้ เนื่องจากสถานะปัจจุบันคือ: " + status)
	}

	res, err := db.Exec(`
		UPDATE anc_bookings SET status = 'cancelled' WHERE id = $1
	`, bookingID)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return errors.New("ไม่พบรายการจองนี้")
	}
	return nil
}
