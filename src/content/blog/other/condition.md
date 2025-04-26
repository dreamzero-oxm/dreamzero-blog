---
title: Condition笔记
description: Condition
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
# Condition类

# condition 介绍及demo

　Condition是在java 1.5中才出现的，它用来替代传统的Object的wait()、notify()实现线程间的协作，相比使用Object的wait()、notify()，使用Condition的await()、signal()这种方式实现线程间协作更加安全和高效。因此通常来说比较推荐使用Condition，阻塞队列实际上是使用了Condition来模拟线程间协作。

**Condition是个接口，基本的方法就是await()和signal()方法；**

Condition依赖于Lock接口，生成一个Condition的基本代码是lock.newCondition()

**调用Condition的await()和signal()方法，都必须在lock保护之内，就是说必须在lock.lock()和lock.unlock之间才可以使用*
　　Conditon中的await()对应Object的wait()；**

Condition中的signal()对应Object的notify()；

Condition中的signalAll()对应Object的notifyAll()。

```java
package thread;
 
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
/**
 * 
 * @author zhangliang
 *
 * 2016年4月8日 下午5:48:54
 */
public class ConTest {
	
	 final Lock lock = new ReentrantLock();
	 final Condition condition = lock.newCondition();
 
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ConTest test = new ConTest();
	    Producer producer = test.new Producer();
	    Consumer consumer = test.new Consumer();
	          
	    
	    consumer.start(); 
	    producer.start();
	}
	
	 class Consumer extends Thread{
         
	        @Override
	        public void run() {
	            consume();
	        }
	          
	        private void consume() {
	           	             
	                try {
	                	   lock.lock();
	                    System.out.println("我在等一个新信号"+this.currentThread().getName());
	                    condition.await();
	                    
	                } catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} finally{
						System.out.println("拿到一个信号"+this.currentThread().getName());
	                    lock.unlock();
	                }
	            
	        }
	    }
	 
	 class Producer extends Thread{
         
	        @Override
	        public void run() {
	            produce();
	        }
	          
	        private void produce() {	             
	                try {
	                	   lock.lock();
	                       System.out.println("我拿到锁"+this.currentThread().getName());
	                        condition.signalAll();	                         
	                    System.out.println("我发出了一个信号："+this.currentThread().getName());
	                } finally{
	                    lock.unlock();
	                }
	            }
	 }
	    
}

```

**结果：**

