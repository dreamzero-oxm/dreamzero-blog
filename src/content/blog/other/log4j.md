---
title: LOG4J日志学习
description: LOG4J日志学习
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - 日志
updated: 2022-07-28
comments: false
---
# LOG4J

```
%m 输出代码中指定的日志信息
%p 输出优先级，即DEBUG，INFO，WARN，ERROR，FATAL
%n 换行符
%r 输出自应用启动到输出该log信息耗费的毫秒数
%c 输出打印语句所属的类目，通常就是所在类的全名
%t 输出产生该日志线程的全名
%d 输出服务器当前时间，默认IS08601，也可以指定格式如：%d{yyyy年MM月dd日 HH:mm:ss}
%l 输出日志发生的位置，线程，及在代码的行数，如：Test.main(Test.java:10)
%F 输出日志消息产生时的所在的文件名称
%L 输出代码中的行号
%% 输出一个“%”字符
```

```properties
 ### 设置###
#log4j.rootLogger=[level],自定义名字1，自定义名字2，...
log4j.rootLogger = debug,stdout,D,E
 
### 输出信息到控制抬 ###
#设置输出的目的地，此时为控制台
log4j.appender.stdout = org.apache.log4j.ConsoleAppender
#Threshold 的优先级大于rootLogger,若设置 CONSOLE（自定义的名字，则输出的最低级别ERR；若不写，则以RootLogger设置为标准
#log4j.appender.CONSOLE.Threshold=ERR
log4j.appender.stdout.Target = System.out
log4j.appender.stdout.layout = org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern = [%-5p] %d{yyyy-MM-dd HH:mm:ss,SSS} method:%l%n%m%n
 
### 输出DEBUG 级别以上的日志到=E://logs/error.log ###

#设置输出的目的地 控制台/文件/数据库...
log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
#设置文件位置 默认在当前项目下
log4j.appender.D.File = F://logs/log.log
#设置是否追加，false为不追加，会先清空上次数据，再写新数据；true为追加，会在原有数据后追加新数据；
log4j.appender.D.Append = true
#设置可输入到文件的最低级别，该级别及该级别以上都会将数据输入到文件；debug，info，warn，error均会输入此文件
log4j.appender.D.Threshold = DEBUG 
#设置自定义输出显示样式
log4j.appender.D.layout = org.apache.log4j.PatternLayout
#自定义输出显示样式
log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
#单个日志的大小
log4j.appender.D.layout.fileSize = 1MB
#日志的数量 (最多100个.log)
log4j.appender.D.layout.maxBackupIndex = 100
#DailyRollingFileAppender特有的指定日期拆分规则
log4j.appender.D.layout.datePattern = '.'yyyy-MM-dd-HH-mm-ss

### 输出ERROR 级别以上的日志到=E://logs/error.log ###
log4j.appender.E = org.apache.log4j.DailyRollingFileAppender
log4j.appender.E.File =F://logs/error.log 
log4j.appender.E.Append = true
log4j.appender.E.Threshold = ERROR 
log4j.appender.E.layout = org.apache.log4j.PatternLayout
log4j.appender.E.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n


```

## Log4j提供的appender有以下几种：

```
org.apache.log4j.ConsoleAppender（控制台），  
org.apache.log4j.FileAppender（文件），  
org.apache.log4j.DailyRollingFileAppender（每天产生一个日志文件），  
org.apache.log4j.RollingFileAppender（文件大小到达指定尺寸的时候产生一个新的文件），  
org.apache.log4j.WriterAppender（将日志信息以流格式发送到任意指定的地方）
org.apache.log4j。JDBCAppender（将日志信息保存到数据库）
```

## Log4j提供的layout有以一下几种：

```
org.apache.log4j.HTMLLayout（以HTML表格形式布局），  
org.apache.log4j.PatternLayout（可以灵活地指定布局模式），  
org.apache.log4j.SimpleLayout（包含日志信息的级别和信息字符串），  
org.apache.log4j.TTCCLayout（包含日志产生的时间、线程、类别等等信息）
```

## 得到记录器

使用Log4j，第一步就是获取日志记录器，这个记录器将负责控制日志信息。其语法为：

```
public static Logger getLogger( String name)
```

通过指定的名字获得记录器，如果必要的话，则为这个名字创建一个新的记录器。Name一般取本类的名字，比如：

```
static Logger logger = Logger.getLogger ( Test.class.getName () )
```

### 插入记录信息（格式化日志信息）

```
Logger.debug ( Object message ) ;  
Logger.info ( Object message ) ;  
Logger.warn ( Object message ) ;  
Logger.error ( Object message ) ;
```

## 日志级别

每个Logger都被了一个日志级别（log level），用来控制日志信息的输出。日志级别从高到低分为：
A：off 最高等级，用于关闭所有日志记录。
B：fatal 指出每个严重的错误事件将会导致应用程序的退出。
C：error 指出虽然发生错误事件，但仍然不影响系统的继续运行。
D：warm 表明会出现潜在的错误情形。
E：info 一般和在粗粒度级别上，强调应用程序的运行全程。
F：debug 一般用于细粒度级别上，对调试应用程序非常有帮助。
G：all 最低等级，用于打开所有日志记录。

上面这些级别是定义在org.apache.log4j.Level类中。Log4j只建议使用4个级别，优先级从高到低分别是error,warn,info和debug。通过使用日志级别，可以控制应用程序中相应级别日志信息的输出。例如，如果使用b了info级别，则应用程序中所有低于info级别的日志信息(如debug)将不会被打印出来。

## Spring中使用Log4j

### web.xml增加

