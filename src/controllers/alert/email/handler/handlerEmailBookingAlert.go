package handlerEmailAlert

import (
	"fmt"
	"time"
)

func CreateBookingEmailHTML(fullName, phone, slotDate string, queueNo int) string {
	return buildBookingHTML("🤰 มีการจองคิวฝากครรภ์ใหม่", "#43a047", fullName, phone, slotDate, queueNo)
}

func CreateCancelEmailHTML(fullName, phone, slotDate string, queueNo int) string {
	return buildBookingHTML("❌ มีการยกเลิกการจองคิว", "#e53935", fullName, phone, slotDate, queueNo)
}

func buildBookingHTML(title, color, fullName, phone, slotDate string, queueNo int) string {
	loc, _ := time.LoadLocation("Asia/Bangkok")
	now := time.Now().In(loc).Format("02/01/2006 15:04:05")

	return fmt.Sprintf(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<div style="max-width:500px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <div style="background:%s;padding:20px;text-align:center;">
    <h2 style="color:#fff;margin:0;">%s</h2>
  </div>
  <div style="padding:24px;">
    <table style="width:100%%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#555;">👤 ชื่อ</td><td style="padding:6px 0;font-weight:bold;">%s</td></tr>
      <tr><td style="padding:6px 0;color:#555;">📞 เบอร์โทร</td><td style="padding:6px 0;">%s</td></tr>
      <tr><td style="padding:6px 0;color:#555;">📅 วันที่จอง</td><td style="padding:6px 0;">%s</td></tr>
      <tr><td style="padding:6px 0;color:#555;">🔢 คิวที่</td><td style="padding:6px 0;font-weight:bold;">%d</td></tr>
    </table>
    <p style="margin-top:16px;color:#888;font-size:12px;">🕐 เวลา: %s</p>
  </div>
</div>
</body></html>`,
		color, title, fullName, phone, slotDate, queueNo, now,
	)
}
