---
title: SSM+Redis+SpirngMVC配置
description: SSM+Redis+SpirngMVC配置
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
updated: 2022-07-28
comments: false
---
# pom.xml

```xml
<properties>
        <env>dev</env>
        <!-- 解决配置文件中的中文乱码 -->
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

<dependencies>
        <!--opengauss数据库连接-->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>42.2.23</version>
        </dependency>
        <!--junit测试-->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13</version>
        </dependency>
        <!--spring-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.3.9</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.3.9</version>
        </dependency>
        <!--mybatis在spring中的配件-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>2.0.6</version>
        </dependency>
        <!--mybatis-->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.4</version>
        </dependency>
        <!--连接池-->
        <dependency>
            <groupId>com.mchange</groupId>
            <artifactId>c3p0</artifactId>
            <version>0.9.5.2</version>
        </dependency>
        <!--web需要-->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>servlet-api</artifactId>
            <version>2.5</version>
        </dependency>
        <!--分页-->
        <dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper</artifactId>
            <version>5.2.0</version>
        </dependency>
        <dependency>
            <groupId>com.github.jsqlparser</groupId>
            <artifactId>jsqlparser</artifactId>
            <version>4.0</version>
        </dependency>
        <!--jackson-->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.12.4</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-core</artifactId>
            <version>2.12.4</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-annotations</artifactId>
            <version>2.12.4</version>
        </dependency>
        <!--JWT-->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt</artifactId>
            <version>0.6.0</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.2</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.2</version>
        </dependency>
        <!--AOP面向切面-->
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjweaver</artifactId>
            <version>1.9.4</version>
        </dependency>
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjrt</artifactId>
            <version>1.8.13</version>
        </dependency>
        <!--tomcat-->
        <dependency>
            <groupId>org.apache.tomcat</groupId>
            <artifactId>tomcat-coyote</artifactId>
            <version>10.0.4</version>
        </dependency>
        <!--文件上传-->
        <dependency>
            <groupId>commons-fileupload</groupId>
            <artifactId>commons-fileupload</artifactId>
            <version>1.3.3</version>
        </dependency>
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.4</version>
        </dependency>
        <!--excel-->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>4.1.2</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>4.1.2</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>easyexcel</artifactId>
            <version>2.2.10</version>
        </dependency>
        <!--其他配置-->
        <dependency>
            <groupId>javax.xml.bind</groupId>
            <artifactId>jaxb-api</artifactId>
            <version>2.3.0</version>
        </dependency>
        <dependency>
            <groupId>com.sun.xml.bind</groupId>
            <artifactId>jaxb-impl</artifactId>
            <version>2.3.0</version>
        </dependency>
        <dependency>
            <groupId>com.sun.xml.bind</groupId>
            <artifactId>jaxb-core</artifactId>
            <version>2.3.0</version>
        </dependency>
        <dependency>
            <groupId>javax.activation</groupId>
            <artifactId>activation</artifactId>
            <version>1.1.1</version>
        </dependency>
        <!--日志-->
        <!-- slf4j + log4j2 begin -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>1.7.32</version>
        </dependency>
        <!-- 桥接：告诉Slf4j使用Log4j2 -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-slf4j-impl</artifactId>
            <version>2.14.1</version>
        </dependency>
        <!-- 桥接：告诉commons logging使用Log4j2 -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-jcl</artifactId>
            <version>2.14.1</version>
        </dependency>
        <!-- 使用Log4j2 -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>2.14.1</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.14.1</version>
        </dependency>
        <!--异步日志输出-->
        <dependency>
            <groupId>com.lmax</groupId>
            <artifactId>disruptor</artifactId>
            <version>3.4.2</version>
        </dependency>
        <!--全局异常捕获需要jar (guava)-->
        <dependency>
            <groupId>com.google.collections</groupId>
            <artifactId>google-collections</artifactId>
            <version>1.0</version>
        </dependency>
        <!--解决跨域
        <dependency>
            <groupId>com.thetransactioncompany</groupId>
            <artifactId>cors-filter</artifactId>
            <version>2.5</version>
        </dependency>
        <dependency>
            <groupId>com.thetransactioncompany</groupId>
            <artifactId>java-property-utils</artifactId>
            <version>1.9.1</version>
        </dependency>-->
        <!--redis-->
        <dependency>
            <groupId>redis.clients</groupId>
            <artifactId>jedis</artifactId>
            <version>3.6.1</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.data</groupId>
            <artifactId>spring-data-redis</artifactId>
            <version>2.5.2</version>
        </dependency>
        <!--session-->
        <dependency>
            <groupId>org.springframework.session</groupId>
            <artifactId>spring-session-data-redis</artifactId>
            <version>2.5.1</version>
        </dependency>
    	<!--解决报错 UTF-8 序列的字节 2 无效问题-->
        <dependency>
            <groupId>javax.annotation</groupId>
            <artifactId>javax.annotation-api</artifactId>
            <version>1.3.2</version>
        </dependency>
    </dependencies>

    <build>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <includes>
                    <include>**/*.properties</include>
                    <include>**/*.xml</include>
                </includes>
                <filtering>true</filtering>
            </resource>
            <resource>
                <directory>src/main/java</directory>
                <includes>
                    <include>**/*.properties</include>
                    <include>**/*.xml</include>
                </includes>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
```

