---
title: Linux学习笔记
description: Linux学习笔记
date: 2022-09-22
image: https://drawing-bed-moity.oss-cn-shenzhen.aliyuncs.com/blog/wallhaven-9mjoy1_1920x1080.png
cover: https://drawing-bed-moity.oss-cn-shenzhen.aliyuncs.com/blog/wallhaven-9mjoy1_1920x1080.png
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Linux
updated: 2022-09-22
comments: false
keywords: 
   - Linux
---
# 配置常见参数
- 网络
   - 修改网络配置信息
      - vi /etc/sysconfig/network-scripts/ifcfg-ens33
      - 操作文档
         - 光标位置
         - dd删除一行
         - i将文档变成可修改模式
         - esc推出编辑
         - :wq保存并推出
         - `修改 <br />ONBOOT=yes<br />BOOTPROTO=static    //静态网络ip dhcp 动态获取网络ip<br />添加<br />IPADDR=192.168.31.100<br />NETMASK=255.255.255.0<br />GATEWAY=192.168.31.2<br />DNS1=114.114.114.114<br />删除<br />UUID`
   - `重启网卡重新加载配置文件`
      - `ifconfig`
      - `service network restart 或者 systemctl restart network restart`
      - `ping www.baidu.com`
      - `ctrl+c 终止命令的执行`
- 防火墙
   - 保护本机的端口不被人访问
   - 关闭防火墙
      - systemctl stop firewalld（本次服务内关闭防火墙）
      - sysremctl disable firewalld(禁用防火墙服务)
   - 软件安装限制
      - vi /etc/selinux/config
         - 将SELINUX的值改为disabled
- 关机拍摄快照
   - halt（关机）
      - 直接拔掉电源
   - poweroff
      - 直接关闭及其，但是有可能当前虚拟机其他人在使用
   - shutdown -h now   
      - 马上关闭计算机
   - reboot
      - 重启虚拟机
- 修改克隆机配置
   - 网络信息
      - 参考之前的修改网络信息
   - 主机名
      - hostname 查看用户名
         - vi /etc/hostname 在里面修改用户名
- 克隆
   - 复制某一个历史快照节点
   - 克隆的方式
      - 链接克隆
         - 当前节点文件夹只存储差异性数据
         - 相同数据存放在原始节点上
         - 优点：节省硬盘空间    缺点：耦合性大
      - 完整克隆
         - 就是基于原始结点完全拷贝到新节点的文件夹中
         - 有点：耦合性低    缺点：硬盘空间使用大
         - 推荐使用完整克隆
# Linux 命令

- whereis 查询命令文件的位置
- file 查看文件的类型
- who  查看当前在线的用户
- whoami 我是谁
- pwd 我在哪
- uname -a 查看内核信息
- echo 类似于sout syso ，打印语句
- clear 清屏
- history 历史
   - 加-c参数 清空历史
### 特殊字符

   - . 点
      - 如果文件的开始是.，说明当前文件是一个隐藏文件
      - .指向当前目录
      - ..指向当前目录的上级目录
   - ￥
      - 说明这是一个变量
         - $PATH Linux的环境变量
   - * 星号
      - 通配符
   - ~
      - 当前用户的家目录
      - 每个用户的家目录是不同的
      - root用户家目录在系统根目录下
      - 其他用户的家目录在/home/用户名为家目录
   - 空格
      - Linux的命令与参数用空格隔开
   - /
      - 整个Linux的文件根目录
   - 命令的参数
      - 如果是单词一般加 --
      - 如果是字母或者缩写一般加 -
### Xshell连接到远程
ssh + ip

例如：ssh 192.168.6.100

# Linux的文件系统
## 万事万物皆文件

- 文件系统
   - 操作系统如何管理文件，内部定义了一些规则或者定义
- 所以在Linux中所有东西都是以文件存在
- 在Linux中，文件的访问不和Window的一样。Window依靠的是通过盘符进行访问
- Linux维护着一个树状结构的文件模型
   - 只有一个根节点，名字叫做/
   - 一个节点上可以有多个子节点
