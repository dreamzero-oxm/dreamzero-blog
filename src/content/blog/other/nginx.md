---
title: nginx学习
description: nginx学习
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - nginx
updated: 2022-07-28
comments: false
---
# nginx

## 1.简介

### 1.1什么是 nginx

- Nginx 是高性能的 HTTP 和反向代理的web服务器，处理高并发能力是十分强大的，能经受高负 载的考验,有报告表明能支持高达 50,000 个并发连接数。

### 1.2Nginx 作为 web 服务器

​	Nginx 可以作为静态页面的 web 服务器，同时还支持 CGI 协议的动态语言，比如 perl、php 等。但是不支持 java。Java 程序只能通过与 tomcat 配合完成。Nginx 专为性能优化而开发， 性能是其最重要的考量,实现上非常注重效率 ，能经受高负载的考验,有报告表明能支持高 达 50,000 个并发连接数。


### 1.3正向代理

**正向代理：如果把局域网外的 Internet 想象成一个巨大的资源库，则局域网中的客户端要访 问 Internet，则需要通过代理服务器来访问，这种代理服务就称为正向代理。**

也就是客户端通过代理服务器访问服务器的过程，就叫做正向代理

### 1.4反向代理

反向代理，其实客户端对代理是无感知的，因为客户端不需要任何配置就可以访问。
我们只 需要将请求发送到反向代理服务器，由反向代理服务器去选择目标服务器获取数据后，在返 回给客户端，此时反向代理服务器和目标服务器对外就是一个服务器，暴露的是代理服务器 地址，隐藏了真实服务器 IP 地址。

### 1.5负载均衡

​	增加服务器的数量，然后将请求分发到各个服务器上，将原先请求集中到单个服务器上的 情况改为将请求分发到多个服务器上，将负载分发到不同的服务器，也就是我们所说的负 载均衡

​	客户端发送**多个请求**到服务器，服务器处理请求，有一些可能要与数据库进行交互，服 务器处理完毕后，再将结果返回给客户端。


### 1.6分离

为了加快网站的解析速度，可以把动态页面和静态页面由不同的服务器来解析，加快解析速 度。降低原来单个服务器的压力。

## 2.Nginx 的安装

### 2.1需要安装gcc环境

```
命令：yum install gcc-c++
```

### 2.2第三方开发包

#### 2.2.1prcre

pcre是nginx的http模块用来解析正则表达式用的

```
 命令：yum install -y pcre pcre-devel
```

#### 2.2.2zlib

nginx使用zlib包进行gzip

```
命令：yum install -y zlib zlib-devel
```

#### 2.2.3openssl

```
  命令：yum install -y openssl openssl-devel
```

### 2.3解压nginx

```
tar -zxvf nginx-1.8.0.tar.gz\
```

### 2.4进入到解压出来的nginx文件夹用configure命令创建一个makeFile文件

```
./configure
```

### 2.5编译nginx的源代码

```
命令：make
```

### 2.6安装

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

## 3.Nginx 的常用命令和配置文件

### 3.1Nginx常用命令

**使用nginx操作命令前提：必须进入到nginx的自动生成目录的下/sbin文件夹下**。



#### 3.1.1查看 nginx 的版本号

```
./nginx -v
```

#### 3.1.2启动 nginx

```
./nginx
```

#### 3.1.3关闭nginx

```
./nginx -s stop
```

#### 3.1.4重新加载 nginx

在目录：**/usr/local/nginx/sbin 下执行命令**，不需要重启服务器，自动编译。

```
./nginx -s reload
```

### 3.2Nginx配置文件

#### 3,.3 配置文件位置

```
/conf/nginx.conf
```

### 3,4nginx 的组成部分

```
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}

```



#### 3.4.1第一部分：全局块

```
  worker_processes  1;
```

这是 Nginx 服务器并发处理服务的关键配置，worker_processes 值越大，可以支持的并发处理量也越多，但是 会受到硬件、软件等设备的制约。

#### 3.4.2第二部分：events块

```
events {
    worker_connections  1024;
}
```

events 块涉及的指令**主要影响 Nginx 服务器与用户的网络连接，常用的设置包括是否开启对多 work process 下的网络连接进行序列化，是否 允许同时接收多个网络连接，选取哪种事件驱动模型来处理连接请求，每个 word process 可以同时支持的最大连接数等。**
上述例子就表示每个 work process 支持的最大连接数为 1024.
这部分的配置对 Nginx 的性能影响较大，在实际中应该灵活配置。