# applicationContext.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="classpath:spring-dao.xml"/>
    <import resource="classpath:spring-service.xml"/>
    <import resource="classpath:springMVC-servlet.xml"/>
    <import resource="classpath:spring-redis.xml"/>
</beans>
```

# database.properties

```properties
driver=org.postgresql.Driver
url=jdbc:postgresql://39.99.140.114:15432/QG_Display?ApplicationName=app1
user=gaussdb
password=Enmo@123
```

# mybatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!-- 指定约束文件，固定写法。作用为检查当前文件出现的标签是否符合 mybatis 的要求 -->
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>

    <plugins>
        <!-- com.github.pagehelper为PageHelper类所在包名 -->
        <plugin interceptor="com.github.pagehelper.PageInterceptor">
            <!-- 设置数据库类型 Oracle,Mysql,MariaDB,SQLite,Hsqldb,PostgreSQL六种数据库 -->
            <property name="helpDialect" value="PostgreSQL" />
            <property name="reasonable" value="true" />
        </plugin>
    </plugins>

</configuration>
```

# redis.properties(确定)

```properties
redis.host=127.0.0.1
redis.port=6379
redis.password=123456
#最大空闲数(默认:8)
redis.maxIdle=300
#当连接池资源耗尽时,调用者最大阻塞时间,超时将抛出异常.单位:毫秒,默认:-1,表示永不超时.
redis.maxWaitMillis=1000
#最大连接数(默认:8)
redis.maxTotal=500
#指明是否在从池中取出连接前进行检验,如果检验失败,则从池中去除连接并尝试取出另一个 (默认:false)
redis.testOnBorrow=true
redis.testOnReturn=true
redis.testWhileIdle=true
redis.blockWhenExhausted=false
redis.numTestsPerEvictionRun=1024
redis.timeBetweenEvictionRunsMillis=30000
redis.minEvictableIdleTimeMillis=1800000
```

# spring-dao.xml

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <!--配置扫描包-->
    <context:component-scan base-package="com.moi.dao"/>
    <context:property-placeholder location="classpath:*.properties"/>

    <!-- DataSource：使用 c3p0 的数据源替换 MyBatis 的配置 -->
    <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="${driver}"/>
        <property name="jdbcUrl" value="${url}"/>
        <property name="user" value="${user}"/>
        <property name="password" value="${password}"/>

        <!-- 设置连接池的最大最小连接数 -->
        <property name="maxPoolSize" value="10"/>
        <property name="minPoolSize" value="5"/>
        <!-- 不自动提交 -->
        <property name="autoCommitOnClose" value="false"/>
        <!-- 获取连接的超时时间 -->
        <property name="checkoutTimeout" value="10000"/>
        <!-- 当获取连接失败后的重试次数 -->
        <property name="acquireRetryAttempts" value="2"/>
    </bean>

    <!-- sqlSessionFactory -->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <!-- 绑定 MyBatis 配置文件 -->
        <property name="configLocation" value="classpath:mybatis-config.xml"/>
    </bean>


    <!-- 配置 dao 接口扫描包，实现动态将 dao 接口注入到 Spring 容器中 -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <!-- 注入 sqlSessionFactory -->
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"/>
        <!-- 要扫描的 dao 包 -->
        <property name="basePackage" value="com.moi.dao"/>
    </bean>
