---
title: JAVA多线程
description: JAVA多线程
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - 多线程
updated: 2022-07-28
comments: false
---
# 多线程

## 多线程的三种创建方式

### Thread

* 自定义线程类继承Thread累
* 重写run()方阿飞，编写线程执行体
* 创建线程对象，调用start()方法启动线程

线程不一定立即执行，CPU安排调度

![image-20220329232307797](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232307797.png)

### 实现runnable接口

* 实现接口Runnable具有多线程的能力
* 启动线程：传入目标对象+Thread对象.start();
* 推荐使用：避免单继承局限性，灵活方便，方便同一个对象被多个线程使用

重写run方法，执行线程需要丢入runnable接口实现类，调用start方法

```JAVA
public static void main (String[] arges){
    //创建runnable接口的实现类对象
    TestThread3 testThread3 = new TestThread3;
    
    //创建线程对象，通过线程对象来开启我们的线程，代理
    Thread thread = new Thread(testThread3);
    thread.start();
}
```

### 实现Callable接口

1. 实现callable接口，需要返回值类型

2. 重写call方法，需要抛出异常

3. 创建目标对象

4. 创建执行服务：

   ```java
   ExecutorService ser = Executors.newFixedThreadPool;
   ```

5. 提交执行

   ```
   Future <Boolean>  result1 = ser.submit
   ```

6. 获取结果

   ```
   boolean r1 = result1.get
   ```

7. 关闭服务：

   ```java
   ser.shutdownNow();
   ```

   好处：
   	可以定义返回值
   	可以抛出异常

## 静态代理模式

​	多线程的几种方法中，Thread类也实现了Runnable接口，因此本质都是实现了Runnable接口中run方法的重写。其中最常用的方式实现Runnable接口就是使用了静态代理模式，我们首先来看以下代码。

```
首先定义一个接口类Study
```

```java
//接口类
interface Study{
    void study();
}

```

```
再定义一个实体类Student来继承这个接口类
```

```java
//实体类
class Student implements Study{
    @Override
    public void study() {
        System.out.println("我爱学习！");
    }
}

```

```
然后定义一个代理类Teacher也继承这个接口类
```

```java
//代理类
class Teacher implements Study{
    private Student name;
    public Teacher(Student name){
        this.name = name;
    }
    @Override
    public void study() {
        this.name.study();
    }
}

```

```
最后来测试一下这个方法的实现过程
```

```java
//测试类
public class Proxy {
    public static void main(String[] args) {
        Student student = new Student();
        new Teacher(student).study();
    }
}

```

可以看到通过Student类和Teacher类同时实现接口类Study可以使用Teacher类通过传入Student对象来调用Student中重写的study方法。这和多线程中我们所写的类以及Thread类同时实现接口类Runnable极其相似。

```
下面对比多线程的实现。
```

```java
//多线程
public class Proxy implements Runnable{
    @Override
    public void run() {
        System.out.println("实现多线程");
    }
    public static void main(String[] args) {
        Proxy proxy = new Proxy();
        new Thread(proxy).start();
    }
}

```

对比上面可以发现我们把实体Student类比成我们要写的Proxy类，代理类Teacher类比成Thread代理类，接口类Study类比为Runnable类，而study()方法则类比成run()方法，而start()方法在官方api中的作用如下图，为调用run()方法。

## Lambda表达式

* 避免内部类定义过多

* 其是指属于函数式编程的概念

* ```
  (params)->expression[表达式]
  (params)->statment[语句]
  (params)->{statments}
  ```

* 函数式接口的定义

  * 任何接口,如果只包含唯一一个抽象方法,那么它就是一个函数式接口

    ```JAVA
    public interface RUNNABLE{
    	public abstract void run();
    }
    ```

    

  * 对于函数式接口,我们可以通过 lambda表达式来创建该接口的对象

```
	lambda表达式只能有一行代码的情况下才能简化成为一行,如果有多行,那么就用代码块包裹。
	前提是接口为函数式接口
```

## 线程状态

![image-20220329232313846](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232313846.png)

## 线程方法

