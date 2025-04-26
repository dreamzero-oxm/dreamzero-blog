---
title: MYSQL基础
description: MYSQL基础
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
## 1.Mysql基础
SQL的分类：

- DDL—数据定义语言（Data Define Language）：create（创建），alter（修改），drop（删除），TRUNCATE（截断），RENAME（重命名）；
- DML—数据操纵语言（Data Manipulation Language）：select（查询），delete（删除），update（更新），insert（新增）；
- DCL—数据控制语言（Data Control Language）：grant（添加权限），revoke（回收权限）
<a name="Ld59o"></a>
### **1.1 DDL操作：**
使用DDL语言时，**必须在动词后跟上数据库对象名词**（例如：TABLE、VIEW、INDEX、SCHEMA、TRIGGER等）

- 创建数据库
   - create database test1 ;
- 查看数据库
   - show databases;
- 选择数据库
   - use databases
- 删除数据库
   - reop database test1
- 创建表
   - CREATE  [TEMPORARY]  TABLE  [IF NOT EXISTS] [database_name.] <table_name><br />(<br />    <column_name>  <data_type>  [[not] null],…<br />)
   - _TEMPORARY：指明创建临时表<br />　　IF NOT EXISTS：如果要创建的表已经存在，强制不显示错误消息<br />　　database_name：数据库名<br />　　table_name：表名<br />　　column_name：列名<br />　　data_type：数据类型_
- _查看定义_
   - desc [表名];
- 查看创建的表：
   - show create table emp ;
- 更新表名：
   -  alter table [表名] rename [新表名];
- 删除表：
   - drop table emp;
- 修改表字段：
   - alter table emp modify ename varchar(30);
- 增加表字段：
   - alter table emp add column age int(3);
- 删除表字段：
   - alter table emp drop column age;
- change和modify:
   - 前者可以修改列名称,后者不能.  
   - change需要些两次列名称
   <a name="U24bN"></a>
### **1.2 DML语句:**

- 插入记录:

`//指定字段,`<br />`//自增,默认值等字段可以不用列出来,没有默认值的为自动设置为NULL`<br />`insert into emp (ename,hiredate,sal,deptno) values ('jack','2000-01-01','2000',1);`<br />`//可以不指定字段,但要一一对应 `<br />`insert into emp values ('lisa','2010-01-01','8000',2);`

- 更新记录

`update emp set sal="7000.00" where ename="jack"; `<br />`update emp e,dept d set e.sal="10000",d.deptname=e.ename where e.deptno=d.deptno and e.ename="lisa";`

- 删除记录

`delete from emp where ename='jack';`

- 查看所有字段

`select * from emp[表名];`

- 条件查询
   - 比较运算符：> < >= <= <> != ...
   - 逻辑运算符：and or ...
   - `select * from emp where asl="1800" and depth=2`
- 聚合:
   - 函数:
   - count():记录数
   - sum(总和)
   -  max():最大值
   - min():最小值
   <a name="O3sUw"></a>
### **1.3 表连接：**

- left join :左连接，返回左表中所有的记录以及右表中连接字段相等的记录；
- right join :右连接，返回右表中所有的记录以及左表中连接字段相等的记录；
- inner join: 内连接，又叫等值连接，只返回两个表中连接字段相等的行；
- full join:外连接，返回两个表中的行：left join + right join；
- cross join:结果是笛卡尔积，就是第一个表的行数乘以第二个表的行数。
<a name="D4A7L"></a>
### 1.4 子查询
`//=, !=`<br />`select * from emp where deptno = (select deptno from dept where deptname="技术部");`<br />`select * from emp where deptno != (select deptno from dept where deptname="技术部");`<br />`//in, not in  `<br />`//当需要使用里面的结果集的时候必须用in();  `<br />`select * from emp where deptno in (select deptno from dept where deptname="技术部");`<br />`select * from emp where deptno not in (select deptno from dept where deptname="技术部");`<br />`//exists , not exists`<br />`//当需要判断后面的查询结果是否存在时使用exists();`<br />`select * from emp where exists (select deptno from dept where deptno > 5);`<br />`select * from emp where not exists (select deptno from dept where deptno > 5);`
<a name="fZGa1"></a>
### 1.5 记录联合
`union:返回去重之后的结果`<br />`select ename from emp union select ename from emp;`<br />`union all:返回所有结果`<br />`select ename from emp union all select ename from emp;`
<a name="UpJHq"></a>
## 2.设计范式：
数据库的实体属性和关系。实体：表； 属性：表中的数据（字段）； 关系：表与表之间的关系；
<a name="nVSHa"></a>
### 2.1 第一范式
当关系模式R的所有属性都不能在分解为更基本的数据单位时，称R是满足第一范式的，简记为1NF。满足第一范式是关系模式规范化的最低要求，否则，将有很多基本操作在这样的关系模式中实现不了。<br />（要求数据达到原子性，使数据不可再分；）

   - 每一列属性都是不可再分的属性值，确保每一列的原子性
   - 两列的属性相近或相似或一样，尽量合并属性一样的列，确保不产生冗余数据。
<a name="OShHS"></a>
### 2.2 第二范式
如果关系模式R满足第一范式，并且R得所有非主属性都完全依赖于R的每一个候选关键属性，称R满足第二范式，简记为2NF。<br />（ 使每一行数据具有唯一性，并消除数据之间的“部分依赖”，使一个表中的非主键字段，完全依赖于主键字段）
<a name="AYUtN"></a>
### 2.3 第三范式
设R是一个满足第一范式条件的关系模式，X是R的任意属性集，如果X非传递依赖于R的任意一个候选关键字，称R满足第三范式，简记为3NF.<br />（使每个字段都独立地依赖于主键字段（独立性），而要消除其中部分非主键字段的内部依赖——这种内部依赖会构成“传递依赖”）

-  数据不能存在传递关系，即没个属性都跟主键有直接关系而不是间接关系。像：a-->b-->c  属性之间含有这样的关系，是不符合第三范式的。
- 比如Student表（学号，姓名，年龄，性别，所在院校，院校地址，院校电话）<br />这样一个表结构，就存在上述关系。 学号--> 所在院校 --> (院校地址，院校电话)<br />这样的表结构，我们应该拆开来，如下。<br />（学号，姓名，年龄，性别，所在院校）--（所在院校，院校地址，院校电话）
<a name="kHG1r"></a>
### 2.4 BC范式(Boyce.Codd)
定义：<br />在第三范式的基础之上，数据库表中如果不存在任何字段对任一候选关键字段的传递函数依赖则符合BC范式。<br />也就是说如果是复合关键字，则复合关键字之间也不能存在函数依赖关系。<br />供应商	商品ID	供应商联系人	商品数量<br />饮料一厂	1	        张三	        10<br />饮料一厂	2	        李四	        20<br />饮料二厂	1	        王五	        20<br />假定供应商联系人只能受雇于一家供应商，每家供应商可以供应多个商品，<br />则存在如下决定关系：<br />（供应商，商品ID）->（联系人，商品数量）<br />（联系人，商品ID->（供应商，商品数量）<br />存在下列关系因此不符合BCNF要求：<br />
<br />（供应商）->（供应商联系人）<br />（供应商联系人）->（供应商）<br />并且存在数据操作异常及数据冗余<br />修改：<br />
<br />供应商	    商品ID	商品数量<br />饮料一厂	    1	        10<br />饮料一厂	    2	        20<br />饮料二厂	    1	        20<br />供应商	    供应商联系人<br />饮料一厂	    张三<br />饮料一厂	    李四<br />饮料二厂	    王五
<a name="WWf9o"></a>
## 3.索引
<a name="xnXPH"></a>
### 3.1 什么是索引