</beans>
```

# spring-redis.xml(确定)

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="
            http://www.springframework.org/schema/beans
            http://www.springframework.org/schema/beans/spring-beans.xsd
            http://www.springframework.org/schema/context
            http://www.springframework.org/schema/context/spring-context.xsd">

    <!--扫描redis配置文件-->
    <!--<context:property-placeholder ignore-unresolvable="true" location="classpath:redis.properties"/>-->
    <context:property-placeholder location="classpath:*.properties" />

    <!--配置扫描注解-->
    <!--<context:component-scan base-package="com.moi.utils"/>-->

    <!--设置连接池-->
    <bean id="poolConfig" class="redis.clients.jedis.JedisPoolConfig">
        <!-- 最大空闲连接数 -->
        <property name="maxIdle" value="${redis.maxIdle}"/>
        <!-- 最大连接数 -->
        <property name="maxTotal" value="${redis.maxTotal}" />
        <!-- 每次释放连接的最大数目 -->
        <property name="numTestsPerEvictionRun" value="${redis.numTestsPerEvictionRun}" />
        <!-- 释放连接的扫描间隔（毫秒） -->
        <property name="timeBetweenEvictionRunsMillis" value="${redis.timeBetweenEvictionRunsMillis}" />
        <!-- 连接最小空闲时间 -->
        <property name="minEvictableIdleTimeMillis" value="${redis.minEvictableIdleTimeMillis}" />
        <!-- 获取连接时的最大等待毫秒数,小于零:阻塞不确定的时间,默认-1 -->
        <property name="maxWaitMillis" value="${redis.maxWaitMillis}" />
        <!-- 在获取连接的时候检查有效性, 默认false -->
        <property name="testOnBorrow" value="${redis.testOnBorrow}" />
        <property name="testOnReturn" value="${redis.testOnReturn}" />
        <!-- 在空闲时检查有效性, 默认false -->
        <property name="testWhileIdle" value="${redis.testWhileIdle}" />
        <!-- 连接耗尽时是否阻塞, false报异常,ture阻塞直到超时, 默认true -->
        <property name="blockWhenExhausted" value="${redis.blockWhenExhausted}" />
    </bean>

    <!--springSession-->
    <!--maxInactiveIntervalInSeconds是过期时间-->
    <bean class="org.springframework.session.data.redis.config.annotation.web.http.RedisHttpSessionConfiguration"
          p:redisNamespace="mvc"
          p:maxInactiveIntervalInSeconds="3600"
          p:cookieSerializer-ref="defaultCookieSerializer"/>
    <!--配置一个Cookie序列化规则对象，用于改变Cookie的存放规则-->
    <!--cookiePath用于指定SpringSession存在域名的根目录下，用于实现同域不同项目的Session共享-->
    <bean id="defaultCookieSerializer" class="org.springframework.session.web.http.DefaultCookieSerializer"
          p:cookiePath="/"/>

    <!--Spring整合Jedis,设置连接属性-->
    <bean id="jedisConnectionFactory" class="org.springframework.data.redis.connection.jedis.JedisConnectionFactory"
          p:hostName="${redis.host}"
          p:port="${redis.port}"
          p:pool-config-ref="poolConfig"
          p:timeout="1000000000">
    </bean>

    <bean id="redisTemplate"
          class="org.springframework.data.redis.core.RedisTemplate">
        <property name="connectionFactory" ref="jedisConnectionFactory" />
        <!-- 如果不配置Serializer，那么存储的时候只能使用String，如果用对象类型存储，那么会提示错误 can't cast to String！！！-->
        <property name="keySerializer">
            <!--对key的默认序列化器。默认值是StringSerializer-->
            <bean class="org.springframework.data.redis.serializer.StringRedisSerializer"/>
        </property>
        <!--是对value的默认序列化器，默认值是取自DefaultSerializer的JdkSerializationRedisSerializer。-->
        <property name="valueSerializer">
            <bean class="org.springframework.data.redis.serializer.JdkSerializationRedisSerializer"/>
        </property>
        <!--存储Map时key需要的序列化配置-->
        <property name="hashKeySerializer">
            <bean class="org.springframework.data.redis.serializer.StringRedisSerializer"/>
        </property>
        <!--存储Map时value需要的序列化配置-->
        <property name="hashValueSerializer">
            <bean class="org.springframework.data.redis.serializer.JdkSerializationRedisSerializer"/>
        </property>
    </bean>

    <!--配置redis工具类bean-->
    <bean id="redisUtils" class="com.moi.utils.RedisUtil"></bean>
</beans>
```

# spring-service.xml

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <!-- 扫描 service 下的包 -->
    <context:component-scan base-package="com.moi.service"/>

    <!-- 配置注自动装配注解的支持 -->
    <context:annotation-config/>

    <!-- 将所有业务类注入到 Spring （也可以通过注解实现）-->

    <!-- 配置声明式事务 -->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <constructor-arg ref="dataSource"/>
    </bean>

