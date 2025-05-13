package config

import (
	// "github.com/fsnotify/fsnotify"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"time"
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

	watchConfig()

	return nil
}

// watchConfig ...
// 监听配置文件是否改变, 用于热更新
func watchConfig() {
	viper.WatchConfig()
	// viper.OnConfigChange(func(e fsnotify.Event) {
	// 	logger.Logger.Infof("Config file changed: %s", e.Name)
	// })
}

// AppConfig ...
type AppConfig struct {
	Name              string `json:"name" yaml:"name" mapstructure:"name"`
	RunMode           string `json:"run_mode" yaml:"run_mode" mapstructure:"run_mode"`
	Addr              string `json:"addr" yaml:"addr" mapstructure:"addr"`
	Port              string `json:"port" yaml:"port" mapstructure:"port"`
	JwtExpirationTime int    `json:"jwt_expiration_time" yaml:"jwt_expiration_time" mapstructure:"jwt_expiration_time"`
	RsaPrivateKeyPath string `json:"rsa_private_key_path" yaml:"rsa_private_key_path" mapstructure:"rsa_private_key_path"`
	RsaPublicKeyPath  string `json:"rsa_public_key_path" yaml:"rsa_public_key_path" mapstructure:"rsa_public_key_path"`
	LogOutputDir      string `json:"log_output_dir" yaml:"log_output_dir" mapstructure:"log_output_dir"`
}

type MinioConfig struct {
	Endpoint        string   `json:"endpoint" yaml:"endpoint" mapstructure:"endpoint"`
	AccessKeyID     string   `json:"access_key_id" yaml:"access_key_id" mapstructure:"access_key_id"`
	SecretAccessKey string   `json:"secret_access_key" yaml:"secret_access_key" mapstructure:"secret_access_key"`
	UseSSL          bool     `json:"use_ssl" yaml:"use_ssl" mapstructure:"use_ssl"`
	BucketNames     []string `json:"bucket_names" yaml:"bucket_names" mapstructure:"bucket_names"`
	Location        string   `json:"location" yaml:"location" mapstructure:"location"`
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
	LogLevel     string `json:"log_level" yaml:"log_level" mapstructure:"log_level"`
	LogOutputDir string `json:"log_output_dir" yaml:"log_output_dir" mapstructure:"log_output_dir"`
}

type DataBaseConfig struct {
	Postgres PostgresConfig `json:"postgres" yaml:"postgres" mapstructure:"postgres"`
	Gorm     GormConfig     `json:"gorm" yaml:"gorm" mapstructure:"gorm"`
}

type KafkaConfig struct {
	Brokers  []string `json:"brokers" yaml:"brokers" mapstructure:"brokers"`       // Kafka broker地址列表
	Version  string   `json:"version" yaml:"version" mapstructure:"version"`       // Kafka版本
	ClientID string   `json:"client_id" yaml:"client_id" mapstructure:"client_id"` // 客户端ID

	// TLS配置
	TLS struct {
		Enable     bool   `json:"enable" yaml:"enable" mapstructure:"enable"`                // 是否启用TLS
		CaFile     string `json:"ca_file" yaml:"ca_file" mapstructure:"ca_file"`             // CA证书文件路径
		CertFile   string `json:"cert_file" yaml:"cert_file" mapstructure:"cert_file"`       // 客户端证书文件路径
		KeyFile    string `json:"key_file" yaml:"key_file" mapstructure:"key_file"`          // 客户端私钥文件路径
		SkipVerify bool   `json:"skip_verify" yaml:"skip_verify" mapstructure:"skip_verify"` // 是否跳过服务器证书验证
	} `json:"tls" yaml:"tls" mapstructure:"tls"`

	// 生产者配置
	Producer struct {
		RetryMax     int           `json:"retry_max" yaml:"retry_max" mapstructure:"retry_max"`             // 最大重试次数
		RetryBackoff int           `json:"retry_backoff" yaml:"retry_backoff" mapstructure:"retry_backoff"` // 重试间隔（毫秒）
		RequiredAcks string        `json:"required_acks" yaml:"required_acks" mapstructure:"required_acks"` // 确认机制
		Timeout      time.Duration `json:"timeout" yaml:"timeout" mapstructure:"timeout"`                   // 超时时间
		Compression  string        `json:"compression" yaml:"compression" mapstructure:"compression"`       // 压缩方式
	} `json:"producer" yaml:"producer" mapstructure:"producer"`

	// 消费者配置
	Consumer struct {
		GroupID           string        `json:"group_id" yaml:"group_id" mapstructure:"group_id"`                               // 消费者组ID
		AutoOffsetReset   string        `json:"auto_offset_reset" yaml:"auto_offset_reset" mapstructure:"auto_offset_reset"`    // 偏移量重置策略
		SessionTimeout    time.Duration `json:"session_timeout" yaml:"session_timeout" mapstructure:"session_timeout"`          // 会话超时时间
		HeartbeatInterval time.Duration `json:"heartbeat_interval" yaml:"heartbeat_interval" mapstructure:"heartbeat_interval"` // 心跳间隔
		RebalanceTimeout  time.Duration `json:"rebalance_timeout" yaml:"rebalance_timeout" mapstructure:"rebalance_timeout"`    // 重平衡超时时间
	} `json:"consumer" yaml:"consumer" mapstructure:"consumer"`
}

// RedisConfig ...
type RedisConfig struct {
	Addr         string        `json:"addr" yaml:"addr" mapstructure:"addr"`
	Password     string        `json:"password" yaml:"password" mapstructure:"password"`
	DB           int           `json:"db" yaml:"db" mapstructure:"db"`
	DialTimeout  time.Duration `json:"dial_timeout" yaml:"dial_timeout" mapstructure:"dial_timeout"`
	ReadTimeout  time.Duration `json:"read_timeout" yaml:"read_timeout" mapstructure:"read_timeout"`
	WriteTimeout time.Duration `json:"write_timeout" yaml:"write_timeout" mapstructure:"write_timeout"`
	PoolSize     int           `json:"pool_size" yaml:"pool_size" mapstructure:"pool_size"`
	KeyPrifex    string        `json:"key_prefix" yaml:"key_prefix" mapstructure:"key_prefix"`
}

type EmailConfig struct {
	SmtpUsername  string `json:"smtp_username" yaml:"smtp_username" mapstructure:"smtp_username"`
	SmtpPassword  string `json:"smtp_password" yaml:"smtp_password" mapstructure:"smtp_password"`
	SmtpHost      string `json:"smtp_host" yaml:"smtp_host" mapstructure:"smtp_host"`
	SmtpPort      int    `json:"smtp_port" yaml:"smtp_port" mapstructure:"smtp_port"`
	SenderName    string `json:"sender_name" yaml:"sender_name" mapstructure:"sender_name"`
	SenderEmail   string `json:"sender_email" yaml:"sender_email" mapstructure:"sender_email"`
	EmailTemplate string `json:"email_template" yaml:"email_template" mapstructure:"email_template"`
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
	// kafka
	Kafka KafkaConfig `json:"kafka" yaml:"kafka" mapstructure:"kafka"`
	// redis
	Redis RedisConfig `json:"redis" yaml:"redis" mapstructure:"redis"`
	// email
	Email EmailConfig `json:"email" yaml:"email" mapstructure:"email"`
}
