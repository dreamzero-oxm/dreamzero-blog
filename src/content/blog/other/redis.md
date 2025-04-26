---
title: Redis学习
description: Redis学习
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Redis
updated: 2022-07-28
comments: false
---
# Redis学习

## 1.NoSQL

NoSQL特点

非关系型数据库，不依赖业务逻辑数据库存储，以简单key-value存储

**适用于**

* 高并发读写
* 海量数据读写
* 数据可扩展

**不适用于** 事务存储 以及复杂数据库

**NoSQL优点**
1.缓存数据库，完全在内存中，速度快，数据结构简单
2.减少io操作，数据库和表拆分，虽然破坏业务逻辑，即外加一个缓存数据库，提高数据库速度，也可以用专门的存储方式，以及针对不同的数据结构存储

## 2.Redis

默认6379端口号
与memcache三点不同，支持多数据类型，持久化，单线程+多路io口复用

## 3.软件安装

高速缓存 可持久化 开源key-value存储系统 支持多个类型集合 不同方式的排序 实现主从操作等
下载redis以及编译安装

1. 官网下载redis文件
2. 复制到/opt目录下cp /home/gaokaoli/Downloads/redis-6.2.3.tar.gz /opt
3. 查看是否安装了gcc编译输入gcc --version
4. 如果没有安装gcc，则输入yum install -y gcc，安装了忽视这一步
   

进入目录号`cd /opt/redis-6.2.3`进行`make`编译以及`make install`安装即可
如果make install显示出错，少了一个文件
**解决方案：**

```
1.是否安装了gcc
2.重新输入make distclean
make
make install
```

**判断是否安装成功：**
在/usr/local/bin中ls

**前台打开（不推荐）**

```
cd /usr/local/bin
redis-server
```

**后台打开**

拷贝一份redis.conf到其他目录
设置redis.conf的daemonize值为yes
启动redis 以及客户端

```
cp /opt/redis-6.2.3/redis.conf /etc/redis.conf
cd /usr/local/bin
redis-server /etc/redis.conf
```

**查看是否在运行**

```
ps -ef |grep redis
```

## 4. 数据类型

### 4.1key值键位

```java
keys * //查看当前库所有key
set key value //设置key值与value
exists key //判断key是否存在
type key //查看key是什么类型
del key //删除指定的key数据
unlink key //根据value选择非阻塞删除
------仅将keys从keyspace元数据中删除，真正的删除会在后续异步操作。
expire key 10 10秒钟：//为给定的key设置过期时间
ttl key //查看还有多少秒过期，-1表示永不过期，-2表示已过期
```

**库的选择：**

```java
select //命令切换数据库
dbsize //查看当前数据库的key数量
flushdb //清空当前库
flushall //通杀全部库
```

### 4.2string字符串

- 一个key对应一个value
- 二进制安全的，即可包含任何数据
- value最多可以是512m

参数设置：

```java
set key value //设置key值
get key //查询key值
append key value //将给定的value追加到原值末尾
strlen key //获取值的长度
setex key second value//设置一个key值，同时设置过期时间（会覆盖掉原有的）(set with expire)
setnx key value //只有在key不存在的时候，设置key值  (set if not exist)
incr key //将key值存储的数字增1，只对数字值操作，如果为空，新增值为1
decr key //将key值存储的数字减1，只对数字值操作，如果为空，新增值为1
decr key //将key值存储的数字减1
incrby/decrby key <步长> //将key值存储的数字增减如步长
```

**补充：**
原子操作
不会被打断，从开始到结束
单线程不会被打断
多线程很难说，被打断的就不是原子操作

补充额外的字符串参数：

```java
mset key value key value…//同时设置一个或者多个key-value
mget key key…//同时获取一个或多个value
msetnx key value key value…//同时设置一个或者多个key-value.当且仅当所有给定key都不存在 (msetnx是一个原子性的操作，要么一起成功，要么一起失败)
getrange key <起始位置> <结束位置> //获取key的起始位置和结束位置的值
setrange key <起始位置> value //将value的值覆盖起始位置开始
setex key <> value //设置键值的同时,设置过期时间
getset key value //用新值换旧值
    
//对象
set user:1 {name:zhangsan,age:15}
//设置一个user:1对象，将它的值设为一个json字符来保存一个对象

mset user:1:name zhangsan user:1:age 15
mget user:1:name user:1:age
```

**数据结构是相同的**

String类似的使用场景：

​	value除了是我们的字符串还可以是我们的数字

* 计数器
* 统计多单位数量
* 对象缓存存储

### 4.3list列表

**常用命令:**

```java
lpush/rpush key value value…//从左或者右插入一个或者多个值(头插与尾插)
lpop/rpop key //从左或者右吐出一个或者多个值(值在键在,值都没,键都没)
rpoplpush key1 key2 //从key1列表右边吐出一个值,插入到key2的左边
lrange key start stop //按照索引下标获取元素(从左到右)
lrange key 0 -1 //获取所有值
lindex key index //按照索引下标获得元素
llen key //获取列表长度

linsert key before/after value newvalue //在value的前面插入一个新值
lrem key n value //从左边删除n个value值
lset key index value //在列表key中的下标index中修改值value
ltrim key startIndex endIndex //在列表key中截取固定部分(通过下标截取指定的长度，这个list已经被改变了，截断 了只剩下截取的元素)
```

### 4.4set集合

字典，哈希表
自动排重且为无序的
**常用命令:**

