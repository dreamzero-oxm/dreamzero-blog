---
title: Guava浅学
description: Guava浅学
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Guava
updated: 2022-07-28
comments: false
---
# Guava

## 使用和避免null

**Optional**

Guava用[Optional](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/base/Optional.html)表示可能为null的T类型引用。一个Optional实例可能包含非null的引用（我们称之为引用存在），也可能什么也不包括（称之为引用缺失）。它从不说包含的是null值，而是用存在或缺失来表示。但Optional从不会包含null值引用。

```java
Optional<Integer> possible = Optional.of(5);

possible.isPresent(); // returns true

possible.get(); // returns 5
```

Optional无意直接模拟其他编程环境中的”可选” or “可能”语义，但它们的确有相似之处。

Optional最常用的一些操作被罗列如下：

```
Optional.of(T)	创建指定引用的Optional实例，若引用为null则快速失败
Optional.absent()	创建引用缺失的Optional实例
Optional.fromNullable(T)	创建指定引用的Optional实例，若引用为null则表示缺失
```

## 不可变集合

### 什么是不可变对象？

对象创建后，所有的状态和属性在整个生命周期内不能被修改

同理，不可变集合就是集合创建后，不能对集合中的对象进行修改

**好处：让并发处理变得更简单了**

在并发编程的世界里，最麻烦的问题就是处理多个线程间的资源共享问题，稍不注意就会出现线程间相互影响的问题

而且这种问题排查起来非常困难，不是每次都会出现。

一般我们处理并发问题，都是在共享资源上加锁，比如synchronize、Lock等，让线程串行的来进行处理

其实仔细想一下，之所有会有并发的问题，是因为线程之间会进行资源争抢，对共享资源进行修改才会影响到其他线程

那假如共享资源不能被修改，每个线程获取到的都是一样的，就不存在并发的问题了

想想是不是？每个线程获取到的数据都是一样的，而且共享资源不能被任何线程修改，那线程之间根本就不会相互影响，天然就是线程安全的

所以不可变对象的好处之一是不用处理并发情况下的资源竞争问题

### **为什么要使用不可变集合？**

* 不可变对象提供给别人使用时是安全的，因为不可变，所有人都无法进行修改，只能读
* 支持多个线程调用，不存在竞争的问题，天然支持多线程
* 不可变集合节省内存空间，因为不可变，集合空间在创建时就已经确定好了，不用考虑扩容等问题，内存利用率高
* 不可变集合可用于常量

### **Guava中不可变集合的使用方法**

#### **1、copyOf方法**

基于已有的集合创建不可变集合

```java
List<String> list  = new ArrayList<String>();
list.add("a");
list.add("b");
list.add("c");
ImmutableList<String> immutList = ImmutableList.copyOf(list);
```

```java
public static void main(String[] args) {
        ArrayList<Integer> integers = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            integers.add(i);
        }
        ImmutableList<Integer> integerImmutableList = ImmutableList.copyOf(integers);
        integers.add(10000);
        System.out.println(integers);
        System.out.println(integerImmutableList);
    }
```

输出：

```
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10000]
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

#### **2、of方法**

```java
ImmutableList<String> immutableList = ImmutableList.of("a","b","c");
```

#### **3、Builder方法**

```java
List<String> list  = new ArrayList<String>();
list.add("a");
list.add("b");
list.add("c");
ImmutableList<String> immutableList = ImmutableList.<String>builder().addAll(list).add("d").build();
```

可以看到，Builder方法更像是组合了copyOf和of方法

此处，对于有序的不可变集合来说，是在集合构造完成时就已经排序完成

#### 智能的Copyof

* 在常量时间内使用底层数据结构是可能的——例如，ImmutableSet.copyOf(ImmutableList)就不能在常量时间内完成
* 不会造成内存泄露——例如，你有个很大的不可变集合ImmutableList hugeList， ImmutableList.copyOf(hugeList.subList(0, 10))就会显式地拷贝，以免不必要地持有hugeList的引用
* 不改变语义——所以ImmutableSet.copyOf(myImmutableSortedSet)会显式地拷贝，因为和基于比较器的ImmutableSortedSet相比，ImmutableSet对hashCode()和equals有不同语义

#### asList视图

所有不可变集合都有一个asList()方法提供ImmutableList视图，来帮助你用列表形式方便地读取集合元素。例如，你可以使用sortedSet.asList().get(k)从ImmutableSortedSet中读取第k个最小元素。

asList()返回的ImmutableList通常是——并不总是——开销稳定的视图实现，而不是简单地把元素拷贝进List。也就是说，asList返回的列表视图通常比一般的列表平均性能更好，比如，在底层集合支持的情况下，它总是使用高效的contains方法。

可变集合与不可变集合对照表

![image-20210805103409760](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210805103409760.png)

## 新的集合类型 

### Multiset

Guava提供了Multiset，虽然名字带有Set，但它可以添加重复的元素

Multiset可以看成是ArrayList和Map的结合体

- Multiset是没有元素顺序限制的ArrayList
- Multiset提供了键为元素，值为计数的Map

**Multiset的实际用法**

```java
        //通过create()方法创建
        Multiset<String> multiset = HashMultiset.create();
        //可直接添加元素
        multiset.add("a");
        multiset.add("b");
        multiset.add("c");
        multiset.add("c");
        multiset.add("c");
        List<String> list = new ArrayList<String>();
        list.add("xx");
        list.add("yy");
        list.add("zz");
        //也可用addAll方法添加集合进来
        multiset.addAll(list);

        //获取元素"c"的计数
        System.out.println(multiset.count("c"));

        //返回去重后的元素set集合
        Set<String> set = multiset.elementSet();

        //multiset所有元素的个数
        System.out.println("multiset.size():" + multiset.size());
        //multiset去重后的元素个数
        System.out.println("elementSet().size():" + multiset.elementSet().size());

        //元素迭代
       Iterator<String> it = multiset.iterator();
        while(it.hasNext()){
            System.out.println(it.next());
        }

        //可以通过设置元素的计数，来批量的添加元素，当然能加也能减
        multiset.setCount("c",5);

        //将元素的计数设为0，就相当于移除所有的"c"元素
        multiset.setCount("c",0);

        //移除一个元素
        multiset.remove("c");

        //移除两个"c"元素
        multiset.remove("c",2);

