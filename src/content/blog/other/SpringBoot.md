---
title: SpringBoot
description: SpringBoot
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
# SpringBoot

## 1. 配置文件

### 1.1 配置文件前述(配置文件加载位置)

如果我们需要更改一些默认配置，我们需要手动更改
**SpringBoot中配置文件有两种，一种是.properties 另一种是 .yml** 

**配置文件的放置路径：**

1. file:./config  	
2. file:./
3. classpath:/config/
4. classpath:/

```
优先级1：项目路径下的config文件夹配置文件
优先级2：项目路径下配置文件
优先级3：资源路径下的config文件夹配置文件
优先级4：资源路径下配置文件
```

**SpringBoot会从这四个位置全部加载主配置文件；互补配置；**

### 1.2 多配置文件

我们在主配置文件编写的时候，文件名可以是 application-{profile}.properties/yml , 用来指定多个环境版本；

**例如：**

application-test.properties 代表测试环境配置

application-dev.properties 代表开发环境配置

但是Springboot并不会直接启动这些配置文件，它**默认使用application.properties主配置文件**；
我们需要通过一个配置来选择需要激活的环境：

```properties
#比如在配置文件中指定使用dev环境，我们可以通过设置不同的端口号进行测试；
#我们启动SpringBoot，就可以看到已经切换到dev下的配置了；
spring.profiles.active=dev
```

### 1.3 yaml的多文档块

和properties配置文件中一样，但是使用yml去实现不需要创建多个配置文件，更加方便了 

```yaml

server:
  port: 8081
#选择要激活那个环境块
spring:
  profiles:
    active: prod

---
server:
  port: 8083
spring:
  profiles: dev #配置环境的名称


---

server:
  port: 8084
spring:
  profiles: prod  #配置环境的名称
```

**如果yml和properties同时都配置了端口，并且没有激活其他环境 ， 默认会使用properties配置文件的！**

## 2. yaml配置注入

SpringBoot使用一个全局的配置文件 ， 配置文件名称是固定的

- application.properties

- - 语法结构 ：key=value

- application.yml

- - 语法结构 ：key：空格 value

**配置文件的作用 ：**修改SpringBoot自动配置的默认值，因为SpringBoot在底层都给我们自动配置好了；

### 2.1 yaml概述

传统xml配置：

```xml
<server>
    <port>8081<port>
</server>
```

yaml配置：

```yaml
server:
	port: 8888 
```

### 2.2 yaml基础语法

#### 2.2.1 **说明：语法要求严格！**

1、空格不能省略

2、以缩进来控制层级关系，只要是左边对齐的一列数据都是同一个层级的。

3、属性和值的大小写都是十分敏感的。

#### 2.2.2 **字面量：普通的值  [ 数字，布尔值，字符串  ]**

字面量直接写在后面就可以 ， 字符串默认不用加上双引号或者单引号；

```yaml
key: value
```

注意：

- “ ” 双引号，不会转义字符串里面的特殊字符 ， 特殊字符会作为本身想表示的意思；

  比如 ：name: "kuang \n shen"  输出 ：kuang  换行  shen

- '' 单引号，会转义特殊字符 ， 特殊字符最终会变成和普通字符一样输出

  比如 ：name: ‘kuang \n shen’  输出 ：kuang  \n  shen

#### **2.2.3 对象、Map（键值对）**

```yaml
#对象、Map格式
k: 
    v1:
    v2:
```

在下一行来写对象的属性和值得关系，注意缩进；比如：

```yaml
student:
    name: qinjiang
    age: 3
```

行内写法

```yaml
student: {name: qinjiang,age: 3}
```

#### 2.2.4 数组（ List、set ）

用 - 值表示数组中的一个元素,比如：

```yaml
pets:
 - cat
 - dog
 - pig
```

行内写法

```yaml
pets: [cat,dog,pig]
```

**修改SpringBoot的默认端口号**

配置文件中添加，端口号的参数，就可以切换端口；

```yaml
server:
  port: 8082
```

### 2.3 注入配置文件

#### 2.3.1 yaml注入配置文件

在springboot项目中的resources目录下新建一个文件 application.yml

```java
@Component //注册bean到容器中
public class Person {
    private String name;
    private Integer age;
    private Boolean happy;
    private Date birth;
    private Map<String,Object> maps;
    private List<Object> lists;
    private Dog dog;
    
    //有参无参构造、get、set方法、toString()方法  
}
```

```yaml
person:
  name: qinjiang
  age: 3
  happy: false
  birth: 2000/01/01
  maps: {k1: v1,k2: v2}
  lists:
   - code
   - girl
   - music
  dog:
    name: 旺财
    age: 1
```

```java
/*
@ConfigurationProperties作用：
将配置文件中配置的每一个属性的值，映射到这个组件中；
告诉SpringBoot将本类中的所有属性和配置文件中相关的配置进行绑定
参数 prefix = “person” : 将配置文件中的person下面的所有属性一一对应
*/
@Component //注册bean
@ConfigurationProperties(prefix = "person")
public class Person {
    private String name;
    private Integer age;
    private Boolean happy;
    private Date birth;
    private Map<String,Object> maps;
    private List<Object> lists;
    private Dog dog;
}
```

```xml
<!-- 导入配置文件处理器，配置文件进行绑定就会有提示，需要重启 -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-configuration-processor</artifactId>
  <optional>true</optional>
</dependency>
```

### 2.4 加载指定的配置文件

**@PropertySource ：**加载指定的配置文件；

**@configurationProperties**：默认从全局配置文件中获取值；

去resource目录下新建一个person.properties文件

```properties
name=moity
```

```java
@PropertySource(value = "classpath:person.properties")
@Component //注册bean
public class Person {

    @Value("${name}")
    private String name;

    ......  
}
```

### 2.5 配置文件占位符

配置文件还可以编写占位符生成随机数

```yaml
person:
    name: qinjiang${random.uuid} # 随机uuid
    age: ${random.int}  # 随机int
    happy: false
    birth: 2000/01/01
    maps: {k1: v1,k2: v2}
    lists:
      - code
      - girl
      - music
    dog:
      name: ${person.hello:other}_旺财
      age: 1
```

### 2.6 小结

@Value这个使用起来并不友好！我们需要为每个属性单独注解赋值，比较麻烦；我们来看个功能对比图

