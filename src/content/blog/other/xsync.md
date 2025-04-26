---
title: xsync脚本使用
description: xsync脚本使用
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
# xsync脚本使用

### 安装rsync脚本

xsync是对rsync脚本的二次封装，所以需要先下载rsync命令。
使用以下命令即可安装

```
yum install -y rsync
```

### 添加xsync脚本

在用户主目录的bin目录下添加脚本

```bash
$cd /usr/local/bin
$touch xsync
$chmod 777 xsync
```

脚本内容如下

```shell
#!/bin/sh

# 获取输入参数个数，如果没有参数，直接退出
pcount=$#
if((pcount!=4)); then
    echo Usage: $0 filename servername startno endno
    exit;
fi


# 获取文件名称
p1=$1
fname=`basename $p1`
echo fname=$fname

# 获取上级目录到绝对路径
pdir=`cd -P $(dirname $p1); pwd`
echo pdir=$pdir
# 获取当前用户名称
user=`whoami`
# 获取hostname及起止号
slave=$2
startline=$3
endline=$4

# 循环
for((host=$startline; host<=$endline; host++)); do
    echo $pdir/$fname $user@$slave$host:$pdir
    echo ==================$slave$host==================
    rsync -rvl $pdir/$fname $user@$slave$host:$pdir
done
```

该脚本经过修改，需要携带4个参数，分别是

- filename 待发送的文件或目录名
- servername 服务器前缀名
- startno 服务器编号起始编号
- endno 服务器编号终止编号

例如我要将当前目录下的a.t文件同步到服务器kafkaos2、kafkaos3上，使用命令

```
xsync a.t kafkaos 2 3
```