```

![image-20210805104432101](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210805104432101.png)

### SortedMultiset

SortedMultiset支持高效的获取指定范围的子集

```java
SortedMultiset<String> sortedMultiset = TreeMultiset.create();
sortedMultiset.setCount("c",5);
sortedMultiset.setCount("a",3);
sortedMultiset.setCount("b",2);
//获取第一个元素
sortedMultiset.firstEntry().getElement();
//获了最后一个元素
sortedMultiset.lastEntry().getElement();
//获取子集
SortedMultiset<String> subMultiset = sortedMultiset.subMultiset("a", BoundType.OPEN,"b",BoundType.CLOSED);
```

需要注意，SortedMultiset默认是排好序的，是按元素来进行排序的而不是元素的个数

### Multimap

在JDK中Map是存储Key-value型数据结构的，并且Key相同时会被覆盖掉,比如

```java
Map<String,String> map = new HashMap<String,String>();
map.put("key","value1");
map.put("key","value2");
```

最终map里只会存key->value2的值

在很多时候，我们需要一个key对应多个值，在JDK中只能以类似于Map<K,List>这种形式来表达,操作起来很不方便

Guava为我们提供了Multimap，可以用来做一个Key映射多个值的操作

```java
Multimap multimap = ArrayListMultimap.create();
//新增元素,直接put
multimap.put("a","123");
multimap.put("a","111");
multimap.put("b","456");
multimap.put("d","789");

Multimap multimap1 = LinkedListMultimap.create();
multimap1.put("a","a1_value");
multimap1.put("k2","k2_value");
//使用putAll方法可以添加一个multimap，这个跟JDK中的putAll一样，而且key相同时会进行合并
multimap.putAll(multimap1);

List<String> list = Lists.newArrayList("a_value1","a_value2","a_value3");
//还可以指定key进行批量添加元素，注意此处是追加到key中，不是替换
multimap.putAll("a",list);

//multimap中的所有键值对，重复的算多个
System.out.println(multimap.size());
//key的个数
System.out.println(multimap.keySet().size());

//移除指定key的指定value
multimap.remove("a","111");
System.out.println(multimap);
//移除整个key的所有value
multimap.removeAll("a");
System.out.println(multimap);


//替换指定key的value
multimap.replaceValues("b",Lists.newArrayList("b1_value","b2_value"));

//是否包含指定的key
System.out.println(multimap.containsKey("d"));
//是否包含指定的键值对
System.out.println(multimap.containsEntry("d","789"));
//获取multimap中所有的value
System.out.println(multimap.values());
//返回Multiset
System.out.println(multimap.keys());
//返回Map类型
Map<String,List<String>> map = multimap.asMap();

//清空整个集合
multimap.clear();

System.out.println(multimap);

```

![image-20210805105247280](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210805105247280.png)

### BiMap

在JDK中，如果我们要维护一个双向Map，需要定义两个Map来存储，并且两个要同时进行变更

```java
Map<String,String> map1 = Maps.newHashMap();
Map<String,String> map2 = Maps.newHashMap();
map1.put("Hello","Kai");
map2.put("Kai","Hello");
```

Guava提供了BiMap，它是一种特殊的Map，可以实现键值的反转

```java
public static void main(String[] args){
        BiMap biMap = HashBiMap.create();
        biMap.put("a","123");
        System.out.println(biMap);
        //对键值对进行反转
        System.out.println(biMap.inverse());

        //试图将一个key映射到已经存在的值上，会抛异常
        biMap.put("b","123");

        //强值将一个key映射到已经存在的值上，会将原来的key覆盖掉
        biMap.forcePut("b","123");
        System.out.println(biMap);
    }