- 官方定义:一种帮助 mysql提高查询效率的数据结构索引数据结构
- 索引存储在文件系统中
- 索引二栋文件存储形式与存储引擎有关
- 索引文件的结构
   - hash
   - 二叉树
   - B树
   - B+树
- 索引的优点
   - 大大加快数据查询速度索引的
- 缺点
   - 维护索引需要耗费数据库资源
   - 索引需要占用磁盘空间当对表的数据进行增删改的时候,因为要维护索引,速度会受到影响
   <a name="867K9"></a>
### 3.2 索引类型
Mysql目前主要有以下几种索引类型：FULLTEXT，HASH，BTREE，RTREE。<br />**1. FULLTEXT**<br />即为全文索引，目前只有MyISAM引擎支持。其可以在CREATE TABLE ，ALTER TABLE ，CREATE INDEX 使用，不过目前只有 CHAR、VARCHAR ，TEXT 列上可以创建全文索引。全文索引并不是和MyISAM一起诞生的，它的出现是为了解决WHERE name LIKE “%word%"这类针对文本的模糊查询效率较低的问题。<br />**2. HASH**<br />由于HASH的唯一（几乎100%的唯一）及类似键值对的形式，很适合作为索引。HASH索引可以一次定位，不需要像树形索引那样逐层查找,因此具有极高的效率。但是，这种高效是有条件的，即只在“=”和“in”条件下高效，对于范围查询、排序及组合索引仍然效率不高。<br />**3. BTREE**<br />BTREE索引就是一种将索引值按一定的算法，存入一个树形的数据结构中（二叉树），每次查询都是从树的入口root开始，依次遍历node，获取leaf。这是MySQL里默认和最常用的索引类型。<br />**4. RTREE**<br />RTREE在MySQL很少使用，仅支持geometry数据类型，支持该类型的存储引擎只有MyISAM、BDb、InnoDb、NDb、Archive几种。相对于BTREE，RTREE的优势在于范围查找　
<a name="m2aTN"></a>
### 3.3 Mysql中的SHOW INDEX
SHOW  INDEX 会返回以下字段

- Table 表的名称。
-  Non_unique 如果索引不能包括重复词,则为0,如果可以则为1。
-  Key_name 索引的名称
-  Seq_in_index 索引中的列序列号，从1开始
-  Column_name 列名称。
- Collation 列以什么方式存储在索引中。在MySQL中，有值‘A’（升序）或NULL（无分类）。Cardinality 
- 索引中唯一值的数目的估计值。通过运行ANALYZE TABLE或myisamchk -a可以更新。基数根据被存储为整数的统计数据来计数，所以即使对于小型表，该值也没有必要是精确的。基数越大，当进行联合时，MySQL使用该索引的机会就越大。
- Sub_part 如果列只是被部分地编入索引，则为被编入索引的字符的数目。如果整列被编入索引，则为NULL。
- Packed 指示关键字如何被压缩。如果没有被压缩，则为NULL。
- Null 如果列含有NULL，则含有YES。如果没有，则该列含有NO。
- Index_type 用过的索引方法（BTREE, FULLTEXT, HASH, RTREE）。
- Comment 多种评注，您可以使用db_name.tbl_name作为tbl_name FROM db_name语法的另一种形式。这两个语句是等价的；
   - mysql>SHOW INDEX FROM mytable FROM mydb;
   - mysql>SHOW INDEX FROM mydb.mytable;
   <a name="92f096e7"></a>
### 3.4 索引分类

   - 普通索引（单值索引）：
      - 仅加速查询<br />
   - 主键索引
      - 设定为主键后数据库会自动建立索引，db为聚族索引
   - 唯一索引（unique）
      - 素引列的值必须唯一,但允许有空值（和主键相比，主键不允许有空值）
      - 唯一索引索引列值可以存在null，但是只能存在一个null
   - 复合索引(组和索引)
      - 即一个索引包合多个列
      - 基于多个列所创建的索引
      - （基于多个列的查询）
   - 全文索引
      - 对文本的内容进行分词，进行搜索<br />
      <a name="LPCSM"></a>
### 3.5 索引的基本操作
<a name="fQa9G"></a>
#### 3.5.1主键索引

- 主键索引是在建表时自动创建
- 建表    主键自动创建主键索引
   - **（创建表时设置主键自动创建）**create table t_user (id varchar (20) primary key, name var char(20))
      - 在创建主键的同时，会自动创建主键索引
   - **（通过修改表结构创建索引）**ALTER TABLE `表名` ADD PRIMARY KEY ( `列名称` )
      - mysql>ALTER TABLE `table_name` ADD PRIMARY KEY ( `column` )
- 查看索引
   - show index from [table]
   <a name="HMgKT"></a>
#### 3.5.2 单列索引（普通索引|单值索引）

- 建表时创建
   - create table t_user (id varchar(20) primary key, name varchar(20),key(name[列名]));
   - 注意:随表一起建立的索引,索引名和列名一致（随表一起建立的索引不能指定索引名，默认为列名）
- 建表后创建
   - create index nameindex[索引名] on t_user(name)[列名]
   - **（通过修改表结构创建索引）**ALTER TABLE `表名` ADD INDEX index_name ( `列名称` )
      - mysql>ALTER TABLE `table_name` ADD INDEX index_name ( `column` )
- 删除索引
   - drop index 索引名 on表名
   <a name="lJ8KM"></a>
#### 3.5.3 唯一索引

- 建表时创建
   - create table t_user (id varchar(20) primary key, name varchar(20), unique(name[列名]))
- 建表后创建
   - 语法：create unique index nameindex[索引的名字] on[table](列名)
   - （通过修改表结构创建索引）语法：ALTER TABLE `表名` ADD UNIQUE ( `列名称`)
      - mysql>ALTER TABLE `table_name` ADD UNIQUE ( `column`)
      <a name="ZDUyf"></a>
#### 3.5.4 复合索引

- 建表时创建
   - create table t_user (id var char(20) primary key, mpme varchar(20), age int, key(name[列名1], age[列名2]))
- 建表后创建
   - create index nameageindex[索引名] on t_user(name[列名1], age[列名2],[列名n]...)
   - **（通过修改表结构创建索引）**语法：ALTER TABLE `表名` ADD INDEX index_name ( `列名称1`, `列名称2`, `列名称3` )
      - mysql>ALTER TABLE `table_name` ADD INDEX index_name ( `column1`, `column2`, `column3` )
