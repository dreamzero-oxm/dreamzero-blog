package mq

import (
	serverConfig "blog-server/internal/config"
	"blog-server/internal/logger"
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/IBM/sarama"
)

var (
	instance         *KafkaProducer
	once             sync.Once
	asyncInstance    *KafkaAsyncProducer
	asyncOnce        sync.Once
	consumerInstance *KafkaConsumer
	consumerOnce     sync.Once
)

// KafkaProducer Kafka生产者结构体
type KafkaProducer struct {
	producer sarama.SyncProducer
	closed   bool
	mutex    sync.RWMutex
}

// NewSyncKafkaProducer 创建一个新的Kafka生产者（单例模式）
func NewSyncKafkaProducer() (*KafkaProducer, error) {
	var err error
	once.Do(func() {
		instance, err = initKafkaProducer()
	})
	if err != nil {
		return nil, fmt.Errorf("初始化Kafka生产者失败: %w", err)
	}
	return instance, nil
}

// initKafkaProducer 初始化生产者
func initKafkaProducer() (*KafkaProducer, error) {
	// 创建Kafka配置
	config := sarama.NewConfig()

	// TLS配置
	if serverConfig.Conf.Kafka.TLS.Enable {
		config.Net.TLS.Enable = true
		tlsConfig := &tls.Config{
			InsecureSkipVerify: serverConfig.Conf.Kafka.TLS.SkipVerify,
		}

		if serverConfig.Conf.Kafka.TLS.CaFile != "" {
			caCert, err := os.ReadFile(serverConfig.Conf.Kafka.TLS.CaFile)
			if err != nil {
				return nil, fmt.Errorf("读取CA证书失败: %w", err)
			}
			caCertPool := x509.NewCertPool()
			caCertPool.AppendCertsFromPEM(caCert)
			tlsConfig.RootCAs = caCertPool
		}

		if serverConfig.Conf.Kafka.TLS.CertFile != "" && serverConfig.Conf.Kafka.TLS.KeyFile != "" {
			cert, err := tls.LoadX509KeyPair(
				serverConfig.Conf.Kafka.TLS.CertFile,
				serverConfig.Conf.Kafka.TLS.KeyFile,
			)
			if err != nil {
				return nil, fmt.Errorf("加载客户端证书失败: %w", err)
			}
			tlsConfig.Certificates = []tls.Certificate{cert}
		}

		config.Net.TLS.Config = tlsConfig
	}

	// 版本设置
	version, err := sarama.ParseKafkaVersion(serverConfig.Conf.Kafka.Version)
	if err != nil {
		return nil, fmt.Errorf("解析Kafka版本失败: %w", err)
	}
	config.Version = version

	// 设置客户端ID
	config.ClientID = serverConfig.Conf.Kafka.ClientID

	// 生产者确认机制
	switch serverConfig.Conf.Kafka.Producer.RequiredAcks {
	case "no":
		config.Producer.RequiredAcks = sarama.NoResponse
	case "local":
		config.Producer.RequiredAcks = sarama.WaitForLocal
	default:
		config.Producer.RequiredAcks = sarama.WaitForAll
	}

	// 重试配置
	config.Producer.Retry.Max = serverConfig.Conf.Kafka.Producer.RetryMax
	config.Producer.Retry.Backoff = time.Duration(serverConfig.Conf.Kafka.Producer.RetryBackoff) * time.Millisecond

	// 压缩配置
	switch serverConfig.Conf.Kafka.Producer.Compression {
	case "gzip":
		config.Producer.Compression = sarama.CompressionGZIP
	case "snappy":
		config.Producer.Compression = sarama.CompressionSnappy
	case "lz4":
		config.Producer.Compression = sarama.CompressionLZ4
	case "zstd":
		config.Producer.Compression = sarama.CompressionZSTD
	default:
		config.Producer.Compression = sarama.CompressionNone
	}

	// 成功失败通知
	config.Producer.Return.Successes = true // 成功交付的消息将在success channel返回
	config.Producer.Return.Errors = true    // 失败的消息将在error channel返回

	// 分区策略
	config.Producer.Partitioner = sarama.NewHashPartitioner // 使用哈希分区策略

	// 超时设置
	config.Producer.Timeout = serverConfig.Conf.Kafka.Producer.Timeout

	// 幂等性设置
	config.Producer.Idempotent = true
	config.Net.MaxOpenRequests = 1

	// 创建生产者
	producer, err := sarama.NewSyncProducer(serverConfig.Conf.Kafka.Brokers, config)
	if err != nil {
		logger.Logger.Errorf("创建Kafka生产者失败: %v", err)
		return nil, err
	}

	return &KafkaProducer{
		producer: producer,
		closed:   false,
	}, nil
}