#### 3.4.3第三部分：

```
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}

```

这算是 Nginx 服务器配置中最频繁的部分，代理、缓存和日志定义等绝大多数功能和第三方模块的配置都在这里。

需要注意的是：http 块也可以包括 http全局块、server 块。

* http全局块
  http全局块配置的指令包括文件引入、MIME-TYPE 定义、日志自定义、连接超时时间、单链接请求数上限等。
* server 块
  这块和虚拟主机有密切关系，虚拟主机从用户角度看，和一台独立的硬件主机是完全一样的，该技术的产生是为了 节省互联网服务器硬件成本。

**每个 http 块可以包括多个 server 块，而每个 server 块就相当于一个虚拟主机。**
**而每个 server 块也分为全局 server 块，以及可以同时包含多个 locaton 块。**

## 4.Nginx 反向代理

### 4.1第一步，准备两个tomcat端口

准备两个 tomcat，一个 8081 端口，一个 8082 端口。
在**/usr/feng/apach-tomcat/下 新建tomcat8081和tomcat8082两个文件夹，将 Tomcat安装包 分别上传到两个文件夹，进行解压缩安装，8081的Tomcat只改一个http协议默认端口号** 就行，直接启动即可。
这里需要改8082的端口号，需要修改三个端口，只修改一个端口号的话，是启动不了的，我已经测试过了（如果只修改http协议默认端口的话，8081和8082只会启动一个）。因为默认的都是8080（没有的直接创建文件夹，好多都是刚建的，与上面的第一个示例示例有点改动）

1. tomcat8081 解压包，然后进入到 /bin 下 ，使用命令 ./startup 启动
2. tomcat8082
   使用命令 编辑 文件 ：/conf/server.xml 文件
   vim server.xml
   修改后如下：
   **1、修改server 的默认端口，由默认8005->8091**

![image-20210802095713340](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802095713340.png)

​	**2、修改http协议的默认端口，由默认的8080->8082**

![image-20210802095733246](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802095733246.png)

**3、修改默认ajp协议的默认端口，由默认的8009->9001**

![image-20210802095747686](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802095747686.png)

### 4.2第二步，修改 nginx 的配置文件

**原来：**

```
server{
	listen			80;
	server_name		localhost;
	
	location / {
		root html;
		index index.html index.htm;
		proxy_pass		http://127/0/0/1:8080
	}
}
```

**修改后**

```
server{
	listen			8001;
	server_name		localhost;
	
	location ~ /vod/ {
		proxy_pass		http://127/0/0/1:8081
	}
	location ~ /edu/ {
		proxy_pass		http://127/0/0/1:8082
	}
}
```

![image-20210802100150629](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802100150629.png)

- **location 指令说明**

该指令用于匹配 URL。
语法如下：

1、= ：用于不含正则表达式的 uri 前，要求请求字符串与 uri 严格匹配，如果匹配 成功，就停止继续向下搜索并立即处理该请求。
2、~：用于表示 uri 包含正则表达式，并且区分大小写。
3、~*：用于表示 uri 包含正则表达式，并且不区分大小写。
4、^~：用于不含正则表达式的 uri 前，要求 Nginx 服务器找到标识 uri 和请求字 符串匹配度最高的 location 后，立即使用此 location 处理请求，而不再使用 location 块中的正则 uri 和请求字符串做匹配。

注意：如果 uri 包含正则表达式，则必须要有 ~ 或者 ~*标识。


## 5.Nginx 负载均衡

**实现效果**

浏览器地址栏输入地址 http://208.208.128.122/edu/a.html，负载均衡效果，平均 8081 和 8082 端口中

### 5.1修改 nginx 的配置文件

**原：**

```
 upstream myserver {
     server localhost:8081;
     server localhost:8082;
}
server{
	listen			80;
	server_name		localhost;
	
	location / {
		root html;
		proxy_pass		http://myserver
		#proxy_pass		http://127/0/0/1:8080
	}
}
```

## 6.nginx 分配服务器策略

### 6.1轮询（默认）

​	每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器 down 掉，能自动剔除。

### 6.2weight

weight 代表权重, 默认为 1,权重越高被分配的客户端越多

```
 upstream myserver {
     server localhost:8081 weight=10;
     server localhost:8082 weight=20;
}
server{
	listen			80;
	server_name		localhost;
	
	location / {
		root html;
		proxy_pass		http://myserver
		#proxy_pass		http://127/0/0/1:8080
	}
}
```

