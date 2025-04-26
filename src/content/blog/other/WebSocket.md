---
title: WebSocket
description: WebSocket
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - WebSocket
updated: 2022-07-28
comments: false
---
# WebSocket

## 理解WebSocket

### 1. websocket与http

**WebSocket是HTML5出的东西（协议），也就是说HTTP协议没有变化，或者说没关系，但HTTP是不支持持久连接的（长连接，循环连接的不算）**
首先HTTP有1.1和1.0之说，也就是所谓的keep-alive，把多个HTTP请求合并为一个，但是Websocket其实是一个新协议，跟HTTP协议基本没有关系，只是为了兼容现有浏览器的握手规范而已，也就是说它是HTTP协议上的一种补充可以通过这样一张图理解

![img](https://pic1.zhimg.com/50/6651f2f811ec133b0e6d7e6d0e194b4c_720w.jpg?source=1940ef5c)![img](https://pic1.zhimg.com/80/6651f2f811ec133b0e6d7e6d0e194b4c_720w.jpg?source=1940ef5c)

有交集，但是并不是全部。
另外Html5是指的一系列新的API，或者说新规范，新技术。Http协议本身只有1.0和1.1，而且跟Html本身没有直接关系。。
通俗来说，你可以用HTTP**协议**传输非Html**数据**，就是这样=。=
再简单来说，**层级不一样**。

### 2. Websocket是什么样的协议，具体有什么优点

首先，Websocket是一个**持久化**的协议，相对于HTTP这种**非持久**的协议来说。
简单的举个例子吧，用目前应用比较广泛的PHP生命周期来解释。
\1) HTTP的生命周期通过Request来界定，也就是一个Request 一个Response，那么**在**HTTP1.0**中**，这次HTTP请求就结束了。
在HTTP1.1中进行了改进，使得有一个keep-alive，也就是说，在一个HTTP连接中，可以发送多个Request，接收多个Response。
但是请记住 Request = Response ， 在HTTP中永远是这样，也就是说一个request只能有一个response。而且这个response也是**被动**的，不能主动发起。

**教练，你BB了这么多，跟Websocket有什么关系呢？**
_(:з」∠)_好吧，我正准备说Websocket呢。。
首先Websocket是基于HTTP协议的，或者说**借用**了HTTP的协议来完成一部分握手。
在握手阶段是一样的
-------以下涉及专业技术内容，不想看的可以跳过lol:，或者只看加黑内容--------
首先我们来看个典型的Websocket握手（借用Wikipedia的。。）

```text
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://example.com
```

熟悉HTTP的童鞋可能发现了，这段类似HTTP协议的握手请求中，多了几个东西。
我会顺便讲解下作用。

```text
Upgrade: websocket
Connection: Upgrade
```

这个就是Websocket的核心了，告诉Apache、Nginx等服务器：**注意啦，窝发起的是Websocket协议，快点帮我找到对应的助理处理~不是那个老土的HTTP。**

```text
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
```

首先，Sec-WebSocket-Key 是一个Base64 encode的值，这个是浏览器随机生成的，告诉服务器：**泥煤，不要忽悠窝，我要验证尼是不是真的是Websocket助理。**
然后，Sec_WebSocket-Protocol 是一个用户定义的字符串，用来区分同URL下，不同的服务所需要的协议。简单理解：**今晚我要服务A，别搞错啦~**
最后，Sec-WebSocket-Version 是告诉服务器所使用的Websocket Draft（协议版本），在最初的时候，Websocket协议还在 Draft 阶段，各种奇奇怪怪的协议都有，而且还有很多期奇奇怪怪不同的东西，什么Firefox和Chrome用的不是一个版本之类的，当初Websocket协议太多可是一个大难题。。不过现在还好，已经定下来啦~大家都使用的一个东西~ 脱水：**服务员，我要的是13岁的噢→_→**

然后服务器会返回下列东西，表示已经接受到请求， 成功建立Websocket啦！

```text
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
```

这里开始就是HTTP最后负责的区域了，告诉客户，我已经成功切换协议啦~

```text
Upgrade: websocket
Connection: Upgrade
```