```

可以看出，因为BiMap要支持反转，所以它的key和value都必须是唯一的，要不然反转过来就存在一对多的情况

![image-20210805105652283](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210805105652283.png)

### Table

在JDK中当需要做key映射到Key-value对时，你需要这样写Map<K,Map<K,V>>,这种写法同样不够友好，同时也不便维护

这实际上就是一个表格的行、列、值的结构，Guava里面提供了表格来解决这种场景

```java
//创建row,column,value结构的table
Table<String,String,Integer> table = HashBasedTable.create();
table.put("a1","c1",23);
table.put("a1","c2",77);
table.put("a2","c2",44);
//通过rowKey获取columnKey->value的映射关系
System.out.println(table.row("a1"));
//通过columnKey获取rowKey ->value的映射关系
System.out.println(table.column("c2"));
```

Table有如下几种实现：

* HashBasedTable：本质上用HashMap<R, HashMap<C, V>>实现；
* TreeBasedTable：本质上用TreeMap<R, TreeMap<C,V>>实现；
* ImmutableTable：本质上用ImmutableMap<R, ImmutableMap<C, V>>实现；注：ImmutableTable对稀疏或密集的数据集都有优化。
* ArrayTable：要求在构造时就指定行和列的大小，本质上由一个二维数组实现，以提升访问速度和密集Table的内存利用率。
  ArrayTable与其他Table的工作原理有点不同。

## 集合工具类

### Lists

主要方法有

#### 各种创建list的方法

* 各种创建list的方法
  * asList()将数据组转成list
  * newArrayList()
  * newArrayListWithCapacity(10) 指定容量的创建
  * newArrayListWithExpectedSize（20） 初始化指定容量
  * newCopyOnWriteArrayList()
  * newLinkedList()
* partition(List list, int size) 将list按指定大小分隔成多个list
* cartesianProduct(List<? extends B>… lists) 获取多个list的笛卡尔集
* charactersOf(String str) 将字符串转成字符集合
* reverse(List list) 反转list
* transform(List fromList, Function<? super F, ? extends T> function) 数据转换

```java
    @Test
    public void ListCreateTest(){
        //将数组转成list,并在开头位置插入元素
        List<String> list = Lists.asList("a",new String[]{"b","c","d"});
        List<String> list1 = Lists.asList("a","b",new String[]{"c","d","e"});

        //直接创建ArrayList
        ArrayList<String> arrayList = Lists.newArrayList();
        //创建ArrayList,并初始化
        ArrayList<String> arrayList1 = Lists.newArrayList("a","b","c");
        //基于现有的arrayList,创建一个arrayList
        ArrayList<String> arrayList2 = Lists.newArrayList(arrayList1);
        //初始化指定容量大小的ArrayList，其中容量指ArrayList底层依赖的数组的length属性值，常用于提前知道ArrayList大小的情况的初始化
        ArrayList<String> arrayList3 = Lists.newArrayListWithCapacity(10);
        //初始化预定容量大小的ArrayList，返回的list的实际容量为5L + estimatedSize + (estimatedSize / 10)，常用于不确定ArrayList大小的情况的初始化
        ArrayList<String> arrayList4 =Lists.newArrayListWithExpectedSize(20);
        //创建CopyOnWriteArrayList
        CopyOnWriteArrayList<String> copyOnWriteArrayList = Lists.newCopyOnWriteArrayList();
        //创建linkedList
        LinkedList<String> linkedList = Lists.newLinkedList();
    }
```

#### **按指定大小分隔list**

```java
    @Test
    public void partitionTest(){
        List<String> list = Lists.newArrayList("a","b","c","d","e");
        //将list按大小为2分隔成多个list
        List<List<String>> splitList = Lists.partition(list,2);
        System.out.println(splitList);

    }
```

#### **笛卡尔集**

```java
    @Test
    public void cartesianProcustTest(){
        List<String> list1 = Lists.newArrayList("a","b","c");
        List<String> list2 = Lists.newArrayList("d","e","f");
        List<String> list3 = Lists.newArrayList("1","2","3");
        //获取多个list的笛卡尔集
        List<List<String>> list = Lists.cartesianProduct(list1,list2,list3);
        System.out.println(list);
    }
```

#### **字符串转成字符集合**

```java
    @Test
    public void charactersOfTest(){
        //将字符串转成字符集合
        ImmutableList<Character> list = Lists.charactersOf("ababcdfb");
    }
```

**list反转**

```java
    @Test
    public void reverseTest(){
        List<String> list = Lists.newArrayList("a","b","c","1","2","3");
        //反转list
        List<String> reverseList = Lists.reverse(list);
        System.out.println(reverseList);
    }
