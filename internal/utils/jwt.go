package utils

import (
    "crypto/rsa"
    "github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(claims jwt.MapClaims, privateKey *rsa.PrivateKey) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
    return token.SignedString(privateKey)
}

func ValidateJWT(tokenString string, publicKey *rsa.PublicKey) (jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
            return nil, jwt.ErrSignatureInvalid
        }
        return publicKey, nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return claims, nil
    }

    return nil, jwt.ErrSignatureInvalid
}