- 最左前缀原则(mysql引擎在查询中为了更好的利用索引，在查询过程中回动态调整查询字段顺序以便利用索引)
   - index：name age bir
   - name bir age 不可用索引
   - name age bir 可以使用索引
   - age bir 不可用索引
   - bir age name 可用索引
   -  age bir 不可用索引
- 对于复合索引的一些限制
   - 如果不是按照索引最左列开始查找，则无法使用索引（最左前缀原则）
   - 不能跳过索引中的列
      - 例如：key(id,name,birthaday)
      - 无法用于查找id为1并且在某个特定日期出生的人
      - 如果不指定name，则MYSQL只能使用索引的第一列
   - 如果查询中有某个列的范围查询，则其右边所有列都无法使用索引优化查找
   <a name="ws0kc"></a>
#### 3.5.5 全文索引(FULLTEXT)

- **（通过修改表结构创建索引）**语法：ALTER TABLE `表名` ADD FULLTEXT ( `列名称`)
   - mysql>ALTER TABLE `table_name` ADD FULLTEXT ( `column`)
   <a name="Wsu3L"></a>
#### 3.5.6 创建索引
**<直接创建索引>**<br />-- 创建普通索引<br />CREATE INDEX index_name ON table_name(col_name);<br />-- 创建唯一索引<br />CREATE UNIQUE INDEX index_name ON table_name(col_name);<br />-- 创建组合索引（复合索引）<br />CREATE INDEX index_name ON table_name(col_name_1,col_name_2);<br />-- 创建唯一组合索引<br />CREATE UNIQUE INDEX index_name ON table_name(col_name_1,col_name_2);

**<通过修改表结构创建索引><br />**ALTER TABLE table_name ADD INDEX index_name(col_name);
<a name="YDEnM"></a>
#### 3.5.7 删除索引
-- 直接删除索引<br />DROP INDEX index_name ON table_name;<br />-- 修改表结构删除索引<br />ALTER TABLE table_name DROP INDEX index_name;
<a name="QLHHW"></a>
#### 3.5.8 **查看索引**
#查看:<br />show index from `表名`;<br />#或<br />show keys from `表名`;
<a name="QAuY4"></a>
### 3.6 索引机制
<a name="P8XVJ"></a>
#### 3.6.1 为什么添加完索引后查询速度变快
传统的查询方法，是按照表的顺序遍历的，不论查询几条数据，mysql需要将表的数据从头到尾遍历一遍<br />在我们添加完索引之后，mysql一般通过`BTREE算法`生成一个`索引文件`，在查询数据库时，找到索引文件进行`遍历(折半查找大幅查询效率)`，找到相应的键从而获取数据
<a name="pJ66P"></a>
#### 3.6.2 索引的代价

1. 创建索引会产生索引文件，占用磁盘空间
1. 索引文件是一个二叉树类型的文件，可想而知我们的dml操作同样也会对索引文件进行修改，所以性能会下降
<a name="RwuLd"></a>
#### 3.6.3 在哪些column上使用索引

1. 较频繁的作为查询条件字段应该创建索引
1. 唯一性太差的字段不适合创建索引，尽管频繁作为查询条件
   1. 例如：gender性别字段，唯一性太差
3. 更新非常频繁的字段不适合作为索引
3. 不会出现在where子句中的字段不该创建索引
<a name="afou4"></a>
#### 3.6.4 总结：**满足以下条件的字段，才应该创建索引**

1. 肯定在where条`经常使用`
1. 该字段的内容`不是唯一的几个值`
1. 字段内容`不是频繁变化`。
<a name="R4lnq"></a>
### 3.7 B树
B树的索引形式

- 键值，即表中记录的主键
- 指针，存储子节点地址信息
- 数据，即表记录中除主键外的数据

特点：

1. 所有键值分布在整树中
1. 搜索有可能在非叶子结点结束,在关键字全集内做一次查找，性能逼近二分查找
1. 每个节最多拥有m个子树
1. 根节至少有2个子树
1. 分支节点至少拥有m/2颖子树(除根节点和叶子节点外都是分支节点)
1. 所有叶子节点都在同一层、每个节点最多可以有m-1个key,并且以升序排列

