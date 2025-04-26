---
title: MyBatis-Plus（Spring Boot）
description: MyBatis-Plus（Spring Boot）
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - SpringBoot
updated: 2022-07-28
comments: false
---
## MyBatis-Plus（Spring Boot）

## 1.特性

* **无侵入：**只做增强不做改变，引入它不会对现有工程产生影响，如丝般顺滑
* **损耗小：**启动即会自动注入基本 CURD，性能基本无损耗，直接面向对象操作
* **强大的 CRUD 操作：**内置通用 Mapper、通用 Service，仅仅通过少量配置即可实现单表大部分 CRUD 操作，更有强大的条件构造器，满足各类使用需求
* **支持 Lambda 形式调用：**通过 Lambda 表达式，方便的编写各类查询条件，无需再担心字段写错
* **支持主键自动生成:**支持多达 4 种主键策略（内含分布式唯一 ID 生成器 - Sequence），可自由配置，完美解决主键问题
* **支持 ActiveRecord 模式：**支持 ActiveRecord 形式调用，实体类只需继承 Model 类即可进行强大的 CRUD 操作
* **支持自定义全局通用操作：**支持全局通用方法注入（ Write once, use anywhere ）
* **内置代码生成器：**采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码，支持模板引擎，更有超多自定义配置等您来使用
* **内置分页插件：**基于 MyBatis 物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于普通 List 查询
* **分页插件支持多种数据库**：支持 MySQL、MariaDB、Oracle、DB2、H2、HSQL、SQLite、Postgre、SQLServer 等多种数据库
* **内置性能分析插件：**可输出 Sql 语句以及其执行时间，建议开发测试时启用该功能，能快速揪出慢查询
* **内置全局拦截插件：**提供全表 delete 、 update 操作智能分析阻断，也可自定义拦截规则，预防误操作上原文出处链接及本声明。

## 2. 快速入门/基础配置

### 2.1 创建数据库，创建表，创建数据

### 2.2 导入依赖

```xml
<!-- https://mvnrepository.com/artifact/com.baomidou/mybatis-plus-boot-starter -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.3.2</version>
</dependency>
```

**springboot中基本的导包**

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.0</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.49</version>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.12</version>
    <scope>provided</scope>
</dependency>
```

### 2.3 比较与以前的mybatis，用了plus之后

**pojo**

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```

**mapper**

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.codeyuaiiao.pojo.User;
import org.springframework.stereotype.Repository;

//在对应的mapper上面继承基本的类 BaseMapper
@Repository//代表持久层
public interface UserMapper extends BaseMapper<User> {
    //所有CRUD操作都已经编写完成了
    //你不需要向以前一样配置一大堆文件了!
}
```

注意点:需要在主启动类`MybatisPlusApplication`上扫描我们Mapper包下的所有接口

```
@MapperScan("com.codeyuaiiao.mapper")
```

**配置 MapperScan 注解**

MapperScan中是需要扫描的Dao层包

```java
@SpringBootApplication
@MapperScan("com.moity.mapper")
public class MpDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MpDemoApplication.class, args);
    }

}
```

### 2.4 连接数据库配置application.yml文件

```YAML
#mysql
#数据库连接配置
spring: 
	datasource: 
		driver-class-name: com.mysql.cj.jdbc.Driver
		url: jdbc:mysql://localhost:3306/mybatis_plus?useSSL=false&useUnicode=true&characterEncoding=utf-8
		username: root
		password: 123456

#mybatis-plus
# 配置日志  (默认控制台输出)
mybatis-plus: 
	configuration:
		log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```



## 3. CRUD扩展

### 3.1 插入数据

```java
@Test
public void testInsert(){
    User user = new User();
    user.setName("moity");
    user.setAge(3);
    user.setEmail("123123123@qq.com");
    //参数是一个实体类
    int result = userMapper.insert(user);
    System.out.println(result);
    System.out.println(user);

}
```

### 3.2 主键生成策略

```
默认 ID_WORKER 全局唯一id

对应数据库中的主键(uuid.自增id.雪花算法.redis.zookeeper)
```

**雪花算法： Twitter的snowflake算法**

snowflake是Twitter开源的分布式ID生成算法，结果是一个long型的ID。其核心思想是：使用41bit作为毫秒数，10bit作为机器的ID（5个bit是数据中心，5个bit的机器ID），12bit作为毫秒内的流水号（意味着每个节点在每毫秒可以产生 4096 个 ID），最后还有一个符号位，永远是0.可以保证几乎全球唯一

**主键自增**

我们需要配置主键自增:

1. 实体类字段上`@TableId(type = IdType.AUTO)`
2. 数据库字段一定要是**自增**!

**其余源码解释**

```java
public enum IdType {
     
