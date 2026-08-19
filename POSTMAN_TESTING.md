# API Testing Guide - ANC Booking System

## **Quick Reference**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/qanc/slots` | GET | ❌ | ดูวันว่าง |
| `/qanc/booking` | POST | ❌ | จองคิว |
| `/qanc/booking/check` | POST | ❌ | ดูรายการจองตัวเอง |
| `/qanc/booking/cancel` | PATCH | ❌ | ยกเลิกการจอง |
| `/qanc/admin/slots` | GET | ✅ | ดูวันทั้งหมด (pagination) |
| `/qanc/admin/slots/bulk` | POST | ✅ | เพิ่มหลายวันพร้อมกัน |
| `/qanc/admin/slots/:id` | PUT | ✅ | แก้ไขจำนวนคิว |
| `/qanc/admin/slots/toggle` | POST | ✅ | เปิด/ปิดวัน |
| `/qanc/admin/bookings` | GET | ✅ | ดูรายการจอง |

---

## **1. User APIs (Public)**

### ดูวันที่ว่าง
```http
GET {{base_url}}/qanc/slots
```
**Response:** `{ success, data: [{ id, slot_date, max_queue, booked, available }] }`

### จองคิว
```http
POST {{base_url}}/qanc/booking
Content-Type: application/json

{
  "slot_date": "2026-08-10",
  "cid": "1234567890123",
  "full_name": "สมหญิง ใจดี",
  "phone": "0812345678",
  "rights_type": "ประกันสังคม",
  "is_first_pregnancy": true,
  "previous_births": 0,
  "previous_miscarriages": 0,
  "lmp_date": "2026-01-15",
  "has_prior_anc": false,
  "diseases": ["เบาหวาน"],
  "note": "ต้องการพบแพทย์เฉพาะทาง"
}
```
**Response:** `{ success, message, booking_id, queue_no }`
**Note:** ใช้ `cid` หรือ `passport_no` อย่างใดอย่างหนึ่ง

### ดูรายการจองของตัวเอง
```http
POST {{base_url}}/qanc/booking/check
Content-Type: application/json

{ "cid": "1234567890123" }
# หรือ
{ "passport_no": "AB1234567" }
```

### ยกเลิกการจอง
```http
PATCH {{base_url}}/qanc/booking/cancel
Content-Type: application/json

{ "slot_id": 3, "cid": "1234567890123" }
```
**Response:** `{ success, message: "ยกเลิกการจองสำเร็จ" }`

---

## **2. Admin APIs (Auth Required)**

### Login Flow
```http
# 1. ขอ OTP
POST {{base_url}}/auth/req
{ "email": "admin@example.com" }

# 2. ยืนยัน OTP → ได้ token
POST {{base_url}}/auth/verify
{ "email": "admin@example.com", "otp": "123456" }
```

**Postman Auto-Save Token** (Tab: Tests)
```javascript
var r = pm.response.json();
if (r.success) pm.environment.set("token", r.token);
```

### ดูวันทั้งหมด
```http
GET {{base_url}}/qanc/admin/slots?page=1&limit=10
Authorization: Bearer {{token}}
```
**Response:** `{ success, data: [...], pagination: { count, total_count, total_pages, current_page } }`
**Note:** limit สูงสุด 1000

### เพิ่มหลายวันพร้อมกัน
```http
POST {{base_url}}/qanc/admin/slots/bulk
Authorization: Bearer {{token}}

{
  "slot_dates": ["2026-09-01", "2026-09-03", "2026-09-05"],
  "max_queue": 20
}
```
**Response:**
```json
{
  "success": true,
  "message": "เพิ่มสำเร็จ 3/3 วัน",
  "results": [
    { "slot_date": "2026-09-01", "success": true },
    { "slot_date": "2026-09-03", "success": true },
    { "slot_date": "2026-09-05", "success": false, "message": "วันนี้มีอยู่ในระบบแล้ว" }
  ]
}
```
**Error:** วันย้อนหลัง / วันปัจจุบัน / slot_dates ว่าง

### แก้ไขจำนวนคิว
```http
PUT {{base_url}}/qanc/admin/slots/1
Authorization: Bearer {{token}}

{ "max_queue": 30 }
```
**Error:** `"ไม่สามารถลดคิวเหลือ 5 เพราะมีการจองแล้ว 8 คิว"`

### เปิด/ปิดรับจอง
```http
POST {{base_url}}/qanc/admin/slots/toggle
Authorization: Bearer {{token}}

{ "id": 2, "is_active": false }
```
**Error:** `"ไม่สามารถปิดรับจองได้ เนื่องจากมีการจองอยู่แล้ว 8 คิว"`

### ดูรายการจอง
```http
GET {{base_url}}/qanc/admin/bookings?page=1&limit=10
GET {{base_url}}/qanc/admin/bookings?slot_date=2026-09-01
Authorization: Bearer {{token}}
```

---

## **Postman Setup**

```
base_url = http://localhost:8081
token    = (auto-set หลัง login)
```
Authorization → Type: **Bearer Token** → `{{token}}`

---

## **Common Errors**

| Code | Cause |
|------|-------|
| 400 | Invalid JSON / missing fields / วันย้อนหลัง |
| 401 | No token / expired |
| 403 | Wrong role |
| 404 | ไม่พบ slot ID |
| 500 | Database error |