```

#### **数据转换**

```java
    @Test
    public void transFormTest(){
        List<String> list = Lists.newArrayList("a","b","c");
        //把list中的每个元素拼接一个1
        List<String> list1 = Lists.transform(list,str -> str + "1");
        System.out.println(list1);
    }
```

### Sets

主要方法有：

* 各种创建set的方法
  * newHashSet()
  * newLinkedHashSet()
  * newTreeSet()
  * newConcurrentHashSet()
* cartesianProduct(Set<? extends B>… sets) 笛卡尔集
* combinations(Set set, final int size) 按指定大小进行排列组合
* difference(final Set set1, final Set<?> set2) 两个集合的差集
* intersection(final Set set1, final Set<?> set2) 交集
* filter(Set unfiltered, Predicate<? super E> predicate) 过滤
* powerSet(Set set) 获取set可分隔成的所有子集
* union(final Set<? extends E> set1, final Set<? extends E> set2) 并集

#### **创建各种set的方法**

```java
    @Test
    public void setsCreate(){
        HashSet<String> set = Sets.newHashSet();
        Sets.newLinkedHashSet();
        Sets.newHashSetWithExpectedSize(10);
        Sets.newTreeSet();
        Sets.newConcurrentHashSet();
    }
```

#### **笛卡尔集**

```java
    @Test
    public void cartesianProduct(){
        Set<String> set1 = Sets.newHashSet("a","b","c");
        Set<String> set2 = Sets.newHashSet("1","2","3");
        Set<String> set3 = Sets.newHashSet("@","#","&");
        //多个Set的笛卡尔集，参数接收多个set集合
        Set<List<String>> sets = Sets.cartesianProduct(set1,set2,set3);
        System.out.println(sets);

        List<Set<String>> list = Lists.newArrayList(set1,set2,set3);
        //也可以把多个Set集合，放到一个list中，再计算笛卡尔集
        Set<List<String>> sets1 = Sets.cartesianProduct(list);
        System.out.println(sets1);
        //Sets.combinations()
        //Sets.difference()
    }
```

#### **按指定大小进行排列组合**

```java
    @Test
    public void combinationsTest(){
        //Set<String> set = Sets.new("a","b","c","d");
        //
        //ImmutableSet immutableSet = ImmutableSet.of("a","b","c","d");
        //将集合中的元素按指定的大小分隔，指定大小的所有组合
        Set<String> set1 = Sets.newHashSet("a","b","c","d");
        Set<Set<String>> sets = Sets.combinations(set1,3);
        for(Set<String> set : sets){
            System.out.println(set);
        }
    }
```

#### **差集**

```java
@Test
public void differenceTest(){
    Set<String> set1 = Sets.newHashSet("a","b","d");
    Set<String> set2 = Sets.newHashSet("d","e","f");
    //difference返回：从set1中剔除两个set公共的元素
    System.out.println(Sets.difference(set1,set2));
    //symmetricDifference返回：剔除两个set公共的元素，再取两个集合的并集
    System.out.println(Sets.symmetricDifference(set1,set2));
}
```

#### **交集**

```java
@Test
    public void intersectionTest(){
        Set<String> set1 = Sets.newHashSet("a","b","c");
        Set<String> set2 = Sets.newHashSet("a","b","f");
        //取两个集合的交集
        System.out.println(Sets.intersection(set1,set2));
    }

```

#### **过滤**

```java
    @Test
    public void filterTest(){
        Set<String> set1 = Sets.newHashSet("a","b","c");
        //建议可以直接使用java8的过滤，比较方便
        Set<String> set2 = Sets.filter(set1,str -> str.equalsIgnoreCase("b"));
        System.out.println(set2);
    }

```

#### **所有的排列组合**

```java
   @Test
    public void powerSetTest(){
        Set<String> set1 = Sets.newHashSet("a","b","c");
        //获取set可分隔成的所有子集
        Set<Set<String>> allSet = Sets.powerSet(set1);
        for(Set<String> set : allSet){
            System.out.println(set);
        }
    }

```

#### **并集**

```java
    @Test
    public void unionTest(){
        Set<String> set1 = Sets.newHashSet("a","b","c");
        Set<String> set2 = Sets.newHashSet("1","2","3");
        //取两个集合的并集
        System.out.println(Sets.union(set1,set2));
    }

