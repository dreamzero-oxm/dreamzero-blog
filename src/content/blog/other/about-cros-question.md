---
title: 关于跨域问题
description: 跨域
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - 跨域
updated: 2022-07-28
comments: false
---
# 跨域

## **两种解决方法**

### 第一种解决办法

**自己添加Access-Control-Allow-Origin**

```java
response.setHeader("Access-Control-Allow-Origin", "*");
```

## **第二种方法**

导入依赖

```xml
<!--解决跨域-->
        <dependency>
            <groupId>com.thetransactioncompany</groupId>
            <artifactId>cors-filter</artifactId>
            <version>2.5</version>
        </dependency>
        <dependency>
            <groupId>com.thetransactioncompany</groupId>
            <artifactId>java-property-utils</artifactId>
            <version>1.9.1</version>
        </dependency>
```

web.xml文件中

```xml
<!--跨域-->
    <filter>
        <filter-name> CORS </filter-name>
        <filter-class> com.thetransactioncompany.cors.CORSFilter </filter-class>
        <init-param>
            <param-name> cors.allowOrigin </param-name>   <!--配置授信的白名单的域名！-->
            <param-value> * </param-value >
        </init-param>
        <init-param>
            <param-name>cors.supportedMethods</param-name>
            <param-value>GET, POST, HEAD, PUT, DELETE </param-value>
        </init-param>
        <init-param>
            <param-name>cors.supportedHeaders</param-name>
            <param-value>Accept, Origin, X-Requested-With, Content-Type, Last-Modified </param-value>
        </init-param>
        <init-param>
            <param-name>cors.exposedHeaders </param-name >
            <param-value>Set-Cookie</param-value>
        </init-param>
        <init-param>
            <param-name>cors.supportsCredentials</param-name>
            <param-value>true </param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>CORS</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
```

## WEB.XML

```XML
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
```

