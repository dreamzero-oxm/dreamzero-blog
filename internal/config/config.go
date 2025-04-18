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

	logger.Logger.Infof("config-app:(%#v)", Conf.App)
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
	Name      string `json:"name" yaml:"name" mapstructure:"name"`
	RunMode   string `json:"run_mode" yaml:"run_mode" mapstructure:"run_mode"`
	Addr      string `json:"addr" yaml:"addr" mapstructure:"addr"`
	Port      string `json:"port" yaml:"port" mapstructure:"port"`
	JwtSecret string `json:"jwt_secret" yaml:"jwt_secret" mapstructure:"jwt_secret"`
	// JWTExpirationTime day
	JwtExpirationTime int `json:"jwt_expiration_time" yaml:"jwt_expiration_time" mapstructure:"jwt_expiration_time"`
}

type MinioConfig struct {
	Endpoint        string `json:"endpoint" yaml:"endpoint" mapstructure:"endpoint"`
	AccessKeyID     string `json:"access_key_id" yaml:"access_key_id" mapstructure:"access_key_id"`
	SecretAccessKey string `json:"secret_access_key" yaml:"secret_access_key" mapstructure:"secret_access_key"`
	UseSSL          bool   `json:"use_ssl" yaml:"use_ssl" mapstructure:"use_ssl"`
	BucketName      string `json:"bucket_name" yaml:"bucket_name" mapstructure:"bucket_name"`
	Location        string `json:"location" yaml:"location" mapstructure:"location"`
}

type PostgresConfig struct {
	Username string `json:"username" yaml:"username" mapstructure:"username"`
	Password string `json:"password" yaml:"password" mapstructure:"password"`
	Host     string `json:"host" yaml:"host" mapstructure:"host"`
	Port     string `json:"port" yaml:"port" mapstructure:"port"`
	DBName   string `json:"db_name" yaml:"db_name" mapstructure:"db_name"`
	Sslmode  string `json:"sslmode" yaml:"sslmode" mapstructure:"sslmode"`
}

type GormConfig struct {
	LogLevel string `json:"debug" yaml:"debug" mapstructure:"debug"`
	LogOutputDir string `json:"log_output_dir" yaml:"log_output_dir" mapstructure:"log_output_dir"`
}

type DataBaseConfig struct {
	Postgres PostgresConfig `json:"postgres" yaml:"postgres" mapstructure:"postgres"`
	Gorm GormConfig `json:"gorm" yaml:"gorm" mapstructure:"gorm"`
}

// Config global config
// include common and biz config
type Config struct {
	// common
	App AppConfig `json:"app" yaml:"app" mapstructure:"app"`
	// minio
	Minio MinioConfig `json:"minio" yaml:"minio" mapstructure:"minio"`
	// database
	DataBase DataBaseConfig `json:"database" yaml:"database" mapstructure:"database"`
}