```java
sadd key value value… //将一个或者多个member元素加入集合key中,已经存在的member元素被忽略
smembers key //取出该集合的所有值
sismember key value //判断该集合key是否含有改值
scard key //返回该集合的元素个数
srem key value value //删除集合中的某个元素
spop key //随机从集合中取出一个元素
srandmember key n //随即从该集合中取出n个值，不会从集合中删除
smove <一个集合a><一个集合b>value //将一个集合a的某个value移动到另一个集合b
sinter key1 key2 //返回两个集合的交集元素
sunion key1 key2 //返回两个集合的并集元素
sdiff key1 key2 //返回两个集合的差集元素（key1有的，key2没有）
```

### 4.5hash哈希

键值对集合，特别适合用于存储对象类型
**常用命令：**

```java
hset key field value //给key集合中的filed键赋值value
hget key1 field //集合field取出value
hmset key1 field1 value1 field2 value2 //批量设置hash的值
hexists key1 field //查看哈希表key中，给定域field是否存在
hkeys key //列出该hash集合的所有field
hvals key //列出该hash集合的所有value
hincrby key field increment //为哈希表key中的域field的值加上增量1 -1
hsetnx key field value //将哈希表key中的域field的值设置为value，当且仅当域field不存在
```

例如 hset user:1000 id 1

### 4.6Zset有序集合

没有重复元素的字符串集合，按照相关的分数进行排名
常用命令：

```java
zadd key score1 value1 score2 value2 //将一个或多个member元素及其score值加入到有序key中
zrange key start stop (withscores) //返回有序集key，下标在start与stop之间的元素，带withscores，可以让分数一起和值返回到结果集。
zrangebyscore key min max(withscores) //返回有序集key，所有score值介于min和max之间（包括等于min或max）的成员。有序集成员按score的值递增次序排列
zrevrangebyscore key max min （withscores）//同上，改为从大到小排列
zincrby key increment value //为元素的score加上增量
zrem key value //删除该集合下，指定值的元素
zcount key min max //统计该集合，分数区间内的元素个数
zrank key value //返回该值在集合中的排名，从0开始
```

## 5.新数据类型

### 5.1Bitmaps

1. 合理使用操作位可以有效地提高内存使用率和开发使用率
2. 本身是一个字符串，不是数据类型，数组的每个单元只能存放0和1，数组的下标在Bitmaps叫做偏移量
3. 节省空间，一般存储活跃用户比较多

**命令参数：**

#### 5.1.1.设置值

```bash
setbit key offset value
```

第一次初始化bitmaps，如果偏移量比较大，那么整个初始化过程执行会比较慢，还可能会造成redis的堵塞

#### 5.1.2.getbit取值

```bash
getbit key offset 
```

获取bitmaps中某个偏移量的值
获取键的第offset位的值

#### 5.1.3.bitcount 统计数值

```bash
bitcount key （start end）
```

统计字符串从start 到end字节比特值为1的数量

**redis的setbit设置或清除的是bit位置，而bitcount计算的是byte的位置**

**4.bitop**
复合操作，交并非异或，结果保存在destkey

```bash
bitop and(or/not/xor）destkey key
```

这个key放两个key1 key2

### 5.2HyperLogLog

1. 统计网页中页面访问量
2. 只会根据输入元素来计算基数，而不会储存输入元素本身，不能像集合那样，返回输入的各个元素
3. 基数估计是在误差可接受的范围内，快速计算（不重复元素的结算）

命令参数：

#### 5.2.1.添加指定的元素到hyperloglog中

```
pfadd key element
```

列如 pfdd progame “java”
成功则返回1，不成功返回0

#### 5.2.2.计算key的近似基数

```
pfcount key 
```

即这个key的键位添加了多少个不重复元素

#### 5.2.3.一个或多个key合并后的结果存在另一个key

```
pfmerge destkey sourcekey sourcekey
```

### 5.3Geographic

提供经纬度设置，查询范围，距离查询等

命令参数：

#### 5.3.1.添加地理位置（经度纬度名称）

当坐标超出指定的范围，命令会返回一个错误
已经添加的数据，无法再添加

```
geoadd key longitude latitude member
```

例如 geoadd china:city 121.47 31.23 shanghai

#### 5.3.2.获取指定地区的坐标值

```
geopos key member 
```

例如 geopos china:city shanghai

#### 5.3.3.获取两个位置之间的直线距离

```
geodist key member1 member2 (m km ft mi)
```

#### 5.3.4.以给定的经纬度为中心，找出某一半径的内元素

```
georadius key longitude latitude radius (m km ft mi)
```

#### 5.3.5.以指定的成员为中心，找出某一半径的内元素

```bush
georadiusbymember key member radius (m km ft mi)
```

#### 5.3.6.返回一个或多个位置元素的Geohash表示

```bash
#将二维的经纬度转换为一维的字符串，如果两个字符串越相近，那么则距离越短
127.0.0.1:6379> GEOHASH china:city shanghai guangzhou 
1) "wtw3sj5zbj0"
2) "ws0e9cb3yj0"
```

#### 注意

​	**GEO底层的实现原理其实是Zset，可以用Zset命令操作Geo**

## 6.Redis的事务操作

单独的隔离操作

> 事务中的所有命令都会序列化
> 按顺序执行
> 执行的过程中，不会被其他命令请求所打断

串联多个命令防止别的命令插队

> multi为组队阶段，还未执行
> exec为执行阶段，将multi的队列放进exec中
> discard 即放弃multi在队列中的值

**编译形异常（代码有问题，命令有错），事物中所有的命令都不会被执行**

**运行时异常（1/0），如果事物队列中存在语法性，那么执行命令的时候，其他命令是可以正常执行的，错误命令抛出异常**