### 6.3ip_hash

ip_hash 每个请求按访问 ip 的 hash 结果分配，这样每个访客固定访问一个后端服务器

```
 upstream myserver {
 	ip_hash;
     server localhost:8081;
     server localhost:8082;
}
server{
	listen			80;
	server_name		localhost;
	
	location / {
		root html;
		proxy_pass		http://myserver
		#proxy_pass		http://127/0/0/1:8080
	}
}
```

### 6.4fair（第三方）

```
 upstream myserver {
     server localhost:8081;
     server localhost:8082;
     fair;
}
server{
	listen			80;
	server_name		localhost;
	
	location / {
		root html;
		proxy_pass		http://myserver
		#proxy_pass		http://127/0/0/1:8080
	}
}
```

### url_hash(第三方插件)

- 必须安装Nginx的hash软件包
- 按访问url的hash结果来分配请求，使每个url定向到同一个后端服务器，可以进一步提高后端缓存服务器的效率。

```
upstream backserver { 
 server squid1:3128; 
 server squid2:3128; 
 hash $request_uri; 
 hash_method crc32; 
} 

```



## 7.Nginx 动静分离

### 7.1.什么是动静分离

​	Nginx 动静分离简单来说就是把**动态跟静态请求分开**，不能理解成只是单纯的把动态页面和 静态页面物理分离。严格意义上说应该是动**态请求跟静态请求分开**，可以理解成使用 Nginx 处理静态页面，Tomcat 处理动态页面。动静分离从目前实现角度来讲大致分为两种：

​	一种是纯粹把静态文件独立成单独的域名，放在独立的服务器上，也是目前主流推崇的方案；

​	另外一种方法就是动态跟静态文件混合在一起发布，通过 nginx 来分开。

​	通过 location 指定不同的后缀名实现不同的请求转发。通过 expires 参数设置，可以使 浏览器缓存过期时间，减少与服务器之前的请求和流量。具体 Expires 定义：是给一个资 源设定一个过期时间，也就是说无需去服务端验证，直接通过浏览器自身确认是否过期即可， 所以不会产生额外的流量。此种方法非常适合不经常变动的资源。（如果经常更新的文件， 不建议使用 Expires 来缓存），我这里设置 3d，表示在这 3 天之内访问这个 URL，发送 一个请求，比对服务器该文件最后更新时间没有变化，则不会从服务器抓取，返回状态码 304，如果有修改，则直接从服务器重新下载，返回状态码 200。


### 7.2 具体配置例子：

```
 upstream myserver {
     server localhost:8081;
     server localhost:8082;
     fair;
}
server{
	listen			80;
	server_name		localhost;
	
	location / {
		root html;
		proxy_pass		http://myserver
		#proxy_pass		http://127/0/0/1:8080
	}
	
	location /www/ {
		root /data/;		//根目录下的data
	}
	location /image/ {
		root /data/;
		autoindex on;	//列出当前目录的内容
	}
}
```

## 8.Nginx 的高可用集群

### 8.1什么是nginx 高可用

**什么是负载均衡高可用**

nginx作为负载均衡器，所有请求都到了nginx，可见nginx处于非常重点的位置，如果nginx服务器宕机后端web服务将无法提供服务，影响严重。

为了屏蔽负载均衡服务器的宕机，需要建立一个备份机。主服务器和备份机上都运行高可用(High Availability)监控程序，通过传送诸如“I am alive”这样的信息来监控对方的运行状况。当备份机不能在一定的时间内收到这样的信息时，它就接管主服务器的服务IP并继续提供负载均衡服务;当备份管理器又从主管理器收到“I am alive”这样的信息时，它就释放服务IP地址，这样的主服务器就开始再次提供负载均衡服务。

**keepalived+nginx实现主备**

**什么是keepalived**

keepalived是集群管理中保证集群高可用的一个服务软件，用来防止单点故障。

Keepalived的作用是检测web服务器的状态，如果有一台web服务器死机，或工作出现故障，Keepalived将检测到，并将有故障的web服务器从系统中剔除，当web服务器工作正常后Keepalived自动将web服务器加入到服务器群中，这些工作全部自动完成，不需要人工干涉，需要人工做的只是修复故障的web服务器。

### 8.2配置高可用的准备工作（ 在两台服务器安装keepalived）

