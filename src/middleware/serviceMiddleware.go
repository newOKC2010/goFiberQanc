package middleware

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	modelAuth "qanc/src/database/models/auth"
)

func VerifyToken(db *sql.DB, userID int64, token string) error {
	var exists bool
	err := db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM tokens_qanc 
		 WHERE user_qanc_id = $1 AND token = $2 AND expires_at > $3)`,
		userID, token, time.Now(),
	).Scan(&exists)

	if err != nil {
		log.Printf("⚠️ VerifyToken DB error userID=%d: %v", userID, err)
		return err
	}
	if !exists {
		log.Printf("⚠️ VerifyToken: token ไม่พบใน DB หรือหมดอายุ userID=%d", userID)
		return fmt.Errorf("token ไม่ถูกต้องหรือหมดอายุ")
	}
	return nil
}

func GetUserByID(db *sql.DB, userID int64) (*UserQANCInfo, error) {
	user := &modelAuth.UserQANC{}
	var role string

	err := db.QueryRow(
		`SELECT id, cid, email, role, status FROM user_qanc WHERE id = $1`,
		userID,
	).Scan(&user.ID, &user.CID, &user.Email, &role, &user.Status)

	if err != nil {
		return nil, err
	}

	userInfo := &UserQANCInfo{
		ID:     user.ID,
		CID:    user.CID,
		Email:  user.Email,
		Role:   role,
		Status: user.Status,
	}

	return userInfo, nil
}