</beans>
```

# springMVC-servlet.xml

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"

       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/mvc
        https://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 使用注解开发 SpringMVC 的流程如下 -->

    <!-- ① 自动扫描包，让指定包下的注解生效，由 IOC 容器统一管理 -->
    <context:component-scan base-package="com.moi.controller"/>

    <!--<context:component-scan base-package="com.qg.interceptor"/>
    <context:component-scan base-package="com.qg.exception"/>
	<context:component-scan base-package="com.moi.aop"/>
    <aop:aspectj-autoproxy proxy-target-class="true"/>-->

    <!-- ② 让 SpringMVC 不处理静态资源，如 .css .js .html 等 -->
    <mvc:default-servlet-handler/>

    <!-- ③ 支持 mvc 注解驱动 -->
    <!-- 相当于自动完成 HandlerMapping 和 HandlerAdapter 的注入
         使得要用到的注解 @RequestMapping 生效 -->
    <mvc:annotation-driven/>

    <!-- 视图解析器 DispatcherServlet 给他的 ModelAndView -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver" id="internalResourceViewResolver">
        <!-- 前缀 -->
        <property name="prefix" value="/"/>
        <!-- 后缀 -->
        <property name="suffix" value=".html"/>
    </bean>

    <mvc:annotation-driven>
        <mvc:message-converters register-defaults="true">
            <bean class="org.springframework.http.converter.StringHttpMessageConverter">
                <property name="supportedMediaTypes">
                    <list>
                        <value>text/html;charset=UTF-8</value>
                        <value>application/json;charset=UTF-8</value>
                        <value>text/plain;charset=UTF-8</value>
                        <value>application/xml;charset=UTF-8</value>
                    </list>
                </property>
            </bean>
        </mvc:message-converters>
    </mvc:annotation-driven>

    <bean id="multipartResolver"
          class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
        <!-- 设置上传文件的最大尺寸为 200MB -->
        <property name="maxUploadSize">
            <value>209715200</value>
        </property>
    </bean>

    <!--拦截器-->
    <!--<mvc:interceptors>
        &lt;!&ndash; 使用bean定义一个Interceptor，直接定义在mvc:interceptors根下面的Interceptor将拦截所有的请求 &ndash;&gt;
        &lt;!&ndash; <bean class="com.bybo.aca.web.interceptor.Login"/> &ndash;&gt;
        <mvc:interceptor>
             &lt;!&ndash;进行拦截：/**表示拦截所有controller&ndash;&gt;
            <mvc:mapping path="/update/**" />
            <mvc:mapping path="/token" />
            <mvc:mapping path="/u/**" />
            <mvc:mapping path="/project/u/**" />
            <mvc:mapping path="/resource/u/**" />
            &lt;!&ndash; 不进行拦截 &ndash;&gt;
            <mvc:exclude-mapping path="/user/login" />
            <bean class="com.qg.interceptor.JwtInterceptor" />
        </mvc:interceptor>
        <mvc:interceptor>
            <mvc:mapping path="/**"/>
            <bean class="com.qg.interceptor.SqlInjectInterceptor"/>
        </mvc:interceptor>
    </mvc:interceptors>-->

</beans>
```