**安装**

第一种方式：命令安装

```
yum install keepalived -y
# 查看版本：
rpm -q -a keepalived
```

第二种方式：安装包方式（这里我使用这个）
命令如下：

```
tar -zxvf keepalived-2.0.18.tar.gz
cd keepalived-2.0.18
./configure
make && make install
```

**配置文件**

**安装之后，在 etc 里面生成目录 keepalived，有文件 keepalived.conf 。**

这个就是主配置文件。
主从模式主要在这个文件里配置。

## 完成高可用配置（主从配置）

### a) 修改 keepalived.conf 配置文件

```
另一种方法：

将keepalived安装成Linux系统服务，因为没有使用keepalived的默认安装路径（默认路径：/usr/local）,安装完成之后，需要做一些修改工作：
首先创建文件夹，将keepalived配置文件进行复制：
mkdir /etc/keepalived
cp /usr/local/keepalived/etc/keepalived/keepalived.conf /etc/keepalived/
然后复制keepalived脚本文件：
cp /usr/local/keepalived/etc/rc.d/init.d/keepalived /etc/init.d/
cp /usr/local/keepalived/etc/sysconfig/keepalived /etc/sysconfig/
ln -s /usr/local/sbin/keepalived /usr/sbin/
ln -s /usr/local/keepalived/sbin/keepalived /sbin/
可以设置开机启动：chkconfig keepalived on，到此我们安装完毕!
```

**修改/etc/keepalived/keepalivec.conf 配置文件**

```
global_defs { 
   notification_email { 
     acassen@firewall.loc 
     failover@firewall.loc 
     sysadmin@firewall.loc 
   } 
   notification_email_from Alexandre.Cassen@firewall.loc 
   smtp_server 208.208.128.122
   smtp_connect_timeout 30 
   router_id LVS_DEVEL 
} 
  
vrrp_script chk_http_port { 
  
   script "/usr/local/src/nginx_check.sh" 
   
   interval 2      #（检测脚本执行的间隔） 
  
   weight 2 
  
} 
  
vrrp_instance VI_1 {     
	state MASTER   # 备份服务器上将 MASTER 改为 BACKUP       
	interface ens192  //网卡     
	virtual_router_id 51   # 主、备机的 virtual_router_id 必须相同     
	priority 100     # 主、备机取不同的优先级，主机值较大，备份机值较小 
    advert_int 1 
    authentication { 
        auth_type PASS 
        auth_pass 1111 
    } 
    virtual_ipaddress {         
		208.208.128.50 // VRRP H 虚拟地址 
    } 
}

```

### 添加检测脚本

**在/usr/local/src 添加检测脚本**

```
#!/bin/bash
A=`ps -C nginx –no-header |wc -l`
if [ $A -eq 0 ];then
    /usr/local/nginx/sbin/nginx
    sleep 2
    if [ `ps -C nginx --no-header |wc -l` -eq 0 ];then
        killall keepalived
    fi
fi
```

### 开启nginx 和 keepalived

把两台服务器上 nginx 和 keepalived 启动 ：
启动 nginx：./nginx
启动 keepalived：systemctl start keepalived.service

## 其他

### Nginx目录结构有哪些？

```
[root@localhost ~]# tree /usr/local/nginx
/usr/local/nginx
├── client_body_temp
├── conf                             # Nginx所有配置文件的目录
│   ├── fastcgi.conf                 # fastcgi相关参数的配置文件
│   ├── fastcgi.conf.default         # fastcgi.conf的原始备份文件
│   ├── fastcgi_params               # fastcgi的参数文件
│   ├── fastcgi_params.default       
│   ├── koi-utf
│   ├── koi-win
│   ├── mime.types                   # 媒体类型
│   ├── mime.types.default
│   ├── nginx.conf                   # Nginx主配置文件
│   ├── nginx.conf.default
│   ├── scgi_params                  # scgi相关参数文件
│   ├── scgi_params.default  
│   ├── uwsgi_params                 # uwsgi相关参数文件
│   ├── uwsgi_params.default
│   └── win-utf
├── fastcgi_temp                     # fastcgi临时数据目录
├── html                             # Nginx默认站点目录
│   ├── 50x.html                     # 错误页面优雅替代显示文件，例如当出现502错误时会调用此页面
│   └── index.html                   # 默认的首页文件
├── logs                             # Nginx日志目录
│   ├── access.log                   # 访问日志文件
│   ├── error.log                    # 错误日志文件
│   └── nginx.pid                    # pid文件，Nginx进程启动后，会把所有进程的ID号写到此文件
├── proxy_temp                       # 临时目录
├── sbin                             # Nginx命令目录
│   └── nginx                        # Nginx的启动命令
├── scgi_temp                        # 临时目录
└── uwsgi_temp                       # 临时目录

```

