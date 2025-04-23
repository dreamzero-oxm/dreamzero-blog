package utils

import (
	"testing"
)

func TestGenerateEncryptedPassword(t *testing.T) {
	test := []struct{
		name string
		password string
		wantErr bool
	}{
		{
			name: "test1",
			password: "123456",
			wantErr: false,
		},
		{
			name: "test2",
			password: "",
			wantErr: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			pwd, err := GenerateEncryptedPassword(tt.password)
			t.Logf("pwd: %v", pwd)
			if (err != nil) != tt.wantErr {
				t.Errorf("GenerateEncryptedPassword() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestComparePassword(t *testing.T){
	test := []struct{
		name string
		password string
		encryptedPassword string
		want bool
	}{
		{
			name: "test1",
			password: "123456",
			encryptedPassword: "$2a$10$fohs970e09Cb/crDk2J0t.oT9OdtQtCmVIWf9okuUg/nJ6UxV7i1i",
			want: true,
		},
		{
			name: "test2",
			password: "",
			encryptedPassword: "$2a$10$kjgyHIt1rB.B26vH6MbfreCAjQJujDYoicDC602m94bXAXnMv3bfO",
			want: true,
		},
		{
			name: "test3",
			password: "123456",
			encryptedPassword: "$2a$10$kjgyHIt1rB.",
			want: false,
		},
	}
	for _, tt := range test {
		t.Run(tt.name, func(t *testing.T) {
			got := ComparePassword(tt.password, tt.encryptedPassword)
			if got != tt.want {
				t.Errorf("ComparePassword() = %v, want %v", got, tt.want)
			}
		})
	}
}