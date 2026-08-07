package database

import (
	"database/sql"
	"log"
)

func CreateTables(db *sql.DB) error {
	schema := `
	-- Table: user_qanc
	CREATE TABLE IF NOT EXISTS user_qanc (
		id BIGSERIAL PRIMARY KEY,
		cid VARCHAR(13) NOT NULL UNIQUE,
		hash_cid VARCHAR(255) NOT NULL,
		role VARCHAR(20) NOT NULL DEFAULT 'user',
		status BOOLEAN NOT NULL DEFAULT true,
		full_name VARCHAR(255) NOT NULL,
		email VARCHAR(255),
		otp_code VARCHAR(10),
		otp_expires_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	-- Table: tokens_qanc
	CREATE TABLE IF NOT EXISTS tokens_qanc (
		id BIGSERIAL PRIMARY KEY,
		user_qanc_id BIGINT NOT NULL UNIQUE,
		token TEXT NOT NULL,
		expires_at TIMESTAMPTZ NOT NULL,
		login_last TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_qanc_id) REFERENCES user_qanc(id) ON DELETE CASCADE
	);

	`

	_, err := db.Exec(schema)
	if err != nil {
		log.Printf("Error creating tables: %v", err)
		return err
	}

	return nil
}