### Nginx配置文件nginx.conf有哪些属性模块?

```
worker_processes  1；                					# worker进程的数量
events {                              					# 事件区块开始
    worker_connections  1024；            				# 每个worker进程支持的最大连接数
}                                    					# 事件区块结束
http {                               					# HTTP区块开始
    include       mime.types；            				# Nginx支持的媒体类型库文件
    default_type  application/octet-stream；     		# 默认的媒体类型
    sendfile        on；       							# 开启高效传输模式
    keepalive_timeout  65；       						# 连接超时
    server {            								# 第一个Server区块开始，表示一个独立的虚拟主机站点
        listen       80；      							# 提供服务的端口，默认80
        server_name  localhost；       					# 提供服务的域名主机名
        location / {            						# 第一个location区块开始
            root   html；       						# 站点的根目录，相当于Nginx的安装目录
            index  index.html index.htm；      			# 默认的首页文件，多个用空格分开
        }          										# 第一个location区块结果
        error_page   500502503504  /50x.html；     		# 出现对应的http状态码时，使用50x.html回应客户
        location = /50x.html {          				# location区块开始，访问50x.html
            root   html；      							# 指定对应的站点目录为html
        }
    }  
    ......
```

### Nginx静态资源?

- 静态资源访问，就是存放在nginx的html页面，我们可以自己编写

### 如何用Nginx解决前端跨域问题？

- 使用Nginx转发请求。把跨域的接口写成调本域的接口，然后将这些接口转发到真正的请求地址。

### Nginx虚拟主机怎么配置?

- 1、基于域名的虚拟主机，通过域名来区分虚拟主机——应用：外部网站
- 2、基于端口的虚拟主机，通过端口来区分虚拟主机——应用：公司内部网站，外部网站的管理后台
- 3、基于ip的虚拟主机。

#### 基于虚拟主机配置域名

- 需要建立/data/www /data/bbs目录，windows本地hosts添加虚拟机ip地址对应的域名解析；对应域名网站目录下新增index.html文件；

```
	#当客户端访问www.lijie.com,监听端口号为80,直接跳转到data/www目录下文件
    server {
        listen       80;
        server_name  www.lijie.com;
        location / {
            root   data/www;
            index  index.html index.htm;
        }
    }

	#当客户端访问www.lijie.com,监听端口号为80,直接跳转到data/bbs目录下文件
	 server {
        listen       80;
        server_name  bbs.lijie.com;
        location / {
            root   data/bbs;
            index  index.html index.htm;
        }
    }
```

#### 基于端口的虚拟主机

- 使用端口来区分，浏览器使用域名或ip地址:端口号 访问

```
    #当客户端访问www.lijie.com,监听端口号为8080,直接跳转到data/www目录下文件
	 server {
        listen       8080;
        server_name  www.lijie.com;
        location / {
            root   data/www;
            index  index.html index.htm;
        }
    }
	
	#当客户端访问www.lijie.com,监听端口号为80直接跳转到真实ip服务器地址 127.0.0.1:8080
	server {
        listen       80;
        server_name  www.lijie.com;
        location / {
		 	proxy_pass http://127.0.0.1:8080;
            index  index.html index.htm;
        }
	}

```

### location的作用是什么？

- location指令的作用是根据用户请求的URI来执行不同的应用，也就是根据用户请求的网站URL进行匹配，匹配成功即进行相关的操作。

#### location的语法

注意：~ 代表自己输入的英文字母

| 匹配符 | 匹配规则                     | 优先级 |
| ------ | ---------------------------- | ------ |
| =      | 精确匹配                     | 1      |
| ^~     | 以某个字符串开头             | 2      |
| ~      | 区分大小写的正则匹配         | 3      |
| ~*     | 不区分大小写的正则匹配       | 4      |
| !~     | 区分大小写不匹配的正则       | 5      |
| !~*    | 不区分大小写不匹配的正则     | 6      |
| /      | 通用匹配，任何请求都会匹配到 | 7      |

#### Location正则案例