```JAVA
setPriority(int newPriority)	更改线程的优先级
static void sleep(long mills)	在指定的毫秒数内让当前正在执行的线程休眠
void join()	等待改线程终止
static void yield()	暂停当前正在执行的线程对象,并执行其他线程
void interrupt()	中断线程
boolean isAlive	测试线程是否处于活动状态
```

### 停止线程

* 不推荐使用JDK提供的STOP()、destroy()方法【已废弃】
* 推荐让线程自己停下来
* 建议使用一个标志位进行终止变量，当flag=false，则终止线程运行

### 线程休眠

* sleep(时间)指定当前线程阻塞的毫秒数
* sleep存在异常 InterruptedException
* sleep时间达到后线程进入就绪状态
*  sleep可以模拟网络延时,倒计时等
* 每一个对象都有一个锁,sleep不会释放锁;

### 线程礼让

* 礼让线程,让当前正在执行的线程暂停,但不阻塞
* 将线程从运行状态转为就绪状态
* 让cpu重新调度,礼让不一定成功!看CPU心情

### Join

Join合并线程，待此线程执行完成后，在执行其他线程，其他线程阻塞

可以看作为插队

## 线程状态观测

```
Tread.State
线程状态。
线程可以处于以下状态之一:
NEW尚未启动的线程处于此状态
RUNNABLE在Java虚拟机中执行的线程处于此状态
BLOCKED被阻塞等待监视器锁定的线程处于此状态
WAITING正在等待另一个线程执行特定动作的线程处于此状态。
MIMED WAITING正在等待另一个线程执行动作达到指定等待时间的线程处于此状态。
TERMINATED己退出的线程处于此状态。
```

## 线程优先级

* Java提供一个线程调度器来监控程序中启动后进入就绪状态的所有线程,线程调度器按照优先级决定应该调度哪个线程来执行。

* 线程的优先级用数字表示,范围从1~10

  * ```JAVA
     Thread.MIN_PRIORITY=1
     Thread.MAX_PRIORITY= 10
     Thread.NORM PRIORITY= 5
    ```

    

* 使用以下方式改变或获取优先级

* ```
  getpriority.setpriority(int XXX)
  ```

  优先级的设定建议放在start()前面

## 守护线程

线程分为用户线程和守护线程

虚拟机必须确保用户线程执行完毕

虚拟机**不用等待**守护线程执行完毕

如后台记操作日志,监控内存,垃圾回收等待.

```
设置为守护线程  方法： thread.setDaemon(true) 	默认为false-用户线程
```

## 线程同步

​	处理多线程问题时,多个线程访问同一个对象,并且某些线程还想修改这个对象，这时候我们就需要线程同步.线程同步其实就是一种等待机制,多个需要同时访问此对象的线程进入这个**对象的等待池**形成队列,等待前面线程使用完毕,下一个线程再使用

**形成条件：**  队列+锁

​	由于同一进程的多个线程共享同一块存储空间,在带来方便的同时,也带来了访问冲突问题,为了保证数据在方法中被访问时的正确性,在访问时加入**锁机制**synchronized,当一个线程获得对象的排它锁,独占资源,其他线程必须等待使用后释放锁即可.存在以下问题

1. 一个线程持有锁会导致其他所有需要此锁的线程挂起
2. 在多线程竞争下,加锁,释放锁会导致比较多的上下文切换和调度延时引起性能问题
3. 如果一个优先级高的线程等待一个优先级低的线程释放锁会导致优先级倒置,引起性能问题

### 同步方法

由于我们可以通过 private关键字来保证数据对象只能被方法访问,所以我们只需要针对方法提出一套机制,这套机制就是 synchronized关键字,它包括两种用法synchronized方法和 synchronized块

```java
同步方法
public synchronized void method(int ...){}
```

synchronized方法控制对“对象”的访问,每个对象对应一把锁,每个synchronized方法都必须获得调用该方法的对象的锁才能执行,否则线程会阻塞方法一旦执行,就独占该锁,直到该方法返回才释放锁,后面被阻塞的线程才能获得这个锁,继续执行

**缺陷：** 

1. 如果将一个大的昂发声明为synchronized将会影响效率
2. 方法里面需要修改的内容才需要锁，所得太多浪费资源

### 同步块