![image-20210720172341752](http://moity-bucket.moity-soeoe.xyz/img/image-20210720172341752.png)

Condition的执行方式，是当在线程Consumer中调用await方法后，线程Consumer将释放锁，并且将自己沉睡，等待唤醒，线程Producer获取到锁后，开始做事，完毕后，调用Condition的signalall方法，唤醒线程Consumer，线程Consumer恢复执行。

以上说明Condition是一个多线程间协调通信的工具类，使得某个，或者某些线程一起等待某个条件（Condition）,只有当该条件具备( signal 或者 signalAll方法被带调用)时 ，这些等待线程才会被唤醒，从而重新争夺锁。

## **Condition实现生产者、消费者模式：**

```java
package thread;
 
import java.util.PriorityQueue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
 
public class ConTest2 {
	    private int queueSize = 10;
	    private PriorityQueue<Integer> queue = new PriorityQueue<Integer>(queueSize);
	    private Lock lock = new ReentrantLock();
	    private Condition notFull = lock.newCondition();
	    private Condition notEmpty = lock.newCondition();
	     
	    public static void main(String[] args) throws InterruptedException  {
	    	ConTest2 test = new ConTest2();
	        Producer producer = test.new Producer();
	        Consumer consumer = test.new Consumer();	          
	        producer.start();
	        consumer.start();
	        Thread.sleep(0);
	        producer.interrupt();
	        consumer.interrupt();
	    }
	      
	    class Consumer extends Thread{	          
	        @Override
	        public void run() {
	            consume();
	        }
	        volatile boolean flag=true;  
	        private void consume() {
	            while(flag){
	                lock.lock();
	                try {
	                    while(queue.isEmpty()){
	                        try {
	                            System.out.println("队列空，等待数据");
	                            notEmpty.await();
	                        } catch (InterruptedException e) {	                          
	                            flag =false;
	                        }
	                    }
	                    queue.poll();                //每次移走队首元素
	                    notFull.signal();
	                    System.out.println("从队列取走一个元素，队列剩余"+queue.size()+"个元素");
	                } finally{
	                    lock.unlock();
	                }
	            }
	        }
	    }
	      
	    class Producer extends Thread{	          
	        @Override
	        public void run() {
	            produce();
	        }
	        volatile boolean flag=true;  
	        private void produce() {
	            while(flag){
	                lock.lock();
	                try {
	                    while(queue.size() == queueSize){
	                        try {
	                            System.out.println("队列满，等待有空余空间");
	                            notFull.await();
	                        } catch (InterruptedException e) {
	                            
	                            flag =false;
	                        }
	                    }
	                    queue.offer(1);        //每次插入一个元素
	                    notEmpty.signal();
	                    System.out.println("向队列取中插入一个元素，队列剩余空间："+(queueSize-queue.size()));
	                } finally{
	                    lock.unlock();
	                }
	            }
	        }
	    }
	}

```

## **Condition接口**

condition可以通俗的理解为条件队列。当一个线程在调用了await方法以后，直到线程等待的某个条件为真的时候才会被唤醒。这种方式为线程提供了更加简单的等待/通知模式。Condition必须要配合锁一起使用，因为对共享状态变量的访问发生在多线程环境下。一个Condition的实例必须与一个Lock绑定，因此Condition一般都是作为Lock的内部实现。

await() ：造成当前线程在接到信号或被中断之前一直处于等待状态。
await(long time, TimeUnit unit) ：造成当前线程在接到信号、被中断或到达指定等待时间之前一直处于等待状态
awaitNanos(long nanosTimeout) ：造成当前线程在接到信号、被中断或到达指定等待时间之前一直处于等待状态。返回值表示剩余时间，如果在nanosTimesout之前唤醒，那么返回值 = nanosTimeout - 消耗时间，如果返回值 <= 0 ,则可以认定它已经超时了。
awaitUninterruptibly() ：造成当前线程在接到信号之前一直处于等待状态。【注意：该方法对中断不敏感】。
awaitUntil(Date deadline) ：造成当前线程在接到信号、被中断或到达指定最后期限之前一直处于等待状态。如果没有到指定时间就被通知，则返回true，否则表示到了指定时间，返回返回false。
signal() ：唤醒一个等待线程。该线程从等待方法返回前必须获得与Condition相关的锁。
signal()All ：唤醒所有等待线程。能够从等待方法返回的线程必须获得与Condition相关的锁。

## **等待队列**

Condition是AQS的内部类。每个Condition对象都包含一个队列(等待队列)。等待队列是一个FIFO的队列，在队列中的每个节点都包含了一个线程引用，该线程就是在Condition对象上等待的线程，如果一个线程调用了Condition.await()方法，那么该线程将会释放锁、构造成节点加入等待队列并进入等待状态。AQS有一个同步队列和多个等待队列，节点都是Node。等待队列的基本结构如下所示。
![image-20220329232048786](http://moity-bucket.moity-soeoe.xyz/img/image-20220329232048786.png)

等待分为首节点和尾节点。当一个线程调用Condition.await()方法，将会以当前线程构造节点，并将节点从尾部加入等待队列。新增节点就是将尾部节点指向新增的节点。节点引用更新本来就是在获取锁以后的操作，所以不需要CAS保证。同时也是线程安全的操作。

## **等待**

当线程调用了Condition的await（）方法以后。线程就作为队列中的一个节点被加入到等待队列中去了。同时会释放锁的拥有。当从await方法返回的时候。当前线程一定会获取condition相关联的锁。

如果从队列（同步队列和等待队列）的角度去看await（）方法，当调用await（）方法时，相当于同步队列的首节点（获取锁的节点）移动到Condition的等待队列中。

调用该方法的线程成功的获取锁的线程，也就是同步队列的首节点，该方法会将当前线程构造成节点并加入到等待队列中，然后释放同步状态，唤醒同步队列中的后继节点，然后当前线程会进入等待状态。

当等待队列中的节点被唤醒的时候，则唤醒节点的线程开始尝试获取同步状态。如果不是通过 其他线程调用Condition.signal()方法唤醒，而是对等待线程进行中断，则会抛出InterruptedException异常信息。

## **通知**

调用Condition的signal()方法，将会唤醒在等待队列中等待最长时间的节点（条件队列里的首节点），在唤醒节点前，会将节点移到同步队列中。当前线程加入到等待队列中如图所示：

![image-20210720173220267](http://moity-bucket.moity-soeoe.xyz/img/image-20210720173220267.png)

回到上面的demo，锁被释放后，线程Consumer开始沉睡，这个时候线程因为线程Consumer沉睡时，会唤醒AQS队列中的头结点，所所以线程Producer会开始竞争锁，并获取到，执行完后线程Producer会调用signal方法，“发出”signal信号，signal方法如下：


```java
public final void signal() {
	 if (!isHeldExclusively())
	 throw new IllegalMonitorStateException();
	 Node first = firstWaiter; //firstWaiter为condition自己维护的一个链表的头结点，
	                          //取出第一个节点后开始唤醒操作
	 if (first != null)
	 doSignal(first);
	 }

```

在调用signal()方法之前必须先判断是否获取到了锁（isHeldExclusively方法）。接着获取等待队列的首节点，将其移动到同步队列并且利用LockSupport唤醒节点中的线程。
被唤醒的线程将从await方法中的while循环中退出（ while (!isOnSyncQueue(node)) { 方法返回true，节点已经在同步队列中）。随后调用同步器的acquireQueued（）方法加入到同步状态的竞争当中去。成功获取到竞争的线程从先前调用await方法返回，此时该线程已经成功获取了锁。

```
AQS的同步队列与Condition的等待队列，两个队列的作用是不同，事实上，每个线程也仅仅会同时存在以上两个队列中的一个
```

![image-20210720173717468](http://moity-bucket.moity-soeoe.xyz/img/image-20210720173717468.png)

**注意：**

1. 线程producer调用signal方法，这个时候Condition的等待队列中只有线程Consumer一个节点，于是它被取出来，并被加入到AQS的等待队列中。 注意，这个时候，线程Consumer 并没有被唤醒。

2. Sync是AQS的抽象子类，实现可重入和互斥的大部分功能。在Sync的子类中有FairSync和NonfairSync两种代表公平锁策略和非公平锁策略。Sync lock方法留给子类去实现，NonfairSync的实现：

   ```java
    final void lock() {
               if (compareAndSetState(0, 1))
                   setExclusiveOwnerThread(Thread.currentThread());
               else
                   acquire(1);
           }
   ```

其中如果一开始获取锁成功，是直接设置当前线程。
否则执行acquire(1),也就是进入aqs等待队列。这里不展开细节。

可以这样理解，整个协作过程是靠结点在AQS的等待队列和Condition的等待队列中来回移动实现的，每个队列的意义不同，Condition作为一个条件类，很好的自己维护了一个等待信号的队列，并在适时的时候将结点加入到AQS的等待队列中来实现的唤醒操作
