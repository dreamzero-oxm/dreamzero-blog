---
title: Mybatis学习笔记
description: Mybatis学习笔记
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Mybatis学习
updated: 2022-07-28
comments: false
---
# Mybatis学习笔记

## 搭建环境

导入maven依赖

```xml
<!--导入依赖-->
<dependencies>
    <!--mysqlq驱动-->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.12</version>
    </dependency>
    <!--mybatis-->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.4</version>
    </dependency>
    <!--junit-->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>
</dependencies>

```

##  创建一个模块

- 编写mybatis的核心配置文件

  ```xml
  <?xml version="1.0" encoding="UTF-8" ?>
  <!DOCTYPE configuration
          PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
          "http://mybatis.org/dtd/mybatis-3-config.dtd">
  <!--configuration核心配置文件-->
  <configuration>
      <environments default="development">
          <environment id="development">
              <transactionManager type="JDBC"/>
              <dataSource type="POOLED">
                  <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                  <property name="url" value="jdbc:mysql://localhost:3306/mybatis?userSSL=true&amp;useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=UTC"/>
                  <property name="username" value="root"/>
                  <property name="password" value="root"/>
              </dataSource>
          </environment>
      </environments>
  </configuration>
  
  ```

  - 编写mybatis工具类

  - ```java
    //sqlSessionFactory --> sqlSession
    public class MybatisUtils {
    
        static SqlSessionFactory sqlSessionFactory = null;
    
        static {
            try {
                //使用Mybatis第一步 ：获取sqlSessionFactory对象
                String resource = "mybatis-config.xml";
                InputStream inputStream = Resources.getResourceAsStream(resource);
                sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    
        //既然有了 SqlSessionFactory，顾名思义，我们可以从中获得 SqlSession 的实例.
        // SqlSession 提供了在数据库执行 SQL 命令所需的所有方法。
        public static SqlSession getSqlSession(){
            return sqlSessionFactory.openSession();
        }
    }
    
    ```

    

## 编写代码

user 实体类

```java
package com.moi.model;

public class user {
    private int id;
    private String name;
    private int age;

    @Override
    public String toString() {
        return "user{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", age=" + age +
                '}';
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}

```

userDao接口

```java
package com.moi.Dao;

import com.moi.model.user;

import java.util.List;

public interface userDao {
    public List<user> getUserList();
}

```

userDao的Mapper（userMapper.xml）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!--namespace=绑定一个指定的Dao/Mapper接口-->
<mapper namespace="com.moi.Dao.userDao">
    <select id="getUserList" resultType="user">
        select * from user
    </select>
</mapper>
```

mybatis核心配置文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<!--configuration核心配置文件-->
<configuration>


    <!-- 类型别名 -->
    <typeAliases>
        <typeAlias type="com.moi.model.user" alias="user"></typeAlias>
    </typeAliases>
    <!-- 环境 -->
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/mybatis?userSSL=true&amp;useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=UTC"/>
                <property name="username" value="root"/>
                <property name="password" value="JYF1013OXM"/>
            </dataSource>
        </environment>
    </environments>

    <!-- ORM映射文件 -->
    <mappers>
        <mapper resource="com/moi/Dao/userMapper.xml" />
    </mappers>


</configuration>

```

测试：

```java
public class test1 {

    @Test
    public void test1(){
        SqlSession sqlSession = mybatisUtils.getSqlSession();
        userDao userDao = sqlSession.getMapper(userDao.class);
        List<user> userList = userDao.getUserList();
        System.out.println(userList);
        sqlSession.close();
    }
}

```

结果：

![image-20210722172137720](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210722172137720.png)

CRUD操作（Insert）

