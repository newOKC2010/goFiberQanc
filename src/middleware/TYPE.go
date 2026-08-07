package middleware

import "github.com/golang-jwt/jwt/v5"

type UserQANCInfo struct {
	ID     int64  `db:"id" json:"user_qanc_id"`
	CID    string `db:"cid" json:"cid"`
	Email  string `db:"email" json:"email"`
	Role   string `db:"role" json:"role"`
	Status bool   `db:"status" json:"-"`
}

type Response struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	User    *UserQANCInfo `json:"user"`
}

type JWTdecode struct {
	UserQANCID int64  `json:"user_qanc_id"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	jwt.RegisteredClaims
}
