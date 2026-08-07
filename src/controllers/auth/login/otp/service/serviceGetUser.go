package serviceLogin

import (
	"database/sql"

	conn "qanc/src/database/connection"
	modelAuth "qanc/src/database/models/auth"
)

func GetUserByEmail(_ *sql.DB, email string) (*modelAuth.UserQANC, error) {
	var user modelAuth.UserQANC
	var role string

	err := conn.DB.QueryRow(
		`SELECT id, cid, hash_cid, full_name, email, role, status
		 FROM user_qanc WHERE LOWER(email) = LOWER($1)`,
		email,
	).Scan(&user.ID, &user.CID, &user.HashCID, &user.FullName, &user.Email, &role, &user.Status)

	if err != nil {
		return nil, err
	}
	user.Role = modelAuth.UserRole(role)
	return &user, nil
}