```

### Maps

主要方法有：

创建各种Map的方法

* Maps.newHashMap();
* Maps.newConcurrentMap();
* Maps.newIdentityHashMap();
* Maps.newLinkedHashMap();
* Maps.newTreeMap();
* asMap(Set set, Function<? super K, V> function) set转map
* difference(Map<? extends K, ? extends V> left, Map<? extends K, ? extends V> right) 计算map的差值
* filterEntries(Map<K, V> unfiltered, Predicate<? super Entry<K, V>> entryPredicate) 通过Entry过滤
* filterKeys(Map<K, V> unfiltered, final Predicate<? super K> keyPredicate) 通过Key过滤
* filterValues(Map<K, V> unfiltered, final Predicate<? super V> valuePredicate) 通过value过滤
* transformEntries(Map<K, V1> fromMap, EntryTransformer<? super K, ? super V1, V2> transformer) 转换Entry
* transformValues(Map<K, V1> fromMap, Function<? super V1, V2> function) 转换value

#### **创建各种Map的方法**

```java
    @Test
    public void createDemo(){
        Maps.newHashMap();
        Maps.newHashMapWithExpectedSize(10);
        //Maps.newEnumMap();
        Maps.newConcurrentMap();
        Maps.newIdentityHashMap();

        Maps.newLinkedHashMap();
        Maps.newLinkedHashMapWithExpectedSize(10);

        Maps.newTreeMap();
    }

```

#### **set转map**

```java
    @Test
    public void asMapTest(){
        Set<String> set = Sets.newHashSet("a","b","c");
        //将set转成Map,key为set元素,value为每个元素的长度
        Map<String,Integer> map = Maps.asMap(set,String::length);
        System.out.println(map);
    }

```

#### **计算map的差值**

```java
    @Test
    public void differenceTest(){
        Map<String,String> map1 = Maps.newHashMap();
        map1.put("a","1");
        map1.put("b","2");
        map1.put("c","3");
        Map<String,String> map2 = Maps.newHashMap();
        map2.put("a","1");
        map2.put("e","5");
        map2.put("f","6");
        //mapDifference是将两个map相同的部分剔除
        MapDifference<String,String> mapDifference = Maps.difference(map1,map2);
        //两个Map相同的部分
        System.out.println(mapDifference.entriesInCommon());
        //左边集合剔除相同部分后的剩余
        System.out.println(mapDifference.entriesOnlyOnLeft());
        //右边集合剔除相同部分后的剩余
        System.out.println(mapDifference.entriesOnlyOnRight());
    }

```

#### **通过Entry过滤**

```java
    @Test
    public void filterEntriesTest(){
        Map<String,String> map1 = Maps.newHashMap();
        map1.put("a","1");
        map1.put("b","2");
        map1.put("c","3");
        Map<String,String> result = Maps.filterEntries(map1,item -> !item.getValue().equalsIgnoreCase("2"));
        System.out.println(result);
    }
```

#### **通过Key过滤**

```java
    @Test
    public void filterKeysTest(){
        Map<String,String> map1 = Maps.newHashMap();
        map1.put("a","1");
        map1.put("b","2");
        map1.put("c","3");
        Map<String,String> result = Maps.filterKeys(map1, item -> !item.equalsIgnoreCase("b"));
        System.out.println(result);
    }
```

#### **通过value过滤**

```java
    @Test
    public void filterValuesTest(){
        Map<String,String> map1 = Maps.newHashMap();
        map1.put("a","1");
        map1.put("b","2");
        map1.put("c","3");
        Map<String,String> result =  Maps.filterValues(map1,item -> !item.equalsIgnoreCase("3"));
        System.out.println(result);
    }
```

#### **转换Entry**

```java
    @Test
    public void transFormEntriesTest(){
        Map<String,String> map1 = Maps.newHashMap();
        map1.put("a","1");
        map1.put("b","2");
        map1.put("c","3");
        Map<String,String> result = Maps.transformEntries(map1,(k,v) -> k + v);
        System.out.println(result);
    }

```

#### **转换value**

```java
    @Test
    public void transformValuesTest(){
        Map<String,String> map1 = Maps.newHashMap();
        map1.put("a","1");
        map1.put("b","2");
        map1.put("c","3");
        Map<String,String> result = Maps.transformValues(map1, value -> value + 10);
        System.out.println(result);
    }
```

## Cache(缓存)

### Guava中的缓存实现

Guava中的缓存是本地缓存的实现，与ConcurrentMap相似，但不完全一样。最基本的区别就是，ConcurrentMap会一直保存添加进去的元素，除非你主动remove掉。而Guava Cache为了限制内存的使用，通常都会设置自动回收

Guava Cache的使用场景：

- 以空间换取时间，就是你愿意用内存的消耗来换取读取性能的提升
- 你已经预测到某些数据会被频繁的查询
- 缓存中存放的数据不会超过内存空间

```java
    @Test
    public void cacheCreateTest(){
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .maximumSize(100) //设置缓存最大容量
                .expireAfterWrite(1,TimeUnit.MINUTES) //过期策略，写入一分钟后过期
                .build();
        cache.put("a","a1");
        String value = cache.getIfPresent("a");
    }

```

### Cache

Cache是Guava提供的最基本缓存接口，创建一个Cache很简单

```java
    @Test
    public void cacheCreateTest(){
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .maximumSize(100) //设置缓存最大容量
                .expireAfterWrite(1,TimeUnit.MINUTES) //过期策略，写入一分钟后过期
                .build();
        cache.put("a","a1");
        String value = cache.getIfPresent("a");
    }