* 同步块：synchronized(obj){}
* obj称之为同步监视器
  * obj可以是任何对象,但是推荐使用共享資源作为同步监视器
  * 同步方法中无需指定同步监视器,因为同步方法的同步监视器就是this,就是这个对象本身,或者是class
* 同步监视器的执行过程
  1. 第一个线程访问，锁定同步监视器，执行其中的代码
  2. 第二个线程访问，发现同步监视器被锁定，无法访问
  3. 第一个线程访问完毕，解锁同步监视器
  4. 第二个线程访问，发现同步监视器没有锁，然后锁定并访问

## CopyOnWriteArrayList

线程安全的ArrayList

## 锁

### 死锁

​	多个线程各自占有一些共享资源,并且互相等待其他线程占有的资源才能运行,而导致两个或者多个线程都在等待对方释放资源,都停止执行的情形.某一个同步块同时拥有“两个以上对象的锁”时,就可能会发生“死锁”的问题

​	多个线程互相抱着对方需要的资源，然后形成僵持

**产生死锁的四个必要条件：**

	1. 互斥条件:一个资源每次只能被一个进程使用。
	2. 请求与保持条件:一个进程因请求资源而阻塞时,对已获得的资源保持不放。
	3. 不剥夺条件:进程已获得的资源,在未使用完之前,不能强行剥夺。
	4. 循环等待条件:若干进程之间形成一种头尾相接的循环等待资源关系。

### Lock锁

* 从JDK5.0开始,Java提供了更强大的线程同步机制——通过显式定义同步锁对象来实现同步。同步锁使用Lock对象充当
* java. util. concurrent.locks.Lock接口是控制多个线程对共享资源进行访问的工具。锁提供了对共享资源的独占访问,每次只能有一个线程对Lock对象加锁,线程开始访问共享资源之前应先获得Lock对象
* Reentrantlock(可重复锁)类实现了Lock,它拥有与 synchronized相同的并发性和内存语义,在实现线程安全的控制中,比较常用的是 Reentrantlock,可以显式加锁、释放锁。

## 线程协作（生产者消费者）

**应用场景:生产者和消费者问题**

假设仓库中只能存放一件产品,生产者将生产出来的产品放入仓库,消费者将仓库中产品取走消费

如果仓库中没有产品,则生产者将产品放入仓库,否则停止生产并等待,直到仓库中的产品被消费者取走为止

如果仓库中放有产品,则消费者可以将产品取走消费,否则停止消费并等待,直到仓库中再次放入产品为止

**这是一个线程同步问题,生产者和消费者共享同一个资源,并且生产者和消费者之间相互依赖,互为条件**

* 对于生产者,没有生产产品之前,要通知消费者等待.而生产了产品之后,又需要马上通知消费者消费
* 对于消费者,在消费之后,要通知生产者已经结束消费,需要生产新的产品以供消费
* 在生产者消费者问题中,仅有 synchronized是不够的
* synchronized可阻止并发更新同一个共享资源,实现了同步
* synchronized不能用来实现**不同线程之间的消息传递(通信)**

Java提供了几个方法解决线程之间的通信问题

| 方法名             | 作用                                                         |
| ------------------ | ------------------------------------------------------------ |
| wait()             | 表示线程一直等待，知道其他线程通知，与sleep不同，会释放锁    |
| wait(long timeout) | 指定等待的毫秒数                                             |
| notify()           | 唤醒一个处于等待状态的线程                                   |
| notifyAll()        | 唤醒同一个对象上所有调用wait方法的线程，优先级别高的线程优先调度 |

**均为Object类的方法，都只能在同步方法或者同步代码块中使用，否则会抛出异常**

![image-20220329232319155](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232319155.png)

### 管程法

生产者消费者问题利用缓冲区解决：


1.首先需要四个角色 ：1.生产者2.消费者3.缓冲区4.商品。


2.生产者生产商品放到缓冲区，缓冲区如果满了，生产者停止运作，进入等待。


3.消费者从缓冲区拿商品，如果缓冲区商品没有了，先唤醒生产者，然后进入等待。

示例如下：

