package config

import (
	"blog-server/internal/logger"

	"github.com/fsnotify/fsnotify"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
)

var (
	// Conf ...
	Conf Config
)

// Init init config
func Init(confPath string) error {
	err := initConfig(confPath)
	if err != nil {
		return err
	}
	return nil
}

// initConfig init config from conf file
func initConfig(confPath string) error {
	if confPath != "" {
		viper.SetConfigFile(confPath)
	} else {
		viper.AddConfigPath("./config")
		viper.SetConfigName("config_original.yaml")
	}
	// 设置配置文件类型为YAML
	viper.SetConfigType("yaml")
	// 读取配置文件
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return errors.WithStack(err)
	}

	// parse to config struct
	// 解析到结构体
	err := viper.Unmarshal(&Conf)
	if err != nil {
		return err
	}

	logger.Logger.Infof("config:(%#v)", Conf)
	watchConfig()

	return nil
}

// watchConfig ...
// 监听配置文件是否改变, 用于热更新
func watchConfig() {
	viper.WatchConfig()
	viper.OnConfigChange(func(e fsnotify.Event) {
		logger.Logger.Infof("Config file changed: %s", e.Name)
	})
}

// AppConfig ...
type AppConfig struct {
	Name      string `json:"name" yaml:"name"`
	RunMode   string `json:"run_mode" yaml:"run_mode"`
	Addr      string `json:"addr" yaml:"addr"`
	Port      string `json:"port" yaml:"port"`
	JwtSecret string `json:"jwt_secret" yaml:"jwt_secret"`
	// JWTExpirationTime day
	JwtExpirationTime int `json:"jwt_expiration_time" yaml:"jwt_expiration_time"`
}

// Config global config
// include common and biz config
type Config struct {
	// common
	App AppConfig `json:"app" yaml:"app"`
}