# web.xml（确定）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <!-- 注册 DispatcherServlet（SpringMVC 的核心：请求分发器/前端控制器） -->
    <servlet>
        <servlet-name>springMVC</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- 关联一个 springmvc 配置文件 -->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <!-- 注意了！！ 要绑定在最终整合的哪个文件上 -->
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
        <!-- 设置启动级别 -->
        <load-on-startup>1</load-on-startup>
        <async-supported>true</async-supported>
    </servlet>
    <!-- / 匹配所有的请求（不包括 .html） -->
    <!-- /* 匹配所有的请求（包括 .html） -->
    <servlet-mapping>
        <servlet-name>springMVC</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

<!--    SpringSession-->
    <filter>
        <filter-name>springSessionRepositoryFilter</filter-name>
        <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>springSessionRepositoryFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!--xss过滤器-->
    <filter>
        <filter-name>XssEscape</filter-name>
        <filter-class>com.taxi.filter.RequestXssFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>XssEscape</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!-- 乱码过滤 -->
    <filter>
        <filter-name>encoding</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>utf-8</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>encoding</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!--解决跨域-->
    <filter>
        <description>跨域过滤器</description>
        <filter-name>CORS</filter-name>
        <filter-class>com.thetransactioncompany.cors.CORSFilter</filter-class>
        <init-param>
            <param-name>cors.allowOrigin</param-name>
            <param-value>*</param-value>
        </init-param>
        <init-param>
            <param-name>cors.supportedMethods</param-name>
            <param-value>GET, POST, HEAD, PUT, DELETE</param-value>
        </init-param>
        <init-param>
            <param-name>cors.supportedHeaders</param-name>
            <param-value>Accept, Origin, X-Requested-With, Content-Type, Last-Modified</param-value>
        </init-param>
        <init-param>
            <param-name>cors.exposedHeaders</param-name>
            <param-value>Set-Cookie</param-value>
        </init-param>
        <init-param>
            <param-name>cors.supportsCredentials</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>

    <filter-mapping>
        <filter-name>CORS</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```

# 日志：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--日志级别以及优先级排序: OFF > FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL -->
<!--status="WARN" :用于设置log4j2自身内部日志的信息输出级别，默认是OFF-->
<!--monitorInterval="30"  :间隔秒数,自动检测配置文件的变更和重新配置本身-->
<configuration status="WARN" monitorInterval="30">
    <Properties>
        <!--自定义一些常量，之后使用${变量名}引用-->
        <Property name="logFilePath">F://logs</Property>
        <Property name="logFileName">allLogs.log</Property>
        <Property name="Pattern">[%d{HH:mm:ss.SSS}] [%-5level] [类:%class{36}] [行数:%L] [方法:%M] -[错误信息:%msg]%n</Property>
    </Properties>
    <!--appenders:定义输出内容,输出格式,输出方式,日志保存策略等,常用其下三种标签[console,File,RollingFile]-->
    <appenders>
        <!--console :控制台输出的配置-->
        <console name="Console" target="SYSTEM_OUT">
            <!--PatternLayout :输出日志的格式,LOG4J2定义了输出代码,详见第二部分-->
            <PatternLayout pattern="${Pattern}"/>
            <Filters>
                <!--如果是INFO级别拒绝-->
                <ThresholdFilter level="info" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是DEBUG输出-->
                <ThresholdFilter level="debug" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </console>

        <!--File :同步输出日志到本地文件-->
        <!--append="false" :根据其下日志策略,每次清空文件重新输入日志,可用于测试-->
        <RandomAccessFile name="accessFile" fileName="${logFilePath}/${logFileName}" append="true">
            <PatternLayout pattern="${Pattern}"/>
        </RandomAccessFile>

        <!-- ${sys:user.home} :项目路径  也用不了 -->
        <!--RollingFile以Info输出-->
        <RollingFile name="RollingFileInfo" fileName="${logFilePath}/INFO/info.log"
                     filePattern="${logFilePath}/INFO/logs/$${date:yyyy-MM}/info-%d{yyyy-MM-dd}-%i.log"
                     append="true">
            <!--ThresholdFilter :日志输出过滤-->
            <!--level="info" :日志级别,onMatch="ACCEPT" :级别在info之上则接受,onMismatch="DENY" :级别在info之下则拒绝-->
            <Filters>
                <!--如果是warn级别拒绝-->
                <ThresholdFilter level="warn" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是info输出-->
                <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${Pattern}"/>
            <!-- Policies :日志滚动策略-->
            <Policies>
                <!-- TimeBasedTriggeringPolicy :时间滚动策略,默认0点小时产生新的文件,interval="6" : 自定义文件滚动时间间隔,每隔6小时产生新文件, modulate="true" : 产生文件是否以0点偏移时间,即6点,12点,18点,0点-->
                <TimeBasedTriggeringPolicy interval="6" modulate="true"/>
                <!-- SizeBasedTriggeringPolicy :文件大小滚动策略-->
                <SizeBasedTriggeringPolicy size="10 MB"/>
            </Policies>
            <!-- DefaultRolloverStrategy属性如不设置，则默认为最多同一文件夹下7个文件，这里设置了20 -->
            <DefaultRolloverStrategy max="25"/>
        </RollingFile>

        <!--RollingFile以warn输出-->
        <RollingFile name="RollingFileWarn" fileName="${logFilePath}/WARN/warn.log"
                     filePattern="${logFilePath}/WARN/logs/$${date:yyyy-MM}/warn-%d{yyyy-MM-dd}-%i.log"
                     append="true">
            <Filters>
                <!--如果是error级别拒绝-->
                <ThresholdFilter level="error" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是warn输出-->
                <ThresholdFilter level="warn" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${Pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="10 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="25"/>
        </RollingFile>

        <!--RollingFile以error输出-->
        <RollingFile name="RollingFileError" fileName="${logFilePath}/ERROR/error.log"
                     filePattern="${logFilePath}/ERROR/logs/$${date:yyyy-MM}/error-%d{yyyy-MM-dd}-%i.log"
                     append="true">
            <Filters>
                <!--如果是FATAL级别拒绝-->
                <ThresholdFilter level="fatal" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是error输出-->
                <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${Pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="10 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="25"/>
        </RollingFile>

        <!--RollingFile以debug输出-->
        <RollingFile name="RollingFileDebug" fileName="${logFilePath}/DEBUG/debug.log"
                     filePattern="${logFilePath}/DEBUG/logs/$${date:yyyy-MM}/error-%d{yyyy-MM-dd}-%i.log"
                     append="true">
            <Filters>
                <!--如果是INFO级别拒绝-->
                <ThresholdFilter level="info" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是DEBUG输出-->
                <ThresholdFilter level="debug" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${Pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="10 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="25"/>
        </RollingFile>

    </appenders>
    <!--然后定义logger，只有定义了logger并引入的appender，appender才会生效-->
    <loggers>
        <!--过滤掉spring和mybatis的一些无用的DEBUG信息-->
        <!--Logger节点用来单独指定日志的形式，name为包路径,比如要为org.springframework包下所有日志指定为INFO级别等。 -->
        <logger name="org.springframework" level="INFO"></logger>
        <logger name="org.mybatis" level="INFO"></logger>
        <!-- Root节点用来指定项目的根日志，如果没有单独指定Logger，那么就会默认使用该Root日志输出 -->
        <root level="debug">
            <appender-ref ref="Console"/>
            <appender-ref ref="RollingFileInfo"/>
            <appender-ref ref="RollingFileWarn"/>
            <appender-ref ref="RollingFileError"/>
            <appender-ref ref="RollingFileDebug"/>
            <appender-ref ref="accessFile"/>
        </root>
        <!--???????用不了??????-->
        <!--AsyncLogger :异步日志,LOG4J有三种日志模式,全异步日志,混合模式,同步日志,性能从高到底,线程越多效率越高,也可以避免日志卡死线程情况发生-->
        <!--additivity="false" : additivity设置事件是否在root logger输出，为了避免重复输出，可以在Logger 标签下设置additivity为”false”-->
        <AsyncLogger name="AsyncLogger" level="debug" includeLocation="true" additivity="false">
            <appender-ref ref="RollingFileInfo"/>
            <appender-ref ref="RollingFileWarn"/>
            <appender-ref ref="RollingFileError"/>
            <appender-ref ref="RollingFileDebug"/>
            <appender-ref ref="accessFile"/>
        </AsyncLogger>
    </loggers>
</configuration>

```

# RedisUtil

```java
package com.moi.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;

import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * @author MOITY
 */
