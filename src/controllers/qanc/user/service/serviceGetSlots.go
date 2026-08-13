package serviceQanc

import (
	"database/sql"

	qancUtils "qanc/src/controllers/qanc/user/utils"
)

func GetAvailableSlots(db *sql.DB) ([]qancUtils.SlotInfo, error) {
	rows, err := db.Query(`
		SELECT s.id, s.slot_date::text, s.max_queue, COUNT(b.id) AS booked
		FROM anc_slots s
		LEFT JOIN anc_bookings b ON b.slot_id = s.id AND b.status = 'booked'
		WHERE s.is_active = true AND s.slot_date >= CURRENT_DATE
		GROUP BY s.id, s.slot_date, s.max_queue
		HAVING COUNT(b.id) < s.max_queue
		ORDER BY s.slot_date
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var slots []qancUtils.SlotInfo
	for rows.Next() {
		var s qancUtils.SlotInfo
		if err := rows.Scan(&s.ID, &s.SlotDate, &s.MaxQueue, &s.Booked); err != nil {
			return nil, err
		}
		s.Available = s.MaxQueue - s.Booked
		slots = append(slots, s)
	}
	return slots, nil
}