依然是固定的，告诉客户端即将升级的是Websocket协议，而不是mozillasocket，lurnarsocket或者shitsocket。
然后，Sec-WebSocket-Accept 这个则是经过服务器确认，并且加密过后的 Sec-WebSocket-Key。服务器：**好啦好啦，知道啦，给你看我的ID CARD来证明行了吧。。**
后面的，Sec-WebSocket-Protocol 则是表示最终使用的协议。

至此，HTTP已经完成它所有工作了，接下来就是完全按照Websocket协议进行了。
具体的协议就不在这阐述了。
------------------技术解析部分完毕------------------



![img](https://pic3.zhimg.com/50/afe119b52e096016139edabc2dfa9661_720w.jpg?source=1940ef5c)![img](https://pic3.zhimg.com/80/afe119b52e096016139edabc2dfa9661_720w.jpg?source=1940ef5c)

你TMD又BBB了这么久，那到底Websocket有什么鬼用，http long poll，或者ajax轮询不都可以实现实时信息传递么。

![img](https://pic2.zhimg.com/50/20110e661edb1e93755a99c1d826e264_720w.jpg?source=1940ef5c)![img](https://pic2.zhimg.com/80/20110e661edb1e93755a99c1d826e264_720w.jpg?source=1940ef5c)



好好好，年轻人，那我们来讲一讲Websocket有什么用。
来给你吃点胡（苏）萝（丹）卜（红）

![img](https://pic2.zhimg.com/50/31ddf0cfbeecef21568d85ca60b5f1ff_720w.jpg?source=1940ef5c)![img](https://pic2.zhimg.com/80/31ddf0cfbeecef21568d85ca60b5f1ff_720w.jpg?source=1940ef5c)

### 3. Websocket的作用

在讲Websocket之前，我就顺带着讲下 long poll 和 ajax轮询 的原理。

#### ajax轮询

首先是 ajax轮询 ，ajax轮询 的原理非常简单，让浏览器隔个几秒就发送一次请求，询问服务器是否有新信息。
场景再现：
客户端：啦啦啦，有没有新信息(Request)
服务端：没有（Response）
客户端：啦啦啦，有没有新信息(Request)
服务端：没有。。（Response）
客户端：啦啦啦，有没有新信息(Request)
服务端：你好烦啊，没有啊。。（Response）
客户端：啦啦啦，有没有新消息（Request）
服务端：好啦好啦，有啦给你。（Response）
客户端：啦啦啦，有没有新消息（Request）
服务端：。。。。。没。。。。没。。。没有（Response） ---- loop



#### long poll 

long poll 其实原理跟 ajax轮询 差不多，都是采用轮询的方式，不过采取的是阻塞模型（一直打电话，没收到就不挂电话），也就是说，客户端发起连接后，如果没消息，就一直不返回Response给客户端。直到有消息才返回，返回完之后，客户端再次建立连接，周而复始。
场景再现
客户端：啦啦啦，有没有新信息，没有的话就等有了才返回给我吧（Request）
服务端：额。。   等待到有消息的时候。。来 给你（Response）
客户端：啦啦啦，有没有新信息，没有的话就等有了才返回给我吧（Request） -loop

从上面可以看出其实这两种方式，都是在不断地建立HTTP连接，然后等待服务端处理，可以体现HTTP协议的另外一个特点，**被动性**。
何为被动性呢，其实就是，服务端不能主动联系客户端，只能有客户端发起。
简单地说就是，服务器是一个很懒的冰箱（这是个梗）（不会、不能主动发起连接），但是上司有命令，如果有客户来，不管多么累都要好好接待。

说完这个，我们再来说一说上面的缺陷（原谅我废话这么多吧OAQ）
从上面很容易看出来，不管怎么样，上面这两种都是非常消耗资源的。
ajax轮询 需要服务器有很快的处理速度和资源。（速度）
long poll 需要有很高的并发，也就是说同时接待客户的能力。（场地大小）
所以ajax轮询 和long poll 都有可能发生这种情况。

**客户端：啦啦啦啦，有新信息么？**
**服务端：月线正忙，请稍后再试（503 Server Unavailable）**
**客户端：。。。。好吧，啦啦啦，有新信息么？**
**服务端：月线正忙，请稍后再试（503 Server Unavailable）
**
**客户端：**

![img](https://pic1.zhimg.com/50/7c0cf075c7ee4cc6cf52f4572a4c1c10_720w.jpg?source=1940ef5c)![img](https://pic1.zhimg.com/80/7c0cf075c7ee4cc6cf52f4572a4c1c10_720w.jpg?source=1940ef5c)


**然后服务端在一旁忙的要死：冰箱，我要更多的冰箱！更多。。更多。。（我错了。。这又是梗。。）**



\--------------------------
**言归正传，我们来说Websocket吧**
通过上面这个例子，我们可以看出，这两种方式都不是最好的方式，需要很多资源。
一种需要更快的速度，一种需要更多的'电话'。这两种都会导致'电话'的需求越来越高。
哦对了，忘记说了HTTP还是一个无状态协议。（感谢评论区的各位指出OAQ）
通俗的说就是，服务器因为每天要接待太多客户了，是个**健忘鬼**，你一挂电话，他就把你的东西全忘光了，把你的东西全丢掉了。你第二次还得再告诉服务器一遍。

所以在这种情况下出现了，Websocket出现了。
他解决了HTTP的这几个难题。
首先，**被动性**，当服务器完成协议升级后（HTTP->Websocket），服务端就可以主动推送信息给客户端啦。
所以上面的情景可以做如下修改。
客户端：啦啦啦，我要建立Websocket协议，需要的服务：chat，Websocket协议版本：17（HTTP Request）
服务端：ok，确认，已升级为Websocket协议（HTTP Protocols Switched）
客户端：麻烦你有信息的时候推送给我噢。。
服务端：ok，有的时候会告诉你的。
服务端：balabalabalabala
服务端：balabalabalabala
服务端：哈哈哈哈哈啊哈哈哈哈
服务端：笑死我了哈哈哈哈哈哈哈

就变成了这样，只需要经过**一次HTTP请求**，就可以做到源源不断的信息传送了。（在程序设计中，这种设计叫做回调，即：你有信息了再来通知我，而不是我傻乎乎的每次跑来问你）
这样的协议解决了上面同步有延迟，而且还非常消耗资源的这种情况。
那么为什么他会解决服务器上消耗资源的问题呢？
其实我们所用的程序是要经过两层代理的，即**HTTP协议在Nginx等服务器的解析下**，然后再传送给相应的**Handler（PHP等）**来处理。
简单地说，我们有一个非常快速的接**线员（Nginx）**，他负责把问题转交给相应的**客服（Handler）**。
本身**接线员基本上速度是足够的**，但是每次都卡在**客服（Handler）**了，老有**客服**处理速度太慢。，导致客服不够。
Websocket就解决了这样一个难题，建立后，可以直接跟接线员建立持**久连接**，有信息的时候客服想办法通知接线员，然后**接线员**在统一转交给客户。
这样就可以解决客服处理速度过慢的问题了。

同时，在传统的方式上，要不断的建立，关闭HTTP协议，由于HTTP是非状态性的，每次都要**重新传输identity info（鉴别信息）**，来告诉服务端你是谁。
虽然接线员很快速，但是每次都要听这么一堆，效率也会有所下降的，同时还得不断把这些信息转交给客服，不但浪费客服的**处理时间**，而且还会在网路传输中消耗**过多的流量/时间。**
但是Websocket只需要**一次HTTP握手，所以说整个通讯过程是建立在一次连接/状态中**，也就避免了HTTP的非状态性，服务端会一直知道你的信息，直到你关闭请求，这样就解决了接线员要反复解析HTTP协议，还要查看identity info的信息。
同时由**客户主动询问**，转换为**服务器（推送）有信息的时候就发送（当然客户端还是等主动发送信息过来的。。）**，没有信息的时候就交给接线员（Nginx），不需要占用本身速度就慢的**客服（Handler）**了

## 正文

### 什么是WebSocket?

![image-20210910205942356](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210910205942356.png)

WebSocket协议是基于TCP的一种新的网络协议。它实现了浏览器与服务器全双工(full-duplex)通信——允许服务器主动发送信息给客户端。

### 为什么需要 WebSocket？

初次接触 WebSocket 的人，都会问同样的问题：我们已经有了 HTTP 协议，为什么还需要另一个协议？它能带来什么好处？

- 答案很简单，因为 HTTP 协议有一个缺陷：***通信只能由客户端发起***，HTTP 协议做不到服务器主动向客户端推送信息。![image-20210910210111811](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210910210111811.png)

  举例来说，我们想要查询当前的排队情况，只能是页面轮询向服务器发出请求，服务器返回查询结果。轮询的效率低，非常浪费资源（因为必须不停连接，或者 HTTP 连接始终打开）。因此WebSocket 就是这样发明的。
  所以，WebSocket建立出来就是为了服务器和客户端之间建立一个连接



```text
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://example.com
```

| 头名称                   | 说明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| Connection:Upgrade       | 标识该HTTP请求是一个协议升级请求                             |
| Upgrade:WebSocket        | 协议升级为WebSocket协议                                      |
| Sec-WebSocket-Version    | 客户端支持WebSocket版本                                      |
| Sec-WebSocket-Key        | 客户端采用base64编码的24位随机字符序列，服务器接收客户端HTTP协议升级说明的证明。要求服务端相应一个对应的Sec-WebSocket-Accept头信息作为应答 |
| Sec-WebSocket-Extensions | 协议扩展类型                                                 |



```text
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
```

| 头名称                 | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| Sec-WebSocket-Accept   | 服务器接收客户端发来的随机字符序列，解码然后返回一个对应的信息给客户端 |
| Sec-WebSocket-Protocol | 表示最终使用的协议                                           |

**服务器怎么判断是哪个客户端呢？**

* 通过Sec-WebSocket-Key，不同的客户端发送来的不同的base64编码的序列，通过这个序列来判断是哪个客户端

**客户端怎么判断是哪个服务端呢？**

* 通过服务器返回的Sec-WebSocket-Accept来判断，客户端给不同的服务端发送不同的随机字符序列，然后服务端相应一个对应的头信息，客户端就通过这个头信息来判断是哪个服务器

**Sec-WebSocket-Key：**
是一个 `Base64 encode` 的值，这个是浏览器随机生成的

**Sec_WebSocket-Protocol：**
是一个用户定义的字符串，用来区分同URL下，不同的服务所需要的协议

**Sec-WebSocket-Version：**
是告诉服务器所使用的 `Websocket Draft`（协议版本）

**Sec-WebSocket-Accept：**
这个则是经过服务器确认，并且加密过后的 `Sec-WebSocket-Key`

**Sec-WebSocket-Protocol：**
是表示最终使用的协议

## 启动

### maven依赖

```xml
<dependency>  
    <groupId>org.springframework.boot</groupId>  
    <artifactId>spring-boot-starter-websocket</artifactId>  
</dependency> 
```

### WebSocketConfig配置

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

/**
 * 开启WebSocket支持
 * @author zhengkai.blog.csdn.net
 */
@Configuration  
public class WebSocketConfig {  
	
    @Bean  
    //注入ServerEndpointExporter bean对象，自动注册使用了ServerEndpoint注解的对象
    public ServerEndpointExporter serverEndpointExporter() {  
        return new ServerEndpointExporter();  
    }  
  
} 
```

* 因为WebSocket是类似客户端服务端的形式(采用ws协议)，那么这里的WebSocketServer其实就相当于一个WebSocket协议的Controller
* 直接@ServerEndpoint("/imserver/{userId}") 、@Component启用即可，然后在里面实现@OnOpen开启连接，@onClose关闭连接，@onMessage接收消息等方法。
* 新建一个ConcurrentHashMap webSocketMap 用于接收当前userId的WebSocket，方便IM之间对userId进行推送消息。单机版实现到这里就可以。
* 集群版（多个ws节点）还需要借助mysql或者redis等进行处理，改造对应的sendMessage方法即可。

### 对于项目部署在外部tomcat的时候WebSocketConfig的更改

**ServerEndpointExporter 是由Spring官方提供的标准实现，用于扫描ServerEndpointConfig配置类和@ServerEndpoint注解实例。使用规则也很简单：**

如果使用默认的嵌入式容器 比如Tomcat 则必须手工在上下文提供ServerEndpointExporter。
如果使用外部容器部署war包，则不需要提供提供ServerEndpointExporter，因为此时SpringBoot默认将扫描服务端的行为交给外部容器处理，所以线上部署的时候要把WebSocketConfig中这段注入bean的代码注掉。

### 实现

```java
package com.softdev.system.demo.config;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;
import cn.hutool.log.Log;
import cn.hutool.log.LogFactory;


/**
 * @author zhengkai.blog.csdn.net
 */
@ServerEndpoint("/imserver/{userId}")
@Component
public class WebSocketServer {

    static Log log=LogFactory.get(WebSocketServer.class);
    /**静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。*/
    private static int onlineCount = 0;
    /**concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。*/
    private static ConcurrentHashMap<String,WebSocketServer> webSocketMap = new ConcurrentHashMap<>();
    /**与某个客户端的连接会话，需要通过它来给客户端发送数据*/
    private Session session;
    /**接收userId*/
    private String userId="";

    /**
     * 连接建立成功调用的方法*/
    @OnOpen
    public void onOpen(Session session,@PathParam("userId") String userId) {
        this.session = session;
        this.userId=userId;
        if(webSocketMap.containsKey(userId)){
            webSocketMap.remove(userId);
            webSocketMap.put(userId,this);
            //加入set中
        }else{
            webSocketMap.put(userId,this);
            //加入set中
            addOnlineCount();
            //在线数加1
        }

        log.info("用户连接:"+userId+",当前在线人数为:" + getOnlineCount());

        try {
            sendMessage("连接成功");
        } catch (IOException e) {
            log.error("用户:"+userId+",网络异常!!!!!!");
        }
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        if(webSocketMap.containsKey(userId)){
            webSocketMap.remove(userId);
            //从set中删除
            subOnlineCount();
        }
        log.info("用户退出:"+userId+",当前在线人数为:" + getOnlineCount());
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息*/
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("用户消息:"+userId+",报文:"+message);
        //可以群发消息
        //消息保存到数据库、redis
        if(StringUtils.isNotBlank(message)){
            try {
                //解析发送的报文
                JSONObject jsonObject = JSON.parseObject(message);
                //追加发送人(防止串改)
                jsonObject.put("fromUserId",this.userId);
                String toUserId=jsonObject.getString("toUserId");
                //传送给对应toUserId用户的websocket
                if(StringUtils.isNotBlank(toUserId)&&webSocketMap.containsKey(toUserId)){
                    webSocketMap.get(toUserId).sendMessage(jsonObject.toJSONString());
                }else{
                    log.error("请求的userId:"+toUserId+"不在该服务器上");
                    //否则不在这个服务器上，发送到mysql或者redis
                }
            }catch (Exception e){
                e.printStackTrace();
            }
        }
    }

    /**
     *
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        log.error("用户错误:"+this.userId+",原因:"+error.getMessage());
        error.printStackTrace();
    }
    /**
     * 实现服务器主动推送
     */
    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }


    /**
     * 发送自定义消息
     * */
    public static void sendInfo(String message,@PathParam("userId") String userId) throws IOException {
        log.info("发送消息到:"+userId+"，报文:"+message);
        if(StringUtils.isNotBlank(userId)&&webSocketMap.containsKey(userId)){
            webSocketMap.get(userId).sendMessage(message);
        }else{
            log.error("用户"+userId+",不在线！");
        }
    }

    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        WebSocketServer.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        WebSocketServer.onlineCount--;
    }
}
```

### 消息推送

至于推送新信息，可以再自己的Controller写个方法调用WebSocketServer.sendInfo();即可

```java

import com.softdev.system.demo.config.WebSocketServer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import java.io.IOException;

/**
 * WebSocketController
 * @author zhengkai.blog.csdn.net
 */
@RestController
public class DemoController {

    @GetMapping("index")
    public ResponseEntity<String> index(){
        return ResponseEntity.ok("请求成功");
    }

    @GetMapping("page")
    public ModelAndView page(){
        return new ModelAndView("websocket");
    }

    @RequestMapping("/push/{toUserId}")
    public ResponseEntity<String> pushToWeb(String message, @PathVariable String toUserId) throws IOException {
        WebSocketServer.sendInfo(message,toUserId);
        return ResponseEntity.ok("MSG SEND SUCCESS");
    }
}
```

### @Component和@ServerEndpoint关于是否单例模式，能否使用static Map等一些问题的解答

1. websocket是原型模式，@ServerEndpoint每次建立双向通信的时候都会创建一个实例，区别于spring的单例模式。
2. Spring的@Component默认是单例模式，请注意，默认 而已，是可以被改变的。
3. 这里的@Component仅仅为了支持@Autowired依赖注入使用，如果不加则不能注入任何东西，为了方便。
4. 什么是prototype 原型模式？ 基本就是你需要从A的实例得到一份与A内容相同，但是又互不干扰的实例B的话，就需要使用原型模式。
5. 关于在原型模式下使用static 的webSocketMap，请注意这是ConcurrentHashMap ，也就是线程安全/线程同步的，而且已经是静态变量作为全局调用，这种情况下是ok的，或者大家如果有顾虑或者更好的想法的化，可以进行改进。 例如使用一个中间类来接收和存放session。
6. 为什么每次都@OnOpen都要检查webSocketMap.containsKey(userId) ，首先了为了代码强壮性考虑，假设代码以及机制没有问题，那么肯定这个逻辑是废的对吧。但是实际使用的时候发现偶尔会出现重连失败或者其他原因导致之前的session还存在，这里就做了一个清除旧session，迎接新session的功能。

## 其他

### nginx 开启websocket支持

```
1）编辑nginx.conf，在http区域内一定要添加下面配置：
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
 
map指令的作用：
该作用主要是根据客户端请求中$http_upgrade 的值，来构造改变$connection_upgrade的值，即根据变量$http_upgrade的值创建新的变量$connection_upgrade，
创建的规则就是{}里面的东西。其中的规则没有做匹配，因此使用默认的，即 $connection_upgrade 的值会一直是 upgrade。然后如果 $http_upgrade为空字符串的话，
那值会是 close。
 
 
2）编辑vhosts下虚拟主机的配置文件，在location匹配配置中添加如下内容：
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
 
示例如下：
upstream socket.kevin.com {
    hash $remote_addr consistent;
    server 10.0.12.108:9000;
    server 10.0.12.109:9000;
}
 
 location / {
            proxy_pass http://socket.kevin.com/;
            proxy_set_header Host $host:$server_port;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
```

**Nginx代理webSocket经常中断的解决方法（也就是如何保持长连接）**

现象描述：用nginx反代代理某个业务，发现平均1分钟左右，就会出现webSocket连接中断，然后查看了一下，是nginx出现的问题。
产生原因：nginx等待第一次通讯和第二次通讯的时间差，超过了它设定的最大等待时间，简单来说就是超时！

解决方法1
其实只要配置nginx.conf的对应localhost里面的这几个参数就好
proxy_connect_timeout; 
proxy_read_timeout; 
proxy_send_timeout;

解决方法2
发心跳包，原理就是在有效地再读时间内进行通讯，重新刷新再读时间

配置示例：

```
http {
    server {
        location / {
            root   html;
            index  index.html index.htm;
            proxy_pass http://webscoket;
            proxy_http_version 1.1;
            proxy_connect_timeout 4s;                #配置点1
            proxy_read_timeout 60s;                  #配置点2，如果没效，可以考虑这个时间配置长一点
            proxy_send_timeout 12s;                  #配置点3
            proxy_set_header Upgrade $http_upgrade; 
            proxy_set_header Connection "Upgrade";  
        }
    }
}
```

关于上面配置2的解释
这个是服务器对你等待最大的时间，也就是说当你webSocket使用nginx转发的时候，用上面的配置2来说，如果60秒内没有通讯，依然是会断开的，所以，你可以按照你的需求来设定。比如说，我设置了10分钟，那么如果我10分钟内有通讯，或者10分钟内有做心跳的话，是可以保持连接不中断的，详细看个人需求

**WebSocket与Socket的关系**
\- Socket其实并不是一个协议，而是为了方便使用TCP或UDP而抽象出来的一层，是位于应用层和传输控制层之间的一组接口。当两台主机通信时，必须通过Socket连接，Socket则利用TCP/IP协议建立TCP连接。TCP连接则更依靠于底层的IP协议，IP协议的连接则依赖于链路层等更低层次。
\- WebSocket就像HTTP一样，则是一个典型的应用层协议。 
总的来说：Socket是传输控制层接口，WebSocket是应用层协议。