- 查找文件的方式
   - 相对路径   
      - 以当前路径为基准点，查找其他资源
      - vi ../etc/syscongig/network
   - 绝对路径
      - 以目录为基点，查找其他资源
      - vi /etc/sysconfig/network-scripts/ifcfg-ens33
   - 在日常使用中，只要找到路径即可，但是如果是一些配置文件，尽量写绝对路径
- 可以随意的挂载磁盘
   - mount /dev/disk1 /user/download
   - disk1 1T
   - mount /dev/disk2 /user/download

disk2 100T

    mount /dev/disk3 /user/download

disk3 1P

## Linux文件目录

- /boot        Linux启动时，需要的文件（核心文件），包括一些连接文件以及镜像文件
- /dev          设备文件，该目录下存放的是LInuex的外部设备，在Linux中访问设备的方式和访问文件的方式是相同的
- /etc            配置文件，用来存放所有系统管理所需要的配置文件和子目录
- /home        用户家目录，在Linux中每一个用户都有一个自己的目录，该目录名是以用户的账号命名的
- /media        媒体文件，Linux系统会自动识别一些设备,例如U盘、光驱等等,当识别后,Linux会把识别的设备挂载到这个目录下
- /mnt            挂载文件，系统提供该目录是为了让用户临时挂载别的文件系统的,我们可以将光驱挂载在/mnt/上,然后进入该目录就可以查看光驱里的内容了。
- /opt            第三方软件，这是给主机额外安装软件所摆放的目录。比如你安装一个 ORACLE数据库则就可以放到这个目录下。默认是空的
- /proc            虚拟化文件（进程信息）这个目录是一个虚拟的目录,它是系统内存的映射,我们可以通过直接访问这个目录来获取系统信息。这个目录的内容不在硬盘上而是在内存里,我们也可以直接修改里面的某些文件，比如可以通过下面的命令来屏蔽主机的ping命令,使别人无法ping你的机器:echo 1 > /proc/sys /net/ipv4/icmp_echo_ignore_all
- /root            管理员的家目录
- /run            进程文件，是一个临时文件系统,存储系统启动以来的信息。当系统重启时,这个目录下的文件应该被删掉或清除。如果你的系统上有/var/run目录应该让它指向run
- /srv            压缩过的文件
- /sys            系统文件
- /usr            安装的软件，共享库
-  /var            可变数据，日志文件，这个目录中存放着在不断扩充着的东西,我们习惯将那些经常被修改的目录放在这个目录下。包括各种日志文件
-  /tmp            临时文件（关闭电脑后有可能清清除）
-  /usr/bin        普通用户可以使用的命令
- /usr/sbin        超级用户可以使用的命令
- /usr/lib            32位库文件，这个目录存放着系统最基本的动态连接共享库，其作用类似于windows里的DLL文件。几乎所有的应用程序都需要用到这些共享库。
-  /usr/lib64        64位库文件
- lost+found        这个目录一般情况下是空的,当系统非法关机后,这里就存放了一些文件
## Linux的文件操作

- cd 
   - **改变当前工作目录**
- is ll
   - **显示出指定目录下所有的文件**
   - 文件的类型
      - -普通文件
      - d文件夹
      - l软连接
   - -rw-r--r--,1 root root 3384 Nov 11 23: 51 install.log.syslog
- mkdir （make directory）
   - **创建文件目录**
   -  mkdir-p a/b/c/d/e/f会自动创建文件父目录(一层一层的嵌套下去，a中有b，b中有c....)
   - mkdir-p sxt/{1234} 一次可以创建多个子目录<br />此例子的结果是 sxt1 sxt2 sxt3 四个文件夹并列
- rmdir (remove directory)
   - 这个命令只能删除文件夹
   - **删除空文件夹**
   - 用rmdir的条件是，删除的对象是一个文件夹，且此文件夹为空