```JAVA
/**
 * @ClassName TubeMethodTest
 * @Description 生产者消费者问题解决办法-管程法
 * @Author
 * @Date 2020-05-25 14:12
 * @Version 1.0
 **/
public class TubeMethodTest {
    public static void main(String[] args) {
        SynContainer synContainer = new SynContainer();
        new Productor(synContainer).start();
        new Consumer(synContainer).start();
    }
}
//生产者
class Productor extends Thread{
    SynContainer container;
    public Productor(SynContainer container){
        this.container = container;
    }
 
    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            container.push(new Googs(i));
            System.out.println("生产了"+i+"个商品");
        }
    }
}
//消费者
class Consumer extends Thread{
    SynContainer container;
    public Consumer(SynContainer container){
        this.container = container;
    }
    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            System.out.println("消费了第"+container.pop().id+"个商品");
        }
    }
}
//商品
class Googs{
    int id;
    Googs(int id){
        this.id = id;
    }
}
//缓冲区
class SynContainer{
    //设置一个容器大小
    Googs[] googs = new Googs[10];
    //设置容器计数器
    int count = 0;
    //生产者放入产品
    public synchronized void push(Googs goog){
        //如果容器满了，就需要等待消费者消费
        if(count == googs.length){
            //通知消费者消费，生产者等待
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        //如果容器未满，放入商品
        googs[count] = goog;
        count++;
        //可以通知消费者消费了
        this.notifyAll();
    }
    //消费者消费产品
    public synchronized Googs pop(){
        //判断能否消费
        if(count == 0){
            //等待生产者生产
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        //如果可以消费
        count--;
        Googs goog = googs[count];
        //消费完了通知生产者生产
        this.notifyAll();
        return goog;
    }
}
```

### 信号灯法（标志位解决）

```JAVA
package com.test3;

//测试生产者消费者问题2：信号灯法，标志位解决
public class TestPC2 {
	public static void main(String[] args) {
		TV tv = new TV();
		new Player(tv).start();
		new Watcher(tv).start();
	}
}

//生产者--->演员
class Player extends Thread {
	TV tv;

	public Player(TV tv) {
		this.tv = tv;
	}

	@Override
	public void run() {
		for (int i = 0; i < 20; i++) {
			if (i % 2 == 0) {
				this.tv.play("快乐大本营");
			} else {
				this.tv.play("广告");
			}
		}
	}
}

//消费者--->观众
class Watcher extends Thread {
	TV tv;

	public Watcher(TV tv) {
		this.tv = tv;
	}

	@Override
	public void run() {
		for (int i = 0; i < 20; i++) {
			this.tv.watch();
		}
	}
}

//产品--->观看
class TV {
	// 演员表演，观众等待 T
	// 观众观看，演员等待 F
	String voice;// 表演的节目
	boolean flag = true;

	// 表演
	public synchronized void play(String voice) {
		if (!flag) {
			try {
				this.wait();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

		System.out.println("演员表演了：" + voice);
		// 通知观众观看
		this.notifyAll();
		this.voice = voice;
		this.flag = !flag;
	}

	// 观看
	public synchronized void watch() {
		if (flag) {
			try {
				this.wait();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		System.out.println("观看了:" + voice);
		// 通知演员表演
		this.notifyAll();
		this.flag = !flag;
	}
}


```

# 线程池

![image-20220329232325061](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232325061.png)

## 使用线程池

* 背景:经常创建和销毁、使用量特别大的资源,比如并发情况下的线程,对性能影响很大。
* 思路:提前创建好多个线程,放入线程池中,使用时直接获取,使用完放回池中。可以避免频繁创建销毁、实现重复利用。类似生活中的公共交通工具。
* 好处:
  * 提高响应速度(减少了创建新线程的时间)◆降低资源消耗(重复利用线程池中线程,不需要毎次都创建)
  * 便于线程管理(...)
    * core Poolsize:核心池的大小
    * maximum Poolsize:最大线程数
    * keepaliveTime:线程没有任务时最多保持多长时间后会终止
* JDK5.0起提供了线程池相关API: Executor Service和 Executors
* Executor Service:真正的线程池接口。常见子类 Thread Pool Executor
  * void execute( Runnable command):执行任务命令,没有返回值,一般用来执行 Runnable
  * <T> Future<T> submit( Callable<T>task):执行任务,有返回值,一般又来执行Callable
  * void shutdown():关闭连接池
  * Executors:工具类、线程池的工厂类,用于创建并返回不同类型的线程池

