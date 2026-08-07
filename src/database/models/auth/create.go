package modelAuth

import "time"

type UserRole string

const (
	RoleUser       UserRole = "user"
	RoleAdmin      UserRole = "admin"
	RoleSuperAdmin UserRole = "super_admin"
)

type UserQANC struct {
	ID           int64
	CID          string
	HashCID      string
	Role         UserRole
	Status       bool
	FullName     string
	Email        string
	OtpCode      *string
	OtpExpiresAt *time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type TokensQANC struct {
	ID         int64
	UserQANCID int64
	Token      string
	ExpiresAt  time.Time
	LoginLast  time.Time
	UserQANC   *UserQANC
}