- cp （copy）
   - **拷贝文件或者文件目录**
   - cp 源文件 目标目录
      - cp abcd /opt    将abcd目录拷贝到根目录下的opt文件夹中
      - cp /opt/abcd ./     将abcd目录拷贝到当前文件夹
   - 拷贝文件夹
      - cp -r 源文件 目标目录 （-r 表示是一个迭代的操作 如果目标文件夹不是一个空文件夹，则需要用-r）
      - 拷贝文件夹下所有的内容
   - -a : 此参数的效果和同时指定“-dpR"参数相同
   - -d : 当复制符号连接时,把目标文件或目录也建立为符号连接,并指向与源文件或目录连接的原始文件或目录
   - -f : 强行复制文件或目录,不论目标文件或目录是否已存在;
   - -i : 覆盖既有文件之前先询问用户;
   - -l : 对源文件建立硬连接,而非复制文件
   - -p : 保留源文件或目录的属性
   - -R/r : 递迭处理,将指定目录下的所有文件与子目录一并处理;
   - -s : 对源文件建立符号连接,而非复制文件
   - -u : 使用这项参数后只会在源文件的更改时间较目标文件更新时或是名称相互对应的目标文件并不存在时,才复制文件
   - -S : 在备份文件时,用指定的后缀“ SUFFIX”代替文件的默认后缀
   - -b : 覆盖已存在的文件目标前将目标文件备份
   - -v : 详细显示命令执行的操作
- mv （move）
   - **移动文件或者文件夹**
      - mv a1 /opt     将a1移动到根目录下的opt文件夹
      - mv abc /opt    将abc移动到根目录下的opt文件夹
   - **修改文件名称 mv [源文件名称] [新名称]**
      - mv a abcd 将a文件的名字改为abcd
- rm （remove）
   - **删除文件**
      - rm install.log 删除当前文件夹中的install.log文件
      - rm -f install.log （-f代表强制删除）
   - **删除文件夹**
      - rm -r abcd     删除当前文件夹中的abcd
      - rm -rf abcd     强制删除整个文件夹 (-r是迭代 -f是强制 -rf迭代的强制)
- touch
   - **如果没有就创建一个文件**
   - 如果该文件已经存在,修改文件的三个时间,将三个时间改为当前时间
      - 三个时间：
      - Access（最近访问）
      - Modify（最近更改）
      - Change（最近改动） 
         - 文件大小，文件所有者，文件权限
         - 对于文件的描述信息
- stat
   - **查看文件的状态**
   - lnode 当前文件在文件系统的统一标识，类似于ID
   - 三个时间（见上一条）
- ln
   - **创建文件的连接（相当于windows上的快捷方式，快捷方式是软连接 ）**
   - 软（符号）连接
      - ln -s [源文件] [软连接名称] 
      - ln -s moity sl
      - 软连接和原始文件不是同一个文件
         - moity     131085
         - sl    131074
         - sl 指向131074 而131074指向moity moity再指向131085 （实际上就是一条线）
      - rm -rf moity 强制删除moity文件
   - 硬链接
      - ln moity02 hl
      - 硬链接和原始文件使用文件系统中的同一个文件（也就是说 两个都指向的是一个地址）
   - 软硬连接在链接文件的时候，推荐使用文件的绝对路径，否则有可能会出现问题
## 读取文件信息

- cat
   - 将整个文档加载到内存中,并进行一次性显示
   - 除非后面使用管道,传递数据
- tac 
   - 将整个文档加载到内存中,并进行一次性按行逆序显示
- more less
   - 分页查看文档内容
   - 快捷键 
      - 回车    下一行
      - 空格    下一页
      - b    回退
      - q    退出
- head
   - 从文章开始读取N行
   - 默认如果超过10行读取10行否则读取现在行数
   - head -5 profile    意思是 读取profile文件的前五行