    AUTO(0),//数据库ID自增  
    NONE(1),//该类型为未设置主键类型      
    INPUT(2),//用户输入ID
      		 //该类型可以通过自己注册自动填充插件进行填充  
    
//以下3种类型、只有当插入对象ID 为空，才自动填充。     
    ID_WORKER(3),//全局唯一ID (idWorker)      
    UUID(4),//全局唯一ID (UUID)          
    ID_WORKER_STR(5);//字符串全局唯一ID (idWorker 的字符串表示)    
}
```

### 3.3 更新数据

**动态sql**

**注意:updateById()参数是 一个对象!**

```java
//测试更新
@Test
public void testUpdate(){
    User user = new User();
    user.setId(2L);
    user.setName("啊实打实的");
    //        注意:updateById()参数是 一个对象!
    int i = userMapper.updateById(user);
    System.out.println(i);

}
```

### 3.4 自动填充

创建时间 . 修改时间! 这些个操作都是自动化完成的,我们不希望手动更新!

阿里巴巴开发手册:所有的数据库表:gmt_create .gmt_modified几乎所有的表都要配置上!而且需要自动化!

#### 3.4.1 方式一:数据库级别

1. 在表中新增字段 create_time , update_time

2. 再次测试插入方法,我们需要先把实体类同步

   ```java
   private Data creatTime;
   private Data updateTime;
   ```

#### 3.4.2 方式二:代码级别

1. 删除数据库默认值

2. 实体类字段属性上添加注解

   ```java
   //记住用util包下的Date!!
   //字段添加填充内容
   @TableField(fill = FieldFill.INSERT)
   private Data creatTime;
   
   @TableField(fill = FieldFill.INSERT_UPDATE)
   private Data updateTime;
   ```

3. 编写处理器来处理这个注解

   ```java
   @Slf4j
   @Component //把处理器加到IOC容器中
   public class MyMetaObjectHandler implements MetaObjectHandler {
   
       //插入时的填充策略
       @Override
       public void insertFill(MetaObject metaObject) {
           log.info("Start insert fill.... ");
           this.setFieldValByName("createTime",new Date(),metaObject);
           this.setFieldValByName("updateTime",new Date(),metaObject);
       }
   
       //更新时的填充策略
       @Override
       public void updateFill(MetaObject metaObject) {
           log.info("Start update fill.... ");
           this.setFieldValByName("updateTime",new Date(),metaObject);
       }
   }
   ```

### 3.5 乐观锁

**乐观锁: 顾名思义十分乐观,他总是认为不会出现问题,无论干什么都不去上锁!如果出现了问题,再次更新值测试**

**悲观锁;顾名思义十分悲观,他总是认为出现问题,无论干什么都会上锁!再去操作!**

我们这里主要讲解 **乐观锁机制**

乐观锁实现方式:

- 取出记录时,获取当前version
- 更新时,带上这个version
- 执行更新时,set version = newVersion where version = oldVersion
- 如果version不对,就更新失败

```java
//测试查询
@Test
public void testSelectById(){
    User user = userMapper.selectById(1L);
    System.out.println(user);
}

//测试批量查询
public void testSelectBatchId(){
    List<User> users = userMapper.selectBatchIds(Arrays.asList(1, 2, 3));
    users.forEach(System.out::println);
}

//按条件查询之--使用Map操作
@Test
public void testSelectBatchIds(){
    HashMap<String, Object> map = new HashMap<>();
    map.put("name","阿峧说java");
    map.put("age","18");

    List<User> users = userMapper.selectByMap(map);
    users.forEach(System.out::println);
}
```

**乐观锁配置需要两步**

#### 3.5.1 配置插件

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    return interceptor;
}
```

#### 3.5.2在实体类的字段上加上`@Version`注解

```java
@Version
private Integer version;
```

说明:

- **支持的数据类型只有:int,Integer,long,Long,Date,Timestamp,LocalDateTime**
- 整数类型下 `newVersion = oldVersion + 1`
- `newVersion` 会**回写**到 `entity` 中
- 仅支持 `updateById(id)` 与 `update(entity, wrapper)` 方法
- **在 `update(entity, wrapper)` 方法下, `wrapper` 不能复用!!!**