```
	#优先级1,精确匹配，根路径
    location =/ {
        return 400;
    }

    #优先级2,以某个字符串开头,以av开头的，优先匹配这里，区分大小写
    location ^~ /av {
       root /data/av/;
    }

    #优先级3，区分大小写的正则匹配，匹配/media*****路径
    location ~ /media {
          alias /data/static/;
    }

    #优先级4 ，不区分大小写的正则匹配，所有的****.jpg|gif|png 都走这里
    location ~* .*\.(jpg|gif|png|js|css)$ {
       root  /data/av/;
    }

    #优先7，通用匹配
    location / {
        return 403;
    }

```

### 限流怎么做的？

- Nginx限流就是限制用户请求速度，防止服务器受不了
- 限流有3种
  1. 正常限制访问频率（正常流量）
  2. 突发限制访问频率（突发流量）
  3. 限制并发连接数
- Nginx的限流都是基于漏桶流算法，底下会说道什么是桶铜流

### 实现三种限流算法

#### 1、正常限制访问频率（正常流量）：

限制一个用户发送的请求，我Nginx多久接收一个请求。

Nginx中使用ngx_http_limit_req_module模块来限制的访问频率，限制的原理实质是基于漏桶算法原理来实现的。在nginx.conf配置文件中可以使用limit_req_zone命令及limit_req命令限制单个IP的请求处理频率。

	#定义限流维度，一个用户一分钟一个请求进来，多余的全部漏掉
	limit_req_zone $binary_remote_addr zone=one:10m rate=1r/m;
	
	#绑定限流维度
	server{
		
		location/seckill.html{
			limit_req zone=zone;	
			proxy_pass http://lj_seckill;
		}
	
	}
1r/s代表1秒一个请求，1r/m一分钟接收一个请求， 如果Nginx这时还有别人的请求没有处理完，Nginx就会拒绝处理该用户请求。



#### 2、突发限制访问频率（突发流量）：

限制一个用户发送的请求，我Nginx多久接收一个。

上面的配置一定程度可以限制访问频率，但是也存在着一个问题：如果突发流量超出请求被拒绝处理，无法处理活动时候的突发流量，这时候应该如何进一步处理呢？Nginx提供burst参数结合nodelay参数可以解决流量突发的问题，可以设置能处理的超过设置的请求数外能额外处理的请求数。我们可以将之前的例子添加burst参数以及nodelay参数：

	#定义限流维度，一个用户一分钟一个请求进来，多余的全部漏掉
	limit_req_zone $binary_remote_addr zone=one:10m rate=1r/m;
	
	#绑定限流维度
	server{
		
		location/seckill.html{
			limit_req zone=zone burst=5 nodelay;
			proxy_pass http://lj_seckill;
		}
	
	}

为什么就多了一个 burst=5 nodelay; 呢，多了这个可以代表Nginx对于一个用户的请求会立即处理前五个，多余的就慢慢来落，没有其他用户的请求我就处理你的，有其他的请求的话我Nginx就漏掉不接受你的请求

#### 3、 限制并发连接数

Nginx中的ngx_http_limit_conn_module模块提供了限制并发连接数的功能，可以使用limit_conn_zone指令以及limit_conn执行进行配置。接下来我们可以通过一个简单的例子来看下：
	http {
		limit_conn_zone $binary_remote_addr zone=myip:10m;
		limit_conn_zone $server_name zone=myServerName:10m;
	}

    server {
        location / {
            limit_conn myip 10;
            limit_conn myServerName 100;
            rewrite / http://www.lijie.net permanent;
        }
    }
上面配置了单个IP同时并发连接数最多只能10个连接，并且设置了整个虚拟服务器同时最大并发数最多只能100个链接。当然，只有当请求的header被服务器处理后，虚拟服务器的连接数才会计数。刚才有提到过Nginx是基于漏桶算法原理实现的，实际上限流一般都是基于漏桶算法和令牌桶算法实现的。接下来我们来看看两个算法的介绍：
漏桶流算法和令牌桶算法知道？
**漏桶算法**
漏桶算法是网络世界中流量整形或速率限制时经常使用的一种算法，它的主要目的是控制数据注入到网络的速率，平滑网络上的突发流量。漏桶算法提供了一种机制，通过它，突发流量可以被整形以便为网络提供一个稳定的流量。也就是我们刚才所讲的情况。漏桶算法提供的机制实际上就是刚才的案例：突发流量会进入到一个漏桶，漏桶会按照我们定义的速率依次处理请求，如果水流过大也就是突发流量过大就会直接溢出，则多余的请求会被拒绝。所以漏桶算法能控制数据的传输速率。