- tail
   - 从文章末尾读取N行
   - daeh -3 profile    意思是读取profile的后三行
   - daeh -3 profile | tail -1 profile    意思是读取profile的前三行中的后一行    （ | 相当于一个管道）
      - 利用管道只读取第N行
      - 管道的作用就相当于前面的结果以参数的方式传递给后面的命令
   - 读取新增数据
      - ping www.baidu.com >>baidu
      - tail -F baidu （-F或者-f）
      - 如果f：
         - 他会监听指定inode的文件数据变化，但是当文件被删除后计实重新创建，inode也会发生变化，导致监听失败
      - 如果F
         - 他会监听指定名字的文件，如果文件被删除后，重新创建，那么他会重新监听新文件的数据变化，监听不受影响
- find
   - 查找指定的文件
   - find 要找的范围 -name 名字
   - find /etc -name profile
      - 意思是 在/etc目录下 以名字的方式查找profile文件
# VI和VIM编辑器
## 打开文件

- 正常打开
   - vi
      - vi profile    打开变基profile文件
      - vi [文件名]
- 打开文件，并将光标置于第八行
   - vi +8 profile
   - vi +n [文件名]
- 打开i文件，并将光标置于最后一行
   - vi + profile
   - vi + [文件名]
- 打开指定搜索单词的位置
   - vi +/if profile    定位到文件中if的位置
      - vi +/[查找的单词] [文件名]
      - 按n查找下一个，按N查找上一个
## 三种模式

- 编辑模式
   - 编辑模式中，每一个按键都有其他的功能
- 输入模式
   - 每一个按键按下什么，就在文本中输入什么
- 末行（命令行）模式
   - 我们可以在VI中输入特定的命令
- 编辑模式 到 输入模式
   - i - 在当前位置插入数据
   - a - 追加数据 （在当前位置之后插入数据）
   - o - 在当前行后面开启新的一行
   - I - 行首输入
   - A - 行尾输入
   - O - 在此行的上行开启新的一行
- 输入模式 到 编辑模式
   - 按ESC
- 编辑模式 到 末行模式
   - shift + ：
- 末行模式 到 编辑模式
   - 按下ESC
### 编辑模式

- G最后一行
- gg跳转到第一行
- 数字gg 跳转到第数字行
- w 下一个单词
- 数字w
- dw 删除一个单词
- 3dw 删除三个单词
- 3dd 三处三行
- u 回退到前面的操作
- . 回退u执行的操作
- yw 复制一个单词
- 3yw 复制三个单词
- yy 复制一行
- 3yy 复制三行
- p 粘贴
- 6p 粘贴六次
- x 剪切
- 3x剪切三个字符
- r 替换，然后输入一个字符替换
- 3r 替换三个
- hjkl 方向键
- ZZ保存并退出
- ctrl+s    锁屏    ctrl+q解锁
## 末行模式

- set nu 设置行号
- set nonu 取消行号
- w 保存
- q 退出
- wq 保存并退出
- q！ 强制退出，但是不保存
- 如果上次异常退出会保留同名隐藏文件，每次启动会给予提示
   - 如果确定当前文件没问题，请删除隐藏文件
- /pattern
   - 在命令栏中输入  :/pattern
      - 意思是    查找pattern这个字符串
      - 按n找下一个
      - 按N找上一个
   - 搜索指定多个字符串
   - /usr n 向下查找 N逆向查找
- s/p1/p2/g
   - 替换字符串
   - s/p1/p2/g的意思是    将这一行的p1都换成p2 
      - 如果后面没有加g    则只该第一个
   - g的意思是替换当前按行所有    否则只替换当前行第一个
      - s/abc/sxt/g
   - 查找指定行
      - 3，8s/abc/sxt/g
   - 替换全文
      - g/abc/s//sxt/g
## 安装VIM
命令 yum install  vim -y
# 计算机间的数据传输
### Window--Linux

- lrzsz
   - 需要手动安装
      - yum install lrzsz -y
   - rz
      - 将文件从window上传到Linux
   - sz [文件]
      - 将文件从Linux传输到Window
- xftp
   - 较为通用的文件传输方式
### Linux--Linux