![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626655177347-2d9f95ae-97da-4eb7-a4d3-d8074a837fd5.png#align=left&display=inline&height=461&margin=%5Bobject%20Object%5D&name=image.png&originHeight=461&originWidth=1155&size=522523&status=done&style=none&width=1155)<br />3.8 B+树<br />B+Tree是在 Btree的基础之上做的一种优化,变化如下

1. B+Tree每个节点可以包含更多的节点,这个做的原因有两个,第一个原因是为了降低树的高度,第二个原因是将数据范围变为多个区间,区间越多,数据检素越快
1. 非叶子节点存储key,叶子节点存储key和数据
1. 叶子节点两两指针相互连接(符台磁盘的预读特性),顺序查询性能更高

**![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626655277377-16e29d0c-5c8b-459a-ae9f-2a295812dbb6.png#align=left&display=inline&height=510&margin=%5Bobject%20Object%5D&name=image.png&originHeight=510&originWidth=1380&size=523894&status=done&style=none&width=1380)**<br />**![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626655596186-bb111ec7-339b-413d-a877-9b1965a23bdb.png#align=left&display=inline&height=483&margin=%5Bobject%20Object%5D&name=image.png&originHeight=483&originWidth=1163&size=447934&status=done&style=none&width=1163)**<br />**![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626655900284-d68bb646-7a26-40dc-8f1d-357281d7f629.png#align=left&display=inline&height=435&margin=%5Bobject%20Object%5D&name=image.png&originHeight=435&originWidth=1149&size=341011&status=done&style=none&width=1149)**<br />**
<a name="fc108"></a>
## 4. 创建高性能的索引
在 MYSQL中,存储引用类似的方法使用素引,其先在素引中找到对应值,然后根据匹配的素引记录找到对应的数据行。
<a name="4MqcZ"></a>
### 4.1 索引的优点
索引可以让服务器快速地定位到表的指定位置。但是这井不是索引的唯一作用,到目前为止可以看到,根据创建索引的数据结构不同,索引也有一些其他的附加作用。

- 索引大大减少了服务器需要扫描的数据量
- 索引可以帮助服务器避免排序和临时表
- 索引可以将随机I/O变为顺序I/O。
<a name="nMW64"></a>
### 4.2 索引的类型
<a name="H0i1Y"></a>
#### 4.2.1 B-Tree索引
B+Tee,即每一个叶子节点都色含指向下一个叶子节点的指针,从而方便叶子节点的范围遍历。<br />B. Tree通常意味着所有的值都是按顺序存储的,并且每一个叶子页到根的距离相同。

- `B-Tree索引能够加快访问数据的速度,因为存储引擎不再需要进行全表扫描来获取需要的数据,取而代之的是从索引的根节点(图示并未画出)开始进行搜索。根节点的槽中存放了指向子节点的指针,存储引擎根据这些指针向下层查找。通过比较节点页的值和要査找的值可以找到合适的指针进入下层子节点,这些指针实际上定义了子节点页中值的上限和下限。最终存储引擎要么是找到对应的值,要么该记录不存在。`
<a name="uIFij"></a>
#### 4.2.2 哈希索引
哈希索引（hash index）基于哈希表实现，只有精确匹配索引所有列的查询才有效。对于每一行数据，存储引擎都会对所有的索引列计算一个哈希码（hash code），哈希码是一个较小的值，并且不同键值的行计算出来的哈希码也不一样。哈希索引将所有的哈希码存储在索引中，同时在哈希表中保存指向每个数据行的指针。<br />
<br />对于hash相同的，采用链表的方式解决冲突。类似于hashmap。因为索引的结构是十分紧凑的，所以hash索引的查询很快。<br />**实现：**

- MSQL先计算索引列的哈希值，按照哈希值来排序
- 哈希索引的数据结构：槽(放置哈希值)[Slot]    值(放置指向对应行的指针)[Value]
- 在查询数据时，先计算该数据的哈希值，并使用该值查找对应的记录指针。

**限制：**

- 哈希索引只包含哈希值和行指针,而不存储字段值,所以不能使用索引中的值来避免读取行。不过,访问内存中的行的速度很快,所以大部分情况下这一点对性能的影响并不明显。
- 哈希索引数据井不是按照索引值顺序存储的,所以也就无法用于排序。
- 哈希索引也不支持部分索引列匹配查找,因为哈希索引始终是使用索引列的全部内容来计算哈希值的。例如,在数据列(A,B)上建立哈希索引,如果查询只有数据列A,则无法使用该索引。
- 哈希索引只支持等值比较查询,包括=、IN()、<=>(注意<>和<>是不同的操作)。也不支持任何范围查询,例如 WHERE price>100。
- 访问哈希索引的数据非常快,除非有很多哈希冲突(不同的索引列值却有相同的哈希值)。当出现哈希冲突的时候,存储引擎必须遍历链表中所有的行指针,逐行进行比较,直到找到所有符合条件的行。
- 如果哈希冲突很多的话,一些索引维护操作的代价也会很高。例如,如果在某个选择性很低(哈希冲突很多)的列上建立哈希索引,那么当从表中删除一行时,存储引擎需要遍历对应哈希值的链表中的每一行,找到并删除对应行的引用,冲突越多代价越大。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626572873807-34042fc4-0b13-448f-8190-129819cdfea2.png#align=left&display=inline&height=174&margin=%5Bobject%20Object%5D&name=image.png&originHeight=174&originWidth=414&size=25849&status=done&style=none&width=414)<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626572889595-7eb816b8-bc94-44b3-a9ab-dbe79578361a.png#align=left&display=inline&height=752&margin=%5Bobject%20Object%5D&name=image.png&originHeight=752&originWidth=784&size=176122&status=done&style=none&width=784)
<a name="YUG9G"></a>
### 4.3 高性能的索引策略
正确的创建你和使用索引是实现高性能查询的基础
<a name="68rNZ"></a>
#### 4.3.1独立的列
我们通常会看到一些查询不当地使用索引,或者使得 MYSQL无法使用已有的索引。如果查询中的列不是独立的,则 MYSQL就不会使用索引。“独立的列”是指索引列不能是表达式的一部分,也不能是函数的参数

- `SELECT actor_id FROM sakila WHERE author_id +1 = 5`

凭肉眼很容易看出表达式其实等价于 actor id=4,但是 MYSQL无法自动解析这个方程式。这完全是用户行为。我们应该养成简化 WHERE条件的习惯,始终将索引列单独放在比较符号的一侧

- `SELECT actor_id FROM sakila WHERE author_id = 4`
<a name="dQPAe"></a>
## 5.聚簇索引
<a name="XAcW7"></a>
### 5.1 概念
聚簇索引：将数据存储与索引放到了一块，索引结构的叶子结点保存了行数据（数据文件和索引文件存放在一起）<br />非聚簇索引：将数据与索引分开存储，索引结构的叶子节点指向了数据对应的位置（存放数据对应的地址）<br />注薏:在 innodb中,在聚簇索引之上创建的索引称之为辅助索引,非聚簇索引都是辅助索引,像复合索引、前缀引、唯索引。辅助索引叶子节点存储的不再是行的物理位置,而是主键值,辅助索引访问数据总是需要二次查找<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626531154982-c5ac3360-ce77-404b-bff1-234d992df630.png#align=left&display=inline&height=334&margin=%5Bobject%20Object%5D&name=image.png&originHeight=391&originWidth=280&size=72111&status=done&style=none&width=239)<br />聚簇索引是一种数据存储方式<br />聚簇索引是物理索引，数据表就是按顺序存储的，物理上是连续的。

   - 它的数据行实际上存放在索引的“叶子页”中。
   - “聚簇”表示数据行和相邻的紧凑的存储在一起。
   - 一个表中只能有一个聚簇索引
   - 所有的记录行都根据聚簇索引顺序存储，如按照主键Id递增方式依次物理顺序存储

Innodb中

   - Innode使用的是聚簇索引,将主键组织到一棵B+树中,而行数据就储存在叶子节点上,若使用 where id=14"这样的条件查找主键,则按照B+树的检索算法即可查找到对应的叶节点,之后获得行数据
   - 若对Name列进行条件搜索,则需要两个步骤:第一步在辅助索引B+树中检索Name,到达其叶子节点获取对应的主键第二步使用主键在主索引B+树种再执行一次B+树检索操作,最终到达叶子节点即可获取整行数据。(重点在于通过其他键需要建立辅助索引)
   - **聚簇索引默认是主键**,如果表中没有定义主键, Innodb会选择一个唯一且非空的索引代替。如果没有这样的索引,InnoDB会隐式定叉一个主键(类似oracle中的Rowld)来作为聚簇索引。如果已经设置了主键为聚簇索引又希望再单独设置聚簇索引,必须先删除主键,然后添加我们想要的聚簇索引,最后恢复设置主键即可

MYISAM

   - MYISAM便用的是非聚簇索引,非聚簇索引的两棵B+树看上去没什么不同,节点的结构完全一致只是存储的内容不同而已,主键索引B+树的节点存储了主键，辅助键索引B+树存储了辅助键。表数据存储在独立的地方,这两颗B+树的叶子节点都使用一个地址指向真正的表数据,对于表数据来说,这两个键没有任何由于*索引树是独立的,通过辅助键检家无需访问主键的家引树
<a name="gwoLV"></a>
### 5.2 MySQL中InnoDB表的聚簇索引
每个InnoDB表都需要一个聚簇索引。该聚簇索引可以帮助表优化增删改查操作。

- 如果你为表定义了一个主键，MySQL将使用主键作为聚簇索引。
- 如果你不为表指定一个主键，MySQL将第一个组成列都not null的唯一索引作为聚簇索引。
- 如果InnoBD表没有主键且没有适合的唯一索引（没有构成该唯一索引的所有列都NOT NULL），MySQL将自动创建一个隐藏的名字为“`GEN_CLUST_INDEX` ”的聚簇索引。
- 因此每个InnoDB表都有且仅有一个聚簇索引。

 聚集的数据有一些优点：

- 可以把相关数据保存在一起。
   - 例如实现电子邮箱时,可以根据用户ID来聚集数据,这样只需要从磁盘读取少数的数据页就能获取某个用户的全部邮件。如果没有使用聚簇索引,则每封邮件都可能导致一次磁盘IO。
- 数据访问更快。聚簇索引将索引和数据保存在同一个B-Tre中,因此从聚簇索引中获取数据通常比在非聚簇索引中查找要快。
- 使用覆盖索引扫描的査询可以直接使用页节点中的主键值。
<a name="FKI4k"></a>
### 5.3 使用聚簇索引的优势
问题:毎次使用辅助索引检索都要经过两次B+树查找,看上去聚簇索引的效率明昰要低于非聚簇索引,这不是多此一举吗?聚簇索引的优势在哪?

- 由于行数据和聚簇索引的叶子节点存储在一起,同一页中会有多条行数据,访问同一数据页不同行记录吋,已经把页加载到了Buffer中(緩存器),再次访问时,会在內存中完成访问,不必访问磁盘。这样主键和行数据是一起被载入內存的,找到叶子节点就可以立刻将行数据返回了,如果按照主键id来组织数据,获得数据更快
- 辅助索引的叶子节点,存储主键值,而不是数据的存放地址。好处是当行数据放生变化时,索引树的节点也需要分裂变化;或者是我们需要査找的数据,在上一次IO读写的缓存中没有,需要发生一次新的IO操作时,可以避免对辅助索引的维护工作,只需要维护聚籝索引树就好了。另一个好处昰,因为辅助索引存放的是主键值,减少了辅助索引占用的存储空间大小。
<a name="fqArT"></a>
### 5.4 聚簇索引需要注意什么?

- 当使用主键为聚簇索引时,主键最好不要使用uuid,因为uuid的值太过离散,不适合排序且可能出线新增加记录的uuid,会插入在索引树中间的位置,导致索引树啁整复杂度变大,消耗更多的时间和资源
- 建议使用int类型的自增,方便排序并且默认会在索引树的末尾增加主键值,对索引树的结构影响最小。而且,主键值占用的存储空间越大,辅助索引中保存的主键值也会跟看变占用存储空间,也会影响到IO操作读取到的数据量
<a name="LWArg"></a>
### 5.5 为什么主键通常建议使用自增id

- 聚簇索引的数据的物理存放顺序与索引顺序是一致的,即:只要索引昰相邻的,那么对应的数据一定也是相邻地存放在磁盘上的。如果主键不是自增id,那么可以想象,它会干些什么,不断地调整数据的物理地址、分页,当然也有其他一些措施来减少这些操作,但却无法彻底避免。但,如果是自增的,那就简单了,它只需要一页一页地写,索引结构相对紧凑,磁盘碎片少,效率也高
<a name="byPOC"></a>
### 5.6 什么情况下无法利用索引

- 查询语句中使用LIKE关键字
   - 查询语句中使用LIKE关键字进行查询时,如果匹配字符串的第一个字符为“%”,索引不会被使用。如果“%不是在第一个位置,索引就会被使用
- 查询语句中使用多列索引
   - 多列索引是在表的多个字段上创建一个索引,只有查询条件中使用了这些字段中的第一个字段,素引才会被使用（最左前缀原则）
- 查询语句中使用OR关键字
   - 查询语句只有OR关键字时,如果OR前后的两个条件的列是索引,那么查询中将使用索引。如果0R前后有一个条件的列不是索引,那么查询中将不使用索引。
   <a name="jOus3"></a>
### 5.7 辅助索引
辅助索引（Secondary Index，也称非聚簇索引），叶子节点并不包含行记录的全部数据。叶子节点除了包含键值以外，每个叶子节点中的索引行中还包含了指向主键的指针。<br />
<br />辅助索引的存在并不影响数据在聚簇索引中的组织，因此每张表上可以有多个辅助索引。当通过辅助索引来寻找数据时，InnoDB存储引擎会遍历辅助索引并通过叶级别的指针获得指向主键索引的主键，然后再通过聚簇索引来找到一个完整的行记录
<a name="BuogW"></a>
### 5.8 联合索引
联合索引是指对表上的多个列进行索引<br />
<br />从本质上来说，联合索引也是一棵B+树，不同的是联合索引的键值的数量不是1，而是大于等于2<br />
<br />联合索引有如下特点：<br />
<br />最左前缀原则<br />
<br />创建了(a,b,c)联合索引,如下几种情况都可以走索引：<br />
<br />select * from table where a = xxx;<br />select * from table where a = xxx and b = xxx;<br />select * from table where a = xxx and b = xxx and c = xxx<br />如下几种情况不走索引<br />
<br />select * from table where b = xxx;<br />select * from table where c = xxx;<br />select * from table where b = xxx and c = xxx;<br />本质上讲(a,b,c)联合索引等同于(a)单列索引、(a,b)联合索引、(a,b,c)联合索引三种索引的组合，符合最左前缀原则
<a name="CCose"></a>
### 5.9 覆盖索引
InnoDB存储引擎支持覆盖索引（covering index，或称索引覆盖），即从辅助索引中就可以得到查询的记录，而不需要查询聚集索引中的记录。使用覆盖索引的一个好处是辅助索引不包含整行记录的所有信息，故其大小要远小于聚集索引，因此可以减少大量的IO操作<br />
<br />非聚集索引上直接可以拿到所需数据，不需要再回表查，比如 select id from table where name = xxx;(id为主键、name为索引列)<br />在统计操作中也会使用覆盖索引。比如(a,b)联合索引，select * from table where b = xxx语句按最左前缀原则是不会走索引的，但如果是统计语句select count(*) from table where b = xxx;就会使用覆盖索引。
<a name="4oW3c"></a>
### 5.10 选择性
并不是在所有的查询条件中出现的列都需要添加索引。对于什么时候添加B+树索引，一般的经验是，在访问表中很少一部分时使用B+树索引才有意义。对于性别字段、地区字段、类型字段，它们可取值的范围很小，称为低选择性<br />
<br />按性别进行查询时，可取值的范围一般只有’M’、‘F’。因此上述SQL语句得到的结果可能是该表50%的数据（假设男女比例1∶1），这时添加B+树索引是完全没有必要的。相反，如果某个字段的取值范围很广，几乎没有重复，即属于高选择性，则此时使用B+树索引是最适合的<br />
<br />所以，我们在添加索引的时候，要尽量选择高选择性的字段，反之你在低选择性的字段上加了字段，查询可能也不会走索引
<a name="9fGFD"></a>
## 6. 复制
<a name="YIXWV"></a>
### 6.1 复制如何工作
MYSQL上的复制有三个步骤

1. 在主库上把数据更改记录到二进制日志( Binary Log)中(这些记录被称为二进制日志事件)。
1. 备库将主库上的日志复制到自己的中继日志( Relay Log)中
1. 备库读取中继日志中的事件,将其重放到备库数据之上。

**![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626594419144-d694503f-4bc4-4f6b-9259-936978c1f617.png#align=left&display=inline&height=346&margin=%5Bobject%20Object%5D&name=image.png&originHeight=346&originWidth=751&size=78256&status=done&style=none&width=751)**<br />**第一步**<br />在主库上记录二进制日志。在每次准备提交事务完成数据更新前,主库将数据更新的事件记录到二进制日志中。 MYSQL会按事务提交的顺序而非每条语句的执行顺序来记录二进制日志。在记录二进制日志后,主库会告诉存储引擎可以提交事务了。<br />**第二步**<br />备库将主库的二进制日志复制到其本地的中继日志中。首先,备库会启动一个工作线程,称为IO线程,IO线程跟主库建立一个普通的客户端连接,然后在主库上启动一个特殊的二进制转储( binlog dump)线程(该线程没有对应的SQL命令),这个二进制转储线程会读取主库上二进制日志中的事件。如果该线程追赶上了主库,它将进入睡眠状态,直到主库发送信号量通知其有新的事件产生时才会被唤醒,备库O线程会将接收到的事件记录到中继日志中。<br />**第三步**<br />备库的SQL线程从中继日志中读取事件并在备库中执行，从而实现备库数据的更新
<a name="Zl6Wo"></a>
### 6.2 复制的原理
<a name="YY6B0"></a>
#### 6.2.1 基于语句的复制
在MYSQL5.0及之前的版本只支持与语句的复制（逻辑复制）。基于与之的复制模式下，主库会记录哪些造成数据更改的查询，当备库读取并重放这些事件的时候，实际上只是把主库上执行过的SQL语句再执行一遍。<br />优点：

   - 简单的记录和执行这些语句，能够让主备保持同步。
   - 二进制日志哩的事件更加紧凑。

_mysqlbinlog_是使用基于语句的日志的最佳工具<br />问题：

   - 更新必须是串行的，需要更多的锁。
      - 串行是指多个任务时，各个任务按顺序执行，完成一个之后才能进行下一个。
      <a name="XVan0"></a>
#### 6.2.2 基于行的复制
MYSQL5.1开始支持基于行的复制，这种方式会将实际数据记录在二进制日志中。<br />好处：

   - 可以正确的复制每一行，一些语句可以被更加有效的复制。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626595886021-6ec1b8e5-d6f2-4d9b-adcb-5fe3e5b76880.png#align=left&display=inline&height=468&margin=%5Bobject%20Object%5D&name=image.png&originHeight=468&originWidth=777&size=167834&status=done&style=none&width=777)
<a name="1z1Tm"></a>
#### 6.2.3 基于行或者基于语句，那种更优？
**基于与语句的复制模式的优点**

   - 当主备的模式不同时，逻辑复制能够在多种情况下工作。在主备上的表的定义不同但数据类型相兼容、列的顺序不同等情况。这样就很容易先在备库上修改schema,然后将其提升为主库,减少停机时间。

**基于语句的复制模式的缺点**

   - 很多情况下通过基于语句的模式无法正确复制。事实上对于存储过程，触发器以及其他的一些语句的复制在5.0和5.1的一系列版本存在大量的BUG。如果正在使用触发器或者存储的过程，就不要使用基于语句的复制模式。

**基于行的复制模式的优点**

   - 基于行的复制模式会记录数据变更，因此在二进制日志中记录的都是实际上在主库上发生了变化的数据。这种模式能够更清楚地知道服务器上发生了哪些更改，并且有一个更好的数据变更记录。
   - 在一些情况下基于行的二进制日志还会记录发生改变之前的数据，因此这可能有利于某些数据恢复，
   - 在某些情况下，由于无须基于语句的复制那样需要为查询建立执行计划并执行查询，因此基于行的复制占用给更少的CPU
   - 基于行的复制能够帮助更快的找到并解决数据不一致的情况

**基于行的复制模式的缺点**

   - 由于语句没有在日志里记录，因此无法判断执行了哪些SQL
   - 基于行的日志无法处理诸如在备库修改表的schema这样的情况，而基于语句的日志可以
      - MySQL官方文档指出，从概念上讲，模式是一组相互关联的数据库对象，如表，表列，列的数据类型，索引，外键等等。但是从物理层面上来说，模式与数据库是同义的。你可以在MySQL的SQL语法中用关键字SCHEMA替代DATABASE，例如使用`CREATE SCHEMA`来代替
      <a name="Uu5sS"></a>
### 6.3 发送复制事件到其他备库
![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626597069785-37659907-cfbd-4c86-9c44-31c573a29751.png#align=left&display=inline&height=344&margin=%5Bobject%20Object%5D&name=image.png&originHeight=344&originWidth=691&size=109137&status=done&style=none&width=691)<br />主库将数据更新事件写入二进制日志,第一个备库提取并执行这个事件。这时候一个事件的生命周期应该已经结束了,但由于设置了og_ slave updates,备库会将这个事件写到它自己的二进制日志中。这样第二个备库就可以将事件提取到它的中继日志中并执行。这意味着作为源服务器的主库可以将其数据变化传递给没有与其直接相连的备库上。（级联复制）<br />当第一个备库将从主库获得的事件写入到其二进制日志中时,这个事件在备库二进制日志中的位置与其在主库二进制日志中的位置几乎肯定是不相同的,可能在不同的日志文件或文件内不同的位置。这意味着你不能假定所有拥有同一逻辑复制点的服务器拥有相同的日志坐标。
<a name="jmWru"></a>
### 6.4 复制拓扑
可以在任意个主库和备库之间建立复制，只有一个限制，每个备库只能有一个主库<br />**基本原则：**

   - 一个MYSQL备库实例只能有一个主库
   - 每个备库必须有一个唯一的服务器ID
   - 一个主库可以有多个备库
   - 如果打开了log_slave_updates选项，一个备库可以把其主库上的数据变化传播到其他备库



<a name="SCzrp"></a>
#### 6.4.1 一主库多备库（一主多从）
在有少量写和大量读时,这种配置是非常有用的。可以把读分摊到多个备库上,直到备库给主库造成了太大的负担,或者主备之间的带宽成为瓶颈为止。<br />尽管这是非常简单的拓扑结构,但它非常灵活,能满足多种需求。下面是它的一些用途:

   - 为不同的角色使用不同的备库(例如添加不同的索引或使用不同的存储引擎)。
   - 把一台备库当作待用的主库,除了复制没有其他数据传输。
   - 将一台备库放到远程数据中心,用作灾难恢复。·
   - 延迟一个或多个备库,以备灾难恢复
   - 使用其中一个备库,作为备份、培训、开发或者测试使用服务器
<a name="z7bGh"></a>
#### 6.4.2 主动-主动模式下的主-主复制
主-主复制(也叫双主复制或双向复制)包含两台服务器,每一个都被配置成对方的主库和备库,换句话说,它们是一对主库。（互为主备库）<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626597704203-1e03d5f2-0c36-4a36-841c-fa009f8a367a.png#align=left&display=inline&height=98&margin=%5Bobject%20Object%5D&name=image.png&originHeight=98&originWidth=287&size=12609&status=done&style=none&width=287)<br />这种配置最大的问题是如何解决冲突,两个可写的互主服务器导致的问题非常多。这通常发生在两台服务器同时修改一行记录,或同时在两台服务器上向一个包含AUT0_INCREMENT列的表里插入数据<br />

<a name="eLv2R"></a>
#### 6.4.3 主动-被动下的主-主复制
这种方式使得反复切换主动和被动服务器非常方便，这使得故障转移和故障恢复很容易，也可以让你在不关闭服务器的情况下执行维护/优化表/升级操作系统或其他任务<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626598041407-a71e3e77-97c4-4c2d-83cf-6755c6c68826.png#align=left&display=inline&height=103&margin=%5Bobject%20Object%5D&name=image.png&originHeight=103&originWidth=259&size=12605&status=done&style=none&width=259)<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626598049108-62fafb36-6f81-4861-b212-af694c09f075.png#align=left&display=inline&height=180&margin=%5Bobject%20Object%5D&name=image.png&originHeight=180&originWidth=683&size=83237&status=done&style=none&width=683)<br />
<br />
<br />
<br />
<br />

<a name="ARw8L"></a>
## 主从复制
<a name="EspYu"></a>
### 概要
<a name="yg7Sw"></a>
#### 什么是MYSQL的主从复制
MySQL 主从复制是指数据可以从一个MySQL数据库服务器主节点复制到一个或多个从节点。MySQL 默认采用异步复制方式，这样从节点不用一直访问主服务器来更新自己的数据，数据的更新可以在远程连接上进行，从节点可以复制主数据库中的所有数据库或者特定的数据库，或者特定的表。
<a name="O2bOT"></a>
#### 为什么要进行主从复制

- 在开发工作中，有时候会遇见某个sql 语句需要锁表，导致暂时不能使用读的服务，这样就会影响现有业务，使用主从复制，让主库负责写，从库负责读，这样，即使主库出现了锁表的情景，通过读从库也可以保证业务的正常运作。
- 做数据的热备
- 架构的扩展。业务量越来越大，I/O访问频率过高，单机无法满足，此时做多库的存储，降低磁盘I/O的访问频率，提高单个机器的I/O性能
<a name="xtyby"></a>
#### MySQL 主从复制主要用途

- **读写分离**

在开发工作中，有时候会遇见某个sql 语句需要锁表，导致暂时不能使用读的服务，这样就会影响现有业务，使用主从复制，让主库负责写，从库负责读，这样，即使主库出现了锁表的情景，通过读从库也可以保证业务的正常运作。<br />**l 数据实时备份，当系统中某个节点发生故障时，可以方便的故障切换**<br />**<br />**l 架构扩展**<br />随着系统中业务访问量的增大，如果是单机部署数据库，就会导致I/O访问频率过高。有了主从复制，增加多个数据存储节点，将负载分布在多个从节点上，降低单机磁盘I/O访问的频率，提高单个机器的I/O性能。

- MYSQL主从模式
   - **一主一从**
      - **只能由从数据库去同步主数据库的数据**
   - **一主多从，提高系统的读性能**
      - 一主一从和一主多从是最常见的主从架构，实施起来简单并且有效，不仅可以实现HA，而且还能读写分离，进而提升集群的并发能力
   - **多主一从 （从5.7开始支持）**
   - **双主复制（主主复制）**
      - 双主复制，也就是互做主从复制，每个master既是master，又是另外一台服务器的slave。这样任何一方所做的变更，都会通过复制应用到另外一方的数据库中。
   - **级联复制**
      - 级联复制模式下，部分slave的数据同步不连接主节点，而是连接从节点。因为如果主节点有太多的从节点，就会损耗一部分性能用于replication，那么我们可以让3~5个从节点连接主节点，其它从节点作为二级或者三级与从节点连接，这样不仅可以缓解主节点的压力，并且对数据一致性没有负面影响。
      <a name="9v4Fp"></a>
### MySQL 主从复制原理
**原理**

1. master服务器将数据的改变记录二进制 binlog日志,当 master上的数据发生改变时,则将其改变写入二进制日志中
1. slave服务器会在一定时间司隔内对 master二进制日志进行探测其是否发生改变,如果发生改变,则开始一个I/Othread和SQLthread请求 master二进制事件
1. 同时主节点为每个/O线程启动一个dump线程,用于向其发送二进制事件,并保存至从节点本地的中继日志中,从节点将启动SQL线程从中继日志中读取二进制日志,在本地重放,使得其数据和主节点的保持一致,最后I/Othread和 Sqlthread将进入睡眠状态,等待下一次被唤醒

**也就是说**

   - 从库会生成两个线程一个I/O线程一个SQL线程;
   - I/O线程会去请求主库的 binlog并将得到的 binlog写到本地的 relay-log(中继日志)文件中
   - 主库会生成—个 log dump线程,用来给从库I/O线程传 binlog
   - SQL线程会读取 relay log文件中的日志并解析成sq语句逐一执行

**注意**

1. master将操作语句记录到binlog日志中,然后授予 slave远程连接的权限( master定要开启 binlog二进制日志功能;通常为了数据安全考虑,slave也开启binlog功能)
1. slave开启两个线程I/O线程和SQL线程。其中I/O线程负责读取 master的 binlog内容到中继日志 relay log里SQL线程负责从 relay log日志里读出 binlog内容,并更新到slave的数据库里,这样就能保证 slave数据和 master数据保持致了。
1. Mysql复制至少需要两个Mysql的服务,当然Mysql服务可以分布在不同的服务器上,也可以在一台服务器上启动多个服务。
1. Mysql复制最好确保 master和 slave服务器上的Mysql版本相同(如果不能满足版本一致,那么要保证 master主节点的版本低于save从节点的版本)
1. master和 slave两节点间时间需同步


<br />MySQL主从复制涉及到三个线程，一个运行在主节点（log dump thread），其余两个(I/O thread, SQL thread)运行在从节点，如下图所示:<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626593715778-2392a152-0dd2-46cc-b5ab-d7356b11f13e.png#align=left&display=inline&height=299&margin=%5Bobject%20Object%5D&name=image.png&originHeight=299&originWidth=644&size=165520&status=done&style=none&width=644)<br />
<br />**l 主节点 binary log dump 线程**<br />
<br />当从节点连接主节点时，主节点会创建一个log dump 线程，用于发送bin-log的内容。在读取bin-log中的操作时，此线程会对主节点上的bin-log加锁，当读取完成，甚至在发动给从节点之前，锁会被释放。<br />
<br />**l 从节点I/O线程**<br />
<br />当从节点上执行`start slave`命令之后，从节点会创建一个I/O线程用来连接主节点，请求主库中更新的bin-log。I/O线程接收到主节点binlog dump 进程发来的更新之后，保存在本地relay-log中。<br />
<br />**l 从节点SQL线程**<br />
<br />SQL线程负责读取relay log中的内容，解析成具体的操作并执行，最终保证主从数据的一致性。<br />
<br />对于每一个主从连接，都需要三个进程来完成。当主节点有多个从节点时，主节点会为每一个当前连接的从节点建一个binary log dump 进程，而每个从节点都有自己的I/O进程，SQL进程。从节点用两个线程将从主库拉取更新和执行分成独立的任务，这样在执行同步数据任务的时候，不会降低读操作的性能。比如，如果从节点没有运行，此时I/O进程可以很快从主节点获取更新，尽管SQL进程还没有执行。如果在SQL进程执行之前从节点服务停止，至少I/O进程已经从主节点拉取到了最新的变更并且保存在本地relay日志中，当服务再次起来之后，就可以完成数据的同步。<br />
<br />要实施复制，首先必须打开Master 端的binary log（bin-log）功能，否则无法实现。<br />
<br />因为整个复制过程实际上就是Slave 从Master 端获取该日志然后再在自己身上完全顺序的执行日志中所记录的各种操作。如下图所示：<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626593785087-7ab13f5a-ee48-4042-b438-924b20bfb0a2.png#align=left&display=inline&height=325&margin=%5Bobject%20Object%5D&name=image.png&originHeight=325&originWidth=688&size=111099&status=done&style=none&width=688)<br />复制的基本过程如下：<br />

- 从节点上的I/O 进程连接主节点，并请求从指定日志文件的指定位置（或者从最开始的日志）之后的日志内容；
- 主节点接收到来自从节点的I/O请求后，通过负责复制的I/O进程根据请求信息读取指定日志指定位置之后的日志信息，返回给从节点。返回信息中除了日志所包含的信息之外，还包括本次返回的信息的bin-log file 的以及bin-log position；从节点的I/O进程接收到内容后，将接收到的日志内容更新到本机的relay log中，并将读取到的binary log文件名和位置保存到master-info 文件中，以便在下一次读取的时候能够清楚的告诉Master“我需要从某个bin-log 的哪个位置开始往后的日志内容，请发给我”；
- Slave 的 SQL线程检测到relay-log 中新增加了内容后，会将relay-log的内容解析成在祝节点上实际执行过的操作，并在本数据库中执行。
<a name="kzCjT"></a>
### MySQL 主从复制模式
MySQL 主从复制默认是异步的模式。MySQL增删改操作会全部记录在binary log中，当slave节点连接master时，会主动从master处获取最新的bin log文件。并把bin log中的sql relay。<br />**l 异步模式（mysql async-mode）**<br />异步模式如下图所示，这种模式下，主节点不会主动push bin log到从节点，这样有可能导致failover的情况下，也许从节点没有即时地将最新的bin log同步到本地。<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626593855796-d1b96fb9-e47a-47a9-9945-65fe6071ac4f.png#align=left&display=inline&height=344&margin=%5Bobject%20Object%5D&name=image.png&originHeight=344&originWidth=707&size=196515&status=done&style=none&width=707)<br />**l 半同步模式(mysql semi-sync)**<br />这种模式下主节点只需要接收到其中一台从节点的返回信息，就会commit；否则需要等待直到超时时间然后切换成异步模式再提交；这样做的目的可以使主从数据库的数据延迟缩小，可以提高数据安全性，确保了事务提交后，binlog至少传输到了一个从节点上，不能保证从节点将此事务更新到db中。性能上会有一定的降低，响应时间会变长。如下图所示：<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/22110625/1626593879116-d72208be-39ab-42e6-842b-b250e8073cac.png#align=left&display=inline&height=364&margin=%5Bobject%20Object%5D&name=image.png&originHeight=364&originWidth=741&size=264633&status=done&style=none&width=741)<br />半同步模式不是mysql内置的，从mysql 5.5开始集成，需要master 和slave 安装插件开启半同步模式。

**binlog记录格式**<br />MySQL 主从复制有三种方式：基于SQL语句的复制（statement-based replication，SBR），基于行的复制（row-based replication，RBR)，混合模式复制（mixed-based replication,MBR)。对应的binlog文件的格式也有三种：STATEMENT,ROW,MIXED。<br />
<br />l Statement-base Replication (SBR)就是记录sql语句在bin log中，Mysql 5.1.4 及之前的版本都是使用的这种复制格式。优点是只需要记录会修改数据的sql语句到binlog中，减少了binlog日质量，节约I/O，提高性能。缺点是在某些情况下，会导致主从节点中数据不一致（比如sleep(),now()等）。<br />
<br />l Row-based Relication(RBR)是mysql master将SQL语句分解为基于Row更改的语句并记录在bin log中，也就是只记录哪条数据被修改了，修改成什么样。优点是不会出现某些特定情况下的存储过程、或者函数、或者trigger的调用或者触发无法被正确复制的问题。缺点是会产生大量的日志，尤其是修改table的时候会让日志暴增,同时增加bin log同步时间。也不能通过bin log解析获取执行过的sql语句，只能看到发生的data变更。<br />
<br />l Mixed-format Replication(MBR)，MySQL NDB cluster 7.3 和7.4 使用的MBR。是以上两种模式的混合，对于一般的复制使用STATEMENT模式保存到binlog，对于STATEMENT模式无法复制的操作则使用ROW模式来保存，MySQL会根据执行的SQL语句选择日志保存方式。<br />
<br />**GTID复制模式**<br />在传统的复制里面，当发生故障，需要主从切换，需要找到binlog和pos点，然后将主节点指向新的主节点，相对来说比较麻烦，也容易出错。在MySQL 5.6里面，不用再找binlog和pos点，我们只需要知道主节点的ip，端口，以及账号密码就行，因为复制是自动的，MySQL会通过内部机制GTID自动找点同步。<br />
<br />多线程复制（基于库），在MySQL 5.6以前的版本，slave的复制是单线程的。一个事件一个事件的读取应用。而master是并发写入的，所以延时是避免不了的。唯一有效的方法是把多个库放在多台slave，这样又有点浪费服务器。在MySQL 5.6里面，我们可以把多个表放在多个库，这样就可以使用多线程复制。<br />
<br />**基于GTID复制实现的工作原理**

   - 主节点更新数据时，会在事务前产生GTID，一起记录到binlog日志中。
   - 从节点的I/O线程将变更的bin log，写入到本地的relay log中。
   - SQL线程从relay log中获取GTID，然后对比本地binlog是否有记录（所以MySQL从节点必须要开启binary log）。
   - 如果有记录，说明该GTID的事务已经执行，从节点会忽略。
   - 如果没有记录，从节点就会从relay log中执行该GTID的事务，并记录到bin log。
   - 在解析过程中会判断是否有主键，如果没有就用二级索引，如果有就用全部扫描。