@Component
public final class RedisUtil {

    @Autowired
    @Qualifier("redisTemplate")
    private RedisTemplate redisTemplate;

    /**
     * 指定缓存失效时间
     *
     * @param key  键
     * @param time 时间(秒)
     * @return 是否成功
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
     *
     * @param key 键 不能为null
     * @return 时间(秒) 返回0代表为永久有效
     */
    public long getExpire(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 判断key是否存在
     *
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
     *
     * @param key 可以传一个值 或多个
     */
    @SuppressWarnings("unchecked")
    public void del(String... key) {
        if (key != null && key.length > 0) {
            if (key.length == 1) {
                redisTemplate.delete(key[0]);
            } else {
                redisTemplate.delete(CollectionUtils.arrayToList(key));
            }
        }
    }

    /**
     * 普通缓存获取
     *
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }

    /**
     * 普通缓存放入
     *
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
     *
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
     *
     * @param key   键
     * @param delta 要增加几(大于0)
     * @return 递增的结果
     */
    public long incr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递增因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key, delta);
    }

    /**
     * 递减
     *
     * @param key   键
     * @param delta 要减少几(小于0)
     * @return 递减的结果
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
     *
     * @param key  键 不能为null
     * @param item 项 不能为null
     * @return 值
     */
    public Object hget(String key, String item) {
        return redisTemplate.opsForHash().get(key, item);
    }

    /**
     * 获取hashKey对应的所有键值
     *
     * @param key 键
     * @return 对应的多个键值
     */
    public Map<Object, Object> hmget(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * HashSet
     *
     * @param key 键
     * @param map 对应多个键值
     * @return true 成功 false 失败
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
     *
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
     * @return 返回新增的值
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
     * @return 返回递减的值
     */
    public double hdecr(String key, String item, double by) {
        return redisTemplate.opsForHash().increment(key, item, -by);
    }

    // ============================set=============================

    /**
     * 根据key获取Set中的所有值
     *
     * @param key 键
     * @return 返回对应的set集合
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
     * @return 返回长度
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
     * @return 返回list
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
     * @return 返回长度
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
     * @param index 索引 index>0时， 0 表头，1 第二个元素，依次类推；index<0时，-1，表尾，-2倒数第二个元素，依次类推
     * @return 返回内容
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
     * @return 是否成功
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
     *
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     * @return 是否成功
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
     * @return 是否成功
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
     * @return 是否成功
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
     * @return 是否成功
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

# RequestXssFilter

```java
package com.moi.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class RequestXssFilter implements Filter {
    FilterConfig filterConfig = null;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        this.filterConfig = filterConfig;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        filterChain.doFilter(new XssHttpServletRequestWrapper(
                (HttpServletRequest) servletRequest), servletResponse);
    }

    @Override
    public void destroy () {
        this.filterConfig = null;
    }
}

```

# XssHttpServletRequestWrapper

```JAVA
package com.moi.filter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 *
 * @author MOITY
 */
public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

    /**
     * 白名单数组
     */
    private static final String[] WHITE_LIST = {"content"};
    /**
     * 定义script的正则表达式
     */
    private static final String REGEX_SCRIPT = "<((?i)script)[^>]?>[\\s\\S]?<\\/((?i)script)>";
    /**
     * 定义style的正则表达式
     */
    private static final String REGEX_STYLE = "<((?i)style)[^>]?>[\\s\\S]?<\\/((?i)style)>";
    /**
     * 定义HTML标签的正则表达式
     */
    private static final String REGEX_HTML = "<[^>]+>";
    /**
     * 定义空格回车换行符
     */
    private static final String REGEX_SPACE = "\\s*|\t|\r|\n";
    /**
     * 定义所有w标签
     */
    private static final String REGEX_W = "<w[^>]*?>[\\s\\S]*?<\\/w[^>]*?>";
    /**
     * 定义SQL注入
     */
    private static String reg = "(\\b(select|update|union|and|or|delete|insert|trancate|char|into|substr|ascii|declare|exec|count|master|into|drop|execute)\\b)";

    public XssHttpServletRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String[] getParameterValues(String parameter) {
        String[] values = super.getParameterValues(parameter);
        if (values == null) {
            return null;
        }

        int count = values.length;

        String[] encodedValues = new String[count];

        for (int i = 0; i < count; i++) {
            //白名单放行的只有HTML标签，SQL标签还是要验证
            if (isWhitelist(parameter)) {
                if (sqlValidate(values[i])) {
                    encodedValues[i] = values[i];
                }
                encodedValues[i] = null;
            }
            encodedValues[i] = removeHtml(values[i]);
        }

        return encodedValues;

    }

    @Override
    public String getParameter(String parameter) {
        String value = super.getParameter(parameter);
        if (value == null) {
            return null;
        }
        //白名单放行的只有HTML标签，SQL标签还是要验证
        if (isWhitelist(parameter)) {
            if (sqlValidate(value)) {
                return value;
            }
            return null;
        }
        return removeHtml(value);
    }

    @Override
    public String getHeader(String name) {
        String value = super.getHeader(name);
        if (value == null) {
            return null;
        }

        if (isWhitelist(name)) {
            if (sqlValidate(value)) {
                return value;
            }
            return null;
        }
        return removeHtml(value);
    }


    //\\b  表示 限定单词边界  比如  select 不通过   1select则是可以的
    private static Pattern sqlPattern = Pattern.compile(reg, Pattern.CASE_INSENSITIVE);

    /**
     * SQL注入过滤器
     * @param str
     * @return
     */
    private static boolean sqlValidate(String str) {
        if (sqlPattern.matcher(str).find()) {
            System.out.println("未能通过过滤器：str=" + str);
            return false;
        }
        return true;
    }

    /**
     * 是否白名单，白名单的放行
     *
     * @param paramName
     * @return
     */
    private static boolean isWhitelist(String paramName) {
        String lowerParam = paramName.toLowerCase();
        String name = Arrays.stream(WHITE_LIST).filter(y -> y.toLowerCase().equals(lowerParam)).findAny().orElse(null);
        return name != null;
    }

    /**
     * 移除HTML标签
     * @param htmlStr
     * @return
     */
    private static String removeHtml(String htmlStr){
        Pattern p_w = Pattern.compile(REGEX_W, Pattern.CASE_INSENSITIVE);
        Matcher m_w = p_w.matcher(htmlStr);
        // 过滤script标签
        htmlStr = m_w.replaceAll("");


        Pattern p_script = Pattern.compile(REGEX_SCRIPT, Pattern.CASE_INSENSITIVE);
        Matcher m_script = p_script.matcher(htmlStr);
        // 过滤script标签
        htmlStr = m_script.replaceAll("");


        Pattern p_style = Pattern.compile(REGEX_STYLE, Pattern.CASE_INSENSITIVE);
        Matcher m_style = p_style.matcher(htmlStr);
        // 过滤style标签
        htmlStr = m_style.replaceAll("");


        Pattern p_html = Pattern.compile(REGEX_HTML, Pattern.CASE_INSENSITIVE);
        Matcher m_html = p_html.matcher(htmlStr);
        // 过滤html标签
        htmlStr = m_html.replaceAll("");


        Pattern p_space = Pattern.compile(REGEX_SPACE, Pattern.CASE_INSENSITIVE);
        Matcher m_space = p_space.matcher(htmlStr);
        // 过滤空格回车标签
        htmlStr = m_space.replaceAll("");

        //过滤
        htmlStr = htmlStr.replaceAll(" ", "");
        // 返回文本字符串
        return htmlStr.trim();
    }
}

