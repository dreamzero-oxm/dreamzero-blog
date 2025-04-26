---
title: Netty问题
description: Netty问题
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Netty
updated: 2022-07-28
comments: false
---
# 关于netty配置的理解serverBootstrap.option和serverBootstrap.childOption

1.  option / handler / attr 方法

     option： 设置通道的选项参数， 对于服务端而言就是ServerSocketChannel， 客户端而言就是SocketChannel；

　 handler： 设置主通道的处理器， 对于服务端而言就是ServerSocketChannel，也就是用来处理Acceptor的操作；

　　　　　　对于客户端的SocketChannel，主要是用来处理 业务操作；

    attr： 设置通道的属性；

　option / handler / attr方法都定义在AbstractBootstrap中， 所以服务端和客户端的引导类方法调用都是调用的父类的对应方法。

2、childHandler / childOption / childAttr 方法（只有服务端ServerBootstrap才有child类型的方法）

　  对于服务端而言，有两种通道需要处理， 一种是ServerSocketChannel：用于处理用户连接的accept操作， 另一种是SocketChannel，表示对应客户端连接。而对于客户端，一般都只有一种channel，也就是SocketChannel。

　  因此以child开头的方法，都定义在ServerBootstrap中，表示处理或配置服务端接收到的对应客户端连接的SocketChannel通道。

 

3、服务端由两种线程池，用于Acceptor的React主线程和用于I/O操作的React从线程池； 客户端只有用于连接及IO操作的React的主线程池；

4、ServerBootstrap中定义了服务端React的"从线程池"对应的相关配置，都是以child开头的属性。 而用于"主线程池"channel的属性都定义在AbstractBootstrap中；

 

channelOption含义

ChannelOption.SO_BACKLOG
ChannelOption.SO_BACKLOG对应的是tcp/ip协议listen函数中的backlog参数，函数listen(int socketfd,int backlog)用来初始化服务端可连接队列，服务端处理客户端连接请求是顺序处理的，所以同一时间只能处理一个客户端连接，多个客户端来的时候，服务端将不能处理的客户端连接请求放在队列中等待处理，backlog参数指定了队列的大小

ChannelOption.SO_REUSEADDR
ChanneOption.SO_REUSEADDR对应于套接字选项中的SO_REUSEADDR，这个参数表示允许重复使用本地地址和端口，比如，某个服务器进程占用了TCP的80端口进行监听，此时再次监听该端口就会返回错误，使用该参数就可以解决问题，该参数允许共用该端口，这个在服务器程序中比较常使用，比如某个进程非正常退出，该程序占用的端口可能要被占用一段时间才能允许其他进程使用，而且程序死掉以后，内核一需要一定的时间才能够释放此端口，不设置SO_REUSEADDR就无法正常使用该端口。

ChannelOption.SO_KEEPALIVE
Channeloption.SO_KEEPALIVE参数对应于套接字选项中的SO_KEEPALIVE，该参数用于设置TCP连接，当设置该选项以后，连接会测试链接的状态，这个选项用于可能长时间没有数据交流的连接。当设置该选项以后，如果在两小时内没有数据的通信时，TCP会自动发送一个活动探测数据报文。

ChannelOption.SO_SNDBUF和ChannelOption.SO_RCVBUF
ChannelOption.SO_SNDBUF参数对应于套接字选项中的SO_SNDBUF，ChannelOption.SO_RCVBUF参数对应于套接字选项中的SO_RCVBUF这两个参数用于操作接收缓冲区和发送缓冲区的大小，接收缓冲区用于保存网络协议站内收到的数据，直到应用程序读取成功，发送缓冲区用于保存发送数据，直到发送成功。

ChannelOption.SO_LINGER
ChannelOption.SO_LINGER参数对应于套接字选项中的SO_LINGER,Linux内核默认的处理方式是当用户调用close()方法的时候，函数返回，在可能的情况下，尽量发送数据，不一定保证会发生剩余的数据，造成了数据的不确定性，使用SO_LINGER可以阻塞close()的调用时间，直到数据完全发送

ChannelOption.TCP_NODELAY
ChannelOption.TCP_NODELAY参数对应于套接字选项中的TCP_NODELAY,该参数的使用与Nagle算法有关。Nagle算法是将小的数据包组装为更大的帧然后进行发送，而不是输入一次发送一次,因此在数据包不足的时候会等待其他数据的到了，组装成大的数据包进行发送，虽然该方式有效提高网络的有效负载，但是却造成了延时，而该参数的作用就是禁止使用Nagle算法，使用于小数据即时传输，于TCP_NODELAY相对应的是TCP_CORK，该选项是需要等到发送的数据量最大的时候，一次性发送数据，适用于文件传输。

ChannelOption.ALLOCATOR
在4.x版本中，UnpooledByteBufAllocator是默认的allocator，尽管其存在某些限制。现在PooledByteBufAllocator已经广泛使用一段时间，并且我们有了增强的缓冲区泄漏追踪机制， 所以是时候让PooledByteBufAllocator成为默认了。
总结：Netty4使用对象池，重用缓冲区

ChannelOption.SO_KEEPALIVE
当设置该选项以后，如果在两小时内没有数据的通信时，TCP会自动发送一个活动探测数据报文。