```

Cache是通过CacheBuilder对象来build出来的，build之前可以设置一系列的参数

### LoadingCache

LoadingCache继承自Cache,当从缓存中读取某个key时，假如没有读取到值，LoadingCache会自动进行加载数据到缓存

```java
    @Test
    public void loadingCacheTest() throws ExecutionException {
        LoadingCache<String,String> loadingCache = CacheBuilder.newBuilder()
                .maximumSize(3)
                .refreshAfterWrite(Duration.ofMillis(10))//10分钟后刷新缓存的数据
                .build(new CacheLoader<String, String>() {
                    @Override
                    public String load(String key) throws Exception {
                        Thread.sleep(1000);
                        System.out.println(key + " load data");
                        return key + " add value";
                    }
                });
        System.out.println(loadingCache.get("a"));
        System.out.println(loadingCache.get("b"));
    }
```

```java
a load data
a add value
b load data
b add value
```

LoadingCache也是通过CacheBuilder创建出来的，只不过创建的时候，需要在build方法里面传入CacheLoader

CacheLoader类的load方法就是在**key找不到的情况下，进行数据自动加载的**

### Cache常用参数

#### **容量初始化**

```java
public void initialCapacityTest(){
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .initialCapacity(1024) //初始容量
                .build();
    }
```

#### **最大容量**

最大容量可以通过两种维度来设置

- maximumSize 最大记录数，存储数据的个数
- maximumWeight 最大容量，存储数据的大小

```java
    @Test
    public void maxSizeTest(){
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .maximumSize(2)//缓存最大个数
                .build();
        cache.put("a","1");
        cache.put("b","2");
        cache.put("c","3");
        //我们设置缓存的最大记录为2，当我们添加三个元素进去后，会把前面添加的元素覆盖

        System.out.println(cache.getIfPresent("a"));
        System.out.println(cache.getIfPresent("b"));
        System.out.println(cache.getIfPresent("c"));

        Cache<String,String> cache1 = CacheBuilder.newBuilder()
                .maximumWeight(1024 * 1024 * 1024)//最大容量为1M
                //用来计算容量的Weigher
                .weigher(new Weigher<String, String>() {
                    @Override
                    public int weigh(String key, String value) {
                        return key.getBytes().length + value.getBytes().length;
                    }
                })
                .build();
        cache1.put("x","1");
        cache1.put("y","2");
        cache1.put("z","3");

        System.out.println(cache1.getIfPresent("x"));
        System.out.println(cache1.getIfPresent("y"));
        System.out.println(cache1.getIfPresent("z"));

    }
```

```
null
2
3
1
2
3
```

#### **过期时间**

- expireAfterWrite 写入后多长时间，数据就过期了
- expireAfterAccess 数据多长时间没有被访问，就过期

```java
    @Test
    public void expireTest() throws InterruptedException {
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .maximumSize(100)//缓存最大个数
                .expireAfterWrite(5,TimeUnit.SECONDS)//写入后5分钟过期
                .build();
        cache.put("a","1");
        int i = 1;
        while(true){
            System.out.println("第" + i + "秒获取到的数据为：" + cache.getIfPresent("a"));
            i++;
            Thread.sleep(1000);
        }
    }

```

```
第1秒获取到的数据为：1
第2秒获取到的数据为：1
第3秒获取到的数据为：1
第4秒获取到的数据为：1
第5秒获取到的数据为：1
第6秒获取到的数据为：null
第7秒获取到的数据为：null
第8秒获取到的数据为：null
第9秒获取到的数据为：null
```

```java
    @Test
    public void expireAfterAccessTest() throws InterruptedException {
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .maximumSize(100)//缓存最大个数
                .expireAfterAccess(5,TimeUnit.SECONDS)//5秒没有被访问，就过期
                .build();
        cache.put("a","1");
        Thread.sleep(3000);
        System.out.println("休眠3秒后访问：" + cache.getIfPresent("a"));
        Thread.sleep(4000);
        System.out.println("休眠4秒后访问：" + cache.getIfPresent("a"));
        Thread.sleep(5000);
        System.out.println("休眠5秒后访问：" + cache.getIfPresent("a"));
    }
