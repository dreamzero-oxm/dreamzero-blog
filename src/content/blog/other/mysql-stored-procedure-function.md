---
title: MYSQL存储过程和函数
description: MYSQL存储过程和函数
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - MYSQL
updated: 2022-07-28
comments: false
---
# MYSQL的存储过程和函数

##  1.存储过程和函数概述

​	存储过程和函数是**事先经过编译**并存**储在数据库**中的**一段SQL语句的集合**,调用存储过程和函数可以简化应用开发人员的很多工作,减数据在数据库和应用服务器之间的传输,对于提高数据处理的效率是有好处的。

存储过程和函数的区別在于函数必须有返回值,而存储过程没有。

**函数:**是一个有返回值的过程;
**过程:**是一个没有返回值的函数

![image-20210719194942549](http://moity-bucket.moity-soeoe.xyz/img/image-20210719194942549.png)

​	在普通模式下获取数据，用户需要输入SQL命令与数据库进行交互，而存储过程是编写好的SQL命令，存储在数据库中，用户操作的时候只需要调用存储过程，而不用重新输入冗余繁杂的SQL命令。因此
存储过程有什么优点？

1. 存储过程可以重复使用，大大减小开发人员的负担；
2. 对于网络上的服务器，可以大大减小网络流量，因为只需要传递存储过程的名称即可；
3. 可以防止对表的直接访问，只需要赋予用户存储过程的访问权限。

## 2. 创建存储过程

```sql
CREATE PROCEDURE procedure_name(proc_parameter[,...])
begin
	--SQL语句
end$;
$为结束分隔符
```

**示例**

```sql
delimiter $

create procedure pro_test1()
begin
	select * from demo1;
end$

delimiter;
```

## 3. 调用存储过程

```sql
call procedure_name()$
```

## 4. 查看存储过程

```sql
--查询db_name 数据库中所有的存储过程
select name from mysql.proc where db='db_name';

--查询存储过程的状态信息
show procedure status;

--查询某个存储过程的定义
show create procedure test.por_test1 \G;
```

## 5. 语法

存储过程是可以编程的,意味看可以使用变量,表达式,控制结构,来完成比较复杂的功能。

### 5.1 变量

* **DECLARE**

* 通过DECLARE可以定义**一个局部变量**，该变量只能**作用在BEGIN...END中**

* ```sql
  DECLEAR var_name[] type [default value]
  ```

  示例：

  ```sql
  delimiter $	(声明结束符为$)
  
  create produre pro_test2()
  begin
  	declare num int deault 5;
  	select num+ 10;
  end$
  
  delimiter;
  ```

  

* **SET**

直接赋值使用SET，可以赋常量或者表达式，具体语法：

```
SET var_name = expr   或者 [var_name = expr]
```

**示例：**

```SQL
delimiter $	(声明结束符为$)

CREATE PROCEDURE por_test3()
BEGIN
	DECLARE NAME VARCHAR(20);
	SET NAME = 'MYSQL';
	SELECT NAME;
END$

delimiter
```

**也可以通过select...into方式进行赋值操作**

```SQL
delimiter $	(声明结束符为$)

CREATE PROCEDURE pro_test4()
BEGIN
	DECLARE countnum int;
	select count(*) into countnum from city;
	select countnum;
	select concat('city表中的记录数为:',num);
END$

delimiter
```

### 5.2 if 条件判断

**语法结构：**

```SQL
delimiter $	(声明结束符为$)

if search_condition[条件] then statement_list[sql语句]
	[elseif search_condition[条件] then statement_list[SQL语句] ]...
	[else statement_list]
	
end if;

delimiter
```

**需求：**

```
根据定义的身高变量，判断当前身高的所属身材类型

180及以上	身材高挑
170 - 180	标准身材
170以下	一般身材
```

**解：**

```SQL
CREATE PROCEDURE pro_test5()
BEGIN
	DECLARE height int default 175;
	DECLARE description varchar(50) default '';
	if height >= 180 then
		set description='身材高挑';
	elseif hegiht >= 170 and height <180 then
		set description='标准身材';
	else
		set description='一般身材';
	end if;
	select concat('身高',height,'对应的身材类型为',description);
END$ 
```

### 5.3 传递参数

**语法格式**

```SQL
CREATE PROCEDURE procedure_name([in/out/inout] 参数名 参数类型) 
...

IN: 该参数可以作为输入，也就是需要调用方传入值，默认
OUT:该参数作为输出，也就是该参数可以作为返回值
INOUT: 既可以作为输入参数，也可以作为输出参数
```

#### 5.3.1 **IN-输入**

**需求**

```
根据定义的身高变量，判断当前身高的所属的身材类型
```

**示例：**

```SQL
CREATE PROCEDURE pro_test5(in hegiht int)
BEGIN
	DECLARE description varchar(50) default '';
	if height >= 180 then
		set description='身材高挑';
	elseif hegiht >= 170 and height <180 then
		set description='标准身材';
	else
		set description='一般身材';
	end if;
	select concat('身高',height,'对应的身材类型为',description);
END$

call protest5(198)$
```

#### 5.3.2 OUT-输出

需求：

```
根据传入的身高变量，获取当前身高的所属的身材类型
```

示例：

```SQL
CREATE PROCEDURE pro_test6(in hegiht int，out description varchar(50))
BEGIN
	if height >= 180 then
		set description='身材高挑';
	elseif hegiht >= 170 and height <180 then
		set description='标准身材';
	else
		set description='一般身材';
	end if;
END$

call protest5(198)$
```

调用：

```SQL
call pro_test6(188,@description)$
SELECT @despcription$
```

@description:这种变量要在变量名称前面加上“@”符号，叫做用户会话变量，代表整个绘画过程他都是有作用的，这个类似于全局变量一样。
@@global.sort_buffer_size：这种在变量前加上“@@”符号，叫做系统变量

### 5.3 CASE 结构

语法结构：

```SQL
方式一：
CASE case_value[条件值]
	WHEN wehn_value THEN statement_list				如果case_value == wehn_value 则执行此条statement_list
	[WHEN wehn_value THEN statement_list]...
	[ELSE statment_list]
END CASE;

方式二：
CASE
	WHEN search_condition[条件表达式] THEN statement_list		如果search_condition这个条件表达式为真，则statement_list实行这个
	[WHEN search_value THEN statement_list]...
	[ELSE statment_list]
END CASE;
```

需求：

```
给定一个月份，然后计算出所在的季度
```

 示例：

```SQL
CREATE PROCEDURE pro_test7(month int)
BEGIN
	declare result varchar(10);
	case
		when month >=1 and month <=3 then
		set resylt = '第一季度';
		when month >=4 and month <=6 then
		set resylt = '第二季度';
		when month >=7 and month <=9 then
		set resylt = '第三季度';
		else
		set resylt = '第四季度';
		select concat('传递的月份为',mon,'计算出的结果为',result);
	end case
END$
```

### 5.4 while循环

语法结构：

```SQL
while search_condition[循环条件] do
	statement_list
end while;
```

需求：

```
计算从1加到n的值
```

示例：

```SQL
delimiter $

create procedure pro_test8(n int)
begin
	declare total int default 0;
	declare start int default 0;
	
	while start <=n do
		set total = total + start;
		set start = start + 1;
	end while;
	select total;
END$

delimiter;
```

### 5.5 repeat结构

有条件的循环控制语句,当满足条件的时候退出循环。while是满足条件才执行, repeat是满足条件就退出循环

语法结构：

```SQL
REPEAT
	statement_list
	UNTIL search conditionEND 
END REPEAT
```

需求：

```
计算从1加到n的值
```

示例：

```SQL
create procedure pro_test9(n int )
begin
	declare total int default 0;
	repeat
		set total = total + n;
		set n = n -1;
		until n = 0
	end repeat;
	select total;
end$
```

### 5.6 loop语句

LOOP实现简单的循环,退出循环的条件需要使用其他的语句定义,通常可以使用 LEAVE语句实现,具体语法如下

```SQL
[begin_label:] LOOP
	statement_list
END LOOP [end_label]
```

如果不在 statement _list中增加退出循环的语句,那么LOOP语句可以用来实现简单的死循环。

### 5.7 leave 语句

用来从标注的流程构造中退出,通常和BEGIN…END或者循环一起使用。下面是一个使用LOOP和 LEAVE的简单例子,退出循环

```SQL
delimiter $

create procedure pro_test9(n int)
begin
	declare total int default 0;
	
	c:loop									(c是这个loop语句的别名)
        set total = total + n;
        set n = n-1;
        if n < 0 then 
        	leave c;
        end if;
	end loop c;								(结束名为c的loop循环)
	select total;
END$
```

### 5.8 游标/光标

游标是用来存储查询结果集的数据类型,在存储过程和函数中可以使用光标对结果集进行循环的处理。光标的使用包括光标的声明、OPEN、FETCH和 CLOSE,其语法分别如下

声明光标：

```SQL
DECLARE cursor_name[游标名字] CURSOR FOR select_statement[select语句];
```

OPEN光标（打开游标）

```SQL
OPEN cursor_name; 
```

FETCH 光标：（相当于一个指针，指向一行，每调用一次就指向下一行）

```SQL
FETCH cursor_name INTO var_name [,var_name] ...
```

CLOSE光标：（退出游标）

```SQL
CLOSE cursor_name;
```

当FETCH读不到数据的时候，有一个触发机制

```SQL
DECLARE EXIT HANDLER FOR NOT FOUND SET name[变量名] = ? ;
当FETCH读不到数据的时候，就会触发一个事件，设置一个变量....
这一句话必须声明在游标的之后
```

## 6. 存储函数

语法结构：

```SQL
create function function_name([param type ....])
returns type
begin
	...
end;
```

案例：

```
制作一个存储过程，请求满足条件(city)的总记录数
```

示例：

```SQL
create function fun1(countryId int)
returns int 
begin 
	declare countryNumber int ;
	
	select count(*) into countryNumber from city where country_id = countryId;
	
	return countryNumber;
end$
```

