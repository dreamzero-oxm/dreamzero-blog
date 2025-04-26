---
title: MYSQL三种语句
description: MYSQL三种语句
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
# MYSQL三种语句

## DDL语句

常用的语句关键主要包含create、delete、update和select等

### 查看所有数据库

```
语句：SHOW DATABASES
```



### **选择(要操作的)数据库**

```
语句：USE 要操作的数据库名
```



### **创建数据库**

```
语句：CREATE DATABASE 数据库名;
```

删除数据库

```
语句：DROP DATABASE 数据库表名;
```



### **修改数据库的编码方式**

```
语句：ALTER DATABASE 数据库名 CHARACTER SET 编码方式;
```



###  **查看当前数据库中所有表**

```
语句：SHOW TABLES;
```



### **创建表**

```
语句：CREATE TABLE  表名
(
列名1 列类型1, 
列名2 列类型2,
 ... 、列名3 列类型3 
);
```



### **查看指定表的创建语句**

```
语句：SHOW CREATE TABLE 指定表;
```



### **查看指定表结构**

```
语句：DESC 表名;
```



### **删除指定表**

```
语句：DROP TABLE 表名;
```



### **修改表的前缀**

```
语句：ALTER TABLE 表名;
```



### **修改表之添加列**

```
添加单列:ALTER TABLE 表名 ADD 列名 字段类型
添加多列:ALTER TABLE 表名 ADD 列名1 字段类型1,ADD 列名2 字段类型2...
```



### **修改表之修改列**

```
ALTER TABLE 表名 CHANGE 原列名 新列名 新类型;//这种可以修改类型和列名
ALTER TABLE 表名 MODIFY 原列名 新类型;//这种只能修改类型 不能修改列名
```



### **修改表之删除列**

```SQL
ALTER TABLE 表名 DROP 列名;//当然如果你删除的列名不存在可能会返回个错误码
```



### **修改表名称**

```SQL
ALTER TABLE 表名 RENAME 新表名;
```



### **修改表指定位置添加字段**

```SQL
ALTER TABLE 表名 ADD 列名 列类型 AFTER 存在的列名;//添加新列在存在的列名之下
```



###  **修改表之修改头顺序** 

```SQL
ALTER TABLE 表名  MODIFY 要修改的列名 要修改的列类型 first;
```



## DML语句 

### **插入记录**

```SQL
INSERT INTO 表名 （表中对应的字段名称） VALUES （每个字段对应的值）
```

也可以不用指定字段名称，但values后面的顺序应该和字段的排列顺序一致。

还可以一次插入多条记录。values后面的括号可以多个，用逗号分隔开。

### **更新记录**

```SQL
UPDATE 表名 SET 更新的记录 WHERE 条件;（后面这个其实就是一个匹配的条件）;
```

UPDATE可以同时更新多个表中的数据。
mysql> UPDATE 表1名 a,表2名 b SET a.sal=a.sal * b.deptno,b.deptname=a.ename where a.deptno=b.deptno;
其中a，b是两个表的别名(当然不起别名也是可以的)。上一语句的意思是：当表1的deptno与表2的deptno相同时，
将表1的sal更新成表1的sal * 表2的deptno积，
将表2的deptname更新成表1的ename。

### 删除记录

```SQL
DELETE FROM 表名 WHERE 条件；
```

**删除多个表的记录：** 

```SQL
DELETE a,b FROM 表名 WHERE 条件；
```



### 查询记录

```SQL
SELETE * FROM 表名;（查询表中的所有信息）

SELETE （表中的字段） FROM  表名;（`查询表中对应字段的信息`）
```



#### 查询不重复的记录

用distinct关键字

```SQL
SELECT DISTINCT 字段名 FROM 表名;
```



#### 条件查询

用WHERE关键词

```SQL
例如：SELECT * FROM 表名 WHERE 条件;
```



#### 排序和限制

用order by关键字

```SQL
SELECT FROM 表名 order by 字段名 desc | asc (字段名 desc|asc...);
```

