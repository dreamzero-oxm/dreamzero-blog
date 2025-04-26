---
title: Shell学习笔记
description: Shell学习笔记
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
    - Shell
updated: 2022-07-28
comments: false
---
## 书写习惯和执行脚本习惯
### 书写脚本
脚本开头第一行，写命令解释器

      - #! 
         - /bin/bash
### 执行脚本

   - 方法一    直接运行，需要加上x权限
      - chmod +x [脚本文件]
      - ./[脚本文件]    （相对路径）
      - /路径/[脚本文件]    （绝对路径）
   - 方法二      sh 执行
      - sh 相当于 /bin/bash
      - sh [脚本文件]
   - 方法三    source 或 . （点）
      - 应用场景
         - 一般让环境变量生效：source 或 .（点）    /etc/profile
         - 类似于include功能：把放在其他位置的配置文件包含进主配置文件中。
      - 在脚本中实现类似于 include( nginx)的功能 ，nginx include 多个配置(站点)，可以把每个站点写在单独的文件中，最后在nginx.conf使用 include包含进来 include  *.conf;
      - 含义：把其他脚本在当前脚本中运行(shel环境)
## Shell 中的变量
### 变量？

   - 用一个固定的字符串，代替更多更复杂的内容
   - 存放在脚本中精虫用到的内容    ip=192.168.0.1
   - 变量的本质：内存中的区域 变量名称区域地址
   - 在Linux中$[变量]  相当于取里面的内容
### 变量额度命名规则

   - 不能以数字开头
   - 要看见变量名字，就知道变量的作用
   - 多个单词中间通过_连接
   - 驼峰命名规则oldBaoAge=16
### 变量的分类

   - 环境变量（全局变量）    大部分为系统创建
   - 普通变量（局部变量）    脚本
   - 特殊变量：匹配脚本参数 、服务状态、特殊替换
#### 环境变量（全局变量）   

      - 系统定义
      - 大写字母
      - 在系统中 各个地方使用
      - `env<br />declare<br />export`
      - 常见的环境变量
         - LANG（language）记录系统字符集，语言
         - PS1    命令行格式
         - PATH    命令路径 （执行命令，系统会在PATH路径中查找
         - UID（userid）    记录用户的UID信息 （脚本中判断用户 是否是root）
         - HOSTNAME    主机名
         - HISTSIZE    history命令记录条数（最多）    
         - HISTFILESIZE    history文件记录的最多条数    （文件默认在当前用户家目录 ~./bash_history）
         - HISTFILE    指定历史记录文件的位置    （文件默认在当前用户家目录 ~./bash_history）
         - TMUT    不进行操作 自动断开时间
         - HISTCONTROL    控制history命令是否记录以空格开头的命令
            - export HISTCONTROL=ignorespace 以空格开头的命令 不会被记录到history中
         - PROMPT_COMMAND    这里面存放的命令/脚本会在下一个命令执行前运行
         - 修改环境变量都要加export
            - export [环境变量]=[更改的]
         - 手动创建环境变量    export ?=?
            - 例如export MOITY=123
         - 删除环境变量
            - unset [环境变量]
#### 普通变量（局部变量）

      - 命名规则与命名方式
         - 不能以数字开头
         - 不能占用系统环境变量
         - 驼峰oldBoyAgeSex=1
         - 用_连接词与词
      - $变量    代表取出变量中的值
         - 若要在变量后加字 例如 $weekday 应该写为${week}day
#### 与变量有关的文件

   - 每次登陆系统或者每次切换用户都会读取这些文件的内容
   - /etc/profile
      - 存放环境变量 别名
   - /etc/bashrc
      - 别名
   - ~/.bashrc
      - 当前用户的别名
   - ~/.bash_profile
      - 当前用户的环境变量
   - /etcprofile.d/xxxx.sh
      - 用户登录系统后 执行这个目录下以.sh结尾的脚本
## 特殊变量
### 特殊重要变量-位置

- $0
   - 脚本的名字    脚本执行错误，给出错误提示或使用帮助
- $n（n数字）
   - 脚本的第几个参数    命令行中参数，传递给脚本，在脚本中使用
- $#
   - 脚本参数的个数  一共有多少个参数 #一般总数    脚本开头 判断参数个数是否正确
- $*
   - 取出所有的参数 加上双引号:相当于是一个整体一个参数
- $@
   - 取出所有的参数 加上双引号:就是每个都是独立
#### $0

   - 一般用来 在脚本执行错误的时候 给用户提示
      - echo $0
   - 主要场景
      - 放在脚本中，当脚本出错了，给用户提示 