```

```
休眠3秒后访问：1
休眠4秒后访问：1
休眠5秒后访问：null
```

#### 回收策略

在上面我们讲了两种回收策略

* expireAfterWrite 写入多长时间后就回收
* expireAfterAccess 多长时间没有被访问就回收

Guava Cache还支持基于引用级别的回收，这种回收策略是Java特有的，在Java的对象回收机制中，按对象的强弱可以分为**强引用、软引用、弱引用、虚引用**

**强引用**

强引用是我们最常用的引用，比如我们直接new一个对象，就是一个强引用

```java
Map<String,String> map = new HashMap<String,String>();
```

强引用不会被自动回收，当内存不足时直接报内存溢出

**软引用**

软引用是一种不稳定的引用方式，如果一个对象具有软引用，当内存充足时，GC不会主动回收软引用对象，而当内存不足时软引用对象就会被回收

```java
SoftReference<Object> softRef=new SoftReference<Object>(new Object()); // 软引用
Object object = softRef.get(); // 获取软引用
```

**弱引用**

弱引用是一种比软引用更不稳定的引用方式，因为无论内存是否充足，弱引用对象都有可能被回收

```java
WeakReference<Object> weakRef = new WeakReference<Object>(new Object()); 
Object obj = weakRef.get(); // 获取弱引用
```

**虚引用**

虚引用这种引用方式就是形同虚设，因为如果一个对象仅持有虚引用，那么它就和没有任何引用一样。在实践中也几乎没有使用

在Guava中支持软/弱引用的回收方式

```java
Cache<String,String> cache = CacheBuilder.newBuilder()
                .weakKeys() //使用弱引用存储键。当键没有其它（强或软）引用时，该缓存可能会被回收。
                .weakValues() //使用弱引用存储值。当值没有其它（强或软）引用时，该缓存可能会被回收。
                .softValues() //使用软引用存储值。当内存不足并且该值其它强引用引用时，该缓存就会被回收
                .build();
```

**手动回收**

上面讲的都是缓存自动回收的策略，我们也可以调用Guava Cache提供的方法来手动清除

可以删除单个key，也可以批量删除key，同时也可以清除整个缓存的数据

```java
    @Test
    public void invalidateTest(){
        Cache<String,String> cache = CacheBuilder.newBuilder().build();
        cache.put("a","1");
        cache.put("b","2");
        //从缓存中清除key为a的数据
        cache.invalidate("a");
        System.out.println(cache.getIfPresent("a"));

        cache.put("x","x1");
        cache.put("y","y1");
        System.out.println("x清除之前："+ cache.getIfPresent("x"));
        System.out.println("y清除之前："+ cache.getIfPresent("y"));
        List<String> list = Lists.newArrayList("x","y");
        //批量清除
        cache.invalidateAll(list);
        System.out.println("x清除之后："+ cache.getIfPresent("x"));
        System.out.println("y清除之后："+ cache.getIfPresent("y"));

        cache.put("y","y1");
        cache.put("z","z1");

        //清空缓存所有的数据
        cache.invalidateAll();

        System.out.println("全部清除后：" + cache.getIfPresent("y"));
        System.out.println("全部清除后：" + cache.getIfPresent("z"));
    }
```

```
null
x清除之前：x1
y清除之前：y1
x清除之后：null
y清除之后：null
全部清除后：null
全部清除后：null
```

#### 数据清除监听器

可以给Cache中的对象加一个监听，当有对象被删除时会有事件通知

```java
    @Test
    public void removeListenerTest() throws InterruptedException {
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .maximumSize(3)
                .expireAfterWrite(Duration.ofSeconds(5))//5秒后自动过期
                //添加一个remove的监听器
                .removalListener(new RemovalListener<Object, Object>() {

                    @Override
                    public void onRemoval(RemovalNotification<Object, Object> notification) {
                        System.out.println("[" +notification.getKey() + ":" + notification.getValue() + "] 被删除了");
                    }
                })
                .build();

        cache.put("a","1");
        Thread.sleep(2000);
        cache.put("b","2");
        cache.put("c","3");
        Thread.sleep(2000);
        cache.put("d","4");
        Thread.sleep(5000);
        cache.put("e","5");
        cache.invalidate("e");
    }
```

创建Cache时removalListener方法传入一个RemovalListener对象，重写onRemoval方法来进行数据清除事件的监听

从运行结果可以看出来，三种情况下的清除数据都会被监听

* 超过容量，清除最早添加进缓存的数据
* 超过设定的过期时间，缓存系统自动删除
* 手动清除数据

#### 统计信息

我们在使用缓存的时候，应该要关心缓存的命中率、加载数据时间等等信息，可以根据这些统计信息来对缓存进行优化调整，让缓存更好的为我们服务。在构建缓存对象时，可以开启统计信息，开启后会对缓存的操作进行统计

```java
    @Test
    public void recordStatsTest(){
        Cache<String,String> cache = CacheBuilder.newBuilder()
                .maximumSize(3)
                .recordStats()
                .build();
        cache.put("a","1");
        cache.put("b","2");
        cache.put("c","3");
        cache.put("d","4");
        cache.put("e","5");
        cache.put("f","6");

        cache.getIfPresent("a");
        cache.getIfPresent("a");
        cache.getIfPresent("e");
        cache.getIfPresent("f");
        cache.getIfPresent("h");
        cache.getIfPresent("t");
        System.out.println(cache.stats());
    }