- scp 原数据地址（source） 目标数据地址（target）
- scp 1234.txt root@192.168.6.200:/opt
   - 意思是说 将本机该目录下的1234.txt拷贝到192.168.6.200的主机上用root用户放置在/opt文件夹中
- scp root@192.168.6.200:/opt/dir.txt /opt
   - 意思是是将192.168.6.200主机下用root用户将/opt/dir.txt拷贝到此主机的/opt目录下
- scp -r moity root@192.168.6.200:/opt
   - 如果moity是文件夹 一定要加-a
   - 意思是将当前目录下面moity文件夹拷贝到192.168.6.200主机下的/opt目录中
### 文件大小

- 分区信息
   - df -h
- 查看文件目录大小
   - du -h --max-depth=1 /opt
      - --max-depth=1 相当于说查看的深度是1（也就是看该目录下所有文件夹的大小）
      - 这个的意思是 查看根目录下opt目录中所有文件夹的大小，不查看文件夹嵌套文件夹的大小
      - 后面加目录就是查看那个目录下的所有目录的大小
- swap
   - 一个特殊分区，以硬盘代替
   - 当内存使用满的时候，可以将一部分数据写出到swap分区
### 文件压缩
#### tar

   - 主要针对的文件时xxx.tar.gz
   - 解压缩
      - tar -zx(解压)v(过程)f(文件)xxx.tar.gz
      - tar -zxvf  [文件]
         - 即在此文件夹中解压此文件
   - 压缩
      - tar -zc(压缩)f(文件) tomcat.tar.gz(压缩后的名字) apache-tomcat-7.061(源文件)
      - tar -zcf tomcat.tar.gz -C /opt/
         - -C 指定解压缩的文件目录
         - 如果没加-C 则默认放到目前的目录下
#### zip和unzip

   - 安装
      - yum install zip unzip -y
   - 压缩
      - zip -r tomcat.zip apache-tomcat-7.0.61
   - 解压缩 
   - unzip tomcat.zip
# Linux的网络信息
## 主机名称

- 临时修改
   - hostname school    
      - 临时将名称改为school
   - 长久修改
      - vi /etc/hostname
## DNS解析

- 域名解析服务
- 可以将域名转换为IP地址
- DNS域名劫持
   - window--> C: \Windows\System32\drivers\etc\hosts
   - 123.56.138.186 www.baidu.com
- 修改主机域名
   - vi /etc/hosts
## 网络相关命令

- ifconfig
   - 查看当前网卡的配置信息
   - 这个命令属于 net-tools中的一个命令,但是 Centos7中 minima版并没有集成这个包
   - 所以7的时候需要自己手动安装
      - yum install net-tools -y
   - 如果没有ipconfig，可以用ip addr临时代替
- netstat
   - 查看当前网络的状态信息
   - 一个机器默认有65536个端口号[0,65535]
   - 这是一个逻辑的概念,将来我们需要使用程序监听指定的端口,等待别人的访问
   - 一个端口只能被一个程序所监听,端口已经被占用
   - netstat -anp
   - netstat -r 核心路由表 == route
- ping
   - 查看于目标IP地址是否能够连通
   - ping主要看的是ip能否访问到
- telnet
   - 查看与目标P的指定端口是否能够连通
   - yum install telnet -y
   - telnet 192.168.6.200 22
   - telnet主要看的是端口是否能被访问到
- curl
   - restful 我们所有的资源在网络上中都有唯一的定位
   - 我们可以通过这个唯一定位标识指定的资源
   - curl -X GET www.baidu.com 
# 加密算法
## 不可逆加密算法

- 相当于7+8 = 15  而 15 = ？+ ？
-  可以通过数据计算加密后的结果,但是通过结果无法计算出加密数据
- 应用场景
   -  Hash算法常用在不可还原的密码存储、信息完整性校验。
   - 文档、音视频文件、软件安装包等用新老摘要对比是否一样(接收到的文件是否被修改)
   - 用户名或者密码加密后数据库存储(数据库大多数不会存储关键信息的明文,就像很多登录功能的忘记密码不能拽回,只能重置案例)
