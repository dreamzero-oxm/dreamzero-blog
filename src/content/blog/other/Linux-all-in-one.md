---
title: Linux全家桶
description: Linux全家桶
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Linux
updated: 2022-07-28
comments: false
---
## Mysql

- `安装Mysqly以来`
  - `yum install per1 net-tools -y`
- `卸载 mariadba`
  - `rpm -qa | grep mariadb`
  - `rpm -e --nodeps mariadb-libs-5.5.60-1.e17_5.x86_64`
- `安装mysql`
  - `tar -xvf mysql-8.0.25-1.el8.x86_64.rpm-bundle.tar`
  - `rpm -ivh mysql-community-common-8.0.25-1.el7.x86_64.rpm`
  - `rpm -ivh mysql-community-client-plugins-8.0.25-1.el7.x86_64.rpm`
  - `rpm -ivh mysql-community-libs-8.0.25-1.el7.x86_64.rpm`
  - `rpm -ivh mysql-community-client-8.0.25-1.el7.x86_64.rpm`
  - `rpm -ivh mysql-community-server-8.0.25-1.el7.x86_64.rpm`
- `启动mysql`
  - `systemctl start mysqld`
- `查找密码并登录Mysql`
  - `cat /var/log/mysqld.log | grep password`
  - `mysql -u root -p`
- `修改mysql密码`
  - `set global validate_password.policy=0;`
    - `设置密码安全级别`
  - `set global validate_password.length=6;`
    - `设置密码长度为6`
  - `alter user root@localhost identified by '123456';`
- `修改mysql连接地址`
  - `use mysql；`
  - `update user set host='%' where user = 'root'；`
  - `commit；`
  - `exit；`
  - `systemctl restart mysqld`

![image-20210822093321523](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210822093321523.png)

安装时报错

解决：`yum list libaio`查看可以安装的yum源
![image-20210822093416772](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210822093416772.png)
yum install -y 这两个都安装一遍



## JDK

官网下载jdk的rpm

https://www.oracle.com/cn/java/technologies/javase/javase-jdk8-downloads.html
Linux x86 RPM Package
下载好后

```
rpm -ivh jdk-8u301-linux-i586.rpm
```

他会在/usr中创建一个java的文件夹

**配置环境变量**

```bash
第一步：vim /etc/profile

第二部在文档最后加上
export JAVA_HOME=/usr/java/deafult
export CLASSPATH=$:CLASSPATH:$JAVA_HOME/lib/
export PATH=$PATH:$JAVA_HOME/bin
```

## Nginx

### 需要安装gcc环境

```
命令：yum install gcc-c++
```

### 第三方开发包

#### prcre

pcre是nginx的http模块用来解析正则表达式用的

```
 命令：yum install -y pcre pcre-devel
```

#### zlib

nginx使用zlib包进行gzip

```
命令：yum install -y zlib zlib-devel
```

#### openssl

```
  命令：yum install -y openssl openssl-devel
```

### 解压nginx

```
tar -zxvf nginx-1.8.0.tar.gz\
```

### 进入到解压出来的nginx文件夹用configure命令创建一个makeFile文件

```
./configure
```

### 编译nginx的源代码

```
命令：make
```

### 安装

```
命令:make install
```

### 2.7启动nginx

进入nginx的安装目录下的sbin目录，启动nginx

```
命令：启动  ./nginx
```

### 2.8可能存在的问题：

在从网页打开之后，可能会是403Forbidden

解决：把conf文件的nginx.conf中添加一行user root root;

命令：vim conf/nginx.conf

```
将第一行的#user nobody
改为user root;

重新加载配置文件
命令:./sbin/nginx -s reload
```

## Redis

先去redis官网下载安装包
https://redis.io/

1. 下载完毕之后进行解压 ***tar -zxvf redis-6.0.3.tar.gz***

2. 进到解压后的redis目录中进行编译 ***make***

3. 编译时若出现以下提示，该错误仅仅说明未安装gcc![image-20210822172408244](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210822172408244.png)
   如果是已经安装gcc，又出现了错误，因为CentOS7默认安装的是4.8.5，而redis6.0只支持5.3以上版本，只需要升级版本***yum -y install centos-release-scl***
   ***yum -y install devtoolset-9-gcc devtoolset-9-gcc-c++ devtoolset-9-binutils***
   升级好了之后要记得版本的切换临时切换：***scl enable devtoolset-9 bash***

   永久切换：***echo “source /opt/rh/devtoolset-9/enable” >> /etc/profile***
   切换完成之后重新连接服务器生效，查看gcc版本 ***gcc -v***

4. 版本切换成功之后，进入redis目录中，重新编译 ***make install***

### 安装后配置

1. 安装后第一件事先把redis的端口改掉，因为容易被黑客全网扫描6379端口攻击
   由port 6379 改为 你自己定义的端口
2. 以后台进程方式启动
   修改daemonize no 为daemonize yes
3. 设置redis远程连接
   （1）先放行你设置的端口号
   （2）注释掉bind 127.0.0.1
   （3）设置redis连接密码：在requirepass foobard改为requirepass xxxxx
   1. 在上面的redis目录把redis的一些服务提取安装到自定义目录中
      make install PREFIX=/usr/local/redis（多出一个bin文件夹）