#### $n n数字

   - 脚本的第几个参数
   - 命令行中的内容通过$n传递到脚本中
      - `#!/bin/bash
      - echo "$1 $2 %2"

sh asd.sh a b c

输出：a b c`

   - 一般使用1-2歌参数满足大部分需求
   - 特殊情况：
      - $n n>10的时候会出现识别错误，需要使用${10} ${11}
   - $0  应用场景：出错的时候，脚本使用帮助
   - $n  应用场景：命令行传参

#### $# 

   - 脚本参数的个数
   -  应用场景：参数个数等于0，则显示错误提示 
      - `#!/bin/bash<br />if [ $# == 0 ];then<br />    echo "Usage:$0"<br />fi`
#### $*

   - 取出所有参数
   - 双引号"$*"  将所有参数变为一个整体，变为一个参数
      - 例如 参数 a b c d
      - "$*" ->"a b c d"

#### $@

   - 取出所有参数
   - 双引号"$*"  将所有参数不变，每个参数还是一个个体
      - 例如 参数 a b c d
      - "$*" ->"a"  "b"  "c"  "d"

#### 帮助
man bash 搜索  Special Parameters 参数/变量

### 特殊变量-状态

- $?
   - 上一条命令/脚本的返回值
   - 0    正常
   - 非0    失败
   - 判断各种东西执行 服务是否成功 配合判断
- $$
   - 当前运行脚本的pid
   - 在脚本中把pid记录到文件 方便后面进行kill
- $!
   - 上一个运行的脚本的pid
- $_
   - 上一个命令或者脚本的最后一个参数    esc +.
   - _（下划线）环境变量
#### $?

   - 上一条命令的返回值
      - 0    上一条命令正常
      - 非0    上一条命令有错误
   - 检查命令 ping
   - 案例
      - `#!/bin/bash`

`ping -c3 www.smartisan.com`

``if [ $? == 0 ]; then`

`echo "成功"`

`fi`

#### $$

   - 当前脚本的pid
      - `#!/bin/bash`
      - ` echo $$`
   - 应用场景
      - 脚本运行的时候生成pid文件 ，方便以后kill

### 变量字串

- 格式${xxxxx}
- 变量字串比使用相应的命令效率更高
- parameter 变量名字（参数）
- man bash 参考 Parameter Expansion

基本

   - ${parameter}
      - 返回变量的内容
   - ${#parameter}
      - 返回变量$parameter的长度

按照范围截取

   - ${parameter:offset}
      - 在$paramete中，从位置offset之后开始提取子串
      - `moity = abcdefg``echo ${moity:1}`<br />`输出：bcdefg`<br />`echo ${moity:3}<br />输出 ：defg`
   - ${parameter:offset:length}
      - 在$paramete中，从位置offset之后开始提取长度为length的子串
      - `moity = abcdefg``echo ${moity:1:3}`

`输出：bcd`

`echo ${moity:3:2}`

`输出 ：de`删除

   - ${变量#内容}    左边开始（开头）
   - ${变量%内容}    右边开始（结尾）
   - ${parameter#word}
      - 从变量$paramete的开头，删除最短匹配word的子串
   - ${parameter##word}
      - 从变量$paramete的开头，删除最长匹配word的子串
   - ${parameter%word}
      - 从变量$paramete的结尾，删除最短匹配word的子串
   - ${parameter%%word}
      - 从变量$paramete的解为，删除最长匹配word的子串
   - moity = i am moity i<br />echo ${moity#i}<br />输出：am moity i<br />echo ${moity##i}<br />输出：am moity i

替换

   - ${parameter/pattern/string}
      - 使用string来代替第一个匹配的pattern
   - ${parameter//pattern/string}
      - 使用string代替所有匹配的pattern
      <a name="vbT9D"></a>
### 变量扩展
给变量设置默认值

   - ${parameter:-word}
      - 如果 parameter没有被赋值或者其值为空，那么就以word作为其值。
   - ${parameter:=word}
      - 如果 parameter没有被赋值或者其值为空，那么就以word作为其值,并且将word赋值给parameter
   - ${parameter:?word}
      - 如果 parameter没有被赋值或者其值为空，那么就把word作为错误输出，否则显示 parameter内容
   - ${parameter:+word}
      - 如果 parameter没有被赋值或者其值为空，就什么都不做，否则用word替换变量内容
      <a name="XZnPe"></a>
### 变量赋值

- 直接赋值
   - moity = 123
- 引用其他命令结果进行赋值：ip=`hostname -l | awk '{print $2}'`
- 交互式变量赋值：read-s不显示输入的信息 -t设置超时时间 -p指定输出/提示
- 脚本传参 shell 表示位置的特殊变量 $1 $2 $3