```

# CommonCode

```java
package com.qg.exception;


/**
 * @author MOITY IceClean
 */

public enum  CommonCode implements ResultCode {
    /**
     * asd
     */
    EXCEPTIONCOUSTM(false,10000,"自定义异常"),
    OTHER_EXCEPTION(false,99999,"不可预测异常"),
    IO_EXCEPTION(false,20000,"IO异常");

    private Boolean success;
    private Integer code;
    private String message;

    CommonCode(Boolean success, Integer code, String message) {
        this.success = success;
        this.code = code;
        this.message = message;
    }

    @Override
    public boolean success() {
        return success;
    }

    @Override
    public int code() {
        return code;
    }

    @Override
    public String message() {
        return message;
    }

}
```

# ExceptionCatch

```java
package com.qg.exception;

import com.google.common.collect.ImmutableMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;


/**
 * @author MOITY IceClean
 */
@ControllerAdvice
@ResponseBody
public class ExceptionCatch {
    /**
     * log4j打印日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(ExceptionCatch.class);


    /**
     * 使用EXCEPTIONS存放异常类型和错误代码的映射
     */
    private static ImmutableMap<Class<? extends Throwable>, ResultCode> EXCEPTIONS;


    /**
     * 使用builder来构建一个异常类型和错误代码的异常集合
     */
    protected static ImmutableMap.Builder<Class<? extends Throwable>, ResultCode> builder = ImmutableMap.builder();

