package serviceQanc

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/lib/pq"

	emailAlert "qanc/src/controllers/alert/email"
	mophAlert "qanc/src/controllers/alert/moph"
	qancUtils "qanc/src/controllers/qanc/user/utils"
	loadEnv "qanc/src/loadenv"
)

func CreateBooking(db *sql.DB, req qancUtils.BookingRequest) (queueNo, bookingID int, err error) {
	// ตรวจสอบการจองซ้ำด้วย cid หรือ passport_no
	var existingDate string
	var checkErr error
	if strings.TrimSpace(req.Cid) != "" {
		checkErr = db.QueryRow(`
			SELECT s.slot_date::text FROM anc_bookings b
			JOIN anc_slots s ON s.id = b.slot_id
			WHERE b.cid = $1 AND b.status = 'booked' LIMIT 1
		`, req.Cid).Scan(&existingDate)
	} else {
		checkErr = db.QueryRow(`
			SELECT s.slot_date::text FROM anc_bookings b
			JOIN anc_slots s ON s.id = b.slot_id
			WHERE b.passport_no = $1 AND b.status = 'booked' LIMIT 1
		`, req.PassportNo).Scan(&existingDate)
	}
	if checkErr == nil {
		if existingDate == req.SlotDate {
			return 0, 0, errors.New("คุณมีการลงทะเบียนในวันที่ " + existingDate + " ไปแล้ว ไม่สามารถจองซ้ำได้ กรุณายกเลิกก่อน")
		}
		return 0, 0, errors.New("คุณมีการลงทะเบียนในวันที่ " + existingDate + " อยู่แล้ว กรุณายกเลิกก่อนจึงจะจองวันใหม่ได้")
	}

	var slotID, maxQueue, booked int
	if err = db.QueryRow(`
		SELECT s.id, s.max_queue, COUNT(b.id)
		FROM anc_slots s
		LEFT JOIN anc_bookings b ON b.slot_id = s.id AND b.status = 'booked'
		WHERE s.slot_date = $1 AND s.is_active = true
		GROUP BY s.id, s.max_queue
	`, req.SlotDate).Scan(&slotID, &maxQueue, &booked); err != nil {
		return 0, 0, errors.New("ไม่พบวันที่จอง หรือยังไม่เปิดรับจอง")
	}
	if booked >= maxQueue {
		return 0, 0, errors.New("วันที่นี้เต็มแล้ว")
	}

	var nextQueue int
	if err = db.QueryRow(`
		SELECT COALESCE(MAX(queue_no), 0) + 1 FROM anc_bookings WHERE slot_id = $1
	`, slotID).Scan(&nextQueue); err != nil {
		return 0, 0, err
	}

	var lmpDate, expDate interface{}
	if strings.TrimSpace(req.LmpDate) != "" {
		lmpDate = req.LmpDate
	}
	if strings.TrimSpace(req.ExpectedDueDate) != "" {
		expDate = req.ExpectedDueDate
	}

	diseases := req.Diseases
	if diseases == nil {
		diseases = []string{}
	}

	var cidVal, passportVal interface{}
	if strings.TrimSpace(req.Cid) != "" {
		cidVal = strings.TrimSpace(req.Cid)
	}
	if strings.TrimSpace(req.PassportNo) != "" {
		passportVal = strings.TrimSpace(req.PassportNo)
	}

	if err = db.QueryRow(`
		INSERT INTO anc_bookings (
			slot_id, queue_no, cid, passport_no, full_name, phone,
			rights_type, rights_other,
			is_first_pregnancy, previous_births, previous_miscarriages,
			lmp_date, has_prior_anc, expected_due_date,
			diseases, diseases_other, note
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
		RETURNING id
	`,
		slotID, nextQueue,
		cidVal, passportVal,
		strings.TrimSpace(req.FullName), strings.TrimSpace(req.Phone),
		req.RightsType, req.RightsOther,
		req.IsFirstPregnancy, req.PreviousBirths, req.PreviousMiscarriages,
		lmpDate, req.HasPriorAnc, expDate,
		pq.Array(diseases), req.DiseasesOther, req.Note,
	).Scan(&bookingID); err != nil {
		return 0, 0, err
	}

	targets := loadEnv.LoadAlertTargets()
	fullName := strings.TrimSpace(req.FullName)
	phone := strings.TrimSpace(req.Phone)
	go func() {
		mophAlert.SendBookingAlert(targets.CID, fullName, phone, req.SlotDate, nextQueue)
		if err := emailAlert.SendBookingAlertEmail(targets.Email, fullName, phone, req.SlotDate, nextQueue); err != nil {
			_ = err
		}
	}()

	return nextQueue, bookingID, nil
}
