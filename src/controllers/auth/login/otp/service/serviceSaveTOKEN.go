package serviceLogin

import (
	"database/sql"
	"time"

	loginHandler "qanc/src/controllers/auth/login/otp/handler"
	conn "qanc/src/database/connection"
	loadEnv "qanc/src/loadenv"
)

func SaveTokenToDB(_ *sql.DB, userQANCID int64, token string) error {
	jwtConfig := loadEnv.LoadJWT()
	expiresInSeconds := loginHandler.GetExpiresInSeconds(jwtConfig.ExpireIn, 3600)
	expiresAt := time.Now().Add(time.Second * time.Duration(expiresInSeconds))

	_, err := conn.DB.Exec(
		`INSERT INTO tokens_qanc (user_qanc_id, token, expires_at, login_last)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (user_qanc_id)
		 DO UPDATE SET token = $2, expires_at = $3, login_last = $4`,
		userQANCID, token, expiresAt, time.Now(),
	)

	return err
}