desc 表示按照字段进行降序排列，asc 则表示升序排列，如果不写此关键字默认是升序排列

还可以有多个字段，如果第一个字段的值相同则按第二个排序，以此类推。

如果只希望显示一部分，可以使用limit关键字
mysql> select * from 表名 order by 字段名 limit 1,3;
limit后面应该有两个参数，第一个参数表示起始偏移量，第二个参数表示显示行数。
如果只有一个参数，默认第一个参数为0.



## DQL语句

### 基本的SELECT语句

```SQL
SELECT 字段 FROM 表名....;

SELECT
	字段列表
FROM 
	表名列表
WHERE
	条件列表
GROUP BY
	分组字段
HAVING
	分组后的条件
ORDER BY
	排序（asc/desc）
LIMIT
	分页限定;
```



###  列的别名

**重命名一个列。 便于计算。 紧跟列名，也可以在列名和别名之间加入关键字‘AS’，别名使用双引号，以便在别名中包含空格或特殊的字符并区分大小写。**

```SQL
 #方式一：使用as
SELECT 100%98  结果;
SELECT last_name AS 姓,first_name AS 名 FROM t_mysql_employees;

#方式二：使用空格
SELECT last_name 姓,first_name 名 FROM t_mysql_employees;

#案例：查询salary，显示结果为 out put
SELECT salary AS "out put" FROM t_mysql_employees;
```

