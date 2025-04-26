---
title: PageHelper
description: PageHelper
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
updated: 2022-07-28
comments: false
---
# PageHelper

# 依赖：

```xml
<dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper</artifactId>
            <version>5.2.0</version>
        </dependency>
        <dependency>
            <groupId>com.github.jsqlparser</groupId>
            <artifactId>jsqlparser</artifactId>
            <version>4.0</version>
        </dependency>
```

## 使用：

```java
PageHelper.startPage(page,pageSize);
Mapper查询;
PageInfo pageinfo = new PageInfo<>(Mapper查询的结果);
```

