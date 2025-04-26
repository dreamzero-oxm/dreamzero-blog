---
title: 配置HTTPS+SSL
description: 配置HTTPS+SSL
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - HTTP
    - SSL
updated: 2022-07-28
comments: false
---
# 阿里云服务器配置ssl（nginx+springboot）

## 1. 阿里云申请免费SSL证书

阿里云官网搜索ssl

![image-20220209161106173](http://moity-bucket.moity-soeoe.xyz/img/image-20220209161106173.png)

![image-20220209161149876](http://moity-bucket.moity-soeoe.xyz/img/image-20220209161149876.png)

**一年申请一次，一次有20分证书**，我已经申请过了所以不能购买

![image-20220209161218167](http://moity-bucket.moity-soeoe.xyz/img/image-20220209161218167.png)

## 2.创建证书

点击创建证书后会出现如下

![image-20220209161317101](http://moity-bucket.moity-soeoe.xyz/img/image-20220209161317101.png)

**需要点击证书申请**

![image-20220209161425686](http://moity-bucket.moity-soeoe.xyz/img/image-20220209161425686.png)

**域名填写：一定要是 * * . * * .com(单域名) ，其他默认就好**

**申请完之后点击下载，选择想要下载的证书类型，下面以nginx为例**

![image-20220209161633187](http://moity-bucket.moity-soeoe.xyz/img/image-20220209161633187.png)

下载完是个zip的压缩包

里面有.key文件和.pem文件

![image-20220209161807665](http://moity-bucket.moity-soeoe.xyz/img/image-20220209161807665.png)

## 3.nginx配置ssl

### 3.1. nginx查看是否安装`http_ssl_module`模块

```bash
#打开nginx的sbin文件夹
$ cd /usr/local/nginx/sbin/nginx
#查看是否安装
$ nginx -V
```

如果出现 `configure arguments: --with-http_ssl_module`, 则已安装（下面的步骤可以跳过，进入 `nginx.conf` 配置）

* 下载 你的nginx对应版本的安装包

  ```bash
  # 下载安装包到 src 目录
  $ cd /usr/local/src
  $ wget http://nginx.org/download/nginx-1.14.1.tar.gz
  ```

* 解压安装包

  ```bash
  $ tar -zxvf nginx-1.14.1.tar.gz
  ```

* 配置 ssl 模块

  ```bash
  $ cd nginx-1.14.1
  $ ./configure --prefix=/usr/local/nginx --with-http_ssl_module
  ```

* 使用 `make` 命令编译（**使用`make install`会重新安装nginx**），此时当前目录会出现 `objs` 文件夹

* 用新的 nginx 文件覆盖当前的 nginx 文件。

  ```bash
  $ cp ./objs/nginx /usr/local/nginx/sbin/
  ```

* 再次查看安装的模块（`configure arguments: --with-http_ssl_module`说明ssl模块已安装）

### 3.2. ssl 证书部署

* 下载申请好的 ssl 证书文件压缩包到本地并解压（这里是用的 pem 与 key 文件，文件名可以更改）

* 在 nginx 目录新建 cert 文件夹存放证书文件

  ```bash
  $ cd /usr/local/nginx
  $ mkdir cert
  ```

* 将这两个文件上传至服务器的 cert 目录里(我直接用XFTP上传)

### 3.3 `nginx.conf`配置

* 编辑 `/usr/local/nginx/conf/nginx.conf` 配置文件

  ```
  server {
      listen 443;
      server_name localhost;
      ssl on;
      root html;
      index index.html index.htm;
      ssl_certificate   cert/证书名称.pem;
      ssl_certificate_key  cert/证书名称.key;
      ssl_session_timeout 5m;
      ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
      ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
      ssl_prefer_server_ciphers on;
      location / {
          root html;
          index index.html index.htm;
      }
  }
  ```

* 重启nginx

  ```bash
  $ nginx -s reload
  ```

## 4. springboot设置https请求

​	在阿里云官网下载tomcat类型的ssl证书，里面会有密码的txt和证书文件

![image-20220209163316043](http://moity-bucket.moity-soeoe.xyz/img/image-20220209163316043.png)

### 4.1 在application.yaml中配置http

```yaml
server:
	port: 8443
	ssl:
        key-store: classpath:7201641_text.moity-soeoe.xyz.pfx
        key-store-password: FU1WXlDO
        key-store-type: PKCS12
        enabled: true
```

![image-20220209163522773](http://moity-bucket.moity-soeoe.xyz/img/image-20220209163522773.png)

### 4.2 建立config.java文件

```java
@Configuration
public class TomcatConfig {

    @Bean
    public TomcatServletWebServerFactory servletContainer() { //springboot2 新变化

        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
            @Override
            protected void postProcessContext(Context context) {
                SecurityConstraint securityConstraint = new SecurityConstraint();
                securityConstraint.setUserConstraint("CONFIDENTIAL");
                SecurityCollection collection = new SecurityCollection();
                collection.addPattern("/**");
                securityConstraint.addCollection(collection);
                context.addConstraint(securityConstraint);
            }
        };
        tomcat.addAdditionalTomcatConnectors(initiateHttpConnector());
        return tomcat;
    }

    private Connector initiateHttpConnector() {
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setScheme("http");
        connector.setPort(8080);
        connector.setSecure(false);
        connector.setRedirectPort(8443);
        return connector;
    }

}

```

### 4.3 启动springboot