![image-20210826001142461](http://moity-bucket.moity-soeoe.xyz/img/image-20210826001142461.png)

1、@ConfigurationProperties只需要写一次即可 ， @Value则需要每个字段都添加

2、松散绑定：这个什么意思呢? 比如我的yml中写的last-name，这个和lastName是一样的， - 后面跟着的字母默认是大写的。这就是松散绑定。可以测试一下

3、JSR303数据校验 ， 这个就是我们可以在字段是增加一层过滤器验证 ， 可以保证数据的合法性

4、复杂类型封装，yml中可以封装对象 ， 使用value就不支持

## 3. JSR303数据校验

Springboot中可以用@validated来校验数据，如果数据异常则会统一抛出异常，方便异常中心统一处理

```java
//检验name是否是邮箱格式
@Component //注册bean
@ConfigurationProperties(prefix = "person")
@Validated  //数据校验
public class Person {
	//message是异常信息
    @Email(message="邮箱格式错误") //name必须是邮箱格式
    private String name;
}
```

**使用数据校验，可以保证数据的正确性；** 

### 3.1 常见参数

```java

@NotNull(message="名字不能为空")
private String userName;
@Max(value=120,message="年龄最大不能查过120")
private int age;
@Email(message="邮箱格式错误")
private String email;

空检查
@Null       验证对象是否为null
@NotNull    验证对象是否不为null, 无法查检长度为0的字符串
@NotBlank   检查约束字符串是不是Null还有被Trim的长度是否大于0,只对字符串,且会去掉前后空格.
@NotEmpty   检查约束元素是否为NULL或者是EMPTY.
    
Booelan检查
@AssertTrue     验证 Boolean 对象是否为 true  
@AssertFalse    验证 Boolean 对象是否为 false  
    
长度检查
@Size(min=, max=) 验证对象（Array,Collection,Map,String）长度是否在给定的范围之内  
@Length(min=, max=) string is between min and max included.

日期检查
@Past       验证 Date 和 Calendar 对象是否在当前时间之前  
@Future     验证 Date 和 Calendar 对象是否在当前时间之后  
@Pattern    验证 String 对象是否符合正则表达式的规则
```

## 4. @ConfigurationProperties注解

使用@PropertySource注解读取配置文件的方法，使代码复用性大大降低。因此引入了@ConfigurationProperties注解，自定义配置类，通过配置类获取配置文件中的信息，提高程序的灵活性。

在springboot中，@ConfigurationProperties会获取工程配置文件中的信息（即application.properties 和 application.yml，如果想或许其他配置文件中的信息 ，可以使用@PropertySource注解指定文件位置）。通过属性prefix指定获取配置文件中的值。
如：
application.yml

```yaml
jdbc:
  url: jdbc:mysql://localhost:3306/test
  username: root
  password: root
  driverClassName: com.mysql.jdbc.Driver
```

配置类

```java
@Component
@ConfigurationProperties(prefix = "jdbc")
public class JdbcProperties {
    private String url;
    private String username;
    private String password;
    private String driverClassName;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDriverClassName() {
        return driverClassName;
    }

    public void setDriverClassName(String driverClassName) {
        this.driverClassName = driverClassName;
    }
}
```

**通过属性的set()方法来自动实现给类中的属性赋值，所以set()方法是必须的，而且配置类与配置文件的属性名需要一致**

配置类的使用：

方式一：通过@Autowired给配置类对象赋值

```java
@Configuration
public class MyConfig {

    @Autowired
    private JdbcProperties jdbcProperties;

    @Bean
    public DataSource dataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl(jdbcProperties.getUrl());
        dataSource.setUsername(jdbcProperties.getUsername());
        dataSource.setPassword(jdbcProperties.getPassword());
        dataSource.setDriverClassName(jdbcProperties.getDriverClassName());
        return dataSource;
    }
}
```

方式二：通过构造器给配置类对象赋值

```java
@Configuration
public class MyConfig {
    private JdbcProperties jdbcProperties;

    public MyConfig(JdbcProperties jdbcProperties) {
        this.jdbcProperties = jdbcProperties;
    }

    @Bean
    public DataSource dataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl(jdbcProperties.getUrl());
        dataSource.setUsername(jdbcProperties.getUsername());
        dataSource.setPassword(jdbcProperties.getPassword());
        dataSource.setDriverClassName(jdbcProperties.getDriverClassName());
        return dataSource;
    }
}
```

方式三：作为方法形参赋值

```java
public class MyConfig {

    @Bean
    public DataSource dataSource(JdbcProperties jdbcProperties) {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl(jdbcProperties.getUrl());
        dataSource.setUsername(jdbcProperties.getUsername());
        dataSource.setPassword(jdbcProperties.getPassword());
        dataSource.setDriverClassName(jdbcProperties.getDriverClassName());
        return dataSource;
    }
    
}
```

**注意：**
**要想使用@ConfigurationProperties注解标注的配置类需要使用@Component注解标注该类，才能将该类加载到IOC容器中。**
**或不用@Component注解标注，而在需要引入配置类对象的类中使用@EnableConfigurationProperties注解引入配置类**
如：

1. 使用了@Component注解标注，可直接使用

   ```java
   @Component
   @ConfigurationProperties(prefix = "jdbc")
   public class JdbcProperties {
   }
   
   @Configuration
   public class MyConfig {
       @Autowired
       private JdbcProperties jdbcProperties;
   }
   ```

2. 未使用@Component注解标注，需使用@EnableConfigurationProperties注解引入配置类

   ```java
   @ConfigurationProperties(prefix = "jdbc")
   public class JdbcProperties {
   }
   
   
   @Configuration
   @EnableConfigurationProperties(JdbcProperties.class)
   public class MyConfig {
       @Autowired
       private JdbcProperties jdbcProperties;
   }
   ```

3. **@ConfigurationProperties注解优雅的使用方式(推荐)**
   只要配置类与配置文件的属性名一致，我们就可以通过set()方法给属性赋值。我们再看，DruidDataSource类中的各个set()方法，发现给属性赋值的set()方法其实也是一致的。那么我们其实不需要配置类，直接通过配置文件给将值传递给DruidDataSource类中的set()方法。

   ```java
   @Configuration
   public class MyConfig {
   
       @Bean
       @ConfigurationProperties(prefix = "jdbc")
       public DataSource dataSource() {
           DruidDataSource dataSource = new DruidDataSource();
           return dataSource;
       }
       
   }
   ```

   

## 5. 整合JDBC

### 5.1  导入了如下的启动器：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 5.2 编写yaml配置文件连接数据库；

```yaml
spring:
  datasource:
    username: root
    password: 123456
    #?serverTimezone=UTC解决时区的报错
    url: jdbc:mysql://localhost:3306/springboot?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 5.3 直接使用

```java
@SpringBootTest
class SpringbootDataJdbcApplicationTests {

    //DI注入数据源
    @Autowired
    DataSource dataSource;

    @Test
    public void contextLoads() throws SQLException {
        //看一下默认数据源
        System.out.println(dataSource.getClass());
        //获得连接
        Connection connection =   dataSource.getConnection();
        System.out.println(connection);
        //关闭连接
        connection.close();
    }
}
```

结果：我们可以看到他默认给我们配置的数据源为 : class com.zaxxer.hikari.HikariDataSource ， 我们并没有手动配置

我们来全局搜索一下，找到数据源的所有自动配置都在 ：DataSourceAutoConfiguration文件：

```java
@Conditional({DataSourceAutoConfiguration.PooledDataSourceCondition.class})
    @ConditionalOnMissingBean({DataSource.class, XADataSource.class})
    @Import({Hikari.class, Tomcat.class, Dbcp2.class, OracleUcp.class, Generic.class, DataSourceJmxConfiguration.class})
    protected static class PooledDataSourceConfiguration {
        protected PooledDataSourceConfiguration() {
        }
    }

```

这里导入的类都在 DataSourceConfiguration 配置类下，可以看出 Spring Boot 2.2.5 默认使用HikariDataSource 数据源，而以前版本，如 Spring Boot 1.5 默认使用 org.apache.tomcat.jdbc.pool.DataSource 作为数据源；

**HikariDataSource 号称 Java WEB 当前速度最快的数据源，相比于传统的 C3P0 、DBCP、Tomcat jdbc 等连接池更加优秀；**

**可以使用 spring.datasource.type 指定自定义的数据源类型，值为 要使用的连接池实现的完全限定名。**

## 6. 集成Druid

### 6.1 添加上Durid的依赖

```xml
<!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.6</version>
</dependency>
```

### 6.2 切换数据源

之前已经说过 Spring Boot 2.0 以上默认使用 com.zaxxer.hikari.HikariDataSource 数据源，但可以 通过 spring.datasource.type 指定数据源。

```yaml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql://localhost:3306/springboot?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.alibaba.druid.pool.DruidDataSource # 自定义数据源
```

数据源切换之后，在测试类中注入 DataSource，然后获取到它，输出一看便知是否成功切换；

切换成功就可以设置数据源连接初始化大小、最大连接数、等待时间、最小连接数 等设置项；可以查看源码

```yaml
spring:
  datasource:
 	  # 基本属性
      name: dev
      url: jdbc:mysql://127.0.0.1:3306/test?autoReconnect=true&useUnicode=true&characterEncoding=utf-8&allowMultiQueries=true&zeroDateTimeBehavior=convertToNull&useSSL=false
      username: root
      password: 123456
      # 可以不配置，根据url自动识别，建议配置
      driver-class-name: com.mysql.jdbc.Driver
      ###################以下为druid增加的配置###########################
      type: com.alibaba.druid.pool.DruidDataSource
      # 初始化连接池个数
      initialSize: 5
      # 最小连接池个数——》已经不再使用，配置了也没效果
      minIdle: 2
      # 最大连接池个数
      maxActive: 20
      # 配置获取连接等待超时的时间，单位毫秒，缺省启用公平锁，并发效率会有所下降
      maxWait: 60000
      # 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
      timeBetweenEvictionRunsMillis: 60000
      # 配置一个连接在池中最小生存的时间，单位是毫秒
      minEvictableIdleTimeMillis: 300000
      # 用来检测连接是否有效的sql，要求是一个查询语句。
      # 如果validationQuery为null，testOnBorrow、testOnReturn、testWhileIdle都不会起作用
      validationQuery: SELECT 1 FROM DUAL
      # 建议配置为true，不影响性能，并且保证安全性。
      # 申请连接的时候检测，如果空闲时间大于timeBetweenEvictionRunsMillis，执行validationQuery检测连接是否有效。
      testWhileIdle: true
      # 申请连接时执行validationQuery检测连接是否有效，做了这个配置会降低性能
      testOnBorrow: false
      # 归还连接时执行validationQuery检测连接是否有效，做了这个配置会降低性能
      testOnReturn: false
      # 打开PSCache，并且指定每个连接上PSCache的大小
      poolPreparedStatements: true
      maxPoolPreparedStatementPerConnectionSize: 20
      # 通过别名的方式配置扩展插件，多个英文逗号分隔，常用的插件有： 
      # 监控统计用的filter:stat
      # 日志用的filter:log4j
      # 防御sql注入的filter:wall
      filters: stat,wall,log4j
      # 通过connectProperties属性来打开mergeSql功能；慢SQL记录
      connectionProperties: druid.stat.mergeSql=true;druid.stat.slowSqlMillis=5000
      # 合并多个DruidDataSource的监控数据
      useGlobalDataSourceStat: true

```

### 6.3 导入Log4j 的依赖

```xml
<!-- https://mvnrepository.com/artifact/log4j/log4j -->
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

### 6.4 添加 DruidDataSource 组件到容器

现在需自己为 DruidDataSource 绑定全局配置文件中的参数，再添加到容器中，而不再使用 Spring Boot 的自动生成了；我们需要 自己添加 DruidDataSource 组件到容器中，并绑定属性；

```java
package com.kuang.config;

import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DruidConfig {

    /*
       将自定义的 Druid数据源添加到容器中，不再让 Spring Boot 自动创建
       绑定全局配置文件中的 druid 数据源属性到 com.alibaba.druid.pool.DruidDataSource从而让它们生效
       @ConfigurationProperties(prefix = "spring.datasource")：作用就是将 全局配置文件中
       前缀为 spring.datasource的属性值注入到 com.alibaba.druid.pool.DruidDataSource 的同名参数中
     */
    @ConfigurationProperties(prefix = "spring.datasource")
    @Bean
    public DataSource druidDataSource() {
        return new DruidDataSource();
    }

}
```

### 6.5 配置Druid数据源监控

Druid 数据源具有监控的功能，并提供了一个 web 界面方便用户查看，类似安装 路由器 时，人家也提供了一个默认的 web 页面。

所以第一步需要设置 Druid 的后台管理页面，比如 登录账号、密码 等；配置后台管理；

```java
package com.moi.jdbc.moity.config;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.support.http.StatViewServlet;
import com.alibaba.druid.support.http.WebStatFilter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * @author MOITY
 */
@Configuration
public class DruidConfig {

    /**
       将自定义的 Druid数据源添加到容器中，不再让 Spring Boot 自动创建
       绑定全局配置文件中的 druid 数据源属性到 com.alibaba.druid.pool.DruidDataSource从而让它们生效
       @ConfigurationProperties(prefix = "spring.datasource")：作用就是将 全局配置文件中
       前缀为 spring.datasource的属性值注入到 com.alibaba.druid.pool.DruidDataSource 的同名参数中
     */
    @ConfigurationProperties(prefix = "spring.datasource")
    @Bean
    public DataSource druidDataSource() {
        return new DruidDataSource();
    }

    @Bean
    public ServletRegistrationBean statViewServlet() {
        ServletRegistrationBean bean = new ServletRegistrationBean(new StatViewServlet(), "/druid/*");

        // 这些参数可以在 com.alibaba.druid.support.http.StatViewServlet
        // 的父类 com.alibaba.druid.support.http.ResourceServlet 中找到
        Map<String, String> initParams = new HashMap<>();
        //后台管理界面的登录账号
        initParams.put("loginUsername", "moity");
        //后台管理界面的登录密码
        initParams.put("loginPassword", "123456");

        //后台允许谁可以访问
        //initParams.put("allow", "localhost")：表示只有本机可以访问
        //initParams.put("allow", "")：为空或者为null时，表示允许所有访问
        initParams.put("allow", "");
        //deny：Druid 后台拒绝谁访问
        //initParams.put("kuangshen", "192.168.1.20");表示禁止此ip访问

        //设置初始化参数
        bean.setInitParameters(initParams);
        return bean;
    }

    //配置web过滤器
    @Bean
    public FilterRegistrationBean webStatFilter() {
        FilterRegistrationBean bean = new FilterRegistrationBean();
        bean.setFilter(new WebStatFilter());
        Map<String, String> initParams = new HashMap<>();
        //那些请求排除，比如静态资源
        initParams.put("exclusions", "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*");
        bean.setInitParameters(initParams);
        //过滤那些请求
        bean.setUrlPatterns(Arrays.asList("/*"));
        return bean;
    }
}
```

### 6.6 druid数据源starter整合方式

**引入依赖**：

```xml
<!-- https://mvnrepository.com/artifact/com.alibaba/druid-spring-boot-starter -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.6</version>
</dependency>
```

分析自动配置：

* 扩展配置项 spring.datasource.druid
* 自动配置类DruidDataSourceAutoConfigure
* DruidSpringAopConfiguration.class, 监控SpringBean的；配置项：spring.datasource.druid.aop-patterns
* DruidStatViewServletConfiguration.class, 监控页的配置。spring.datasource.druid.stat-view-servlet默认开启。
* DruidWebStatFilterConfiguration.class，web监控配置。spring.datasource.druid.web-stat-filter默认开启。
* DruidFilterConfiguration.class所有Druid的filter的配置：

```java
private static final String FILTER_STAT_PREFIX = "spring.datasource.druid.filter.stat";
private static final String FILTER_CONFIG_PREFIX = "spring.datasource.druid.filter.config";
private static final String FILTER_ENCODING_PREFIX = "spring.datasource.druid.filter.encoding";
private static final String FILTER_SLF4J_PREFIX = "spring.datasource.druid.filter.slf4j";
private static final String FILTER_LOG4J_PREFIX = "spring.datasource.druid.filter.log4j";
private static final String FILTER_LOG4J2_PREFIX = "spring.datasource.druid.filter.log4j2";
private static final String FILTER_COMMONS_LOG_PREFIX = "spring.datasource.druid.filter.commons-log";
private static final String FILTER_WALL_PREFIX = "spring.datasource.druid.filter.wall";
```

**配置示例**：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/database
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver

    druid:
      aop-patterns: com.moity.admin.*  #监控SpringBean
      filters: stat,wall     # 底层开启功能，stat（sql监控），wall（防火墙）

      stat-view-servlet:   # 配置监控页功能
        enabled: true
        login-username: admin	#监控页面登录的用户名
        login-password: admin	#监控页面登录的密码
        #IP白名单(没有配置或者为空，则允许所有访问)
        allow: 
        #IP黑名单 (存在共同时，deny优先于allow)
        deny: 
        resetEnable: false

      web-stat-filter:  # 监控web
        enabled: true
        urlPattern: /*
        exclusions: '*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*'
        #session-stat-enable: true
        #session-stat-max-count: 10


      filter:
        stat:    # 对上面filters里面的stat的详细配置
          slow-sql-millis: 1000
          logSlowSql: true
          enabled: true
        wall:
          enabled: true
          config:
            drop-table-allow: false
```

[官方文档]: https://github.com/alibaba/druid/tree/master/druid-spring-boot-starter

**更多配置**

```yaml


#Druid Spring Boot Starter 配置属性的名称完全遵照 Druid，你可以通过 Spring Boot 配置文件来配置Druid数据库连接池和监控，如果没有配置则使用默认值。
#JDBC 配置
#spring.datasource.druid.url= jdbc:mysql://localhost:3306/shiro?useUnicode=true&characterEncoding=utf-8&useSSL=false
#spring.datasource.druid.username= root
#spring.datasource.druid.password= 123456
#spring.datasource.druid.driver-class-name= com.mysql.jdbc.Driver

######################等同以上配置##########################
spring.datasource.url= jdbc:mysql://localhost:3306/test01?useUnicode=true&characterEncoding=utf-8&useSSL=false
spring.datasource.username= root
spring.datasource.password= 123456
spring.datasource.driver-class-name= com.mysql.jdbc.Driver

#spring.datasource.type=com.alibaba.druid.pool.DruidDataSource 

#连接池配置(可选)
# 连接池的配置信息初始化大小，最小，最大
spring.datasource.druid.name=testDruidDataSource
#spring.datasource.druid.initial-size=5
#spring.datasource.druid.max-active=20
#spring.datasource.druid.min-idle=5
# 配置获取连接等待超时的时间
#spring.datasource.druid.max-wait= 60000
#spring.datasource.druid.pool-prepared-statements=
#spring.datasource.druid.max-pool-prepared-statement-per-connection-size= 
##spring.datasource.druid.max-open-prepared-statements= #和上面的等价
#spring.datasource.druid.validation-query=
#spring.datasource.druid.validation-query-timeout=
#spring.datasource.druid.test-on-borrow=
#spring.datasource.druid.test-on-return=
#spring.datasource.druid.test-while-idle=
#spring.datasource.druid.time-between-eviction-runs-millis=
#spring.datasource.druid.min-evictable-idle-time-millis=
#spring.datasource.druid.max-evictable-idle-time-millis=
#配置监控统计拦截的filters，去掉后监控界面sql无法统计，'wall'用于防火墙
spring.datasource.druid.filters= stat,wall


#######监控配置
# WebStatFilter配置，说明请参考Druid Wiki，配置_配置WebStatFilter
spring.datasource.druid.web-stat-filter.enabled=true
spring.datasource.druid.web-stat-filter.url-pattern=/*
spring.datasource.druid.web-stat-filter.exclusions=/druid/*,*.js,*.gif,*.jpg,*.bmp,*.png,*.css,*.ico
spring.datasource.druid.web-stat-filter.session-stat-enable=true
spring.datasource.druid.web-stat-filter.session-stat-max-count=10
spring.datasource.druid.web-stat-filter.principal-session-name=session_name
spring.datasource.druid.web-stat-filter.principal-cookie-name=cookie_name
spring.datasource.druid.web-stat-filter.profile-enable=
# StatViewServlet配置，说明请参考Druid Wiki，配置_StatViewServlet配置默认false
spring.datasource.druid.stat-view-servlet.enabled=true
# 配置DruidStatViewServlet
spring.datasource.druid.stat-view-servlet.url-pattern=/druid/*
#  禁用HTML页面上的“Reset All”功能
spring.datasource.druid.stat-view-servlet.reset-enable=true
spring.datasource.druid.stat-view-servlet.login-username=admin
spring.datasource.druid.stat-view-servlet.login-password=123456
#IP白名单(没有配置或者为空，则允许所有访问)
spring.datasource.druid.stat-view-servlet.allow=127.0.0.1,192.168.0.119
#IP黑名单 (存在共同时，deny优先于allow)
spring.datasource.druid.stat-view-servlet.deny=
#Spring监控配置，说明请参考Druid Github Wiki，配置_Druid和Spring关联监控配置
spring.datasource.druid.aop-patterns= com.lcf.service.*


#日志级别
#logging.level.root=debug


#热部署生效
spring.devtools.restart.enabled=true

#------------------------------mybatis------------------------------
mybatis.type-aliases-package=com.lcf.entity
mybatis.mapper-locations=classpath:mapper/**.xml

#server.port=8888
#server.servlet.context-path=/lichenfei
```



## 7. 整合MyBatis

### 7.1 导入 MyBatis 所需要的依赖

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.1.1</version>
</dependency>
```

### 7.2 配置数据库连接信息（不变）

```
spring:
  datasource:
    username: root
    password: 123456
    #?serverTimezone=UTC解决时区的报错
    url: jdbc:mysql://localhost:3306/mysql?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.alibaba.druid.pool.DruidDataSource

    #Spring Boot 默认是不注入这些属性值的，需要自己绑定
    #druid 数据源专有配置
    initialSize: 5
    minIdle: 5
    maxActive: 20
    maxWait: 60000
    timeBetweenEvictionRunsMillis: 60000
    minEvictableIdleTimeMillis: 300000
    validationQuery: SELECT 1 FROM DUAL
    testWhileIdle: true
    testOnBorrow: false
    testOnReturn: false
    poolPreparedStatements: true

    #配置监控统计拦截的filters，stat:监控统计、log4j：日志记录、wall：防御sql注入
    #如果允许时报错  java.lang.ClassNotFoundException: org.apache.log4j.Priority
    #则导入 log4j 依赖即可，Maven 地址：https://mvnrepository.com/artifact/log4j/log4j
    filters: stat,wall,log4j
    maxPoolPreparedStatementPerConnectionSize: 20
    useGlobalDataSourceStat: true
    connectionProperties: druid.stat.mergeSql=true;druid.stat.slowSqlMillis=500
```

## 8. Web开发静态资源处理

### 8.1 什么是webjars 

Webjars本质就是以jar包的方式引入我们的静态资源 ， 我们以前要导入一个静态资源文件，直接导入即可。

使用SpringBoot需要使用Webjars，我们可以去搜索一下：

网站：https://www.webjars.org 

要使用jQuery，我们只要要引入jQuery对应版本的pom依赖即可

```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>jquery</artifactId>
    <version>3.4.1</version>
</dependency>
```

### 8.2 第二种静态资源映射规则

我们去找staticPathPattern发现第二种映射规则 ：/** , 访问当前的项目任意资源，它会去找 resourceProperties 这个类，我们可以点进去看一下分析：

```java
// 进入方法
public String[] getStaticLocations() {
    return this.staticLocations;
}
// 找到对应的值
private String[] staticLocations = CLASSPATH_RESOURCE_LOCATIONS;
// 找到路径
private static final String[] CLASSPATH_RESOURCE_LOCATIONS = { 
    "classpath:/META-INF/resources/",
  "classpath:/resources/", 
    "classpath:/static/", 
    "classpath:/public/" 
};
```

ResourceProperties 可以设置和我们静态资源有关的参数；这里面指向了它会去寻找资源的文件夹，即上面数组的内容。

所以得出结论，以下四个目录存放的静态资源可以被我们识别：

```
"classpath:/META-INF/resources/"
"classpath:/resources/"
"classpath:/static/"
"classpath:/public/"
```

### 8.3 自定义静态资源路径

我们也可以自己通过配置文件来指定一下，哪些文件夹是需要我们放静态资源文件的，在application.properties中配置；

```yaml
spring.resources.static-locations=classpath: /coding/
classpath: /moity/
```

一旦自己定义了静态文件夹的路径，原来的自动配置就都会失效了！

### 8.4 首页处理

看到一个欢迎页的映射，就是首页

```java
@Bean
public WelcomePageHandlerMapping welcomePageHandlerMapping(ApplicationContext applicationContext,
                                                           FormattingConversionService mvcConversionService,
                                                           ResourceUrlProvider mvcResourceUrlProvider) {
    WelcomePageHandlerMapping welcomePageHandlerMapping = new WelcomePageHandlerMapping(
        new TemplateAvailabilityProviders(applicationContext), applicationContext, getWelcomePage(), // getWelcomePage 获得欢迎页
        this.mvcProperties.getStaticPathPattern());
    welcomePageHandlerMapping.setInterceptors(getInterceptors(mvcConversionService, mvcResourceUrlProvider));
    return welcomePageHandlerMapping;
}
```

```java
private Optional<Resource> getWelcomePage() {
    String[] locations = getResourceLocations(this.resourceProperties.getStaticLocations());
    // ::是java8 中新引入的运算符
    // Class::function的时候function是属于Class的，应该是静态方法。
    // this::function的funtion是属于这个对象的。
    // 简而言之，就是一种语法糖而已，是一种简写
    return Arrays.stream(locations).map(this::getIndexHtml).filter(this::isReadable).findFirst();
}
// 欢迎页就是一个location下的的 index.html 而已
private Resource getIndexHtml(String location) {
    return this.resourceLoader.getResource(location + "index.html");
}
```

欢迎页，静态资源文件夹下的所有 index.html 页面；被 /** 映射。

比如我访问  http://localhost:8080/ ，就会找静态资源文件夹下的 index.html

新建一个 index.html ，在我们上面的3个目录中任意一个；然后访问测试  http://localhost:8080/  

### **关于网站图标说明**：

与其他静态资源一样，Spring Boot在配置的静态内容位置中查找 favicon.ico。如果存在这样的文件，它将自动用作应用程序的favicon。

1、关闭SpringBoot默认图标

```yaml
#关闭默认图标
spring.mvc.favicon.enabled: false
```

2、自己放一个图标在静态资源目录下，我放在 public 目录下

3、清除浏览器缓存！刷新网页，发现图标已经变成自己的了！

## 9. 集成Swagger

**SpringBoot项目整合swagger2需要用到两个依赖：`springfox-swagger2`和`springfox-swagger-ui`，用于自动生成swagger文档。**

- springfox-swagger2：这个组件的功能用于帮助我们自动生成描述API的json文件
- springfox-swagger-ui：就是将描述API的json文件解析出来，用一种更友好的方式呈现出来。

### swagger3.0 与2.xx配置差异：

1. 应用主类添加注解@EnableOpenApi (swagger2是@EnableSwagger2)
2. swagger配置类SwaggerProperties.class，与swagger2.xx 版本有差异，具体看下文
3. 自定义一个配置类 SwaggerConfiguration.class,看下文
4. 访问地址：http://localhost:8080/swagger-ui/index.html (swagger2.xx版本访问的地址为http://localhost:8080/swagger-ui.html)



**使用Swagger(使用2.x版本)**

要求：jdk 1.8 + 否则swagger2无法运行

步骤：

1、新建一个SpringBoot-web项目

2、添加Maven依赖

```xml
<!-- https://mvnrepository.com/artifact/io.springfox/springfox-swagger2 -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<!-- https://mvnrepository.com/artifact/io.springfox/springfox-swagger-ui -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
```

### 9.1 SwaggerConfig来配置 Swagger

#### 	配置 Swagger

1. **Swagger实例Bean是Docket，所以通过配置Docket实例来配置Swaggger。**

```java
@Bean //配置docket以配置Swagger具体参数
public Docket docket() {
   return new Docket(DocumentationType.SWAGGER_2);
}
```

2. **可以通过apiInfo()属性配置文档信息**

```java
//配置文档信息
private ApiInfo apiInfo() {
   Contact contact = new Contact("联系人名字", "http://xxx.xxx.com/联系人访问链接", "联系人邮箱");
   return new ApiInfo(
           "Swagger学习", // 标题
           "学习演示如何配置Swagger", // 描述
           "v1.0", // 版本
           "http://terms.service.url/组织链接", // 组织链接
           contact, // 联系人信息
           "Apach 2.0 许可", // 许可
           "许可链接", // 许可连接
           new ArrayList<>()// 扩展
  );
}
```

3. **Docket 实例关联上 apiInfo()**

```java
@Bean
public Docket docket() {
   return new Docket(DocumentationType.SWAGGER_2).apiInfo(apiInfo());
}
```

#### **配置扫描接口**

4. **构建Docket时通过select()方法配置扫描接口**
   通过.select()方法，去配置扫描接口,RequestHandlerSelectors配置如何扫描接口

```java
@Bean
public Docket docket() {
   return new Docket(DocumentationType.SWAGGER_2)
      .apiInfo(apiInfo())
      .select()// 通过.select()方法，去配置扫描接口,RequestHandlerSelectors配置如何扫描接口
      .apis(RequestHandlerSelectors.basePackage("com.kuang.swagger.controller"))
      .build();
}
```

**除了通过包路径配置扫描接口外，还可以通过配置其他方式扫描接口，这里注释一下所有的配置方式：**

```java
any() // 扫描所有，项目中的所有接口都会被扫描到
none() // 不扫描接口
// 通过方法上的注解扫描，如withMethodAnnotation(GetMapping.class)只扫描get请求
withMethodAnnotation(final Class<? extends Annotation> annotation)
// 通过类上的注解扫描，如.withClassAnnotation(Controller.class)只扫描有controller注解的类中的接口
withClassAnnotation(final Class<? extends Annotation> annotation)
basePackage(final String basePackage) // 根据包路径扫描接口
```

5. **配置接口扫描过滤**

   配置如何通过path过滤,即这里只扫描请求以/kuang开头的接口

```java
@Bean
public Docket docket() {
   return new Docket(DocumentationType.SWAGGER_2)
      .apiInfo(apiInfo())
      .select()// 通过.select()方法，去配置扫描接口,RequestHandlerSelectors配置如何扫描接口
      .apis(RequestHandlerSelectors.basePackage("com.kuang.swagger.controller"))
       // 配置如何通过path过滤,即这里只扫描请求以/kuang开头的接口
      .paths(PathSelectors.ant("/kuang/**"))
      .build();
}
```

还有其他选择

```java
any() // 任何请求都扫描
none() // 任何请求都不扫描
regex(final String pathRegex) // 通过正则表达式控制
ant(final String antPattern) // 通过ant()控制
```

6. **Swagger开关**
   通过enable()方法配置是否启用swagger，如果是false，swagger将不能在浏览器中访问了

```java
@Bean
public Docket docket() {
   return new Docket(DocumentationType.SWAGGER_2)
      .apiInfo(apiInfo())
      .enable(false) //配置是否启用Swagger，如果是false，在浏览器将无法访问
      .select()// 通过.select()方法，去配置扫描接口,RequestHandlerSelectors配置如何扫描接口
      .apis(RequestHandlerSelectors.basePackage("com.kuang.swagger.controller"))
       // 配置如何通过path过滤,即这里只扫描请求以/kuang开头的接口
      .paths(PathSelectors.ant("/kuang/**"))
      .build();
}
```

7. **动态配置当项目某些环境时显示swagger**

```java
@Bean
public Docket docket(Environment environment) {
   // 设置要显示swagger的环境
   Profiles of = Profiles.of("dev", "test");
   // 判断当前是否处于该环境
   // 通过 enable() 接收此参数判断是否要显示
   boolean b = environment.acceptsProfiles(of);
   
   return new Docket(DocumentationType.SWAGGER_2)
      .apiInfo(apiInfo())
      .enable(b) //配置是否启用Swagger，如果是false，在浏览器将无法访问
      .select()// 通过.select()方法，去配置扫描接口,RequestHandlerSelectors配置如何扫描接口
      .apis(RequestHandlerSelectors.basePackage("com.kuang.swagger.controller"))
       // 配置如何通过path过滤,即这里只扫描请求以/kuang开头的接口
      .paths(PathSelectors.ant("/kuang/**"))
      .build();
}
```

#### **配置API分组**

8. 配置分组
   如果没有配置分组，默认是default。通过groupName()方法即可配置分组：

   ```java
   @Bean
   public Docket docket(Environment environment) {
      return new Docket(DocumentationType.SWAGGER_2).apiInfo(apiInfo())
         .groupName("hello") // 配置分组
          // 省略配置....
   }
   ```

### **9.2 常用注解**

一些经常用到的

| Swagger注解                                            | 简单说明                                             |
| ------------------------------------------------------ | ---------------------------------------------------- |
| @Api(tags = "xxx模块说明")                             | 作用在模块类上                                       |
| @ApiOperation("xxx接口说明")                           | 作用在接口方法上                                     |
| @ApiModel("xxxPOJO说明")                               | 作用在模型类上：如VO、BO                             |
| @ApiModelProperty(value = "xxx属性说明",hidden = true) | 作用在类方法和属性上，hidden设置为true可以隐藏该属性 |
| @ApiParam("xxx参数说明")                               | 作用在参数、方法和字段上，类似@ApiModelProperty      |

我们也可以给请求的接口配置一些注释

### 9.3.1 用于controller类上：

```
注解	说明
@Api	对请求类的说明
```

### 9.3.2 用于方法上面（说明参数的含义）：

```
注解	说明
@ApiOperation	方法的说明
@ApiImplicitParams、@ApiImplicitParam	方法的参数的说明；@ApiImplicitParams 用于指定单个参数的说明
```

### 9.3.3 用于方法上面（返回参数或对象的说明）：

```
注解	说明
@ApiResponses、@ApiResponse	方法返回值的说明 ；@ApiResponses 用于指定单个参数的说明
```

### 9.3.4 对象类：

```
注解	说明
@ApiModel	用在JavaBean类上，说明JavaBean的 用途
@ApiModelProperty	用在JavaBean类的属性上面，说明此属性的的含议
```



### 9.3.5 @Api 其它属性配置：

```
属性名称	备注
value	url的路径值
tags	如果设置这个值、value的值会被覆盖
description	对api资源的描述
basePath	基本路径
position	如果配置多个Api 想改变显示的顺序位置
produces	如, “application/json, application/xml”
consumes	如, “application/json, application/xml”
protocols	协议类型，如: http, https, ws, wss.
authorizations	高级特性认证时配置
hidden	配置为true ，将在文档中隐藏
```

## 10. 异步、定时、邮件任务

### 10.1 异步任务

如果需要用多线程执行异步操作的话，只要在方法上面添加一个注解即可

给需要用到异步的方法添加@Async注解

```java
//告诉Spring这是一个异步方法
    @Async
    public void asyncTest(){
        System.out.println(new SimpleDateFormat("HH-mm-ss").format(new Date()));
    }
```

同时要在启动类上加上@EnableAsync注解
或者在配置类上加入@EnableAsync注解

### 10.2 定时任务

两个接口：

- TaskExecutor接口
- TaskScheduler接口

两个注解：

- @EnableScheduling
- @Scheduled

**cron表达式：**

 **cron表达式格式：**

**{秒数} {分钟} {小时} {日期} {月份} {星期} **

```
{秒数} ==> 允许值范围: 0~59 ,不允许为空值，若值不合法，调度器将抛出SchedulerException异常

	"*" 代表每隔1秒钟触发；

	"," 代表在指定的秒数触发，比如"0,15,45"代表0秒、15秒和45秒时触发任务

   "-" 代表在指定的范围内触发，比如"25-45"代表从25秒开始触发到45秒结束触发，每隔1秒触发1次

   "/" 代表触发步进(step)，"/"前面的值代表初始值("*"等同"0")，后面的值代表偏移量，比如"0/20"或者"*/20"代表从0秒钟开始，每隔20秒钟触发1次，即0秒触发1次，20秒触发1次，40秒触发1次；"5/20"代表5秒触发1次，25秒触发1次，45秒触发1次；"10-45/20"代表在[10,45]内步进20秒命中的时间点触发，即10秒触发1次，30秒触发1次
```

```
{分钟} ==> 允许值范围: 0~59 ,不允许为空值，若值不合法，调度器将抛出SchedulerException异常

	"*" 代表每隔1分钟触发；

	"," 代表在指定的分钟触发，比如"10,20,40"代表10分钟、20分钟和40分钟时触发任务

	"-" 代表在指定的范围内触发，比如"5-30"代表从5分钟开始触发到30分钟结束触 发，每隔1分钟触发

	"/" 代表触发步进(step)，"/"前面的值代表初始值("*"等同"0")，后面的值代表偏移量，比如"0/25"或者"*/25"代表从0分钟开始，每隔25分钟触发1次，即0分钟触发1次，第25分钟触发1次，第50分钟触发1次；"5/25"代表5分钟触发1次，30分钟触发1次，55分钟触发1次；"10-45/20"代表在[10,45]内步进20分钟命中的时间点触发，即10分钟触发1次，30分钟触发1次
```

```
{小时}**==> 允许值范围: 0~23 ,不允许为空值，若值不合法，调度器将抛出SchedulerException异常

	"*" 代表每隔1小时触发；

	"," 代表在指定的时间点触发，比如"10,20,23"代表10点钟、20点钟和23点触发任务

	"-" 代表在指定的时间段内触发，比如"20-23"代表从20点开始触发到23点结束触发，每隔1小时触发

	"/" 代表触发步进(step)，"/"前面的值代表初始值("*"等同"0")，后面的值代表偏移量，比如"0/1"或者"*/1"代表从0点开始触发，每隔1小时触发1次；"1/2"代表从1点开始触发，以后每隔2小时触发一次；"19-20/2"表达式将只在19点触发
```

```
**{日期}** ==> 允许值范围: 1~31 ,不允许为空值，若值不合法，调度器将抛出SchedulerException异常

	"*" 代表每天触发；

	"?" 与{星期}互斥，即意味着若明确指定{星期}触发，则表示{日期}无意义，以免引起 冲突和混乱

	"," 代表在指定的日期触发，比如"1,10,20"代表1号、10号和20号这3天触发

	"-" 代表在指定的日期范围内触发，比如"10-15"代表从10号开始触发到15号结束触发，每隔1天触发

	"/" 代表触发步进(step)，"/"前面的值代表初始值("*"等同"1")，后面的值代表偏移量，比如"1/5"或者"*/5"代表从1号开始触发，每隔5天触发1次；"10/5"代表从10号开始触发，以后每隔5天触发一次；"1-10/2"表达式意味着在[1,10]范围内，每隔2天触发，即1号，3号，5号，7号，9号触发

	"L" 如果{日期}占位符如果是"L"，即意味着当月的最后一天触发

	"W "意味着在本月内离当天最近的工作日触发，所谓最近工作日，即当天到工作日的前后最短距离，如果当天即为工作日，则距离为0；所谓本月内的说法，就是不能跨月取到最近工作日，即使前/后月份的最后一天/第一天确实满足最近工作日；因此，"LW"则意味着本月的最后一个工作日触发，"W"强烈依赖{月份}

	"C" 根据日历触发，由于使用较少，暂时不做解释
```

```
{月份}**==> 允许值范围: 1~12 (JAN-DEC),不允许为空值，若值不合法，调度器将抛出SchedulerException异常

	"*" 代表每个月都触发；

	"," 代表在指定的月份触发，比如"1,6,12"代表1月份、6月份和12月份触发任务

	"-" 代表在指定的月份范围内触发，比如"1-6"代表从1月份开始触发到6月份结束触发，每隔1个月触发

	"/" 代表触发步进(step)，"/"前面的值代表初始值("*"等同"1")，后面的值代表偏移量，比如"1/2"或者"*/2"代表从1月份开始触发，每隔2个月触发1次；"6/6"代表从6月份开始触发，以后每隔6个月触发一次；"1-6/12"表达式意味着每年1月份触发
```

```
{星期}**==> 允许值范围: 1~7 (SUN-SAT),1代表星期天(一星期的第一天)，以此类推，7代表星期六(一星期的最后一天)，不允许为空值，若值不合法，调度器将抛出SchedulerException异常

	"*" 代表每星期都触发；

	"?" 与{日期}互斥，即意味着若明确指定{日期}触发，则表示{星期}无意义，以免引起冲突和混乱

	"," 代表在指定的星期约定触发，比如"1,3,5"代表星期天、星期二和星期四触发

	"-" 代表在指定的星期范围内触发，比如"2-4"代表从星期一开始触发到星期三结束触发，每隔1天触发

	"/" 代表触发步进(step)，"/"前面的值代表初始值("*"等同"1")，后面的值代表偏移量，比如"1/3"或者"*/3"代表从星期天开始触发，每隔3天触发1次；"1-5/2"表达式意味着在[1,5]范围内，每隔2天触发，即星期天、星期二、星期四触发

	"L" 如果{星期}占位符如果是"L"，即意味着星期的的最后一天触发，即星期六触发，L= 7或者 L = SAT，因此，"5L"意味着一个月的最后一个星期四触发

	"#" 用来指定具体的周数，"#"前面代表星期，"#"后面代表本月第几周，比如"2#2"表示本月第二周的星期一，"5#3"表示本月第三周的星期四，因此，"5L"这种形式只不过是"#"的特殊形式而已

	"C" 根据日历触发，由于使用较少，暂时不做解释
```

***注意：除了{日期}和{星期}可以使用"?"来实现互斥，表达无意义的信息之外，其他占位符都要具有具体的时间含义，且依赖关系为：年->月->日期(星期)->小时->分钟->秒数***

#### **常用的表达式**

```
（1）0/2 * * * * ?   表示每2秒 执行任务
（1）0 0/2 * * * ?   表示每2分钟 执行任务
（1）0 0 2 1 * ?   表示在每月的1日的凌晨2点调整任务
（2）0 15 10 ? * MON-FRI   表示周一到周五每天上午10:15执行作业
（3）0 15 10 ? 6L 2002-2006   表示2002-2006年的每个月的最后一个星期五上午10:15执行作
（4）0 0 10,14,16 * * ?   每天上午10点，下午2点，4点
（5）0 0/30 9-17 * * ?   朝九晚五工作时间内每半小时
（6）0 0 12 ? * WED   表示每个星期三中午12点
（7）0 0 12 * * ?   每天中午12点触发
（8）0 15 10 ? * *   每天上午10:15触发
（9）0 15 10 * * ?     每天上午10:15触发
（10）0 15 10 * * ?   每天上午10:15触发
（11）0 15 10 * * ? 2005   2005年的每天上午10:15触发
（12）0 * 14 * * ?     在每天下午2点到下午2:59期间的每1分钟触发
（13）0 0/5 14 * * ?   在每天下午2点到下午2:55期间的每5分钟触发
（14）0 0/5 14,18 * * ?     在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发
（15）0 0-5 14 * * ?   在每天下午2点到下午2:05期间的每1分钟触发
（16）0 10,44 14 ? 3 WED   每年三月的星期三的下午2:10和2:44触发
（17）0 15 10 ? * MON-FRI   周一至周五的上午10:15触发
（18）0 15 10 15 * ?   每月15日上午10:15触发
（19）0 15 10 L * ?   每月最后一日的上午10:15触发
（20）0 15 10 ? * 6L   每月的最后一个星期五上午10:15触发
（21）0 15 10 ? * 6L 2002-2005   2002年至2005年的每月的最后一个星期五上午10:15触发
（22）0 15 10 ? * 6#3   每月的第三个星期五上午10:15触发
```

### 10.3 邮件任务

#### 10.3.1 引入依赖

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

#### 10.3.2 查看自动配置类MailSenderJndiConfiguration

```java
/*
 * Copyright 2012-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.boot.autoconfigure.mail;

import javax.mail.Session;
import javax.naming.NamingException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnJndi;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jndi.JndiLocatorDelegate;
import org.springframework.mail.MailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Auto-configure a {@link MailSender} based on a {@link Session} available on JNDI.
 *
 * @author Eddú Meléndez
 * @author Stephane Nicoll
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(Session.class)
@ConditionalOnProperty(prefix = "spring.mail", name = "jndi-name")
@ConditionalOnJndi
class MailSenderJndiConfiguration {

   private final MailProperties properties;

   MailSenderJndiConfiguration(MailProperties properties) {
      this.properties = properties;
   }

   @Bean
   JavaMailSenderImpl mailSender(Session session) {
      JavaMailSenderImpl sender = new JavaMailSenderImpl();
      sender.setDefaultEncoding(this.properties.getDefaultEncoding().name());
      sender.setSession(session);
      return sender;
   }

   @Bean
   @ConditionalOnMissingBean
   Session session() {
      String jndiName = this.properties.getJndiName();
      try {
         return JndiLocatorDelegate.createDefaultResourceRefLocator().lookup(jndiName, Session.class);
      }
      catch (NamingException ex) {
         throw new IllegalStateException(String.format("Unable to find Session in JNDI location %s", jndiName), ex);
      }
   }

}
```

这个类中存在bean，JavaMailSenderImpl

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package org.springframework.mail.javamail;


public class JavaMailSenderImpl implements JavaMailSender {
    public static final String DEFAULT_PROTOCOL = "smtp";
    public static final int DEFAULT_PORT = -1;
    private static final String HEADER_MESSAGE_ID = "Message-ID";
    private Properties javaMailProperties = new Properties();
    @Nullable
    private Session session;
    @Nullable
    private String protocol;
    @Nullable
    private String host;
    private int port = -1;
    @Nullable
    private String username;
    @Nullable
    private String password;
    @Nullable
    private String defaultEncoding;
    @Nullable
    private FileTypeMap defaultFileTypeMap;

    ...
}

```

#### 10.3.3 配置文件：

```yaml
spring:
  mail:
    username: 邮箱
    password: 授权码
    host: smtp.qq.com
    #qq需要配置ssl
    properties:
      mail:
        smtp:
          ssl:
            enable: true

```

#### 10.3.4 发送邮件

**一个简单的邮件**

```java
@Autowired
JavaMailSenderImpl mailSender;

@Test
public void contextLoads() {
   //邮件设置1：一个简单的邮件
   SimpleMailMessage message = new SimpleMailMessage();
   message.setSubject("阿巴阿巴");//标题
   message.setText("123123");//内容

   message.setTo("1123@qq.com");
   message.setFrom("1123@qq.com");
   mailSender.send(message);
}
```

**复杂一些的邮件（带附件）**

```java
@Autowired
JavaMailSenderImpl mailSender;

@Test
public void contextLoads2() throws MessagingException {
   //邮件设置2：一个复杂的邮件
   MimeMessage mimeMessage = mailSender.createMimeMessage();
   MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

   helper.setSubject("阿巴阿巴");
   helper.setText("<b style='color:red'>123123</b>",true);

   //发送附件
   helper.addAttachment("1.jpg",new File(""));
   helper.addAttachment("2.jpg",new File(""));

   helper.setTo("123@qq.com");
   helper.setFrom("123@qq.com");

   mailSender.send(mimeMessage);
}
```



## 11. 集成SpringSecurity

### 11.1 认识SpringSecurity

Spring Security 是针对Spring项目的安全框架，也是Spring Boot底层安全模块默认的技术选型，他可以实现强大的Web安全控制，对于安全控制，我们仅需要引入 spring-boot-starter-security 模块，进行少量的配置，即可实现强大的安全管理！

记住几个类：

- WebSecurityConfigurerAdapter：自定义Security策略
- AuthenticationManagerBuilder：自定义认证策略
- @EnableWebSecurity：开启WebSecurity模式

Spring Security的两个主要目标是 “认证” 和 “授权”（访问控制）。

**“认证”（Authentication）**

身份验证是关于验证您的凭据，如用户名/用户ID和密码，以验证您的身份。

身份验证通常通过用户名和密码完成，有时与身份验证因素结合使用。

 **“授权” （Authorization）**

授权发生在系统成功验证您的身份后，最终会授予您访问资源（如信息，文件，数据库，资金，位置，几乎任何内容）的完全权限。

这个概念是通用的，而不是只在Spring Security 中存在。

### 11.2 引入 Spring Security 模块

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 11.3 编写 Spring Security 配置类

#### 11.3.1 编写基础配置类

```java
package com.kuang.config;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@EnableWebSecurity // 开启WebSecurity模式
public class SecurityConfig extends WebSecurityConfigurerAdapter {

   @Override
   protected void configure(HttpSecurity http) throws Exception {
       
  }
}
```

#### 11.3.2 定制请求的授权规则

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
   // 定制请求的授权规则
   // 首页所有人可以访问
   http.authorizeRequests().antMatchers("/").permitAll()
  .antMatchers("/level1/**").hasRole("vip1")
  .antMatchers("/level2/**").hasRole("vip2")
  .antMatchers("/level3/**").hasRole("vip3");
}
```

在configure()方法中加入以下配置，开启自动配置的登录功能

```java
// 开启自动配置的登录功能
// /login 请求来到登录页
// /login?error 重定向到这里表示登录失败
http.formLogin();
```

#### 11.3.4 定义认证规则

```java
//定义认证规则
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
   
   //在内存中定义，也可以在jdbc中去拿....
   auth.inMemoryAuthentication()
          .withUser("moity").password("123456").roles("vip2","vip3")
          .and()
          .withUser("root").password("123456").roles("vip1","vip2","vip3")
          .and()
          .withUser("guest").password("123456").roles("vip1","vip2");
}
```

在测试的时候会发现报错

```
There is no PasswordEncoder mapped for the id “null”
```

原因，我们要将前端传过来的密码进行某种方式加密，否则就无法登录

```java
//定义认证规则
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
   //在内存中定义，也可以在jdbc中去拿....
   //Spring security 5.0中新增了多种加密方式，也改变了密码的格式。
   //要想我们的项目还能够正常登陆，需要修改一下configure中的代码。我们要将前端传过来的密码进行某种方式加密
   //spring security 官方推荐的是使用bcrypt加密方式。
   
   auth.inMemoryAuthentication().passwordEncoder(new BCryptPasswordEncoder())
          .withUser("moity").password(new BCryptPasswordEncoder().encode("123456")).roles("vip2","vip3")
          .and()
          .withUser("root").password(new BCryptPasswordEncoder().encode("123456")).roles("vip1","vip2","vip3")
          .and()
          .withUser("guest").password(new BCryptPasswordEncoder().encode("123456")).roles("vip1","vip2");
}
```

**如果用jdbc来认证的话**

例如：

```java
@Data
public class SysUser {
	
	private Integer id;
	private String name;
	private String password;
}
```

```java
@Data
public class SysRole {
	private Integer id;
	private String name;
}
```

```java
public interface UserMapper {

	@Select("select * from user where name = #{name}")
	SysUser loadUserByUsername(String name);

}
```

```java
public interface RoleMapper {

	@Select("SELECT role.`name` FROM role WHERE role.id in (SELECT role_id FROM "
			+ " role_user as r_s JOIN `user` as u  ON r_s.user_id = u.id and u.id = #{id})")
	List<SysRole> findRoleByUserId(int id);
	
}
```

```java
package com.blu.service;

import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {

}
```

**重点！实现UserService接口**

```java
package com.blu.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blu.entity.SysRole;
import com.blu.entity.SysUser;
import com.blu.mapper.LoginMapper;
import com.blu.mapper.UserMapper;
import com.blu.service.UserService;

@Service
@Transactional
public class UserServiceImpl implements UserService {
	
	@Autowired
	private UserMapper userMapper;
	
	@Autowired
	private RoleMapper roleMapper;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		try {
			SysUser sysUser = userMapper.loadUserByUsername(username);
			if(sysUser==null) {
				return null;
			}
			List<SimpleGrantedAuthority> authorities = new ArrayList<>();
			List<SysRole> list = roleMapper.findRoleByUserId(sysUser.getId());
			for(SysRole role : list) {
				authorities.add(new SimpleGrantedAuthority(role.getName()));
			}
			//封装 SpringSecurity  需要的UserDetails 对象并返回
			UserDetails userDetails = new User(sysUser.getName(),sysUser.getPassword(),authorities);
			return userDetails;
		} catch (Exception e) {
			e.printStackTrace();
			//返回null即表示认证失败
			return null;
		}
	}

}
```

**加密类**

```java
@Bean
public BCryptPasswordEncoder bcryptPasswordEncoder(){
	return new BCryptPasswordEncoder();
}
```

**认证：**

```java
@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userServiceImpl).passwordEncoder(bcryptPasswordEncoder);
	}
```

#### 11.3.5 权限控制和注销

开启自动配置的注销的功能

```java
//定制请求的授权规则
@Override
protected void configure(HttpSecurity http) throws Exception {
   //....
   //开启自动配置的注销的功能
      // /logout 注销请求
   http.logout();
}
```

如果注销404了，就是因为它默认防止csrf跨站请求伪造，因为会产生安全问题，我们可以将请求改为post表单提交，或者在spring security中关闭csrf功能；我们试试：在 配置中增加 `http.csrf().disable();`

```java
http.csrf().disable();//关闭csrf功能:跨站请求伪造,默认只能通过post方式提交logout请求
http.logout().logoutSuccessUrl("/");
```

#### 11.3.6 记住我功能

```java
//定制请求的授权规则
@Override
protected void configure(HttpSecurity http) throws Exception {
//。。。。。。。。。。。
   //记住我
   http.rememberMe();
}
```

#### 11.3.7 定制登录页

```java
http.formLogin().loginPage("/toLogin");
```

#### 11.3.8 配置文件的完整代码

```java
package com.moity.config;

import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

   //定制请求的授权规则
   @Override
   protected void configure(HttpSecurity http) throws Exception {

       http.authorizeRequests().antMatchers("/").permitAll()
      .antMatchers("/level1/**").hasRole("vip1")
      .antMatchers("/level2/**").hasRole("vip2")
      .antMatchers("/level3/**").hasRole("vip3");


       //开启自动配置的登录功能：如果没有权限，就会跳转到登录页面！
           // /login 请求来到登录页
           // /login?error 重定向到这里表示登录失败
       http.formLogin()
          .usernameParameter("username")
          .passwordParameter("password")
          .loginPage("/toLogin")
          .loginProcessingUrl("/login"); // 登陆表单提交请求

       //开启自动配置的注销的功能
           // /logout 注销请求
           // .logoutSuccessUrl("/"); 注销成功来到首页

       http.csrf().disable();//关闭csrf功能:跨站请求伪造,默认只能通过post方式提交logout请求
       http.logout().logoutSuccessUrl("/");

       //记住我
       http.rememberMe().rememberMeParameter("remember");
  }

   //定义认证规则
   @Override
   protected void configure(AuthenticationManagerBuilder auth) throws Exception {
       //在内存中定义，也可以在jdbc中去拿....
       //Spring security 5.0中新增了多种加密方式，也改变了密码的格式。
       //要想我们的项目还能够正常登陆，需要修改一下configure中的代码。我们要将前端传过来的密码进行某种方式加密
       //spring security 官方推荐的是使用bcrypt加密方式。

       auth.inMemoryAuthentication().passwordEncoder(new BCryptPasswordEncoder())
              .withUser("moity").password(new BCryptPasswordEncoder().encode("123456")).roles("vip2","vip3")
              .and()
              .withUser("root").password(new BCryptPasswordEncoder().encode("123456")).roles("vip1","vip2","vip3")
              .and()
              .withUser("guest").password(new BCryptPasswordEncoder().encode("123456")).roles("vip1","vip2");
  }
}
```

## 12. 集成 Shiro

### 12.1 导入依赖

```xml
<!-- https://mvnrepository.com/artifact/org.apache.shiro/shiro-spring-boot-web-starter -->
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-spring-boot-web-starter</artifactId>
    <version>1.8.0</version>
</dependency>
```

### 12.2 编写配置文件

Shiro 三大要素

```
subject -> ShiroFilterFactoryBean
securityManager -> DefaultWebSecurityManager
realm
```

实际操作中对象创建的顺序 ： realm -> securityManager -> subject

#### 12.2.1 编写自定义的 realm ，需要继承 `AuthorizingRealm`

```java
//自定义的 Realm
public class UserRealm extends AuthorizingRealm {
    //授权
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        System.out.println("执行授权逻辑!");
    	//给资源进行授权
        SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
        //添加授权字符串,就是在shiroConfig中授权时定义的字符串
        //到数据库中查询当前登录用户的授权字符串
        //获取当前用户
        Subject subject = SecurityUtils.getSubject();
        //要想获取到当前用户,需要在下面的认证逻辑完成传过来

        User user = (User) subject.getPrincipal();
        User dbUser = userService.selectUserById(user.getId());

      	//然后添加授权字符串
    	info.addStringPermission(dbUser.getPerms());
  		//  info.addStringPermission("user:add");
 		//   info.addStringPermissions();  添加一个集合
      return info;
    }

    //认证
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        System.out.println("执行认证逻辑!");
        //编写Shiro的判断逻辑,判断用户名和密码
        UsernamePasswordToken token1 = (UsernamePasswordToken) token;
        //通过登录传过来的用户名查询数据库中的用户是否存在!
        User user = userService.selectUserByName(token1.getUsername());
        //判断用户名
        if(user==null){
            //用户名不存在!
            return null; //Shiro底层会抛出UnKnowAccountException Controller中进行捕获
        }
        //判断密码
        return new SimpleAuthenticationInfo("",user.getPassword(),"");
    }
}
```

#### 12.2.2 编写Shiro的配置类

```java
@Configuration
public class ShiroConfig {

    /**
     *  创建ShiroFilterFactoryBean
     *  subject -> ShiroFilterFactoryBean
     *  @Qualifier("securityManager") 指定 Bean 的名字为 securityManager
     */
    @Qualifier("securityManager") 指定 Bean 的名字为 securityManager
    public ShiroFilterFactoryBean getShiroFilterFactoryBean(@Qualifier("securityManager") DefaultWebSecurityManager securityManager){

        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
        //1.设置安全管理器
        shiroFilterFactoryBean.setSecurityManager(securityManager);

        return shiroFilterFactoryBean;
    }

    /**
     *  创建DefaultWebSecurityManager
     *  使用@Qualifier注解从Apring容器中引入UserRealm
     *  @Qualifier("userRealm") 指定 Bean 的名字为 userRealm
     *  spring 默认的 BeanName 就是方法名
     *  name 属性 指定 BeanName
     */
    @Bean(name = "securityManager")
    public DefaultWebSecurityManager getDefaultWebSecurityManager(@Qualifier("userRealm") UserRealm userRealm){
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        //关联realm
        securityManager.setRealm(userRealm);
        return securityManager;
    }

    /**
     *  创建Realm对象
     *  加载到spring容器中共其他方法调用
     *  让 spring 托管自定义的 realm 类	
     */

    @Bean(name ="userRealm")
    public UserRealm getRealm(){
        return new UserRealm();
    }
}
```

## 13. 集成Redis

### 13.1 导入相关依赖

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 13.2 配置文件

```yaml
# 配置 Redis
spring:
  redis:
    host: 192.168.142.120
    port: 6379
