package qancUtils

type BookingRequest struct {
	SlotDate             string   `json:"slot_date"`
	Cid                  string   `json:"cid"`         // เลขบัตรประชาชน (ถ้ามี)
	PassportNo           string   `json:"passport_no"` // เลข Passport (ถ้าไม่มีบัตรประชาชน)
	FullName             string   `json:"full_name"`
	Phone                string   `json:"phone"`
	RightsType           string   `json:"rights_type"`
	RightsOther          string   `json:"rights_other"`
	IsFirstPregnancy     *bool    `json:"is_first_pregnancy"`
	PreviousBirths       int      `json:"previous_births"`
	PreviousMiscarriages int      `json:"previous_miscarriages"`
	LmpDate              string   `json:"lmp_date"`
	HasPriorAnc          *bool    `json:"has_prior_anc"`
	ExpectedDueDate      string   `json:"expected_due_date"`
	Diseases             []string `json:"diseases"`
	DiseasesOther        string   `json:"diseases_other"`
	Note                 string   `json:"note"`
}

type SlotInfo struct {
	ID        int    `json:"id"`
	SlotDate  string `json:"slot_date"`
	MaxQueue  int    `json:"max_queue"`
	Booked    int    `json:"booked"`
	Available int    `json:"available"`
}

type CheckBookingRequest struct {
	Cid        string `json:"cid"`
	PassportNo string `json:"passport_no"`
}

type CancelRequest struct {
	SlotID     int    `json:"slot_id"`
	Cid        string `json:"cid"`
	PassportNo string `json:"passport_no"`
}

type BookingDetail struct {
	ID        int    `json:"id"`
	SlotDate  string `json:"slot_date"`
	QueueNo   int    `json:"queue_no"`
	FullName  string `json:"full_name"`
	Phone     string `json:"phone"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
}

type BookingResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	BookingID int    `json:"booking_id,omitempty"`
	QueueNo   int    `json:"queue_no,omitempty"`
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
