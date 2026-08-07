package handlerLogin

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	loginUtils "qanc/src/controllers/auth/login/otp/utils"
	loadEnv "qanc/src/loadenv"
)

func GenerateJWT(userQANCID int64, email, role string) (string, error) {
	jwtConfig := loadEnv.LoadJWT()
	expiresInSeconds := GetExpiresInSeconds(jwtConfig.ExpireIn, 3600)
	expiresAt := time.Now().Add(time.Second * time.Duration(expiresInSeconds))

	claims := loginUtils.GenerateJWTClaims{
		UserQANCID: userQANCID,
		Email:      email,
		Role:       role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtConfig.Secret))
}