// SendMessage 发送消息到指定的topic
func (p *KafkaProducer) SendMessage(ctx context.Context, topic string, key string, value []byte) error {
	p.mutex.RLock()
	if p.closed {
		p.mutex.RUnlock()
		return fmt.Errorf("producer已关闭")
	}
	p.mutex.RUnlock()

	// 创建消息
	msg := &sarama.ProducerMessage{
		Topic:     topic,
		Key:       sarama.StringEncoder(key),
		Value:     sarama.ByteEncoder(value),
		Timestamp: time.Now(), // 设置消息时间戳
	}

	// 添加自定义头部信息（如果需要）
	msg.Headers = []sarama.RecordHeader{
		{
			Key:   []byte("timestamp"),
			Value: []byte(fmt.Sprintf("%d", time.Now().Unix())),
		},
	}

	// 发送消息
	partition, offset, err := p.producer.SendMessage(msg)
	if err != nil {
		logger.Logger.Errorf("发送消息失败: topic=%s, key=%s, error=%v", topic, key, err)
		return fmt.Errorf("发送消息失败: %w", err)
	}

	logger.Logger.Debugf("消息发送成功: topic=%s, partition=%d, offset=%d, key=%s",
		topic, partition, offset, key)
	return nil
}

// SendMessages 批量发送消息
func (p *KafkaProducer) SendMessages(ctx context.Context, messages []*sarama.ProducerMessage) error {
	p.mutex.RLock()
	if p.closed {
		p.mutex.RUnlock()
		return fmt.Errorf("producer已关闭")
	}
	p.mutex.RUnlock()

	err := p.producer.SendMessages(messages)
	if err != nil {
		logger.Logger.Errorf("批量发送消息失败: %v", err)
		return fmt.Errorf("批量发送消息失败: %w", err)
	}

	return nil
}

// Close 安全关闭生产者
func (p *KafkaProducer) Close() error {
	p.mutex.Lock()
	defer p.mutex.Unlock()

	if p.closed {
		return nil
	}

	if err := p.producer.Close(); err != nil {
		logger.Logger.Errorf("关闭Kafka生产者失败: %v", err)
		return fmt.Errorf("关闭Kafka生产者失败: %w", err)
	}

	p.closed = true
	return nil
}

// IsHealthy 检查生产者健康状态
func (p *KafkaProducer) IsHealthy() bool {
	p.mutex.RLock()
	defer p.mutex.RUnlock()
	return !p.closed
}

// KafkaAsyncProducer Kafka异步生产者结构体
type KafkaAsyncProducer struct {
	producer sarama.AsyncProducer
	closed   bool
	mutex    sync.RWMutex
}

// NewKafkaAsyncProducer 创建一个新的Kafka异步生产者（单例模式）
func NewKafkaAsyncProducer() (*KafkaAsyncProducer, error) {
	var err error
	asyncOnce.Do(func() {
		asyncInstance, err = initKafkaAsyncProducer()
	})
	if err != nil {
		return nil, fmt.Errorf("初始化Kafka异步生产者失败: %w", err)
	}
	return asyncInstance, nil
}