- 案例
   - 123456
   - e10adc3949ba59abbe56e057f20f883e
   - md5(md5(123456)) -----md5(654321)
## 对称加密算法

- Symmetric Key Encryption
- 代表新性算法叫做DES、3DES、Blowfish、IDEA、RC4、RC5、RC6和AES
- 特点
   - 两边都持有一个加密的密钥，而且持有的密钥相同
   - 加密和解密使用的是相同的密钥
- 优点
   - 生成密钥的算法公开、计算量小、加密速度块、加密效率高、密钥较短  
- 缺点
   - 双方共同的密钥，如果一方密钥被窃取，双方都受影响
   - 如果为每个客户都生成不同的密钥，则密钥数量巨大，密钥管理有压力
- 应用场景
   - 登录信息用户名和密码加密、传输加密、指令加密
## 非对称加密算法

- Asymmetric Key Encryption
- 加密的密钥和解密的密钥不同
   - 但是着两个密钥成对出现（公钥与私钥）
- 非堆成加密算法需要一对密钥（两个密钥）
   - 公开密钥（publickey）和私有密钥（privatekey）（公钥、密钥）
   - 公开密钥和私有密钥是一对
   - 用公钥加密只能是对应的私钥解密，同理用私钥加密只能用对应的公钥解密
   - 优点
      - 安全性高
   - 缺点
      - 加密解密相对速度慢，密钥长，计算量大，效率低
   - 应用场景
      - HTTPS(ssl)证书里制作、CRS请求证书、金融通信加密、蓝牙等硬件信息加密配对传输、关键的登陆信息验证
## 主机间的相互免密钥

- 可以通过ssh命令免密钥连接到其他的主机
- 如果是第一次建立连接，需要输入yes
   - 在~/.ssh/known_hosts 文件记录了以前访问地址(ip hoostname)的信息
   - 在访问地址的时候如果没有收录到known_hosts 文件中，就需要输入yes
   - 如果以前收录到了known_hosts中，直接输入密码
- 需要输入密码
   - 生成密钥
   - ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
      - rsa是加密算法
      - -P是 密码
      - -f 是说密钥放在什么位置
      - ~/.ssh/id_rsa 意思是 家目录下的.ssh
   - 如果想免密钥登陆谁，只需要把自己的公钥传递给对方主机即可
   - 这个秘钥要放在 ~/.ssh/authorized_keys
      - ssh-copy-id -i ~/.ssh/id_rsa.pub [主机地址]
      - ssh-copy-id -i ~/.ssh/id_rsa.pub root@192.168.6.200
      - 免密钥后ssh root@192.168.6.200尝试免密登录
## 主机名与Host校验

- 错误原因：
- Cannot determine realm for numeric host 无法确定数字主机的域
- 解决方案1 - 本次
   - ssh-v-o GSSAPIAuthentication=no root@192.168.6.200
- 解决方案2 - 所有
   - 修改本机的客户端配置文件ssh_config
   - vi /etc/ssh/ssh_config
   - 找到 GSSAPIAuthentication yes
   - 改为 GSSAPIAuthentication no
   - 在文档最后面添加
   - StrictHostKeyChecking no
   - UserKnownHostsFile /dev/null
# 日期与时间
# 用户-组-权限
## 用户

- 新增用户
   - useradd [用户名]
   - 会创建同名的组和家目录
- 设置密码
   - passwd [密码]
- 删除用户
   - userdel -r [用户名]
   - 级联删除家目录和组
- 修改用户信息
   - usermod -l [用户名] [新用户名]
      - 修改用户名
   - usermod -L [用户名]
      - 锁定用户名
   - usermod -U [用户名]
      - 解锁用户名
- 常用文件
   - cat /etc/shadow
      - 用户名和密码
   - cat /etc/passwd
      - 用户名，编号，组编号，家目录，命令码，目录
- 切换用户
   - su [用户名]
## 组

