package i18n

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// GetLang อ่าน Accept-Language header แล้วคืนค่า "th" หรือ "en"
func GetLang(c *fiber.Ctx) string {
	lang := strings.ToLower(strings.TrimSpace(c.Get("Accept-Language")))
	if strings.HasPrefix(lang, "en") {
		return "en"
	}
	return "th"
}

// T คืนค่า th หรือ en ตาม lang
func T(lang, th, en string) string {
	if lang == "en" {
		return en
	}
	return th
}

// Tf คือ T แบบรองรับ format string (fmt.Sprintf)
func Tf(lang, th, en string, args ...interface{}) string {
	if lang == "en" {
		return fmt.Sprintf(en, args...)
	}
	return fmt.Sprintf(th, args...)
}