    /*
      加载异常类型，可以加载n个
     */
    static {
        builder.put(IOException.class,CommonCode.IO_EXCEPTION);
    }

    /**
     * 捕获自定义异常类型
     * @param exceptionCoustm
     * @return
     */
    @ExceptionHandler(ExceptionCoustm.class)
    public void exceptionCoustm(ExceptionCoustm exceptionCoustm){
        ResultCode resultCode = exceptionCoustm.getResultCode();
        LOGGER.info(exceptionCoustm.getMessage());
        LOGGER.error("catch exception:{}",exceptionCoustm);
        LOGGER.error("catch exception:{}",resultCode);
        exceptionCoustm.printStackTrace();
    }

    @ExceptionHandler(Exception.class)
    public void exception(Exception exception){
        LOGGER.info(exception.getMessage());
        //打印记录日志
        LOGGER.error("catch exception:{}",exception);
        exception.printStackTrace();
        if (EXCEPTIONS==null){
        //ImmutableMap创建完成，不可在更改数据
            EXCEPTIONS=builder.build();
        }

        //获取异常类型,与定义相符的存入（resultCode）多态
        ResultCode resultCode = EXCEPTIONS.get(exception.getClass());

    }

}

```

# ExceptionCoustm

```java
package com.qg.exception;

/**
 * @author MOITY IceClean
 */
public class ExceptionCoustm extends RuntimeException{

    private ResultCode resultCode;

    public ResultCode getResultCode() {
        return resultCode;
    }

    public ExceptionCoustm(ResultCode resultCode) {
//        super必须在构造的第一行，this也一样，所以两者不能同时出现
        super("错误代码:"+resultCode.code()+"错误信息:"+resultCode.message());
        this.resultCode = resultCode;

    }
}
```

# ResultCode

```java
package com.qg.exception;

/**
 * @author MOITY IceClean
 */
public interface ResultCode {
    /**
     * 操作是否成功,true为成功，false操作失败
     * @return
     */
    boolean success();

    /**
     * 操作代码
     * @return
     */
    int code();

    /**
     * 提示信息
     * @return
     */
    String message();
}

```

