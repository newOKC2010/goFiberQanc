package serviceLogin

import (
	"database/sql"
	"time"

	conn "qanc/src/database/connection"
	modelAuth "qanc/src/database/models/auth"
)

func VerifyOTP(_ *sql.DB, email, otp string) (*modelAuth.UserQANC, bool) {
	var user modelAuth.UserQANC
	var role string

	err := conn.DB.QueryRow(
		`SELECT id, cid, hash_cid, full_name, email, role, status, otp_code, otp_expires_at
		 FROM user_qanc WHERE LOWER(email) = LOWER($1)`,
		email,
	).Scan(&user.ID, &user.CID, &user.HashCID, &user.FullName, &user.Email, &role, &user.Status, &user.OtpCode, &user.OtpExpiresAt)

	if err != nil {
		return nil, false
	}
	user.Role = modelAuth.UserRole(role)

	// ตรวจสอบว่ามี OTP หรือไม่
	if user.OtpCode == nil || user.OtpExpiresAt == nil {
		return nil, false
	}

	// ตรวจสอบว่า OTP หมดอายุหรือไม่
	if time.Now().After(*user.OtpExpiresAt) {
		return nil, false
	}

	// ตรวจสอบว่า OTP ตรงกันหรือไม่
	if *user.OtpCode != otp {
		return nil, false
	}

	return &user, true
}