userMapper中

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!--namespace=绑定一个指定的Dao/Mapper接口-->
<mapper namespace="com.moi.Dao.userDao">
    <select id="getUserList" resultType="user">
        select * from user
    </select>

    <insert id="addUser" parameterType="user">
        insert into user value (#{id},#{name},#{age})
    </insert>
</mapper>

```

测试：

```java
@Test
        public void test2(){
            SqlSession sqlSession = mybatisUtils.getSqlSession();
            userDao userDao = sqlSession.getMapper(userDao.class);

            user user = new user();
            user.setAge(11);
            user.setId(2);
            user.setName("abb");

            userDao.addUser(user);
            sqlSession.commit();
            sqlSession.close();
        }
```

**注意：增删改查一定要提交事务：**

### 万能Map

假设，我们的实体类，或者数据库中的表，字段或者参数过多，我们应该考虑使用Map

userMapper中

```xml
 <insert id="addUser2" parameterType="map">
        insert into user value (#{userid},#{username},#{userage})
    </insert>
```

userDao接口中

```java
public interface userDao {
    public List<user> getUserList();

    public void addUser(user user);

    public void addUser2(Map<String ,Object> map);
}
```

测试：

```java
@Test
        public void test3(){
                SqlSession sqlSession = mybatisUtils.getSqlSession();
                userDao userDao = sqlSession.getMapper(userDao.class);

                Map<String ,Object> map = new LinkedHashMap<>();
                map.put("userid",3);
                map.put("username","abb2");
                map.put("userage",13);

                userDao.addUser2(map);
            sqlSession.commit();
            sqlSession.close();
        }
```

### 模糊查询

Java代码执行的时候，传递通配符% %

```java
List<User> userList = mapper.getUserLike("%李%");
```

在sql拼接中使用通配符

```java
select * from user where name like "%"#{value}"%"	"%"%李%"%"
```

## 配置解析

### 核心配置文件

- mybatis-config.xml

- Mybatis的配置文件包含了会深深影响MyBatis行为的设置和属性信息。

- **配置文件中有顺序要求**

  ```
  configuration（配置）				
      properties（属性）
      settings（设置）
      typeAliases（类型别名）
      typeHandlers（类型处理器）
      objectFactory（对象工厂）
      plugins（插件）
      environments（环境配置）
      	environment（环境变量）
      		transactionManager（事务管理器）
      		dataSource（数据源）
      databaseIdProvider（数据库厂商标识）
      mappers（映射器）
  ```

### 环境配置 environments

MyBatis 可以配置成适应多种环境

**不过要记住：尽管可以配置多个环境，但每个 SqlSessionFactory 实例只能选择一种环境**

**学会使用配置多套运行环境！**

MyBatis默认的事务管理器就是JDBC ，连接池：POOLED

### 属性 properties

我们可以通过properties属性来实现引用配置文件

这些属性可以在外部进行配置，并可以进行动态替换。你既可以在典型的 Java 属性文件中配置这些属性，也可以在 properties 元素的子元素中设置。【db.poperties】

编写一个配置文件

db.properties

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/mybatis?userSSL=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC
username=root
password=root
```

1. 可以直接引入外部文件
2. 可以在其中增加一些属性配置
3. 如果两个文件有同一个字段，优先使用外部配置文件的

### 类型别名 typeAliases

- 类型别名可为 Java 类型设置一个缩写名字。 它仅用于 XML 配置.
- 意在降低冗余的全限定类名书写。

```xml
<!--可以给实体类起别名-->
<typeAliases>
    <typeAlias type="com.moi.model.User" alias="User"/>
</typeAliases>

```

也可以指定一个包，每一个在包 domain.blog 中的 Java Bean，在没有注解的情况下，会使用 Bean 的首字母小写的非限定类名来作为它的别名。 比如 domain.blog.Author 的别名为 author,；若有注解，则别名为其注解值。见下面的例子：

```xml
<typeAliases>
    <package name="com.moi.model"/>
</typeAliases>
```

在实体类比较少的时候，使用第一种方式。
如果实体类十分多，建议用第二种扫描包的方式。
第一种可以DIY别名，第二种不行，如果非要改，需要在实体上增加注解。

```java
@Alias("author")
public class Author {
    ...
}
```

### 其他配置

- typeHandlers（类型处理器）
- objectFactory（对象工厂）
- plugins 插件
  - mybatis-generator-core
  - mybatis-plus
  - 通用mapper

### 映射器 mappers

MapperRegistry：注册绑定我们的Mapper文件；

方式一：【推荐使用】

```xml
<!--每一个Mapper.xml都需要在MyBatis核心配置文件中注册-->
<mappers>
    <mapper resource="com/moi/Dao/userMapper.xml"/>
</mappers>

```

方式二：使用class文件绑定注册

```xml
<!--每一个Mapper.xml都需要在MyBatis核心配置文件中注册-->
<mappers>
    <mapper class="com.moi.Dao.userMapper.xml"/>
</mappers>

```

方式三：使用包扫描进行注入

```xml
<mappers>
    <package name="com.kuang.dao"/>
</mappers>

```

### 8. 作用域和生命周期

声明周期和作用域是至关重要的，因为错误的使用会导致非常严重的并发问题。

**SqlSessionFactoryBuilder:**

- 一旦创建了SqlSessionFactory，就不再需要它了
- 局部变量
  **SqlSessionFactory:**
- 说白了就可以想象为：数据库连接池
- SqlSessionFactory一旦被创建就应该在应用的运行期间一直存在，**没有任何理由丢弃它或重新创建一个实例。**
- 因此SqlSessionFactory的最佳作用域是应用作用域（ApplocationContext）。
- 最简单的就是使用单例模式或静态单例模式。

**SqlSession：**

- 连接到连接池的一个请求
- SqlSession 的实例不是线程安全的，因此是不能被共享的，所以它的最佳的作用域是请求或方法作用域。
- 用完之后需要赶紧关闭，否则资源被占用！

## 解决属性名和字段名不一致的问题

### 问题

![image-20210722174113600](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210722174113600.png)

数据库中的字段和项目中实体类名字不一致

**解决方法：**

- 起别名（不推荐）

```xml
<select id="getUserById" resultType="com.kuang.pojo.User">
    select id,name,pwd as password from USER where id = #{id}
</select>

```

### resultMap结果集映射

```
id name pwd
id name password
```

```xml
<!--结果集映射-->
<resultMap id="UserMap" type="User">
    <!--column数据库中的字段，property实体类中的属性-->
    <result column="id" property="id"></result>
    <result column="name" property="name"></result>
    <result column="pwd" property="password"></result>
</resultMap>

<select id="getUserList" resultMap="UserMap">
    select * from USER
</select>
```

- resultMap 元素是 MyBatis 中最重要最强大的元素。
- ResultMap 的设计思想是，对简单的语句做到零配置，对于复杂一点的语句，只需要描述语句之间的关系就行了。
- ResultMap 的优秀之处——你完全可以不用显式地配置它们。

## 日志

### 日志工厂

如果一个数据库操作，出现了异常，我们需要排错，日志就是最好的助手！

曾经：sout、debug

现在：日志工厂

**STDOUT_LOGGING**

```xml
<settings>
    <setting name="logImpl" value="STDOUT_LOGGING"/>
</settings>

```

### Log4j

什么是Log4j？

- Log4j是Apache的一个开源项目，通过使用Log4j，我们可以控制日志信息输送的目的地是控制台、文件、GUI组件；
- 我们也可以控制每一条日志的输出格式；
- 通过定义每一条日志信息的级别，我们能够更加细致地控制日志的生成过程；
- 最令人感兴趣的就是，这些可以通过一个配置文件来灵活地进行配置，而不需要修改应用的代码。

先导入log4j的包

```xml
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

log4j.properties

```properties
### Log4j配置 ###
#定义log4j的输出级别和输出目的地（目的地可以自定义名称，和后面的对应）
#[ level ] , appenderName1 , appenderName2
log4j.rootLogger=DEBUG,console,file
#-----------------------------------#
#1 定义日志输出目的地为控制台
log4j.appender.console = org.apache.log4j.ConsoleAppender
log4j.appender.console.Target = System.out
log4j.appender.console.Threshold=DEBUG
####可以灵活地指定日志输出格式，下面一行是指定具体的格式 ###
#%c: 输出日志信息所属的类目，通常就是所在类的全名
#%m: 输出代码中指定的消息,产生的日志具体信息
#%n: 输出一个回车换行符，Windows平台为"/r/n"，Unix平台为"/n"输出日志信息换行
log4j.appender.console.layout = org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern=[%c]-%m%n
#-----------------------------------#
#2 文件大小到达指定尺寸的时候产生一个新的文件
log4j.appender.file = org.apache.log4j.RollingFileAppender
#日志文件输出目录
log4j.appender.file.File=log/info.log
#定义文件最大大小
log4j.appender.file.MaxFileSize=10mb
###输出日志信息###
#最低级别
log4j.appender.file.Threshold=ERROR
log4j.appender.file.layout=org.apache.log4j.PatternLayout
log4j.appender.file.layout.ConversionPattern=[%p][%d{yy-MM-dd}][%c]%m%n
#-----------------------------------#
#3 druid
log4j.logger.druid.sql=INFO
log4j.logger.druid.sql.DataSource=info
log4j.logger.druid.sql.Connection=info
log4j.logger.druid.sql.Statement=info
log4j.logger.druid.sql.ResultSet=info
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

配置settings为log4j实现

测试运行

**Log4j简单使用**

1.在要使用Log4j的类中，导入包 import org.apache.log4j.Logger;

2.日志对象，参数为当前类的class对象

```java
Logger logger = Logger.getLogger(UserDaoTest.class);
1
```

3.日志级别

```java
logger.info("info: 测试log4j");
logger.debug("debug: 测试log4j");
logger.error("error:测试log4j");
```

1.info
2.debug
3.error

## 分页

### Springboot Mybatis使用pageHelper实现分页查询

一、导入依赖；  

二、添加配置；  

第一步：

pom.xml添加依赖：

```xml
<!--分页插件 pagehelper pagehelper的版本选择很重要！！ -->
<dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper</artifactId>
            <version>3.7.5</version>
        </dependency>
        <dependency>
            <groupId>com.github.jsqlparser</groupId>
            <artifactId>jsqlparser</artifactId>
            <version>4.0</version>
</dependency>
```

MyBatis可以使用第三方的插件来对功能进行扩展，分页助手PageHelper是将分页的复杂操作进行封装，使用简单的方式即可获得分页的相关数据

开发步骤：

①导入通用PageHelper的坐标

②在mybatis核心配置文件中配置PageHelper插件

③测试分页数据获取

在mybatis核心配置文件中配置PageHelper插件

```xml
 <plugins>
        <!-- com.github.pagehelper为PageHelper类所在包名 -->
        <plugin interceptor="com.github.pagehelper.PageHelper">
            <!-- 设置数据库类型 Oracle,Mysql,MariaDB,SQLite,Hsqldb,PostgreSQL六种数据库 -->
            <property name="dialect" value="mysql" />
            <property name="rowBoundsWithCount" value="true" />
        </plugin>
    </plugins>
```

## 使用注解开发

### 面向接口开发

**三个面向区别**

- 面向对象是指，我们考虑问题时，以对象为单位，考虑它的属性和方法；
- 面向过程是指，我们考虑问题时，以一个具体的流程（事务过程）为单位，考虑它的实现；
- 接口设计与非接口设计是针对复用技术而言的，与面向对象（过程）不是一个问题，更多的体现就是对系统整体的架构；

### 使用注解开发

1.注解在接口上实现

```java
@Select("select * from user")
List<User> getUsers();

```

2.需要在核心配置文件中绑定接口

```xml
 <mappers>
        <mapper class="com.moi.Dao.userDao"></mapper>
    </mappers>
```

![20201017070716720](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\20201017070716720.png)

### 注解CURD

```java
//方法存在多个参数，所有的参数前面必须加上@Param("id")注解
@Delete("delete * from user where id = ${uid} name = ${uName}")
public int deleteUser(@Param("uid") int id, @Param("uName") String username)
```

**关于@Param( )注解**

- 基本类型的参数或者String类型，需要加上
- 引用类型不需要加
- 如果只有一个基本类型的话，可以忽略，但是建议大家都加上
- 我们在SQL中引用的就是我们这里的@Param()中设定的属性名
  **#{} 和 ${}**

## Lombok

Lombok项目是一个Java库，它会自动插入编辑器和构建工具中，Lombok提供了一组有用的注释，用来消除Java类中的大量样板代码。仅五个字符(@Data)就可以替换数百行代码从而产生干净，简洁且易于维护的Java类。

使用步骤：

1.在IDEA中安装Lombok插件

2.在项目中导入lombok的jar包

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.10</version>
    <scope>provided</scope>
</dependency>
```

在程序上加注解

```java
@Getter and @Setter
@FieldNameConstants
@ToString
@EqualsAndHashCode
@AllArgsConstructor, @RequiredArgsConstructor and @NoArgsConstructor
@Log, @Log4j, @Log4j2, @Slf4j, @XSlf4j, @CommonsLog, @JBossLog, @Flogger, @CustomLog
@Data
@Builder
@SuperBuilder
@Singular
@Delegate
@Value
@Accessors
@Wither
@With
@SneakyThrows
@val
```



## 多对一处理

多个学生对一个老师

```sql
alter table student add constraint fk_tid foregin key(tid) references teacher(id)
```

###  按照查询嵌套处理

```xml
<!--
     思路：
        1. 查询所有的学生信息
        2. 根据查询出来的学生的tid寻找特定的老师 (子查询)
    -->
<select id="getStudent" resultMap="StudentTeacher">
    select * from student
</select>
<resultMap id="StudentTeacher" type="student">
    <result property="id" column="id"/>
    <result property="name" column="name"/>
    <!--复杂的属性，我们需要单独出来 对象：association 集合：collection-->
    <collection property="teacher" column="tid" javaType="teacher" select="getTeacher"/>
</resultMap>
<select id="getTeacher" resultType="teacher">
    select * from teacher where id = #{id}
</select>
```

### 按照结果嵌套处理

```xml
    <!--按照结果进行查询-->
    <select id="getStudent2" resultMap="StudentTeacher2">
        select s.id sid , s.name sname, t.name tname
        from student s,teacher t
        where s.tid=t.id
    </select>
    <!--结果封装，将查询出来的列封装到对象属性中-->
    <resultMap id="StudentTeacher2" type="student">
        <result property="id" column="sid"/>
        <result property="name" column="sname"/>
        <association property="teacher" javaType="teacher">
            <result property="name" column="tname"></result>
        </association>
    </resultMap>
```

## 一对多处理

实体类：

```java
@Data
public class Student {
    private int id;
    private String name;
    private int tid;
}
```

```java
@Data
public class Teacher {
    private int id;
    private String name;

    //一个老师拥有多个学生
    private List<Student> students;
}
```



```xml
<!--按结果嵌套查询-->
<select id="getTeacher" resultMap="StudentTeacher">
    SELECT s.id sid, s.name sname,t.name tname,t.id tid FROM student s, teacher t
    WHERE s.tid = t.id AND tid = #{tid}
</select>
<resultMap id="StudentTeacher" type="Teacher">
    <result property="id" column="tid"/>
    <result property="name" column="tname"/>
    <!--复杂的属性，我们需要单独处理 对象：association 集合：collection
    javaType=""指定属性的类型！
    集合中的泛型信息，我们使用ofType获取
    -->
    <collection property="students" ofType="Student">
        <result property="id" column="sid"/>
        <result property="name" column="sname"/>
        <result property="tid" column="tid"/>
    </collection>
</resultMap>
```

## 动态SQL

**什么是动态SQL：动态SQL就是根据不同的条件生成不同的SQL语句**

**所谓的动态SQL，本质上还是SQL语句，只是我们可以在SQL层面，去执行一个逻辑代码**

### 搭建环境

```sql
CREATE TABLE `mybatis`.`blog`  (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '博客id',
  `title` varchar(30) NOT NULL COMMENT '博客标题',
  `author` varchar(30) NOT NULL COMMENT '博客作者',
  `create_time` datetime(0) NOT NULL COMMENT '创建时间',
  `views` int(30) NOT NULL COMMENT '浏览量',
  PRIMARY KEY (`id`)
)
```

**实体类：**

```java
@Data
public class Blog {
    private int id;
    private String title;
    private String author;

    private Date createTime;// 属性名和字段名不一致
    private int views;
}
```

### IF

```XML
<select id="queryBlogIF" parameterType="map" resultType="blog">
    select * from blog
    <where>
        <if test="title!=null">
            and title = #{title}
        </if>
        <if test="author!=null">
            and author = #{author}
        </if>
    </where>
</select>
```

### SQL片段

有的时候，我们可能会将一些功能的部分抽取出来，方便服用！

使用SQL标签抽取公共部分

```XML
<sql id="if-title-author">
    <if test="title!=null">
        title = #{title}
    </if>
    <if test="author!=null">
        and author = #{author}
    </if>
</sql>
```

注意事项：

- 最好基于单标来定义SQL片段
- 不要存在where标签

**动态SQL就是在拼接SQL语句，我们只要保证SQL的正确性，按照SQL的格式，去排列组合就可以了**

建议：

- 先在Mysql中写出完整的SQL，再对应的去修改成我们的动态SQL实现通用即可

## 缓存

### 简介

查询 ： 连接数据库，耗资源  一次查询的结果，给他暂存一个可以直接取到的地方 --> 内存：缓存 我们再次查询的相同数据的时候，直接走缓存，不走数据库了

**什么是缓存[Cache]？**

* 存在内存中的临时数据
* 将用户经常查询的数据放在缓存（内存）中，用户去查询数据就不用从磁盘上（关系型数据库文件）查询，从缓存中查询，从而提高查询效率，解决了高并发系统的性能问题

**为什么使用缓存？**

* 减少和数据库的交互次数，减少系统开销，提高系统效率

**什么样的数据可以使用缓存？**

* 经常查询并且不经常改变的数据 【可以使用缓存】

### MyBatis缓存

- MyBatis包含一个非常强大的查询缓存特性，它可以非常方便的定制和配置缓存，缓存可以极大的提高查询效率。
- MyBatis系统中默认定义了两级缓存：一级缓存和二级缓存
  - 默认情况下，只有一级缓存开启（SqlSession级别的缓存，也称为本地缓存）
  - 二级缓存需要手动开启和配置，他是基于namespace级别的缓存。
  - 为了提高可扩展性，MyBatis定义了缓存接口Cache。我们可以通过实现Cache接口来定义二级缓存。

### 一级缓存

- 一级缓存也叫本地缓存：SqlSession
  - 与数据库同一次会话期间查询到的数据会放在本地缓存中
  - 以后如果需要获取相同的数据，直接从缓存中拿，没必要再去查询数据库

测试步骤：

1.开启日志

2.测试在一个Session中查询两次记录

```java
    @Test
    public void test1() {
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        User user = mapper.getUserById(1);
        System.out.println(user);

        System.out.println("=====================================");

        User user2 =  mapper.getUserById(1);
        System.out.println(user2 == user);
    }
```

3.查看日志输出

**缓存失效的情况：**

1.查询不同的东西

2.增删改操作，可能会改变原来的数据，所以必定会刷新缓存

3.查询不同的Mapper.xml

4.手动清理缓存

```java
sqlSession.clearCache();
```

### 二级缓存

- 二级缓存也叫全局缓存，一级缓存作用域太低了，所以诞生了二级缓存
- 基于namespace级别的缓存，一个名称空间，对应一个二级缓存
- 工作机制
  - 一个会话查询一条数据，这个数据就会被放在当前会话的一级缓存中
  - 如果会话关闭了，这个会员对应的一级缓存就没了；但是我们想要的是，会话关闭了，一级缓存中的数据被保存到二级缓存中
  - 新的会话查询信息，就可以从二级缓存中获取内容
  - 不同的mapper查询出的数据会放在自己对应的缓存（map）中

一级缓存开启（SqlSession级别的缓存，也称为本地缓存）

- 二级缓存需要手动开启和配置，他是基于namespace级别的缓存。
- 为了提高可扩展性，MyBatis定义了缓存接口Cache。我们可以通过实现Cache接口来定义二级缓存。

步骤：

1.开启全局缓存

```java
<!--显示的开启全局缓存-->
<setting name="cacheEnabled" value="true"/>
```

2.在Mapper.xml中使用缓存

```java
<!--在当前Mapper.xml中使用二级缓存-->
<cache
       eviction="FIFO"
       flushInterval="60000"
       size="512"
       readOnly="true"/>
```

3.测试

1.问题：我们需要将实体类序列化，否则就会报错

**小结：**

- 只要开启了二级缓存，在同一个Mapper下就有效
- 所有的数据都会放在一级缓存中
- 只有当前会话提交，或者关闭的时候，才会提交到二级缓存中

### 缓存原理

![image-20210722201009453](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210722201009453.png)

**注意：**

- 只有查询才有缓存，根据数据是否需要缓存（修改是否频繁选择是否开启）useCache=“true”

```XML
    <select id="getUserById" resultType="user" useCache="true">
        select * from user where id = #{id}
    </select>

```

### 自定义缓存-ehcache

```
Ehcache是一种广泛使用的开源Java分布式缓存。主要面向通用缓存
```

1.导包

```XML
<dependency>
    <groupId>org.mybatis.caches</groupId>
    <artifactId>mybatis-ehcache</artifactId>
    <version>1.2.1</version>
</dependency>

```

2.在mapper中指定使用我们的ehcache缓存实现

```XML
<cache type="org.mybatis.caches.ehcache.EhcacheCache"/>
```