- 创建组
   - groupadd [组名称]
- 删除组
   - groupdel [组名称]
- 修改组名字
   - groupmod -n [组名称] [新组名称]
- 查看用户对应的组
   - groups 
      - 查看自己对应的组
   - groups [用户名]
      - 查看其他用户对应的组
- 修改用户的组
   - usermod -g [主组] [用户] 
   - usermod -G [附属组] [用户] 
- 查看系统中的组
   - cat /etc/group
## 权限

- 查看文件的权限
   - 三组权限，每组三个字母
      - r：读取权限
      - w：写入权限
      - x：执行权限
      - - ：没有权限
   - root ： 所属用户（属组）
   - root：所属的组（属组）
- 权限的UGO模型
   - 三组权限
   - 属主的权限、属组的权限、其他权限
      - 将来修改文件的权限可以从rwx和ugo两个方面进行修改
- 修改文件的权限
   - 修改文件所属
      - chown [用户] [文件]
      - chown [用户] :[属组]  [文件]
      - 修改文件夹时，让子目录迭代修改
         - chown -R [用户] :[属组] [文件]
      - chgrp [属组] [文件]
         - 当用户的组被修改后，需要重新登陆才能获取新组的权限
   - 修改文件的rwx
      - 改动UGO上的rwx
      - chmod o+w [文件]
         - 意思是将该文件的O（其他）权限加上“w”（写）
      -  chmod ug+x [文件]
         - 意思是件发给该文件的U（属主）G（属组）的权限加上“x”（执行）
      - chmod o-w [文件]
         - 意思是将该文件的O（其他）权限去掉“w”（写）
      - 权限RWX分别对应数字 4 2 1 
         - 例如 5 = 4+1 也就相当于说时 r-x
            - chmod 664 [文件] 相当于是修改为rw-rw-r--
## 权限赋予

