package emailAlertSend

import (
	"net/smtp"

	handlerEmailAlert "qanc/src/controllers/alert/email/handler"
	loadEnv "qanc/src/loadenv"
)

func SendEmailSMTP(to, subject, body string) error {
	emailConfig := loadEnv.LoadEmail()

	from := emailConfig.Email
	password := emailConfig.Password

	smtpHost := "mail.privateemail.com"
	smtpPort := "587"

	msg := []byte(
		"From: " + from + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/html; charset=UTF-8\r\n" +
			"\r\n" +
			body + "\r\n",
	)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	addr := smtpHost + ":" + smtpPort

	return smtp.SendMail(addr, auth, from, []string{to}, msg)
}

func SendOTPEmail(to, otpCode, fullName string) error {
	subject := "🤰 รหัส OTP สำหรับจองคิวฝากครรภ์ (ANC)"
	body := handlerEmailAlert.CreateOTPEmailHTML(otpCode, fullName)
	return SendEmailSMTP(to, subject, body)
}

func SendBookingAlertEmail(to, fullName, phone, slotDate string, queueNo int) error {
	if to == "" {
		return nil
	}
	body := handlerEmailAlert.CreateBookingEmailHTML(fullName, phone, slotDate, queueNo)
	return SendEmailSMTP(to, "🤰 มีการจองคิวฝากครรภ์ใหม่", body)
}

func SendCancelAlertEmail(to, fullName, phone, slotDate string, queueNo int) error {
	if to == "" {
		return nil
	}
	body := handlerEmailAlert.CreateCancelEmailHTML(fullName, phone, slotDate, queueNo)
	return SendEmailSMTP(to, "❌ มีการยกเลิกการจองคิว", body)
}