![image-20210802215149726](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802215149726.png)

**令牌桶算法**
令牌桶算法是网络流量整形和速率限制中最常使用的一种算法。典型情况下，令牌桶算法用来控制发送到网络上的数据的数目，并允许突发数据的发送。Google开源项目Guava中的RateLimiter使用的就是令牌桶控制算法。令牌桶算法的机制如下：存在一个大小固定的令牌桶，会以恒定的速率源源不断产生令牌。如果令牌消耗速率小于生产令牌的速度，令牌就会一直产生直至装满整个令牌桶。

![image-20210802215158553](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802215158553.png)

### 为什么要做动静分离？

Nginx是当下最热的Web容器，网站优化的重要点在于**静态化网站**，网站静态化的关键点则是是**动静分离**，动静分离是让动态网站里的动态网**页根据一定规则把不变的资源和经常变的资源区分开来**，动静资源做好了拆分以后，我们则根据静态资源的特点将其做缓存操作。

让静态的资源只走静态资源服务器，动态的走动态的服务器

Nginx的静态处理能力很强，但是动态处理能力不足，因此，在企业中常用动静分离技术。

对于静态资源比如图片，js，css等文件，我们则在反向代理服务器nginx中进行缓存。这样浏览器在请求一个静态资源时，代理服务器nginx就可以直接处理，无需将请求转发给后端服务器tomcat。
若用户请求的动态文件，比如servlet,jsp则转发给Tomcat服务器处理，从而实现动静分离。这也是反向代理服务器的一个重要的作用。

### Nginx怎么做的动静分离？

- 只需要指定路径对应的目录。location/可以使用正则表达式匹配。并指定对应的硬盘中的目录。如下：（操作都是在Linux上）

```
		location /image/ {
            root   /usr/local/static/;
            autoindex on;
        }
```

创建目录

```
mkdir /usr/local/static/image
```

进入目录

```
cd  /usr/local/static/image
```

放一张照片上去#

```
1.jpg
```

重启 nginx

```
sudo nginx -s reload
```

打开浏览器 输入 server_name/image/1.jpg 就可以访问该静态图片了


### Nginx配置高可用性怎么配置？

- 当上游服务器(真实访问服务器)，一旦出现故障或者是没有及时相应的话，应该直接轮训到下一台服务器，保证服务器的高可用
- Nginx配置代码：

```
server {
        listen       80;
        server_name  www.lijie.com;
        location / {
		    ### 指定上游服务器负载均衡服务器
		    proxy_pass http://backServer;
			###nginx与上游服务器(真实访问的服务器)超时时间 后端服务器连接的超时时间_发起握手等候响应超时时间
			proxy_connect_timeout 1s;
			###nginx发送给上游服务器(真实访问的服务器)超时时间
            proxy_send_timeout 1s;
			### nginx接受上游服务器(真实访问的服务器)超时时间
            proxy_read_timeout 1s;
            index  index.html index.htm;
        }
    }
```

### Nginx怎么判断别IP不可访问？

```
 	 # 如果访问的ip地址为192.168.9.115,则返回403
     if  ($remote_addr = 192.168.9.115) {  
         return 403;  
     }  
```

### 怎么限制浏览器访问？

```
	## 不允许谷歌浏览器访问 如果是谷歌浏览器返回500
 	if ($http_user_agent ~ Chrome) {   
        return 500;  
    }
```

### Rewrite全局变量是什么？

![image-20210802220457115](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802220457115.png)

## 关于proxy_set_header

nginx上配有aaa.example.com的虚拟主机，现在需要将访问http://aaa.example.com/api/x.x/client/的请求转到http://bbb.example.com/api/x.x/client/，bbb.example.com的虚拟主机在另外一台nginx上，其中x.x表示位数不定的版本号，如：1.0或1.20.345都可能。请求转过去要求url保持不变

在location里面添加一条**proxy_set_header Host $proxy_host;**配置。当**Host**设置为$http_host时，则不改变请求头的值，所以当要转发到bbb.example.com的时候，请求头还是aaa.example.com的Host信息，就会有问题；当**Host**设置为$proxy_host时，则会重新设置请求头为bbb.example.com的Host信息。





