# 线程理解

线程是调度CPU的最小单元，也叫轻量级进程LWP

**两种线程模型**

1. 用户级线程(ULT)
2. 内核级线程(KLT)

```
用户线程(ULT):用户程序实现,不依赖操作系统核心,应用提供创建、同步、调度和管理线程的函数来控制用户线程。不需要用户态/核心态切换,速度快。内核对ULT无感知,线程阻塞则进程(包括它的所有线程)阻塞。

内核线程(KLT):系统内核管理线程(KLT),内核保存线程的状态和上下文信息,线程阻塞不会引起进程阻塞。在多处理器系统上,多线程在多处理器上并行运行。线程的创建、调度和管理由内核完成,效率比UT要慢,比进程操作快。

线程交给APP管理的话叫做用户线程，交给操作系统管理的话叫做内核线程

JVM虚拟机使用线程模型：KLT
```

![image-20220329232328890](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232328890.png)

![image-20220329232332164](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232332164.png)

![image-20220329232334623](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232334623.png)



# 线程池的意义

​	线程是稀缺资源,它的创建与销毁是一个相对偏重且耗资源的操作,而Java线程依赖于内核线程,创建线程需要进行操作系统状态切换,为避免资源过度消耗需要设法重用线程执行多个任务。线程池就是一个线程缓存,负责对线程进行统一分配、调优与监控。

**什么时候使用线程池?**

* 单个任务处理时间比较短

* 需要处理的任务数量很大

  

**线程池优势**

* 重用存在的线程,减少线程创建,消亡的开销,提高性能
* 提高响应速度。当任务到达时,任务可以不需要的等到线程创建就能立即执行。
* 提高线程的可管理性,可统一分配,调优和监控。

# 线程池五种状态

**Running**
	能接受新任务以及处理已添加的任务

**Shutdown**
	不接受新任务,**可以处理已经添加的任务**

**Stop**
	不接受新任务,不处理己经添加的任务,并且**中断**正在处理的任务

**Tidying**
	所有的任务已经终止,CTL记录的”任务数量”为0,CTL负责记录线程池的运行状态与活动线程数量

**Terminated**
	线程池彻底终止,则线程池转变为 terminated状态

![](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232337790.png)

**用Integer纪录线程池生命状态**

```
用高3位记录线程池生命状态
用低29位记录当前工作线程数
```

![image-20220329232401810](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232401810.png)

# 自定义线程池-参数设计分析

1. 核心线程数(corePoolSize)
   核心线程数的设计需要依据任务的处理时间和每秒产生的任务数量来确定例妙如执行个任务需要0.1秒系统百分之80的时可每秒都会产生100个任务那么要想在1秒内处理完这100个任务就需要10个线程此时我们就可以设计核心线程数为10,当然实际情况不可能这么平均,所以我们般按照8020原则设计即可,既按照百分之80的情况设计核心线程数剩下的百分之20可以利用最大线程数处理

2. 任务队列长度(workqueue)
   任务队列长度一般设计为核心线程数/单个任务执行时间*2即可;例如上面的场景中核心线程数设计为10单个任务执行时间为0.1秒则队列长度可以设计为200

