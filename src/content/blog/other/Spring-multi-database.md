---
title: Spring配备多个数据库
description: Spring配备多个数据库
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Spring
updated: 2022-07-28
comments: false
---
# Spring-dao.xml

```xml
<!-- ClickHouse DataSource：使用 c3p0 的数据源替换 MyBatis 的配置 -->
    <bean id="clickDataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
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

    <!-- MYSQL DataSource：使用 c3p0 的数据源替换 MyBatis 的配置 -->
    <bean id="myDataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="${driver2}"/>
        <property name="jdbcUrl" value="${url2}"/>
        <property name="user" value="${user2}"/>
        <property name="password" value="${password2}"/>

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


    <!-- 配置动态数据源 -->
    <bean id ="dataSource" class= "com.taxi.utils.dbchange.DynamicDataSource" >
        <property name ="targetDataSources">
            <!-- 配置两个数据库源 -->
            <map key-type ="java.lang.String">
                <entry value-ref="clickDataSource" key="clickDataSource"/>
                <entry value-ref="myDataSource" key="myDataSource"/>
            </map >
        </property>

        <!-- 默认使用 clickHouse -->
        <property name ="defaultTargetDataSource" ref= "clickDataSource"/>
    </bean>
```

# DataSourceContextHolder

```java
package com.taxi.utils.dbchange;

/**
 * @author : MOITY
 * @date : 2021-08-10
 *
 * 负责切换数据库的类
 */
public class DataSourceContextHolder {

    private static final ThreadLocal<String> CONTEXT_HOLDER = new ThreadLocal<>();

    public static void setDbType(String dbType) {
        CONTEXT_HOLDER.set(dbType);
    }


    public static String getDbType() {
        return CONTEXT_HOLDER.get();
    }


    public static void clearDbType() {
        CONTEXT_HOLDER.remove();
    }
}

```

# DataSourceType

```java
package com.taxi.utils.dbchange;

/**
 * @author : MOITY
 * @date : 2021-08-10
 *
 * 数据库名常量类
 */
public class DataSourceType {
    public static final String SOURCE_CLICK_HOUSE = "clickDataSource";
    public static final String SOURCE_MYSQL = "myDataSource";
}
```

# DynamicDataSource

```java
package com.taxi.utils.dbchange;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * @author : Ice'Clean,MOITY
 * @date : 2021-08-10
 *
 * 动态数据源切换
 */
public class DynamicDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        return DataSourceContextHolder.getDbType();
    }
}

```

