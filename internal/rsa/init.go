package rsa

import (
	"blog-server/internal/code"
	cryptoRsa "crypto/rsa"
	"os"
	"path/filepath"
)

// InitRSAKeys 初始化RSA密钥对，如果文件不存在则创建新的密钥对
func InitRSAKeys(privateKeyPath, publicKeyPath string) (*cryptoRsa.PrivateKey, *cryptoRsa.PublicKey, error) {
    if privateKeyPath == "" {
		return nil, nil, code.ErrRsaPrivateKeyPathError
	}
	if publicKeyPath == "" {
		return nil, nil, code.ErrRsaPublicKeyPathError
	}
    // 确保目录存在
    if err := os.MkdirAll(filepath.Dir(privateKeyPath), 0755); err != nil {
        return nil, nil, err
    }
    if err := os.MkdirAll(filepath.Dir(publicKeyPath), 0755); err != nil {
        return nil, nil, err
    }

    // 尝试读取现有的私钥
    privateKey, err := loadPrivateKey(privateKeyPath)
    if err != nil {
        // 如果私钥不存在，生成新的密钥对
        privateKey, err = generateRSAKeys(privateKeyPath, publicKeyPath)
        if err != nil {
            return nil, nil, err
        }
    }

    // 获取公钥
    publicKey := &privateKey.PublicKey

    return privateKey, publicKey, nil
}

