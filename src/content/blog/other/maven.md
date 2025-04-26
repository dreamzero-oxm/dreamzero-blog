---
title: Maven笔记
description: Maven笔记
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Maven
updated: 2022-07-28
comments: false
---
# Maven笔记

## 概念

Maven是一个项目管理工具，它包含了一个项目对象模型 (Project Object Model)、一组标准集合、一个项目生命周期(Project Lifecycle)、一个依赖管理系统(Dependency Management System)和用来运行定义在生命周期阶段(phase)中插件(plugin)目标(goal)的逻辑。

Maven能够很方便的帮你管理项目报告，生成站点，管理JAR文件等等。


## 认识Maven目录结构

若要使用Maven，那么项目的目录结构必须符合Maven的规范，其目录结构如下：

![image-20220329232521393](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232521393.png)

## Maven命令

1. -v:查询Maven版本

   本命令用于检查maven是否安装成功。

   Maven安装完成之后，在命令行输入mvn -v，若出现maven信息，则说明安装成功。

2. compile：编译

   将java源文件编译成class文件

3. test:测试项目				mvn test 

   执行test目录下的测试用例

4. package:打包					mvn package 

   将项目打成jar包

5. clean:删除target文件夹			mvn clean

6. install:安装				mvn install 

   将当前项目放到Maven的本地仓库中。供其他项目使用

7. mvn deploy 
   发布命令 将打包的文件发布到远程参考,提供其他人员进行下载依赖 ,一般是发布到公司的私服，这里我没配置私服，所以就不演示了。

## Maven 参数

```
-D 传入属性参数 
-P 使用pom中指定的配置 
-e 显示maven运行出错的信息 
-o 离线执行命令,即不去远程仓库更新包 
-X 显示maven允许的debug信息 
-U 强制去远程参考更新snapshot包 
```

## 什么是Maven仓库？

Maven仓库用来存放Maven管理的所有Jar包。分为：本地仓库 和 中央仓库。

本地仓库：Maven本地的Jar包仓库。
中央仓库： Maven官方提供的远程仓库。
当项目编译时，Maven首先从本地仓库中寻找项目所需的Jar包，若本地仓库没有，再到Maven的中央仓库下载所需Jar包。

## 什么是“坐标”？

在Maven中，坐标是Jar包的唯一标识，Maven通过坐标在仓库中找到项目所需的Jar包。

如下代码中，groupId和artifactId构成了一个Jar包的坐标。

```xml
<dependency>
   <groupId>cn.missbe.web.search</groupId>
   <artifactId>resource-search</artifactId>
   <packaging>jar</packaging>
   <version>1.0-SNAPSHOT</version>
</dependency>
```

```
groupId:所需Jar包的项目名
artifactId:所需Jar包的模块名
version:所需Jar包的版本号
```

## 传递依赖 与 排除依赖

传递依赖：如果我们的项目引用了一个Jar包，而该Jar包又引用了其他Jar包，那么在默认情况下项目编译时，Maven会把直接引用和简洁引用的Jar包都下载到本地。
排除依赖：如果我们只想下载直接引用的Jar包，那么需要在pom.xml中做如下配置：(将需要排除的Jar包的坐标写在中)

```xml
<exclusions>
   <exclusion>
      <groupId>cn.missbe.web.search</groupId>
      <artifactId>resource-search</artifactId>
      <packaging>pom</packaging>
      <version>1.0-SNAPSHOT</version>
   </exclusion>
</exclusions>
```

## 依赖范围scope

在项目发布过程中，帮助决定哪些构件被包括进来。欲知详情请参考依赖机制。    
- compile ：默认范围，用于编译      
- provided：类似于编译，但支持你期待jdk或者容器提供，类似于classpath      
- runtime: 在执行时需要使用      
- test:    用于test任务时使用      
- system: 需要外在提供相应的元素。通过systemPath来取得      
- systemPath: 仅用于范围为system。提供相应的路径      
- optional:   当项目自身被依赖时，标注依赖是否传递。用于连续依赖时使用
