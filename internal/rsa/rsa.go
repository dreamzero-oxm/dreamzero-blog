package rsa

import (
	"crypto/rand"
	cryptoRsa "crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"os"
)

var (
	PrivateKey *cryptoRsa.PrivateKey
	PublicKey  *cryptoRsa.PublicKey
)

// generateRSAKeys 生成新的RSA密钥对并保存到文件
func generateRSAKeys(privateKeyPath, publicKeyPath string) (*cryptoRsa.PrivateKey, error) {
	// 生成私钥
	privateKey, err := cryptoRsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, err
	}

	// 将私钥转换为PEM格式
	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	})

	// 将公钥转换为PEM格式
	publicKeyBytes := x509.MarshalPKCS1PublicKey(&privateKey.PublicKey)
	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PUBLIC KEY",
		Bytes: publicKeyBytes,
	})

	// 保存私钥到文件
	if err := os.WriteFile(privateKeyPath, privateKeyPEM, 0600); err != nil {
		return nil, err
	}

	// 保存公钥到文件
	if err := os.WriteFile(publicKeyPath, publicKeyPEM, 0644); err != nil {
		return nil, err
	}

	return privateKey, nil
}

// loadPrivateKey 从文件加载私钥
func loadPrivateKey(privateKeyPath string) (*cryptoRsa.PrivateKey, error) {
	// 读取私钥文件
	privateKeyData, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return nil, err
	}

	// 解析PEM格式
	block, _ := pem.Decode(privateKeyData)
	if block == nil {
		return nil, err
	}

	// 解析私钥
	return x509.ParsePKCS1PrivateKey(block.Bytes)
}