// initKafkaAsyncProducer 初始化异步生产者
func initKafkaAsyncProducer() (*KafkaAsyncProducer, error) {
	// 创建Kafka配置
	config := sarama.NewConfig()

	// TLS配置
	if serverConfig.Conf.Kafka.TLS.Enable {
		config.Net.TLS.Enable = true
		tlsConfig := &tls.Config{
			InsecureSkipVerify: serverConfig.Conf.Kafka.TLS.SkipVerify,
		}

		if serverConfig.Conf.Kafka.TLS.CaFile != "" {
			caCert, err := os.ReadFile(serverConfig.Conf.Kafka.TLS.CaFile)
			if err != nil {
				return nil, fmt.Errorf("读取CA证书失败: %w", err)
			}
			caCertPool := x509.NewCertPool()
			caCertPool.AppendCertsFromPEM(caCert)
			tlsConfig.RootCAs = caCertPool
		}

		if serverConfig.Conf.Kafka.TLS.CertFile != "" && serverConfig.Conf.Kafka.TLS.KeyFile != "" {
			cert, err := tls.LoadX509KeyPair(
				serverConfig.Conf.Kafka.TLS.CertFile,
				serverConfig.Conf.Kafka.TLS.KeyFile,
			)
			if err != nil {
				return nil, fmt.Errorf("加载客户端证书失败: %w", err)
			}
			tlsConfig.Certificates = []tls.Certificate{cert}
		}

		config.Net.TLS.Config = tlsConfig
	}

	// 版本设置
	version, err := sarama.ParseKafkaVersion(serverConfig.Conf.Kafka.Version)
	if err != nil {
		return nil, fmt.Errorf("解析Kafka版本失败: %w", err)
	}
	config.Version = version

	// 设置客户端ID
	config.ClientID = serverConfig.Conf.Kafka.ClientID

	// 生产者确认机制
	switch serverConfig.Conf.Kafka.Producer.RequiredAcks {
	case "no":
		config.Producer.RequiredAcks = sarama.NoResponse
	case "local":
		config.Producer.RequiredAcks = sarama.WaitForLocal
	default:
		config.Producer.RequiredAcks = sarama.WaitForAll
	}

	// 重试配置
	config.Producer.Retry.Max = serverConfig.Conf.Kafka.Producer.RetryMax
	config.Producer.Retry.Backoff = time.Duration(serverConfig.Conf.Kafka.Producer.RetryBackoff) * time.Millisecond

	// 压缩配置
	switch serverConfig.Conf.Kafka.Producer.Compression {
	case "gzip":
		config.Producer.Compression = sarama.CompressionGZIP
	case "snappy":
		config.Producer.Compression = sarama.CompressionSnappy
	case "lz4":
		config.Producer.Compression = sarama.CompressionLZ4
	case "zstd":
		config.Producer.Compression = sarama.CompressionZSTD
	default:
		config.Producer.Compression = sarama.CompressionNone
	}

	// 成功失败通知
	config.Producer.Return.Successes = true // 成功交付的消息将在success channel返回
	config.Producer.Return.Errors = true    // 失败的消息将在error channel返回

	// 分区策略
	config.Producer.Partitioner = sarama.NewHashPartitioner // 使用哈希分区策略

	// 版本设置
	config.Version = sarama.V4_0_0_0 // 设置Kafka版本

	// 创建异步生产者
	producer, err := sarama.NewAsyncProducer(serverConfig.Conf.Kafka.Brokers, config)
	if err != nil {
		logger.Logger.Errorf("创建Kafka异步生产者失败: %v", err)
		return nil, err
	}

	asyncProducer := &KafkaAsyncProducer{
		producer: producer,
		closed:   false,
	}

	// 启动goroutine处理异步结果
	go asyncProducer.handleAsyncResults()

	return asyncProducer, nil
}