```xml
<!-- 设置根目录 -->  
   <context-param>    
       <param-name>webAppRootKey</param-name>    
       <param-value>webapp.root</param-value>    
   </context-param>    
 
   <context-param>  
    <param-name>log4jConfigLocation</param-name>  
    <param-value>classpath:log4j.properties</param-value>  
</context-param>  
<!-- 3000表示 开一条watchdog线程每60秒扫描一下配置文件的变化;这样便于日志存放位置的改变 -->  
<context-param>    
        <param-name>log4jRefreshInterval</param-name>    
        <param-value>3000</param-value>    
   </context-param>   
<listener>  
    <listener-class>org.springframework.web.util.Log4jConfigListener</listener-class>  
</listener>
```

## Mybatis

```properties
#4 mybatis 显示SQL语句部分
log4j.logger.org.mybatis=DEBUG
#log4j.logger.cn.tibet.cas.dao=DEBUG
#log4j.logger.org.mybatis.common.jdbc.SimpleDataSource=DEBUG
#log4j.logger.org.mybatis.common.jdbc.ScriptRunner=DEBUG
#log4j.logger.org.mybatis.sqlmap.engine.impl.SqlMapClientDelegate=DEBUG
#log4j.logger.java.sql.Connection=DEBUG
log4j.logger.java.sql=DEBUG
log4j.logger.java.sql.Statement=DEBUG
log4j.logger.java.sql.ResultSet=DEBUG
log4j.logger.java.sql.PreparedStatement=DEBUG
```

## 数据库

```properties
#3 druid
log4j.logger.druid.sql=INFO
log4j.logger.druid.sql.DataSource=info
log4j.logger.druid.sql.Connection=info
log4j.logger.druid.sql.Statement=info
log4j.logger.druid.sql.ResultSet=info
```

## 真正的分级储存

```properties
log4j.appender.error.filter.errorFilter=org.apache.log4j.varia.LevelRangeFilter
log4j.appender.error.filter.errorFilter.LevelMin=ERROR
log4j.appender.error.filter.errorFilter.LevelMax=ERROR
```

```properties
### 设置###
#log4j.rootLogger=[level],自定义名字1，自定义名字2，...
log4j.rootLogger = debug,stdout,D,E,info,warn

### 输出信息到控制抬 ###

#设置输出的目的地，此时为控制台
log4j.appender.stdout = org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target = System.out
log4j.appender.stdout.layout = org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern = [%-5p] %d{yyyy-MM-dd HH:mm:ss,SSS} method:%l%n%m%n

### 输出DEBUG 级别###
log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
log4j.appender.D.File = F://logs/DEBUG/debug.log
log4j.appender.D.Append = true
log4j.appender.D.Threshold = DEBUG 
log4j.appender.D.layout = org.apache.log4j.PatternLayout
log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
log4j.appender.D.layout.fileSize = 5MB
log4j.appender.D.layout.maxBackupIndex = 100
log4j.appender.D.layout.datePattern = '.'yyyy-MM-dd
log4j.appender.D.filter.infoFilter = org.apache.log4j.varia.LevelRangeFilter
log4j.appender.D.filter.infoFilter.LevelMin=DEBUG
log4j.appender.D.filter.infoFilter.LevelMax=DEBUG
log4j.appender.D.ImmediateFlush=true

### 输出ERROR 级别 ###
log4j.appender.E = org.apache.log4j.RollingFileAppender
log4j.appender.E.File =F://logs/ERROR/error.log 
log4j.appender.E.Append = true
log4j.appender.E.Threshold = ERROR 
log4j.appender.E.layout = org.apache.log4j.PatternLayout
log4j.appender.E.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
log4j.appender.E.layout.fileSize = 5MB
log4j.appender.E.layout.maxBackupIndex = 100
log4j.appender.E.filter.infoFilter = org.apache.log4j.varia.LevelRangeFilter
log4j.appender.E.filter.infoFilter.LevelMin=ERROR
log4j.appender.E.filter.infoFilter.LevelMax=ERROR
log4j.appender.E.ImmediateFlush=true

### 输出INFO 级别 ###
log4j.appender.info = org.apache.log4j.RollingFileAppender
log4j.appender.info.File =F://logs/INFO/info.log 
log4j.appender.info.Append = true
log4j.appender.info.Threshold = INFO 
log4j.appender.info.layout = org.apache.log4j.PatternLayout
log4j.appender.info.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
log4j.appender.info.layout.fileSize = 5MB
log4j.appender.info.layout.maxBackupIndex = 100
log4j.appender.info.filter.infoFilter = org.apache.log4j.varia.LevelRangeFilter
log4j.appender.info.filter.infoFilter.LevelMin=INFO
log4j.appender.info.filter.infoFilter.LevelMax=INFO
log4j.appender.info.ImmediateFlush=true

### 输出WARN 级别 ###
log4j.appender.warn = org.apache.log4j.RollingFileAppender
log4j.appender.warn.File =F://logs/WARN/warn.log
log4j.appender.warn.Append = true
log4j.appender.warn.Threshold = WARN
log4j.appender.warn.layout = org.apache.log4j.PatternLayout
log4j.appender.warn.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
log4j.appender.warn.layout.fileSize = 5MB
log4j.appender.warn.layout.maxBackupIndex = 100
log4j.appender.warn.filter.infoFilter = org.apache.log4j.varia.LevelRangeFilter
log4j.appender.warn.filter.infoFilter.LevelMin=WARN
log4j.appender.warn.filter.infoFilter.LevelMax=WARN
log4j.appender.warn.ImmediateFlush=true
```

## 将日志保存到数据库

![image-20210806221912636](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210806221912636.png)

![image-20210806222034157](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210806222034157.png)

![image-20210806221950741](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210806221950741.png)

