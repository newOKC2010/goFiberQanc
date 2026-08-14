package handlerMophAlert

import (
	"fmt"
	"time"

	mophAlertUtils "qanc/src/controllers/alert/moph/utils"
)

func CreateBookingFlexMessage(fullName, phone, slotDate string, queueNo int) mophAlertUtils.FlexMessage {
	return buildBookingFlex("🤰 มีการจองคิวฝากครรภ์ใหม่", "#43a047", fullName, phone, slotDate, queueNo)
}

func CreateCancelFlexMessage(fullName, phone, slotDate string, queueNo int) mophAlertUtils.FlexMessage {
	return buildBookingFlex("❌ มีการยกเลิกการจองคิว", "#e53935", fullName, phone, slotDate, queueNo)
}

func buildBookingFlex(title, color, fullName, phone, slotDate string, queueNo int) mophAlertUtils.FlexMessage {
	loc, _ := time.LoadLocation("Asia/Bangkok")
	now := time.Now().In(loc).Format("02/01/2006 15:04")

	return mophAlertUtils.FlexMessage{
		Type:    "flex",
		AltText: title,
		Contents: mophAlertUtils.FlexBubble{
			Type: "bubble",
			Header: &mophAlertUtils.FlexBox{
				Type:   "box",
				Layout: "vertical",
				Contents: []interface{}{
					mophAlertUtils.FlexText{Type: "text", Text: title, Weight: "bold", Size: "md", Color: color},
				},
			},
			Body: &mophAlertUtils.FlexBox{
				Type:    "box",
				Layout:  "vertical",
				Spacing: "sm",
				Contents: []interface{}{
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("👤 ชื่อ: %s", fullName), Size: "sm", Wrap: true},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("📞 โทร: %s", phone), Size: "sm"},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("📅 วันที่จอง: %s", slotDate), Size: "sm"},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("🔢 คิวที่: %d", queueNo), Size: "sm"},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("🕐 เวลา: %s", now), Size: "xs", Color: "#888888", Margin: "md"},
				},
			},
		},
	}
}