// handleAsyncResults 处理异步发送结果
func (p *KafkaAsyncProducer) handleAsyncResults() {
	for {
		p.mutex.RLock()
		if p.closed {
			p.mutex.RUnlock()
			return
		}
		p.mutex.RUnlock()

		select {
		case success := <-p.producer.Successes():
			if success != nil {
				logger.Logger.Debugf("异步消息发送成功: topic=%s, partition=%d, offset=%d",
					success.Topic, success.Partition, success.Offset)
			}
		case err := <-p.producer.Errors():
			if err != nil {
				logger.Logger.Errorf("异步消息发送失败: %v", err)
			}
		}
	}
}

// SendMessageAsync 异步发送消息到指定的topic
func (p *KafkaAsyncProducer) SendMessage(ctx context.Context, topic string, key string, value []byte) error {
	p.mutex.RLock()
	if p.closed {
		p.mutex.RUnlock()
		return fmt.Errorf("异步producer已关闭")
	}
	p.mutex.RUnlock()

	// 创建消息
	msg := &sarama.ProducerMessage{
		Topic:     topic,
		Key:       sarama.StringEncoder(key),
		Value:     sarama.ByteEncoder(value),
		Timestamp: time.Now(),
		Headers: []sarama.RecordHeader{
			{
				Key:   []byte("timestamp"),
				Value: []byte(fmt.Sprintf("%d", time.Now().Unix())),
			},
		},
	}

	// 异步发送消息
	select {
	case p.producer.Input() <- msg:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Close 安全关闭异步生产者
func (p *KafkaAsyncProducer) Close() error {
	p.mutex.Lock()
	defer p.mutex.Unlock()

	if p.closed {
		return nil
	}

	if err := p.producer.Close(); err != nil {
		logger.Logger.Errorf("关闭Kafka异步生产者失败: %v", err)
		return fmt.Errorf("关闭Kafka异步生产者失败: %w", err)
	}

	p.closed = true
	return nil
}

// IsHealthy 检查异步生产者健康状态
func (p *KafkaAsyncProducer) IsHealthy() bool {
	p.mutex.RLock()
	defer p.mutex.RUnlock()
	return !p.closed
}

// KafkaConsumer Kafka消费者结构体
type KafkaConsumer struct {
	consumer sarama.ConsumerGroup
	topics   []string
	groupID  string
	closed   bool
	mutex    sync.RWMutex
	handlers map[string]func(message *sarama.ConsumerMessage) error
}

// ConsumerHandler 实现 sarama.ConsumerGroupHandler 接口
type ConsumerHandler struct {
	consumer *KafkaConsumer
}

// Setup 在消费者会话开始时调用
func (h *ConsumerHandler) Setup(_ sarama.ConsumerGroupSession) error {
	return nil
}

// Cleanup 在消费者会话结束时调用
func (h *ConsumerHandler) Cleanup(_ sarama.ConsumerGroupSession) error {
	return nil
}

// ConsumeClaim 处理消息的主要方法
func (h *ConsumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for message := range claim.Messages() {
		if handler, ok := h.consumer.handlers[message.Topic]; ok {
			if err := handler(message); err != nil {
				logger.Logger.Errorf("处理消息失败: topic=%s, partition=%d, offset=%d, error=%v",
					message.Topic, message.Partition, message.Offset, err)
			} else {
				session.MarkMessage(message, "")
			}
		}
	}
	return nil
}

// NewKafkaConsumer 创建一个新的Kafka消费者（单例模式）
func NewKafkaConsumer(groupID string, topics []string) (*KafkaConsumer, error) {
	var err error
	consumerOnce.Do(func() {
		consumerInstance, err = initConsumer(groupID, topics)
	})
	if err != nil {
		return nil, fmt.Errorf("初始化Kafka消费者失败: %w", err)
	}
	return consumerInstance, nil
}

// initConsumer 初始化消费者
func initConsumer(groupID string, topics []string) (*KafkaConsumer, error) {
	config := sarama.NewConfig()

	// TLS配置
	if serverConfig.Conf.Kafka.TLS.Enable {
		config.Net.TLS.Enable = true
		tlsConfig := &tls.Config{
			InsecureSkipVerify: serverConfig.Conf.Kafka.TLS.SkipVerify,
		}

		if serverConfig.Conf.Kafka.TLS.CaFile != "" {
			caCert, err := os.ReadFile(serverConfig.Conf.Kafka.TLS.CaFile)
			if err != nil {
				return nil, fmt.Errorf("读取CA证书失败: %w", err)
			}
			caCertPool := x509.NewCertPool()
			caCertPool.AppendCertsFromPEM(caCert)
			tlsConfig.RootCAs = caCertPool
		}

		if serverConfig.Conf.Kafka.TLS.CertFile != "" && serverConfig.Conf.Kafka.TLS.KeyFile != "" {
			cert, err := tls.LoadX509KeyPair(
				serverConfig.Conf.Kafka.TLS.CertFile,
				serverConfig.Conf.Kafka.TLS.KeyFile,
			)
			if err != nil {
				return nil, fmt.Errorf("加载客户端证书失败: %w", err)
			}
			tlsConfig.Certificates = []tls.Certificate{cert}
		}

		config.Net.TLS.Config = tlsConfig
	}

	// 版本设置
	version, err := sarama.ParseKafkaVersion(serverConfig.Conf.Kafka.Version)
	if err != nil {
		return nil, fmt.Errorf("解析Kafka版本失败: %w", err)
	}
	config.Version = version

	// 设置客户端ID
	config.ClientID = serverConfig.Conf.Kafka.ClientID

	// 消费者配置
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRoundRobin()

	// 设置偏移量重置策略
	switch serverConfig.Conf.Kafka.Consumer.AutoOffsetReset {
	case "earliest":
		config.Consumer.Offsets.Initial = sarama.OffsetOldest
	default:
		config.Consumer.Offsets.Initial = sarama.OffsetNewest
	}

	// 自动提交配置
	config.Consumer.Offsets.AutoCommit.Enable = true
	config.Consumer.Offsets.AutoCommit.Interval = serverConfig.Conf.Kafka.Consumer.HeartbeatInterval

	// 会话超时和心跳间隔
	config.Consumer.Group.Session.Timeout = serverConfig.Conf.Kafka.Consumer.SessionTimeout
	config.Consumer.Group.Heartbeat.Interval = serverConfig.Conf.Kafka.Consumer.HeartbeatInterval
	config.Consumer.Group.Rebalance.Timeout = serverConfig.Conf.Kafka.Consumer.RebalanceTimeout

	// 创建消费者组
	group, err := sarama.NewConsumerGroup(serverConfig.Conf.Kafka.Brokers, groupID, config)
	if err != nil {
		return nil, fmt.Errorf("创建消费者组失败: %w", err)
	}

	return &KafkaConsumer{
		consumer: group,
		topics:   topics,
		groupID:  groupID,
		closed:   false,
		handlers: make(map[string]func(message *sarama.ConsumerMessage) error),
	}, nil
}

// RegisterHandler 注册消息处理器
func (c *KafkaConsumer) RegisterHandler(topic string, handler func(message *sarama.ConsumerMessage) error) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.handlers[topic] = handler
}

// Start 启动消费者
func (c *KafkaConsumer) Start(ctx context.Context) error {
	handler := &ConsumerHandler{consumer: c}

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			err := c.consumer.Consume(ctx, c.topics, handler)
			if err != nil {
				if err == sarama.ErrClosedConsumerGroup {
					return nil
				}
				logger.Logger.Errorf("消费消息失败: %v", err)
				return err
			}
		}
	}
}

// Close 安全关闭消费者
func (c *KafkaConsumer) Close() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	if c.closed {
		return nil
	}

	if err := c.consumer.Close(); err != nil {
		logger.Logger.Errorf("关闭Kafka消费者失败: %v", err)
		return fmt.Errorf("关闭Kafka消费者失败: %w", err)
	}

	c.closed = true
	return nil
}

// IsHealthy 检查消费者健康状态
func (c *KafkaConsumer) IsHealthy() bool {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return !c.closed
}