3. 最大线程数( maximumPoolSize)
   最大线程数的设计除了需要参照核心线程数的条件外还需要参照系统毎秒产生的最大任务数决定:例如:上述环境中如果系统毎秒最大产生的任务是1000个那么最大线程数=(最大任务数任务队列长度*单个任务执行时间既最大线程数=(1000-200)0.1=80个;

   # 自定义线程池-实现步骤

   1. 编写任务类( My Task)实现 Runnable接口
   2. 编写线程类( Myworker)用于执行任务需要持有所有任务
   3. 编写线程池类( My Threadpool,包含提交任务执行任务的能力
   4. 编写测试类( My Test)创建线程池对象提交多个任务测试

   

   # Java内置线程池ExecutorService介绍

   ExecutorService接口是java内置的线程池接口,通过学习接口中的方法,可以快速的掌握java内置线程池的基本使用

   常用方法:

    void shutdown()  启动一次顺序关闭，执行以前提交的任务，但不接受新任务。 

    List<Runnable> shutdownNow() 停止所有正在执行的任务，暂停处理正在等待的任务，并返回等待执行的任务列表。 

   <T> Future<T> submit(Callable<T> task)  执行带返回值的任务，返回一个Future对象。 

    Future<?> submit(Runnable task) 执行 Runnable 任务，并返回一个表示该任务的 Future。 

   <T> Future<T> submit(Runnable task, T result)  执行 Runnable 任务，并返回一个表示该任务的 Future。 

# Java内置线程池ExecutorService获取

获取ExecutorService可以利用JDK中的Executors 类中的静态方法,常用获取方式如下:

static ExecutorService newCachedThreadPool() 创建一个默认的线程池对象,里面的线程可重用,且在第一次使用时才创建 

static ExecutorService newCachedThreadPool(ThreadFactory threadFactory)

​     线程池中的所有线程都使用ThreadFactory来创建,这样的线程无需手动启动,自动执行; 

static ExecutorService newFixedThreadPool(int nThreads)  创建一个可重用固定线程数的线程池 

static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory)

​     创建一个可重用固定线程数的线程池且线程池中的所有线程都使用ThreadFactory来创建。 

static ExecutorService newSingleThreadExecutor() 

​     创建一个使用单个 worker 线程的 Executor，以无界队列方式来运行该线程。 

static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) 

​     创建一个使用单个 worker 线程的 Executor，且线程池中的所有线程都使用ThreadFactory来创建。 

![image-20220329232407879](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232407879.png)

![image-20220329232410652](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232410652.png)

# Java内置线程池ScheduledExecutorService

​	ScheduledExecutorService是ExecutorService的子接口,具备了延迟运行或定期执行任务的能力,

常用获取方式如下:

```JAVA
static ScheduledExecutorService newScheduledThreadPool(int corePoolSize)

创建一个可重用固定线程数的线程池且允许延迟运行或定期执行任务;

static ScheduledExecutorService newScheduledThreadPool(int corePoolSize, ThreadFactory threadFactory)

创建一个可重用固定线程数的线程池且线程池中的所有线程都使用ThreadFactory来创建,且允许延迟运行或定期执行任务; 

static ScheduledExecutorService newSingleThreadScheduledExecutor() 

创建一个单线程执行程序，它允许在给定延迟后运行命令或者定期地执行。

static ScheduledExecutorService newSingleThreadScheduledExecutor(ThreadFactory threadFactory) 

创建一个单线程执行程序，它可安排在给定延迟后运行命令或者定期地执行。 
```

```java
ScheduledExecutorService常用方法如下:
<V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit) 
延迟时间单位是unit,数量是delay的时间后执行callable。 
    
 ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit) 
延迟时间单位是unit,数量是delay的时间后执行command。  
    
 //从任务开始就计时
 ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit) 
延迟时间单位是unit,数量是initialDelay的时间后,每间隔period时间重复执行一次command。 
    
 //从任务结束才计时
 ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit) 
创建并执行一个在给定初始延迟后首次启用的定期操作，随后，在每一次执行终止和下一次执行开始之间都存在给定的延迟。 

```

# Java内置线程池异步计算结果(Future)

java内置线程池使用时,没有考虑线程计算的结果,但开发中,我们有时需要利用线程进行一些计算,然后获取这些计算的结果,而java中的Future接口就是专门用于描述异步计算结果的,我们可以通过Future 对象获取线程计算的结果;

**与callable对接，因为callable可以有返回值而runnable没有**

Future 的常用方法如下:

```java
boolean cancel(boolean mayInterruptIfRunning) 

     试图取消对此任务的执行。 

 V get()

     如有必要，等待计算完成，然后获取其结果。 

 V get(long timeout, TimeUnit unit) 

     如有必要，最多等待为使计算完成所给定的时间之后，获取其结果（如果结果可用）。 

 boolean isCancelled() 

     如果在任务正常完成前将其取消，则返回 true。 

 boolean isDone() 

     如果任务已完成，则返回 true。 
```