### 3.6 查询操作

```java
//测试查询
@Test
public void testSelectById(){
    //通过id查询
    User user = userMapper.selectById(1L);
    System.out.println(user);
}

//测试批量查询
public void testSelectBatchId(){
    //通过id批量查询
    List<User> users = userMapper.selectBatchIds(Arrays.asList(1, 2, 3));
    users.forEach(System.out::println);
}

//按条件查询之--使用Map操作
@Test
public void testSelectBatchIds(){
    //条件查询，map里面是条件
    HashMap<String, Object> map = new HashMap<>();
    map.put("name","阿斯顿阿斯顿");
    map.put("age","18");

    List<User> users = userMapper.selectByMap(map);
    users.forEach(System.out::println);
}
```

### 3.7 逻辑删除

```
物理删除:从数据库中直接移除

逻辑删除: 在数据库中没有被移除,而是通过一个变量来让他失效! deleted=0=>deleted=1
```

**管理员可以查看被删除的记录!防止数据的丢失,类似于回收站!**

**说明:**

只对自动注入的sql起效:

- 插入: 不作限制
- 查找: 追加where条件过滤掉已删除数据,且使用 wrapper.entity 生成的where条件会忽略该字段
- 更新: 追加where条件防止更新到已删除数据,且使用 wrapper.entity 生成的where条件会忽略该字段
- 删除: 转变为 更新

例如:

- 删除: `update user set deleted=1 where id = 1 and deleted=0`
- 查找: `select id,name,deleted from user where deleted=0`

字段类型支持说明:

- 支持所有数据类型(推荐使用 `Integer`,`Boolean`,`LocalDateTime`)
- 如果数据库字段使用`datetime`,逻辑未删除值和已删除值支持配置为字符串`null`,另一个值支持配置为函数来获取值如`now()`

附录:

- 逻辑删除是为了方便数据恢复和保护数据本身价值等等的一种方案，但实际就是删除。
- 如果你需要频繁查出来看就不应使用逻辑删除，而是以一个状态去表示。

#### 3.7.1 配置

**application.yml文件**

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: flag  # 全局逻辑删除的实体字段名(since 3.3.0,配置后可以忽略不配置步骤2)
      logic-delete-value: 1 # 逻辑已删除值(默认为 1)
      logic-not-delete-value: 0 # 逻辑未删除值(默认为 0)
```

#### 3.7.2 实体类字段上加上`@TableLogic`注解

```java
@TableLogic
private Integer deleted;
```

**原本要配置逻辑删除相关的bean，但在3.1.1版本之后就不用配置了，可以直接使用**

### 3.8 分页查询

```java
//Spring boot方式
@Configuration
@MapperScan("com.baomidou.cloud.service.*.mapper*")
public class MybatisPlusConfig {
    
    // 最新版
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.H2));
        return interceptor;
    }
    
}
```

```java
public IPage<User> selectUserPage(Page<User> page, Integer state) {
    // 不进行 count sql 优化，解决 MP 无法自动优化 SQL 问题，这时候你需要自己查询 count 部分
    // page.setOptimizeCountSql(false);
    // 当 total 为小于 0 或者设置 setSearchCount(false) 分页插件不会进行 count 查询
    // 要点!! 分页返回的对象与传入的对象是同一个
    return userMapper.selectPageVo(page, state);
}
```

**分页返回的对象与传入的对象是同一个**

**例子：**

```java
public void test() {
    Page<User> page = new Page<>(1,5);	//第一个参数是current（第几页），第二个参数是size（一页多少数据）
    userMapper.selectPageVo(page, null);	//参数：(page,wrapper)
    page.getRecords.forEach(System.out::println);
}
```

## 4. 性能分析插件

我们在平时的开发中,会遇到一些慢sql.

MP也提供了性能分析插件,如果超过这个时间就停止运行!

**导入插件**

```java
    @Bean
    @Profile({"dev","test"}) //设置dev 和 test环境开启
    public PerformanceInterceptor performanceInterceptor(){
        PerformanceInterceptor performanceInterceptor = new PerformanceInterceptor();
        performanceInterceptor.setMaxTime(1000);	//语句最大执行时间 单位是ms
        performanceInterceptor.setFormat(true);
        return performanceInterceptor;
    }
```

**记住在SpringBoot中配置环境为 dev或者test环境**

**application.properties中添加设置开发环境**

```properties
#设置开发环境
spring.profiles.active=dev
```