```

### 13.3 RedisConfig 

```java
@Configuration
public class RedisConfig {
    /**
     *  编写自定义的 redisTemplate
     *  这是一个比较固定的模板
     */
    @Bean
    @SuppressWarnings("all")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) throws UnknownHostException {
        // 为了开发方便，直接使用<String, Object>
        RedisTemplate<String, Object> template = new RedisTemplate();
        template.setConnectionFactory(redisConnectionFactory);

        // Json 配置序列化
        // 使用 jackson 解析任意的对象
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        // 使用 objectMapper 进行转义
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);
        // String 的序列化
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        // key 采用 String 的序列化方式
        template.setKeySerializer(stringRedisSerializer);
        // Hash 的 key 采用 String 的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);
        // value 采用 jackson 的序列化方式
        template.setValueSerializer(jackson2JsonRedisSerializer);
        // Hash 的 value 采用 jackson 的序列化方式
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        // 把所有的配置 set 进 template
        template.afterPropertiesSet();

        return template;
    }
}
```

13.4 Redis工具类

```java
package com.example.redis.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
public final class RedisUtil {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // =============================common============================
    /**
     * 指定缓存失效时间
     * @param key  键
     * @param time 时间(秒)
     */
    public boolean expire(String key, long time) {
        try {
            if (time > 0) {
                redisTemplate.expire(key, time, TimeUnit.SECONDS);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据key 获取过期时间
     * @param key 键 不能为null
     * @return 时间(秒) 返回0代表为永久有效
     */
    public long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }


    /**
     * 判断key是否存在
     * @param key 键
     * @return true 存在 false不存在
     */
    public boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 删除缓存
     * @param key 可以传一个值 或多个
     */
    @SuppressWarnings("unchecked")
    public void del(String... key) {
        if (key != null && key.length > 0) {
            if (key.length == 1) {
                redisTemplate.delete(key[0]);
            } else {
                redisTemplate.delete((Collection<String>) CollectionUtils.arrayToList(key));
            }
        }
    }


    // ============================String=============================

    /**
     * 普通缓存获取
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }

    /**
     * 普通缓存放入
     * @param key   键
     * @param value 值
     * @return true成功 false失败
     */

    public boolean set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 普通缓存放入并设置时间
     * @param key   键
     * @param value 值
     * @param time  时间(秒) time要大于0 如果time小于等于0 将设置无限期
     * @return true成功 false 失败
     */

    public boolean set(String key, Object value, long time) {
        try {
            if (time > 0) {
                redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
            } else {
                set(key, value);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 递增
     * @param key   键
     * @param delta 要增加几(大于0)
     */
    public long incr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递增因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key, delta);
    }


    /**
     * 递减
     * @param key   键
     * @param delta 要减少几(小于0)
     */
    public long decr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递减因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key, -delta);
    }


    // ================================Map=================================

    /**
     * HashGet
     * @param key  键 不能为null
     * @param item 项 不能为null
     */
    public Object hget(String key, String item) {
        return redisTemplate.opsForHash().get(key, item);
    }

    /**
     * 获取hashKey对应的所有键值
     * @param key 键
     * @return 对应的多个键值
     */
    public Map<Object, Object> hmget(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * HashSet
     * @param key 键
     * @param map 对应多个键值
     */
    public boolean hmset(String key, Map<String, Object> map) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * HashSet 并设置时间
     * @param key  键
     * @param map  对应多个键值
     * @param time 时间(秒)
     * @return true成功 false失败
     */
    public boolean hmset(String key, Map<String, Object> map, long time) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 向一张hash表中放入数据,如果不存在将创建
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张hash表中放入数据,如果不存在将创建
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @param time  时间(秒) 注意:如果已存在的hash表有时间,这里将会替换原有的时间
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value, long time) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 删除hash表中的值
     *
     * @param key  键 不能为null
     * @param item 项 可以使多个 不能为null
     */
    public void hdel(String key, Object... item) {
        redisTemplate.opsForHash().delete(key, item);
    }


    /**
     * 判断hash表中是否有该项的值
     *
     * @param key  键 不能为null
     * @param item 项 不能为null
     * @return true 存在 false不存在
     */
    public boolean hHasKey(String key, String item) {
        return redisTemplate.opsForHash().hasKey(key, item);
    }


    /**
     * hash递增 如果不存在,就会创建一个 并把新增后的值返回
     *
     * @param key  键
     * @param item 项
     * @param by   要增加几(大于0)
     */
    public double hincr(String key, String item, double by) {
        return redisTemplate.opsForHash().increment(key, item, by);
    }


    /**
     * hash递减
     *
     * @param key  键
     * @param item 项
     * @param by   要减少记(小于0)
     */
    public double hdecr(String key, String item, double by) {
        return redisTemplate.opsForHash().increment(key, item, -by);
    }


    // ============================set=============================

    /**
     * 根据key获取Set中的所有值
     * @param key 键
     */
    public Set<Object> sGet(String key) {
        try {
            return redisTemplate.opsForSet().members(key);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 根据value从一个set中查询,是否存在
     *
     * @param key   键
     * @param value 值
     * @return true 存在 false不存在
     */
    public boolean sHasKey(String key, Object value) {
        try {
            return redisTemplate.opsForSet().isMember(key, value);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 将数据放入set缓存
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSet(String key, Object... values) {
        try {
            return redisTemplate.opsForSet().add(key, values);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 将set数据放入缓存
     *
     * @param key    键
     * @param time   时间(秒)
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSetAndTime(String key, long time, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().add(key, values);
            if (time > 0) {
                expire(key, time);
            }
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 获取set缓存的长度
     *
     * @param key 键
     */
    public long sGetSetSize(String key) {
        try {
            return redisTemplate.opsForSet().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 移除值为value的
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 移除的个数
     */

    public long setRemove(String key, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().remove(key, values);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    // ===============================list=================================

    /**
     * 获取list缓存的内容
     *
     * @param key   键
     * @param start 开始
     * @param end   结束 0 到 -1代表所有值
     */
    public List<Object> lGet(String key, long start, long end) {
        try {
            return redisTemplate.opsForList().range(key, start, end);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 获取list缓存的长度
     *
     * @param key 键
     */
    public long lGetListSize(String key) {
        try {
            return redisTemplate.opsForList().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }


    /**
     * 通过索引 获取list中的值
     *
     * @param key   键
     * @param index 索引 index>=0时， 0 表头，1 第二个元素，依次类推；index<0时，-1，表尾，-2倒数第二个元素，依次类推
     */
    public Object lGetIndex(String key, long index) {
        try {
            return redisTemplate.opsForList().index(key, index);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     */
    public boolean lSet(String key, Object value) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 将list放入缓存
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     */
    public boolean lSet(String key, Object value, long time) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

    }


    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @return
     */
    public boolean lSet(String key, List<Object> value) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

    }


    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     * @return
     */
    public boolean lSet(String key, List<Object> value, long time) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 根据索引修改list中的某条数据
     *
     * @param key   键
     * @param index 索引
     * @param value 值
     * @return
     */

    public boolean lUpdateIndex(String key, long index, Object value) {
        try {
            redisTemplate.opsForList().set(key, index, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    /**
     * 移除N个值为value
     *
     * @param key   键
     * @param count 移除多少个
     * @param value 值
     * @return 移除的个数
     */

    public long lRemove(String key, long count, Object value) {
        try {
            Long remove = redisTemplate.opsForList().remove(key, count, value);
            return remove;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }

    }

}
```

## 14.  注解

### 14.1 @Conditional类注解

@Conditional(TestCondition.class)

这句代码可以标注在类上面，表示该类下面的所有@Bean都会启用配置，也可以标注在方法上面，只是对该方法启用配置。

@ConditionalOnBean（仅仅在当前上下文中存在某个对象时，才会实例化一个Bean）
@ConditionalOnClass（某个class位于类路径上，才会实例化一个Bean）
@ConditionalOnExpression（当表达式为true的时候，才会实例化一个Bean）
@ConditionalOnMissingBean（仅仅在当前上下文中不存在某个对象时，才会实例化一个Bean）
@ConditionalOnMissingClass（某个class类路径上不存在的时候，才会实例化一个Bean）
@ConditionalOnNotWebApplication（不是web应用）

### 14.2 @Configuration注解

**@Configuration注解可以达到在Spring中使用xml配置文件的作用。**

**@Bean就等同于xml配置文件中的**

```
<bean>....</bean>
```

### 14.3 @Import注解

@Import注解是用来导入配置类或者一些需要前置加载的类

@import 给容器导入/创造出所需要的组件

**使用**

@import({ .class , .class }) 类里面存放class型的数组

**例如**

```
@Improt({user.class})
在容器中创造出来的组件就是com.moi.pojo.user
给容器创造出这个类型的组件，默认组件的名字就是全类名
```

### 14.4 @ImportResource注解

@ImportResource用于导入Spring的配置文件，让配置文件（如applicationContext.xml，bean.xml）里面的内容生效

@ImportResource标注在一个配置类上。

```java
@Configuration
@ImportResource({"classpath*:applicationContext.xml"})
public class XmlConfiguration {
}
```

### 14.5 @ConfigurationProperties注解

**把配置文件的信息，读取并自动封装成实体类**

#### 14.5.1 添加Spring Boot依赖

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
```

#### 14.5.2 例子

```java
@Component
@ConfigurationProperties(prefix="connection")
public class ConnectionSettings {

    private String username;
    private String remoteAddress;
    private String password ;
    
}
```

```properties
connection.username=admin
connection.password=kyjufskifas2jsfs
connection.remoteAddress=192.168.1.1
```

我们还可以把@ConfigurationProperties还可以直接定义在@bean的注解上，这是bean实体类就不用@Component和@ConfigurationProperties了

```java
@SpringBootApplication
public class DemoApplication{

    //...

    @Bean
    @ConfigurationProperties(prefix = "connection")
    public ConnectionSettings connectionSettings(){
        return new ConnectionSettings();

    }

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

然后我们需要使用的时候就直接这样子注入

```java
@RestController
@RequestMapping("/task")
public class TaskController {

    @Autowired ConnectionSettings conn;

    @RequestMapping(value = {"/",""})
    public String hellTask(){
        String userName = conn.getUsername();     
        return "hello task !!";
    }

}
```

#### 14.5.3 属性验证

**@ConfigurationProperties可以使用标准的JSR-303格式来做属性验证**

```java
@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "mail")
public class ConfigProperties {

    @NotEmpty
    private String hostName;
    @Min(1025)
    @Max(65536)
    private int port;
    @Pattern(regexp = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,6}$")
    private String from;
}
```

如果不满足条件则会报错

### 14.6 @ComponentScan注解

#### 14.6.1 注解的定义如下：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Repeatable(ComponentScans.class)
public @interface ComponentScan {

   /**
    * 扫描路径
    * @ComponentScan(value = "spring.annotation.componentscan")
    */
   @AliasFor("basePackages")
   String[] value() default {};

   /**
    * 扫描路径
    */
   @AliasFor("value")
   String[] basePackages() default {};

   /**
    * 指定扫描类
    * @ComponentScan(basePackageClasses = {BookDao.class, BookService.class})
    */
   Class<?>[] basePackageClasses() default {};

   /**
    * 命名注册的Bean，可以自定义实现命名Bean，
    * 1、@ComponentScan(value = "spring.annotation.componentscan",nameGenerator = MyBeanNameGenerator.class)
    * MyBeanNameGenerator.class 需要实现 BeanNameGenerator 接口，所有实现BeanNameGenerator 接口的实现类都会被调用
    * 2、使用 AnnotationConfigApplicationContext 的 setBeanNameGenerator方法注入一个BeanNameGenerator
    * BeanNameGenerator beanNameGenerator = (definition,registry)-> String.valueOf(new Random().nextInt(1000));
    * AnnotationConfigApplicationContext annotationConfigApplicationContext = new AnnotationConfigApplicationContext();
    * annotationConfigApplicationContext.setBeanNameGenerator(beanNameGenerator);
    * annotationConfigApplicationContext.register(MainConfig2.class);
    * annotationConfigApplicationContext.refresh();
    * 第一种方式只会重命名@ComponentScan扫描到的注解类
    * 第二种只有是初始化的注解类就会被重命名
    * 列如第一种方式不会重命名 @Configuration 注解的bean名称，而第二种就会重命名 @Configuration 注解的Bean名称
    */
   Class<? extends BeanNameGenerator> nameGenerator() default BeanNameGenerator.class;

   /**
    * 用于解析@Scope注解，可通过 AnnotationConfigApplicationContext 的 setScopeMetadataResolver 方法重新设定处理类
    * ScopeMetadataResolver scopeMetadataResolver = definition -> new ScopeMetadata();  这里只是new了一个对象作为演示，没有做实际的逻辑操作
    * AnnotationConfigApplicationContext annotationConfigApplicationContext = new AnnotationConfigApplicationContext();
    * annotationConfigApplicationContext.setScopeMetadataResolver(scopeMetadataResolver);

    * annotationConfigApplicationContext.register(MainConfig2.class);
    * annotationConfigApplicationContext.refresh();
    * 也可以通过@ComponentScan 的 scopeResolver 属性设置
    *@ComponentScan(value = "spring.annotation.componentscan",scopeResolver = MyAnnotationScopeMetadataResolver.class)
    */
   Class<? extends ScopeMetadataResolver> scopeResolver() default AnnotationScopeMetadataResolver.class;

   /**
    * 用来设置类的代理模式
    */
   ScopedProxyMode scopedProxy() default ScopedProxyMode.DEFAULT;

   /**
    * 扫描路径 如 resourcePattern = "**/*.class"
    * 使用  includeFilters 和 excludeFilters 会更灵活
    */
   String resourcePattern() default ClassPathScanningCandidateComponentProvider.DEFAULT_RESOURCE_PATTERN;

   /**
    * 指示是否应启用对带有{@code @Component}，{@ code @Repository}，
    * {@ code @Service}或{@code @Controller}注释的类的自动检测。
    */
   boolean useDefaultFilters() default true;

   /**
    * 对被扫描的包或类进行过滤，若符合条件，不论组件上是否有注解，Bean对象都将被创建
    * @ComponentScan(value = "spring.annotation.componentscan",includeFilters = {
    *     @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class, Service.class}),
    *     @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {SchoolDao.class}),
    *     @ComponentScan.Filter(type = FilterType.CUSTOM, classes = {MyTypeFilter.class}),
    *     @ComponentScan.Filter(type = FilterType.ASPECTJ, pattern = "spring.annotation..*"),
    *     @ComponentScan.Filter(type = FilterType.REGEX, pattern = "^[A-Za-z.]+Dao$")
    * },useDefaultFilters = false)
    * useDefaultFilters 必须设为 false
    */
   Filter[] includeFilters() default {};

   /**
    * 指定哪些类型不适合进行组件扫描。
    * 用法同 includeFilters 一样
    */
   Filter[] excludeFilters() default {};

   /**
    * 指定是否应注册扫描的Bean以进行延迟初始化。
    * @ComponentScan(value = "spring.annotation.componentscan",lazyInit = true)
    */
   boolean lazyInit() default false;


   /**
    * 用于 includeFilters 或 excludeFilters 的类型筛选器
    */
   @Retention(RetentionPolicy.RUNTIME)
   @Target({})
   @interface Filter {

      /**
       * 要使用的过滤器类型，默认为 ANNOTATION 注解类型
       * @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class, Service.class})
       */
      FilterType type() default FilterType.ANNOTATION;

      /**
       * 过滤器的参数，参数必须为class数组，单个参数可以不加大括号
       * 只能用于 ANNOTATION 、ASSIGNABLE_TYPE 、CUSTOM 这三个类型
       * @ComponentScan.Filter(type = FilterType.ANNOTATION, value = {Controller.class, Service.class})
       * @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {SchoolDao.class})
       * @ComponentScan.Filter(type = FilterType.CUSTOM, classes = {MyTypeFilter.class})
       */
      @AliasFor("classes")
      Class<?>[] value() default {};

      /**
       * 作用同上面的 value 相同
       * ANNOTATION 参数为注解类，如  Controller.class, Service.class, Repository.class
       * ASSIGNABLE_TYPE 参数为类，如 SchoolDao.class
       * CUSTOM  参数为实现 TypeFilter 接口的类 ，如 MyTypeFilter.class
       * MyTypeFilter 同时还能实现 EnvironmentAware，BeanFactoryAware，BeanClassLoaderAware，ResourceLoaderAware 
       * 这四个接口
       * EnvironmentAware
       * 此方法用来接收 Environment 数据 ，主要为程序的运行环境，Environment 接口继承自 PropertyResolver 接口，
       * 详细内容在下方
       * @Override
       * public void setEnvironment(Environment environment) {
       *    String property = environment.getProperty("os.name");
       * }
       * 
       * BeanFactoryAware
       * BeanFactory Bean容器的根接口，用于操作容器，如获取bean的别名、类型、实例、是否单例的数据
       * @Override
       * public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
       *     Object bean = beanFactory.getBean("BeanName")
       * }
       * 
       * BeanClassLoaderAware
       * ClassLoader 是类加载器，在此方法里只能获取资源和设置加载器状态
       * @Override
       * public void setBeanClassLoader(ClassLoader classLoader) {
       *     ClassLoader parent = classLoader.getParent();
       * }
       * 
       * ResourceLoaderAware
       * ResourceLoader 用于获取类加载器和根据路径获取资源
       * public void setResourceLoader(ResourceLoader resourceLoader) {
       *     ClassLoader classLoader = resourceLoader.getClassLoader();
       * }
       */
      @AliasFor("value")
      Class<?>[] classes() default {};

      /**
       * 这个参数是 classes 或 value 的替代参数，主要用于 ASPECTJ 类型和  REGEX 类型
       * ASPECTJ  为 ASPECTJ 表达式
       * @ComponentScan.Filter(type = FilterType.ASPECTJ, pattern = "spring.annotation..*")
       * REGEX  参数为 正则表达式
       * @ComponentScan.Filter(type = FilterType.REGEX, pattern = "^[A-Za-z.]+Dao$")
       */
      String[] pattern() default {};

   }
}
```

#### 14.6.2 excludeFilters的使用

使用excludeFilters不扫描com.learn包中的Controller、Service注解，如下：

```java
@Configuration
@ComponentScan(basePackages = "com.learn",excludeFilters = {
		@Filter(type = FilterType.ANNOTATION,classes = {Controller.class,Service.class})
})
public class SpringConfig {
}
```

上面使用的excludeFilters用于设置排除的过滤条件，实现Filter接口的type属性用于设置过滤类型，默认值为`FilterType.ANNOTATION`，提供了这几个过滤类型：

* FilterType.ANNOTATION：按照注解过滤
* FilterType.ASSIGNABLE_TYPE：按照给定的类型过滤
* FilterType.ASPECTJ：按照ASPECTJ表达式过滤
* FilterType.REGEX：按照正则表达式过滤
* FilterType.CUSTOM：按照自定义规则过滤

classes和value属性为过滤器的参数，必须为class数组，类只能为以下三种类型：

* ANNOTATION 参数为注解类，如 Controller.class, Service.class,Repository.class
* ASSIGNABLE_TYPE 参数为类，如 SchoolDao.class
* CUSTOM 参数为实现 TypeFilter 接口的类 ，如 MyTypeFilter.class

#### 14.6.3 includeFilters的使用

includeFilters属性用于定义扫描过滤条件，满足该条件才进行扫描。用法与excludeFilters一样。
但是因为useDefaultFilters属性默认为true，即使用默认的过滤器，启用对带有@Component，@Repository，@Service，@Controller注释的类的自动检测。会将带有这些注解的类注册为bean装配到IoC容器中。所以使用includeFilters时，需要把useDefaultFilters设置为false，如下：

```java
@Configuration
@ComponentScan(basePackages = "com.learn",includeFilters = {
		@Filter(type = FilterType.ANNOTATION,classes = {Controller.class,Service.class})
},useDefaultFilters = false)
public class SpringConfig {

}
```

#### 14.6.4 自定义过滤规则

@ComponentScan注解扫描或解析的bean只能是Spring内部所定义的，比如@Component、@Service、@Controller或@Repository。如果要扫描一些自定义的注解，就可以自定义过滤规则来完成这个操作。

自定义一个类MyTypeFilter实现TypeFilter接口，这样这个TypeFilter就扫描所有类并只通过类名包含了controller的类，如下：

```java
public class MyTypeFilter implements TypeFilter {
    /**
     * 两个参数的含义：
     * metadataReader：包含读取到的当前正在扫描的类的信息
     * metadataReaderFactory:可以获取到当前正在扫描的类的其他类信息(如父类和接口)
     * match方法返回false即不通过过滤规则，true通过过滤规则
     */
	@Override
	public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory)
			throws IOException {
		// TODO Auto-generated method stub
	     //获取当前类注解的信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
        //获取当前正在扫描的类的类信息
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        //获取当前类资源（类的路径）
        Resource resource = metadataReader.getResource();
        String className = classMetadata.getClassName();
        if(className.contains("controller")){
            return true;
        }
        return false;
	}
}
```

在@ComponentScan注解中进行配置，如下：

```java
@Configuration
@ComponentScan(basePackages = "com.learn",includeFilters = {
		@Filter(type = FilterType.ASSIGNABLE_TYPE,classes = {Person.class}),
		@Filter(type = FilterType.CUSTOM,classes = {MyTypeFilter.class}),
},useDefaultFilters = false)
public class SpringConfig {
}
```

### 14.7 @MatrixVariable

在Spring3.2 后，一个@MatrixVariable出现了，这个注解的出现拓展了URL请求地址的功能。
Matrix Variable中，多个变量可以使用“;”（分号）分隔，例如：
`/cars;color=red;year=2012`
如果是一个变量的多个值那么可以使用“,”（逗号）分隔
`color=red,green,blue`
或者可以使用重复的变量名：
`color=red;color=green;color=blue`

**Springboot 默认是无法使用矩阵变量绑定参数的。需要覆盖WebMvcConfigurer中的configurePathMatch方法。**

```java
@Configuration
public class WebConfig extends WebMvcConfigurerAdapter {
 
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        UrlPathHelper urlPathHelper=new UrlPathHelper();
        urlPathHelper.setRemoveSemicolonContent(false);
        configurer.setUrlPathHelper(urlPathHelper);
    }
}
```

**`@MatrixVariable`的用例**

```java
@RestController
public class ParameterTestController {

    ///cars/sell;low=34;brand=byd,audi,yd
    @GetMapping("/cars/{path}")
    public Map carsSell(@MatrixVariable("low") Integer low,
                        @MatrixVariable("brand") List<String> brand,
                        @PathVariable("path") String path){
        Map<String,Object> map = new HashMap<>();

        map.put("low",low);
        map.put("brand",brand);
        map.put("path",path);
        return map;
    }

    // /boss/1;age=20/2;age=10

    @GetMapping("/boss/{bossId}/{empId}")
    public Map boss(@MatrixVariable(value = "age",pathVar = "bossId") Integer bossAge,
                    @MatrixVariable(value = "age",pathVar = "empId") Integer empAge){
        Map<String,Object> map = new HashMap<>();

        map.put("bossAge",bossAge);
        map.put("empAge",empAge);
        return map;

    }

}
```

















## 其他

### 错误处理-SpringBoot默认错误处理机制

默认规则：

默认情况下，Spring Boot提供/error处理所有错误的映射

机器客户端，它将生成JSON响应，其中包含错误，HTTP状态和异常消息的详细信息。对于浏览器客户端，响应一个“ whitelabel”错误视图，以HTML格式呈现相同的数据

```json
{
  "timestamp": "2020-11-22T05:53:28.416+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "No message available",
  "path": "/asadada"
}
```

* 要对其进行自定义，添加View解析为error
* 要完全替换默认行为，可以实现 ErrorController并注册该类型的Bean定义，或添加ErrorAttributes类型的组件以使用现有机制但替换其内容。
* /templates/error/下的4xx，5xx页面会被自动解析

![image-20210901205558834](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210901205558834.png)

### 原生注解与Spring方式注入

**使用原生的注解**

```java
@WebServlet(urlPatterns = "/my")
public class MyServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("66666");
    }
}
```

```java
@Slf4j
@WebFilter(urlPatterns={"/css/*","/images/*"}) //my
public class MyFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("MyFilter初始化完成");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        log.info("MyFilter工作");
        chain.doFilter(request,response);
    }

    @Override
    public void destroy() {
        log.info("MyFilter销毁");
    }
}
```

```java
@Slf4j
@WebListener
public class MyServletContextListener implements ServletContextListener {


    @Override
    public void contextInitialized(ServletContextEvent sce) {
        log.info("MySwervletContextListener监听到项目初始化完成");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        log.info("MySwervletContextListener监听到项目销毁");
    }
}
```

最后还要在主启动类添加注解`@ServletComponentScan`

```java
@ServletComponentScan(basePackages = "com.lun")//
@SpringBootApplication(exclude = RedisAutoConfiguration.class)
public class Boot05WebAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(Boot05WebAdminApplication.class, args);
    }
}
```

**Spring方式注入**

ServletRegistrationBean，FilterRegistrationBean，和ServletListenerRegistrationBean

```java
@Configuration(proxyBeanMethods = true)
public class MyRegistConfig {

    @Bean
    public ServletRegistrationBean myServlet(){
        MyServlet myServlet = new MyServlet();

        return new ServletRegistrationBean(myServlet,"/my","/my02");
    }


    @Bean
    public FilterRegistrationBean myFilter(){

        MyFilter myFilter = new MyFilter();
//        return new FilterRegistrationBean(myFilter,myServlet());
        FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean(myFilter);
        filterRegistrationBean.setUrlPatterns(Arrays.asList("/my","/css/*"));
        return filterRegistrationBean;
    }

    @Bean
    public ServletListenerRegistrationBean myListener(){
        MySwervletContextListener mySwervletContextListener = new MySwervletContextListener();
        return new ServletListenerRegistrationBean(mySwervletContextListener);
    }
}
```

### Springboot打包部署在Linux中的tomcat中

#### 1. 移除内置的tomcat

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <!-- 移除嵌入式tomcat插件 -->
            <exclusions>
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>Spring-boot-start-tomcat</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
```

#### 2. 引入所需依赖包（既可以本地直接运行，又可以在服务器上面运行）

```xml
<!-- https://mvnrepository.com/artifact/javax.servlet/javax.servlet-api -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.1</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
            <scope>provided</scope>
        </dependency>
```

#### 3. 继承SpringBootServletInitializer类

**第一种方法**

**直接在启动类上面继承**

```java
/**
 * @author MOITY
 */
@SpringBootApplication
public class MoityApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(MoityApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(MoityApplication.class, args);
    }

}
```

**第二种方法**

**建立一个新的配置类**

```java
/**
 * @author MOITY
 */
@SpringBootApplication
public class MySpringBootServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        //形参是启动类的class
        return builder.sources(MoityApplication.class);
    }

}
```



**最后像springmvc一样打war包上床到tomcat的webapps中**

### 注意

开启springboot时报错

```
Failed to execute goal org.apache.maven.plugins:maven-surefire-plugin:2.22.2:test (default-test) on project swagger: There are test failures.

Please refer to F:\IDEA\springboot\swagger\target\surefire-reports for the individual test results.
Please refer to dump files (if any exist) [date].dump, [date]-jvmRun[N].dump and [date].dumpstream.
```

**解决办法**

在pox.xml中加入

```xml
<plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>2.22.2</version>
                <configuration>
                    <skipTests>true</skipTests>
                </configuration>
            </plugin>
```

