package utils

import (
	"testing"
)

func TestGetCallerInfo(t *testing.T) {
	t.Run("GetCallerInfo", func(t *testing.T) {
		got := GetCallerInfo(0)
		t.Logf("got: %v", got)
	})
}

func TestGetFullCallerInfo(t *testing.T) {
	t.Run("GetFullCallerInfo", func(t *testing.T) {
		got := GetFullCallerInfo(0)
		t.Logf("got: %v", got)
	})
}