# API Testing Guide - ANC Booking System

## **Quick Reference**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/qanc/slots` | GET | ❌ | ดูวันว่าง |
| `/qanc/booking` | POST | ❌ | จองคิว |
| `/qanc/booking/check` | POST | ❌ | ดูรายการจองตัวเอง |
| `/qanc/booking/:id/cancel` | PATCH | ❌ | ยกเลิกการจอง |
| `/qanc/admin/slots` | GET | ✅ | ดูวันทั้งหมด |
| `/qanc/admin/slots` | POST | ✅ | เพิ่มวันใหม่ |
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
**Note:** ใช้ `cid` หรือ `passport_no` อย่างใดอย่างหนึ่ง — ใช้ **`booking_id`** ในการยกเลิกจอง

### ดูรายการจองของตัวเอง
```http
POST {{base_url}}/qanc/booking/check
Content-Type: application/json

# ใช้เลขบัตรประชาชน
{ "cid": "1234567890123" }

# หรือใช้ Passport
{ "passport_no": "AB1234567" }
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "slot_date": "2026-08-15",
    "queue_no": 3,
    "full_name": "สมหญิง ใจดี",
    "phone": "0812345678",
    "status": "booked",
    "created_at": "2026-08-13T10:00:00Z"
  }
}
```
**Error:** `"ไม่พบรายการจองที่ active อยู่"`

### ยกเลิกการจอง
```http
PATCH {{base_url}}/qanc/booking/cancel
Content-Type: application/json

# ใช้ cid
{ "slot_id": 3, "cid": "1234567890123" }

# หรือใช้ passport
{ "slot_id": 3, "passport_no": "AB1234567" }
```
**Response:** `{ success, message: "ยกเลิกการจองสำเร็จ" }`
**Error:**
- `"ไม่พบรายการจองที่ active สำหรับ slot นี้"` (ไม่มี booking ที่ status=booked)
- `"กรุณาระบุ slot_id"`
- `"กรุณาระบุ cid หรือ passport_no"`

---

## **2. Admin APIs (Auth Required)**

### Login Flow
```http
# 1. ขอ OTP
POST {{base_url}}/auth/req
{ "email": "admin@example.com" }

# 2. ยืนยัน OTP
POST {{base_url}}/auth/verify
{ "email": "admin@example.com", "otp": "123456" }
→ Response: { success, token, user }
```

**Postman Auto-Save Token** (Tab: Tests)
```javascript
var jsonData = pm.response.json();
if (jsonData.success) pm.environment.set("token", jsonData.token);
```

### ดูวันทั้งหมด
```http
GET {{base_url}}/qanc/admin/slots
Authorization: Bearer {{token}}
```
**Response:** `{ success, data: [{ id, slot_date, max_queue, booked, is_active }] }`

### เพิ่มวันใหม่
```http
POST {{base_url}}/qanc/admin/slots
Authorization: Bearer {{token}}

{ "slot_date": "2026-08-15", "max_queue": 25 }
```
**Response:** `{ success, message }`
**Error:** วันซ้ำ / วันย้อนหลัง / วันปัจจุบัน

### แก้ไขจำนวนคิว
```http
PUT {{base_url}}/qanc/admin/slots/1
Authorization: Bearer {{token}}

{ "max_queue": 30 }
```
**Response:** `{ success, message }`
**Error:** `"ไม่สามารถลดคิวเหลือเป็น 5 เพราะมีการจองแล้ว 8 คิว"`

### เปิด/ปิดรับจอง
```http
POST {{base_url}}/qanc/admin/slots/toggle
Authorization: Bearer {{token}}

{ "id": 2, "is_active": false }
```
**Response:** `{ success, message: "อัพเดทสำเร็จ" }`
**Error:**
- `"ไม่สามารถปิดรับจองได้ เนื่องจากมีการจองอยู่แล้ว 8 คิว"`
- `"ไม่สามารถแก้ไขวันที่ผ่านมาแล้วได้"`

### ดูรายการจอง
```http
# ทั้งหมด
GET {{base_url}}/qanc/admin/bookings

# กรองตามวัน
GET {{base_url}}/qanc/admin/bookings?slot_date=2026-08-10
```

---

## **Postman Setup**

### Environment Variables
```
base_url = http://localhost:3000
token = (auto-set หลัง login)
```

### Authorization
- Type: **Bearer Token**
- Token: `{{token}}`

---

## **Test Scenarios**

| Scenario | Steps |
|----------|-------|
| **จองคิวสำเร็จ** | 1. GET slots → 2. POST booking → 3. GET slots (เห็นคิวลด) |
| **ดูและยกเลิกการจอง** | 1. POST booking/check → 2. PATCH booking/:id/cancel → 3. POST booking/check (ไม่พบ) |
| **Admin เพิ่มวัน** | 1. Login → 2. POST admin/slots → 3. GET slots (user เห็นวันใหม่) |
| **Admin ปิดรับจอง** | 1. PATCH slots/:id `is_active: false` → 2. GET slots (user ไม่เห็น) |

---

## **Common Errors**

| Code | Message | Cause |
|------|---------|-------|
| 400 | รูปแบบข้อมูลไม่ถูกต้อง | Invalid JSON/missing fields |
| 401 | กรุณาเข้าสู่ระบบ | No token / expired |
| 403 | ไม่มีสิทธิ์เข้าถึง | Wrong role |
| 404 | ไม่พบวันที่ต้องการแก้ไข | Invalid slot ID |
| 500 | ไม่สามารถดึงข้อมูลได้ | Database error |

**Empty Data Response:**
```json
{ "success": false, "message": "ขณะนี้ยังไม่มีวันเปิดให้จอง", "data": [] }
```
