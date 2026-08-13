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

	-- Table: anc_slots (วันที่เปิดให้จอง)
	CREATE TABLE IF NOT EXISTS anc_slots (
		id SERIAL PRIMARY KEY,                      -- รหัสช่วงเวลา
		slot_date DATE NOT NULL UNIQUE,             -- วันที่เปิดให้จอง (ห้ามซ้ำ)
		max_queue INT NOT NULL DEFAULT 20,          -- จำนวนคิวสูงสุดต่อวัน
		is_active BOOLEAN NOT NULL DEFAULT true     -- สถานะเปิด/ปิดรับจอง
	);

	-- Table: anc_bookings (ข้อมูลการจอง)
	CREATE TABLE IF NOT EXISTS anc_bookings (
		id SERIAL PRIMARY KEY,                                     -- รหัสการจอง
		slot_id INT NOT NULL REFERENCES anc_slots(id) ON DELETE CASCADE,  -- อ้างอิงวันที่จอง
		cid VARCHAR(13),                                           -- เลขบัตรประชาชน (13 หลัก)
		passport_no VARCHAR(20),                                   -- เลข Passport (กรณีไม่มีบัตรประชาชน)
		queue_no INT NOT NULL,                                     -- หมายเลขคิว

		-- ข้อมูลพื้นฐาน
		full_name VARCHAR(150) NOT NULL,                           -- ชื่อ-นามสกุล
		phone VARCHAR(20) NOT NULL,                                -- เบอร์โทรศัพท์

		-- สิทธิการรักษา
		rights_type VARCHAR(50),                                   -- ประเภทสิทธิ์ ('ประกันสังคม', '30บาท', 'อื่นๆ')
		rights_other TEXT,                                         -- ระบุสิทธิ์อื่นๆ (ถ้าเลือก 'อื่นๆ')

		-- ประวัติการตั้งครรภ์
		is_first_pregnancy BOOLEAN,                                -- ตั้งครรภ์ครั้งแรกหรือไม่
		previous_births INT NOT NULL DEFAULT 0,                    -- จำนวนครั้งที่คลอดมาแล้ว
		previous_miscarriages INT NOT NULL DEFAULT 0,              -- จำนวนครั้งที่แท้งมาแล้ว

		-- ประจำเดือนครั้งสุดท้าย
		lmp_date DATE,                                             -- วันที่มีประจำเดือนครั้งสุดท้าย (Last Menstrual Period)

		-- เคยฝากครรภ์ที่อื่น
		has_prior_anc BOOLEAN,                                     -- เคยฝากครรภ์ที่อื่นหรือไม่
		expected_due_date DATE,                                    -- วันคลอดโดยประมาณ (ถ้าเคยฝากครรภ์แล้ว)

		-- โรคประจำตัว
		diseases TEXT[] NOT NULL DEFAULT '{}',                     -- รายการโรคประจำตัว (เก็บเป็น array)
		diseases_other TEXT,                                       -- ระบุโรคอื่นๆ (ถ้ามี)

		note TEXT,                                                 -- หมายเหตุเพิ่มเติม
		status VARCHAR(20) NOT NULL DEFAULT 'booked',              -- สถานะการจอง ('booked', 'cancelled', 'completed')
		created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, -- วันเวลาที่สร้างการจอง

		UNIQUE (slot_id, queue_no)                                 -- ป้องกันหมายเลขคิวซ้ำในวันเดียวกัน
	);

	CREATE INDEX IF NOT EXISTS idx_anc_bookings_slot ON anc_bookings(slot_id);
	CREATE INDEX IF NOT EXISTS idx_anc_bookings_phone ON anc_bookings(phone);

	`

	_, err := db.Exec(schema)
	if err != nil {
		log.Printf("Error creating tables: %v", err)
		return err
	}

	return nil
}