- 我们可以将管理用的权限分配给普通用户
- 文件位置在 vim /etc/sudoers
- 但是修改这个文件需要使用命令 
   - visudo
   - 修改Line 99
   - [用户名]    ALL=(root)    /sbin/chkconfig
   - [用户名]    ALL=(root)    /sbin/useradd
   - [用户名]    ALL=(root)    /sbin/*
      - 此目录下所有命令都可以使用
   - [用户名]    ALL=(root)    [命令]
- 如何使用
   - su [用户名]  切换用户
   - sudo + 需要的命令
# 管道与重定向
## 管道

- 将前面命令的结果作为参数传递给后面的命令
- grep
   - 强大的文本搜索工具
   - cat profile | grep if
   - is / | grep^t
## 重定向

- 改变数据输出的位置，方向
- 1 正确输出 2 错误输出        （1标准输出 2错误输出）
   - 例如 ll /abcd 2> moity 
      - 如果有错误信息才会输入到moity中
   - 例如 ll /abcd 1> moity 或者 ll /abcd > moity 
      - 如果有正确的信息（正常信息）才会输入到moity中
- > 替换（覆盖）    >> 追加
- 如果正确和错误的输出都要输入到文件中 则在后面加上 2>&1
# Linux的系统进程
## 进程信息

-   ps -ef
   - UID PID PPID C STIME TTY    TIME CMD
   - UID所属用户
   - PID当前进程编号
   - PPID当前进程编号的父进程编号
- ps -ef | grep redis
- ps -aux
   - 所有信息
- ps -aux -- sort -pcpu
- top
   - 当前服务器内存使用率
## 后台进程

- 只需要在命令的后面添加一个&符号
   - ping www.baidu.com >> baidu&
- jobs -l
   - 可以查看当前的后台进程
   - 但是只有当前的用户界面可以获取到
- nohup可以防止后台进程被挂起
   - nohup ping www.baidu.com >> baidu 2>&1 &
## 杀死进程

- kill -9 [进程编号]
# Linux的软件安装
## 环境变量
￥PATH的配置文件在/etc/profile

Linux的路径与路径之间用 ：（冒号）连接

Linux每次修改完成后，需要重新加载文件

- source /etc/profile
## 软件的安装方式

- 解压就可以使用
- 使用安装包安装
   - 自己下载安装包
## RPM安装

- 通过RPM命令安装软件
   - rpm -ivh [安装包]
- 可以查询软件
   - rpm -qa | grep jdk
   - rpm -q jdk
- 卸载
   - rpm -e [软件名]
- 需要手动配置java的环境变量
   - vim /etc/profile
   -  在profile文件最后加入
      - `export JAVA_HOME=`[JDK路径](/usr/java/jdk1.8.0_291-amd64)
      - export PATH=$JAVA_HOME/bin:$PATH
- 重新加载配置文件
   - source /etc/profile
## YUM安装
### yum作用

- 可以帮我们管理RPM包
- 可以帮我们安装软件
- 如果软件有其他依赖,会帮我们安装依赖后在安装软件
- 类似于 Maven
### yum命令

- ·search查询命令或者软件
- info
   - 查看包的信息
- list/ list jdk
   - 查询安装的rpm包,或者只查询某一周
### 更换yum源

- 首先安装wget
   - yum install wget -y
- 将系统原始配置文件失效
   - mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
- 使用Wget获取阿里yum源配置文件
   - wget -O /etc/yum.repos.d/CentOS-Base.repo [http://mirrors.aliyun.com/repo/Centos-7.repo](http://mirrors.aliyun.com/repo/Centos-7.repo)
- 清空以前yum源的缓存
   -  yum clean all
- 获取阿里云的缓存
   - yum makecache
## 安装Mysql数据库

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
#  Linux三剑客
## 普通

- cut
   - 用指定的规则来切分文本
   - cut -d':' -f1,2,3  [文本]
      - 以 ：为分割 查找第1、2、3列
- sort
   - sort [文本]
      - 对文本中的行进行排序
   - sort -t' ' -k2 [文本]
      - 对每一行的数据进行切分，按照第二列进行排序
      - 以空格作为分割，以第二列进行排序
   - sort -t' ' -k2 -r [文本]
      - 逆序
   - sort -t' ' -k2 -n [文本]
      - 按照数值的大小进行排序，如果有字幕，字母在前
- wc(word count)
   - 统计单词的数量
   - wc [文件]
      - 显示：[数字] [数字] [数字] [文件]
      - -l line 多少行
      - -w word 多少个单词
      - -c char 多少个字符
## grep

- 可以对文本进行搜索
- 同时搜索多个文件
   - grep [查找的东西] [文件] [文件] [文件]
- 显示匹配的
   - grep -n [查找的东西] [文件]
- 显示不匹配的 
   - grep -nv [查找的东西] [文件]
- 忽略大小写
   - grep -i [查找的东西] [文件]
- 使用正则表达式
   - grep -E "[1-9]+" [文件]

## sed

- sed软件从文件或管道中读取一行，处理一行，输出一行...
- 行的选择模式
   - 10 第十行
   - m,n    第m行到第n行
   - m,+n    从第m行到第m+n行
   - m~n    从m行开始依次累加n    每隔n行
   - m,$    从m行开始到最后一行
   - /school/    匹配到school的行
   - /u1/,/u4/    从匹配u1到u4

# 14.Linux中必备常用支持库的安装
在CentOS安装软件的时候，可能缺少一部分支持库，而报错。这里首先安装系统常用的支持库。那么在安装的时候就会减少很多的错误的出现。
```bash
yum install -y gcc gdb strace gcc-c++ autoconf libjpeg libjpeg-devel libpng libpng-devel freetype freetype-devel libxml2 libxml2-devel zlib zlib-devel glibc glibc-devel glib2 glib2-devel bzip2 bzip2-devel ncurses ncurses-devel curl curl-devel e2fsprogs patch e2fsprogs-devel krb5-devel libidn libidn-devel openldap-devel nss_ldap openldap-clients openldap-servers libevent-devel libevent uuid-devel uuid mysql-devel    
```