![image-20210719155626578](http://moity-bucket.moity-soeoe.xyz/img/image-20210719155626578.png)

![image-20210719155634556](http://moity-bucket.moity-soeoe.xyz/img/image-20210719155634556.png)

### 去除重复数据

```SQL
SELECT DISTINCT 表名 FROM 列名;
#案例：查询员工表中涉及到的所有的部门编号
SELECT DISTINCT department_id FROM t_mysql_employees;
```



### 过滤和排序数据

```SQL
select 
		查询列表
	from
		表名
	where
		筛选条件;
```



#### 一、按条件表达式筛选

简单条件运算符：> < = != <> >= <=

#### 二、按逻辑表达式筛选

逻辑运算符：
作用：用于连接条件表达式
	&& || !
	and or not
	
&&和and：两个条件都为true，结果为true，反之为false
||或or： 只要有一个条件为true，结果为true，反之为false
!或not： 如果连接的条件本身为false，结果为true，反之为false

#### 三、模糊查询

​	like
​	between and
​	in
​	is null

**案例：查询部门编号不是在90到110之间，或者工资高于15000的员工信息**

```sql
SELECT
	*
FROM
	t_mysql_employees
WHERE
	NOT(department_id>=90 AND  department_id<=110) OR salary>15000;
```

**案例：查询员工编号在100到120之间的员工信息**

```sql
SELECT
	*
FROM
	t_mysql_employees
WHERE
	employee_id <= 120 AND employee_id>=100;

SELECT
	*
FROM
	t_mysql_employees
WHERE
	employee_id BETWEEN 100 AND 120;

### in
```

含义：判断某字段的值是否属于in列表中的某一项
特点：
①使用in提高语句简洁度
②in列表的值类型必须一致或兼容
③in列表中不支持通配符

```sql
不使用in查询员工的工种编号是 IT_PROG、AD_VP、AD_PRES中的一个员工名和工种编号

SELECT
	last_name,
	job_id
FROM
	t_mysql_employees
WHERE
	job_id = 'IT_PROT' OR job_id = 'AD_VP' OR JOB_ID ='AD_PRES';

#------------------
使用in查询
SELECT
	last_name,
	job_id
FROM
	t_mysql_employees
WHERE
	job_id IN( 'IT_PROT' ,'AD_VP','AD_PRES');
```



### is null与is not null

```sql
#查询没有奖金的员工名和奖金率
SELECT
	last_name,
	commission_pct
FROM
	t_mysql_employees
WHERE
	commission_pct IS NULL;


#查询有奖金的员工名和奖金率
SELECT
	last_name,
	commission_pct
FROM
	t_mysql_employees
WHERE
	commission_pct IS NOT NULL;

#查询没有奖金的员工名和奖金率
SELECT
	last_name,
	commission_pct
FROM
	t_mysql_employees
WHERE
	commission_pct <=>NULL;


#查询工资为12000的员工信息
SELECT
	last_name,
	salary
FROM
	t_mysql_employees

WHERE 
	salary <=> 12000;

IS NULL:仅仅可以判断NULL值，可读性较高，建议使用
<=>    :既可以判断NULL值，又可以判断普通的数值，可读性较低
```

### 排序查询

```sql
select 查询列表
from 表名
【where 筛选条件】
order by 排序的字段或表达式;
```

特点：
1、asc代表的是升序，可以省略
desc代表的是降序

2、order by子句可以支持 单个字段、别名、表达式、函数、多个字段

3、order by子句在查询语句的最后面，除了limit子句

按单个字段排序
SELECT * FROM t_mysql_employees ORDER BY salary DESC;

```sql
#案例：查询部门编号>=90的员工信息，并按员工编号降序

SELECT *
FROM t_mysql_employees
WHERE department_id>=90
ORDER BY employee_id DESC;


#3、按表达式排序
#案例：查询员工信息 按年薪降序


SELECT *,salary*12*(1+IFNULL(commission_pct,0))
FROM t_mysql_employees
ORDER BY salary*12*(1+IFNULL(commission_pct,0)) DESC;


#4、按别名排序
#案例：查询员工信息 按年薪升序

SELECT *,salary*12*(1+IFNULL(commission_pct,0)) 年薪
FROM t_mysql_employees
ORDER BY 年薪 ASC;


#案例：查询员工信息，要求先按工资降序，再按employee_id升序
SELECT *
FROM t_mysql_employees
ORDER BY salary DESC,employee_id ASC;

#1.查询员工的姓名和部门号和年薪，按年薪降序 按姓名升序

SELECT last_name,department_id,salary*12*(1+IFNULL(commission_pct,0)) 年薪
FROM t_mysql_employees
ORDER BY 年薪 DESC,last_name ASC;

#2.选择工资不在8000到17000的员工的姓名和工资，按工资降序
SELECT last_name,salary
FROM t_mysql_employees

WHERE salary NOT BETWEEN 8000 AND 17000
ORDER BY salary DESC;

#3.查询邮箱中包含e的员工信息，并先按邮箱的字节数降序，再按部门号升序

SELECT *,LENGTH(email)
FROM t_mysql_employees
WHERE email LIKE '%e%'
ORDER BY LENGTH(email) DESC,department_id ASC;
```

### 分组查询

**分组函数作用于一组数据，并对一组数据返回一个值。**
**聚合函数**

功能：用作统计使用，又称为聚合函数或统计函数或组函数
分类：
sum 求和、avg 平均值、max 最大值 、min 最小值 、count 计算个数

特点：
1、sum、avg一般用于处理数值型
max、min、count可以处理任何类型
2、以上分组函数都忽略null值

3、可以和distinct搭配实现去重的运算

4、count函数的单独介绍
一般使用count(*)用作统计行数

5、和分组函数一同查询的字段要求是group by后的字段

```sql
SELECT SUM(salary) FROM t_mysql_employees;
SELECT AVG(salary) FROM t_mysql_employees;
SELECT MIN(salary) FROM t_mysql_employees;
SELECT MAX(salary) FROM t_mysql_employees;
SELECT COUNT(salary) FROM t_mysql_employees;

SELECT SUM(salary) 和,AVG(salary) 平均,MAX(salary) 最高,MIN(salary) 最低,COUNT(salary) 个数
FROM t_mysql_employees;

SELECT SUM(salary) 和,ROUND(AVG(salary),2) 平均,MAX(salary) 最高,MIN(salary) 最低,COUNT(salary) 个数
FROM t_mysql_employees;
```

**语法**

```sql
select 查询列表
from 表
【where 筛选条件】
group by 分组的字段
【order by 排序的字段】;

group by就是相当于分组，将相同的内容放在一起
```

**特点**

1、和分组函数一同查询的字段必须是group by后出现的字段
2、筛选分为两类：分组前筛选和分组后筛选
针对的表			位置									连接的关键字
分组前筛选		原始表								group by前	where
分组后筛选		group by后的结果集    		group by后	having

* where 在分组之前进行限定，如果不满足条件，则不参与分组
* having 在分组之后进行限定，如果不满足结果，则不会参与分组
* where后不可以跟聚合函数，而having可以

```sql
#查询邮箱中包含a字符的 每个部门的最高工资
SELECT MAX(salary),department_id
FROM t_mysql_employees
WHERE email LIKE '%a%'
GROUP BY department_id;

#查询有奖金的每个领导手下员工的平均工资
SELECT AVG(salary),manager_id
FROM t_mysql_employees
WHERE commission_pct IS NOT NULL
GROUP BY manager_id;

#每个工种有奖金的员工的最高工资>12000的工种编号和最高工资

SELECT job_id,MAX(salary)
FROM t_mysql_employees
WHERE commission_pct IS NOT NULL
GROUP BY job_id
HAVING MAX(salary)>12000;

#领导编号>102的每个领导手下的最低工资大于5000的领导编号和最低工资

manager_id>102

SELECT manager_id,MIN(salary)
FROM t_mysql_employees
GROUP BY manager_id
HAVING MIN(salary)>5000;

#查询所有部门的编号，员工数量和工资平均值,并按平均工资降序（Desc）
SELECT department_id,COUNT(*),AVG(salary) a
FROM t_mysql_employees
GROUP BY department_id
ORDER BY a DESC;
```

### 多表查询

含义：
又称多表查询，当查询的字段来自于多个表时，就会用到连接查询

笛卡尔集
数据库表连接数据行匹配时所遵循的算法就是以上提到的笛卡尔积，表与表之间的连接可以看成是在做乘法运算。
笛卡尔乘积现象：表1 有m行，表2有n行，结果=m*n行
发生原因：没有有效的连接条件
如何避免：添加有效的连接条件

笛卡尔集会在下面条件下产生:
– 省略连接条件
– 连接条件无效

– 所有表中的所有行互相连接

• 为了避免笛卡尔集， 可以在 WHERE 加入有 效的连接条件。

区分重复的列名:
• 在不同表中具有相同列名的列可以用表的别名
加以区分。
• 如果使用了表别名，则在select语句中需要使
用表别名代替表名
• 表别名最多支持32个字符长度，但建议越少越
好

连接多个表:
连接 n个表,至少需要 n-1个连接条件。 例如：连接 三个表，至少需要两个连接条件。

#### 等值连接

```sql
#查询每个城市的部门个数

SELECT COUNT(*) 个数,city
FROM t_mysql_departments d,t_mysql_locations l
WHERE d.`location_id`=l.`location_id`
GROUP BY city;


#查询有奖金的每个部门的部门名和部门的领导编号和该部门的最低工资(is not null:不为空 )
SELECT department_name,d.`manager_id`,MIN(salary)
FROM t_mysql_departments d,t_mysql_employees e
WHERE d.`department_id`=e.`department_id`
AND commission_pct IS NOT NULL
GROUP BY department_name,d.`manager_id`;

#三表查询查询员工名、部门名和所在的城市
SELECT last_name,department_name,city
FROM t_mysql_employees e,t_mysql_departments d,t_mysql_locations l
WHERE e.`department_id`=d.`department_id`
AND d.`location_id`=l.`location_id`
AND city LIKE 's%'

ORDER BY department_name DESC;
```

#### 非等值连接

```sql
#查询员工的工资和工资级别

SELECT salary,grade_level
FROM t_mysql_employees e,t_mysql_job_grades g
WHERE salary BETWEEN g.`lowest_sal` AND g.`highest_sal`
AND g.`grade_level`='A';
```

#### JION连接

分类：
**内连接**
 [inner] join on
**外连接**
• 左外连接 
	left [outer] join on
• 右外连接 
	right [outer] join on

ON:子句创建连接
自然连接中是以具有相同名字的列为连接条件的。
可以使用 ON 子句指定额外的连接条件。
这个连接条件是与其它条件分开的。
ON 子句使语句具有更高的易读性。

语法

```
select 
	查询列表
from 
	表1 别名 【连接类型】
join 
	表2 别名
on 
	连接条件
【where 筛选条件】
【group by 分组】
【having 筛选条件】
【order by 排序列表】
```

**内连接**

语法：

```
select 
	查询列表
from 
	表1 别名
inner join 
	表2 别名
on 
	连接条件;
```

**分类：**
等值
非等值
自连接
**特点：**
①添加排序、分组、筛选
②inner可以省略
③ 筛选条件放在where后面，连接条件放在on后面，提高分离性，便于阅读
④inner join连接和sql92语法中的等值连接效果是一样的，都是查询多表的交集

**案例**

```sql
#查询员工名、部门名

SELECT last_name,department_name
FROM t_mysql_departments d
 JOIN  t_mysql_employees e
ON e.`department_id` = d.`department_id`;

#查询名字中包含e的员工名和工种名（添加筛选）
SELECT last_name,job_title
FROM t_mysql_employees e
INNER JOIN t_mysql_jobs j
ON e.`job_id`=  j.`job_id`
WHERE e.`last_name` LIKE '%e%';

#查询部门个数>3的城市名和部门个数，（添加分组+筛选）

#①查询每个城市的部门个数
#②在①结果上筛选满足条件的
SELECT city,COUNT(*) 部门个数
FROM t_mysql_departments d
INNER JOIN t_mysql_locations l
ON d.`location_id`=l.`location_id`
GROUP BY city
HAVING COUNT(*)>3;


非等值链接
#查询员工的工资级别

SELECT salary,grade_level
FROM t_mysql_employees e
 JOIN t_mysql_job_grades g
 ON e.`salary` BETWEEN g.`lowest_sal` AND g.`highest_sal`;
```

**外链接**

**应用场景：**用于查询一个表中有，另一个表没有的记录

**特点：**
1、外连接的查询结果为**主表**中的所有记录
如果从表中有和它匹配的，则显示匹配的值
如果从表中没有和它匹配的，则显示null
**外连接查询结果=内连接结果+主表中有而从表没有的记录**
2、左外连接，left join左边的是主表
右外连接，right join右边的是主表
3、左外和右外交换两个表的顺序，可以实现同样的效果
4、全外连接=内连接的结果+**表1中有但表2没有的+表2中有但表1没有的**

左连接以左表为基表，查询左表所有数据以及关联的右表数据，如果右表没有关联数据以null补齐。
右连接以右表为基表，查询右表所有数据以及关联的左表数据，如果左表没有关联数据以null补齐。

**案例**

```sql
#查询编号>3的女神的男朋友信息，如果有则列出详细，如果没有，用null填充
SELECT b.id,b.name,bo.*
FROM t_mysql_beauty b
LEFT OUTER JOIN t_mysql_boys bo
ON b.`boyfriend_id` = bo.`id`
WHERE b.`id`>3;

#查询部门名为SAL或IT的员工信息

SELECT e.*,d.department_name,d.`department_id`
FROM t_mysql_departments  d
LEFT JOIN t_mysql_employees e
ON d.`department_id` = e.`department_id`
WHERE d.`department_name` IN('SAL','IT');

查询哪个部门没有员工
 #左外
 SELECT d.*,e.employee_id
 FROM t_mysql_departments d
 LEFT OUTER JOIN t_mysql_employees e
 ON d.`department_id` = e.`department_id`
 WHERE e.`employee_id` IS NULL;


 #右外

  SELECT d.*,e.employee_id
 FROM t_mysql_employees e
 RIGHT OUTER JOIN t_mysql_departments d
 ON d.`department_id` = e.`department_id`
 WHERE e.`employee_id` IS NULL;
```

## MYSQL的语句执行顺序

```
from 
join 
on 
where 
group by(开始使用select中的别名，后面的语句中都可以使用)
avg,sum.... 
having 
select 
distinct 
order by
limit 
```

**第一步：**首先对from子句中的前两个表执行一个笛卡尔乘积，此时生成虚拟表 vt1（选择相对小的表做基础表）。 

**第二步：**接下来便是应用on筛选器，on 中的逻辑表达式将应用到 vt1 中的各个行，筛选出满足on逻辑表达式的行，生成虚拟表 vt2 。

**第三步：**如果是outer join 那么这一步就将添加外部行，left outer jion 就把左表在第二步中过滤的添加进来，如果是right outer join 那么就将右表在第二步中过滤掉的行添加进来，这样生成虚拟表 vt3 。

第四步：如果 from 子句中的表数目多余两个表，那么就将vt3和第三个表连接从而计算笛卡尔乘积，生成虚拟表，该过程就是一个重复1-3的步骤，最终得到一个新的虚拟表 vt3。 

**第五步：**应用where筛选器，对上一步生产的虚拟表引用where筛选器，生成虚拟表vt4，在这有个比较重要的细节不得不说一下，对于包含outer join子句的查询，就有一个让人感到困惑的问题，到底在on筛选器还是用where筛选器指定逻辑表达式呢？on和where的最大区别在于，如果在on应用逻辑表达式那么在第三步outer join中还可以把移除的行再次添加回来，而where的移除的最终的。举个简单的例子，有一个学生表（班级,姓名）和一个成绩表(姓名,成绩)，我现在需要返回一个x班级的全体同学的成绩，但是这个班级有几个学生缺考，也就是说在成绩表中没有记录。为了得到我们预期的结果我们就需要在on子句指定学生和成绩表的关系（学生.姓名=成绩.姓名）那么我们是否发现在执行第二步的时候，对于没有参加考试的学生记录就不会出现在vt2中，因为他们被on的逻辑表达式过滤掉了,但是我们用left outer join就可以把左表（学生）中没有参加考试的学生找回来，因为我们想返回的是x班级的所有学生，如果在on中应用学生.班级='x'的话，left outer join会把x班级的所有学生记录找回（感谢网友康钦谋__康钦苗的指正），所以只能在where筛选器中应用学生.班级='x' 因为它的过滤是最终的。 

**第六步：**group by 子句将中的唯一的值组合成为一组，得到虚拟表vt5。如果应用了group by，那么后面的所有步骤都只能得到的vt5的列或者是聚合函数（count、sum、avg等）。原因在于最终的结果集中只为每个组包含一行。这一点请牢记。 

**第七步：**应用cube或者rollup选项，为vt5生成超组，生成vt6. 

**第八步：**应用having筛选器，生成vt7。having筛选器是第一个也是为唯一一个应用到已分组数据的筛选器。 

**第九步：**处理select子句。将vt7中的在select中出现的列筛选出来。生成vt8. 

**第十步：**应用distinct子句，vt8中移除相同的行，生成vt9。事实上如果应用了group by子句那么distinct是多余的，原因同样在于，分组的时候是将列中唯一的值分成一组，同时只为每一组返回一行记录，那么所以的记录都将是不相同的。 

**第十一步：**应用order by子句。按照order_by_condition排序vt9，此时返回的一个游标，而不是虚拟表。sql是基于集合的理论的，集合不会预先对他的行排序，它只是成员的逻辑集合，成员的顺序是无关紧要的。对表进行排序的查询可以返回一个对象，这个对象包含特定的物理顺序的逻辑组织。这个对象就叫游标。正因为返回值是游标，那么使用order by 子句查询不能应用于表表达式。排序是很需要成本的，除非你必须要排序，否则最好不要指定order by，最后，在这一步中是第一个也是唯一一个可以使用select列表中别名的步骤。 

**第十二步：**应用top选项。此时才返回结果给请求者即用户。 