```

## 限流RateLimiter

### 漏桶算法

漏桶算法很形象，我们可以想像有一个大桶，大桶底部有一个固定大小的洞，Web请求就像水一样，先进入大桶，然后以固定的速率从底部漏出来，无论进入桶中的水多么迅猛，漏桶算法始终以固定的速度来漏水

![image-20210806204829424](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210806204829424.png)

对应到Web请求就是

- 当桶中无水时表示当前无请求等待，可以直接处理当前的请求
- 当桶中有水时表示当前有请求正在等待处理，此时新来的请求也是需要进行等待处理
- 当桶中水已经装满，并且进入的速率大于漏水的速率，水就会溢出来，此时系统就会拒绝新来的请求

### 令牌桶算法

令牌桶跟漏桶算法有点不一样，令牌桶算法也有一个大桶，桶中装的都是令牌，有一个固定的“人”在不停的往桶中放令牌，每个请求来的时候都要从桶中拿到令牌，要不然就无法进行请求操作

![image-20210806204849015](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210806204849015.png)

- 当没有请求来时，桶中的令牌会越来越多，一直到桶被令牌装满为止，多余的令牌会被丢弃
- 当请求的速率大于令牌放入桶的速率，桶中的令牌会越来越少，直止桶变空为止，此时的请求会等待新令牌的产生

### 漏桶算法 VS 令牌桶算法

* 漏桶算法是桶中有水就需要等待，桶满就拒绝请求。而令牌桶是桶变空了需要等待令牌产生
* 漏桶算法漏水的速率固定，令牌桶算法往桶中放令牌的速率固定
* 令牌桶可以接收的瞬时流量比漏桶大，比如桶的容量为100，令牌桶会装满100个令牌，当有瞬时80个并发过来时可以从桶中迅速拿到令牌进行处理，而漏桶的消费速率固定，当瞬时80个并发过来时，可能需要进行排队等待

### Guava中的限流实现RateLimiter

Guava中的限流使用的是令牌桶算法，RateLimiter提供了两种限流实现：

**平滑突发限流(SmoothBursty)**
**平滑预热限流(SmoothWarmingUp)**
什么是平滑突发限流？

每秒以固定的速率输出令牌，以达到平滑输出的效果

```java
    //每秒5个令牌
    RateLimiter rateLimiter = RateLimiter.create(5);
    while(true){
        System.out.println("time:" + rateLimiter.acquire() + "s");
    }
```

输出结果：

```
time:0.0s
time:0.196802s
time:0.186141s
time:0.199164s
time:0.199221s
time:0.199338s
time:0.199493s
```


平均每个0.2秒左右，很均匀

当产生令牌的速率大于取令牌的速率时，是不需要等待令牌时间的

```java
    //每秒5个令牌
    RateLimiter rateLimiter = RateLimiter.create(5);
    while(true){
        System.out.println("time:" + rateLimiter.acquire() + "s");
        //线程休眠，给足够的时间产生令牌
        Thread.sleep(1000);
    }
```

输出结果：

```
time:0.0s
time:0.0s
time:0.0s
time:0.0s
time:0.0s
```


**由于令牌可以积累，所以我一次可以取多个令牌，只要令牌充足，可以快速响应**

```java
    //每秒5个令牌
    RateLimiter rateLimiter = RateLimiter.create(5);
    while(true){
        //一次取出5个令牌也可以快速响应
        System.out.println("time:" + rateLimiter.acquire(5) + "s");
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
    }
```

输出结果：

```
time:0.0s
time:0.990702s
time:0.190547s
time:0.195084s
time:0.199338s
time:0.999403s
```


**平滑预热限流？**

平滑预热限流带有预热期的平滑限流，它启动后会有一段预热期，逐步将令牌产生的频率提升到配置的速率

这种方式适用于系统启动后需要一段时间来进行预热的场景

比如，我设置的是每秒5个令牌，预热期为5秒，那么它就不会是0.2左右产生一个令牌。在前5秒钟它不是一个均匀的速率，5秒后恢复均匀的速率

```java
    //每秒5个令牌，预热期为5秒
    RateLimiter rateLimiter = RateLimiter.create(5,5, TimeUnit.SECONDS);
    while(true){
        //一次取出5个令牌也可以快速响应
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
        System.out.println("time:" + rateLimiter.acquire(1) + "s");
        System.out.println("-----------");
    }
```

输出结果：

```
time:0.0s
time:0.57874s
time:0.539854s
time:0.520102s
time:0.485491s
-----------
time:0.455969s
time:0.423133s
time:0.391189s
time:0.359336s
time:0.327898s
-----------
time:0.295409s
time:0.263682s
time:0.231618s
time:0.202781s
time:0.198914s
-----------
time:0.198955s
time:0.199052s
time:0.199183s
time:0.199296s
time:0.199468s
-----------
time:0.199493s
time:0.199687s
time:0.198785s
time:0.198893s
time:0.199373s
-----------
```

从输出结果可以看出来，前面的速率不均匀，到后面就逐渐稳定在0.2秒左右了
