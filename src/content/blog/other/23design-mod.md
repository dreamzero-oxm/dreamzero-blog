---
title: 23种设计模式
description: 23种设计模式
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - 设计模式
updated: 2022-07-28
comments: false
---
# 23种设计模式

## 1. 单例模式

概念：
　　java中单例模式是一种常见的设计模式，单例模式的写法有好几种，这里主要介绍三种：懒汉式单例、饿汉式单例、登记式单例。
　　单例模式有以下特点：
　　1、单例类只能有一个实例。
　　2、单例类必须自己创建自己的唯一实例。
　　3、单例类必须给所有其他对象提供这一实例。
　　单例模式确保某个类只有一个实例，而且自行实例化并向整个系统提供这个实例。在计算机系统中，线程池、缓存、日志对象、对话框、打印机、显卡的驱动程序对象常被设计成单例。这些应用都或多或少具有资源管理器的功能。每台计算机可以有若干个打印机，但只能有一个Printer Spooler，以避免两个打印作业同时输出到打印机中。每台计算机可以有若干通信端口，系统应当集中管理这些通信端口，以避免一个通信端口同时被两个请求同时调用。总之，选择单例模式就是为了避免不一致状态，避免政出多头。

```
 单例模式便是创建型设计模式的一种。

​ 单例的可以分为三个主要的步骤来实现：

​ 私有化静态变量

​ 私有化构造

​ 创建一个public方法，供外界调用
```

### 饿汉式

```java
public class Hungry {

    private Hungry() {}

    private static Hungry hungry = new Hungry();

    public static Hungry getInstance() {
        return hungry;
    }
}
```

 hungry 为 **static** 的关系，在类加载过程中就会执行。由此带来的好处是Java的类加载机制本身为我们保证了实例化过程的线程安全性（没有线程安全的问题）。

 **缺点是：不管我们是否使用这个类，它都会在加载时实例化，占用我们的空间。**



### 懒汉式

```java
public class Lazy {

    private static Lazy lazy = null;

    private Lazy() {}

    public static Lazy getInstance() {
        if(lazy == null) {
            lazy = new Lazy();
        }

        return lazy;
    }
}
```

 懒汉模式的好处就在于当我们用到的时候才会去实例化。

 缺点就是：单例时为了确保我们的系统中只存在一个实例，上述的代码在单线程中是能保证的，但是在多线程中就不能保证了。

 下边我们测试一下多线程下的单例：

```java
public class Lazy {

    private static Lazy lazy = null;

    private Lazy() {
        System.out.println(Thread.currentThread().getName() + " is init !!!");
    }

    public static Lazy getInstance() {
        if(lazy == null) {      // ------------1
            lazy = new Lazy();   // ------------2
        }

        return lazy;
    }


    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                Lazy.getInstance();
            }).start();
        }
    }
}
```

```
Thread-0 is init !!!
Thread-2 is init !!!
Thread-1 is init !!!
```

**原因解释：**

 假设现在有两个线程A和B,首先A线程调用` getInstance `方法，当执行到语句1时会判断对象是否为空，由于该类还没被实例化，所以条件成立，遍进入到花括号中准备执行语句2，正如前面所说线程的切换是随机，当正准备执行语句2时，线程A突然停在这里了，CPU切换到线程B去执行。当线程B执行这个方法时，也会判断语句1的条件是否成立，由于A线程停在了语句1和2之间，实例还未创建，所以条件成立，也会进入到花括号中，注意此时线程B并未停止，而是顺利的执行语句2，创建了一个实例，并返回。然后线程B又切换回了线程A，别忘了，这时，线程A还停在语句1和2之间，切换回它的时候就又继续执行下面的代码，也就是执行语句2，创建了一个实例，并返回。这样，两个对象就被创建出来了，我们的单例模式也就失效了。

 **解决：**

 给 `getInstance `这个方法加把锁：


```JAVA
public static synchronized Lazy getInstance() {
    if(lazy == null) {
        lazy = new Lazy();
    }

    return lazy;
}
```

**带来的问题**

 synchronized锁住了整个方法，降低了执行了效率。

### 双重检查锁

针对上边出现的问题，我们修改一下锁的范围，将同步方法改为**同步代码块**

```JAVA
public class Lazy {

    private static Lazy lazy = null;

    private Lazy() {
        System.out.println(Thread.currentThread().getName() + " is init !!!");
    }

    public static Lazy getInstance() {
        if(lazy == null) {     // -------1
            synchronized (Lazy.class){  // -------2
                lazy = new Lazy();   // -------3
            }
        }

        return lazy;
    }
}
```

上边的代码会出现什么问题呢？

 如果有两个线程A、B调用 getInstance 方法。假设A先调用，当A调用方法时，会执行语句1进行条件判断，由于对象尚未创建，所以条件成立，正准备执行语句2来获取同步锁。我们上面也分析过了，线程的切换是随机的，还未执行语句2时，线程A突然停这了，切换到线程B执行。当线程B调用 getInstance 方法时也会执行语句1进行条件的判断，由于这时实例还未创建，所以条件成立，注意这时线程B还是没有停，又继续执行了语句2和3，即获取了同步锁并创建了Singleton对象。这时线程B切换回A，由于A此时还停在语句1和2之间，切回A时，就又继续执行语句2和3，即获取同步锁并创建了Singleton对象，这样两个对象就被创建出来了，synchronized 也失去了意义。

 **解决：**

 在步骤2和步骤3中间**在加一个空判断**

```JAVA
public class Lazy {

    private static Lazy lazy = null;

    private Lazy() {
        System.out.println(Thread.currentThread().getName() + " is init !!!");
    }

    public static Lazy getInstance() {
        if(lazy == null) {
            synchronized (Lazy.class){
                if(lazy == null) {
                    lazy = new Lazy();
                }
            }
        }

        return lazy;
    }
}
```

 代码到了这一步，即解决了**多线程下重复实例化**的问题，也提高了代码的执行效率，同时也是**懒加载**，只有使用到的时候才会实例化。

 **现在还存在什么问题呢？？？**

 我们先来了解一下java虚拟机在创建对象的时候，会具体做哪些事情呢？

在栈内创建 lazy 变量，在堆内存中开辟出一块空间用于存放Lazy实例对象，该空间会得到一个随机地址，假设为`0x0001`；

对 **Lazy 对象**进行初始化；

将 **lazy 变量** 指向该对象，也就是将该对象的地址`0x0001`赋值给 **lazy变量**，此时lazy就不为null了；

 **还有就是程序的运行过程中实际上就是CPU在执行一条条的指令，有的时候CPU为了提高执行效率，会将指令的顺序打乱，但是不会影响到程序的运行结果，也就是所谓的指令重排序。**

 了解了以上这些，我们再来看一下上边的代码会有什么问题呢？

 假设现在有两个线程A、B，CPU先切换到线程A，当执行上述创建对象语句时，假设是以132的顺序执行，当线程A执行完3时（执行完第3步后 lazy 就不为null了），突然停住了，CPU切换到了线程B去调用 `getInstance `方法，由于 lazy 此时不为null，就直接返回了**lazy**，但此时步骤2是还没执行的，返回的对象还是未初始化的，这样程序也就出问题了。

 **解决：**

这个时候就要用到我们的 volatile 了，volatile可以避免上述出现的指令重排序问题。

现在来看一下完整的`DCL`代码（Double Check Lock）

```JAVA
package com.zzp.design.singleton;

public class Lazy {

    private static volatile Lazy lazy = null;

    private Lazy() {
        System.out.println(Thread.currentThread().getName() + " is init !!!");
    }

    public static Lazy getInstance() {
        if(lazy == null) {
            synchronized (Lazy.class){
                if(lazy == null) {
                    lazy = new Lazy();
                }
            }
        }

        return lazy;
    }
}
```

**存在的问题：**

 如果说我们只是简单的使用的话，到这里已经是可以使用了，但是这还不是最安全的。为什么这么说呢？？？ 因为java还有一个反射机制，它可以不管你的构造是否是私有的，都能拿到你的构造创建对象。

```JAVA
public static void main(String[] args) throws Exception {
    
    Constructor<Lazy> declaredConstructor = Lazy.class.getDeclaredConstructor(null);
    declaredConstructor.setAccessible(true);  //设置为true，就能操作private修饰的变量或者是方法

    Lazy lazy1 = declaredConstructor.newInstance();
    Lazy lazy2 = declaredConstructor.newInstance();

    System.out.println(lazy1);
    System.out.println(lazy2);
}
```

```JAVA
com.zzp.design.singleton.Lazy@135fbaa4
com.zzp.design.singleton.Lazy@45ee12a7
```

**我们通过反射创建的实例还是无法保证是唯一的**

```JAVA
package com.zzp.design.singleton;

import java.lang.reflect.Constructor;

public class Lazy {

    private static volatile Lazy lazy = null;

    private static boolean flag = false;
    private Lazy() {
        if(!flag) {
            flag = true;
        }else{
            throw new RuntimeException("请不要试着用反射破坏单例！！！！");
        }
    }

    public static Lazy getInstance() {
        if(lazy == null) {
            synchronized (Lazy.class){
                if(lazy == null) {
                    lazy = new Lazy();
                }
            }
        }

        return lazy;
    }

    public static void main(String[] args) throws Exception {
        Constructor<Lazy> declaredConstructor = Lazy.class.getDeclaredConstructor(null);
        declaredConstructor.setAccessible(true); //设置为true，就能操作private修饰的变量或者是方法

        Lazy lazy1 = declaredConstructor.newInstance();
        Lazy lazy2 = declaredConstructor.newInstance();

        System.out.println(lazy1);
        System.out.println(lazy2);
    }
}
```

```java
Exception in thread "main" java.lang.reflect.InvocationTargetException
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at com.zzp.design.singleton.Lazy.main(Lazy.java:36)
Caused by: java.lang.RuntimeException: 请不要试着用反射破坏单例！！！！
	at com.zzp.design.singleton.Lazy.<init>(Lazy.java:14)
	... 5 more
```

### 静态内部类实现单例

```java
//静态内部类实现单例
public class Honner {

    // 只有调用该静态内部类时才会创建该对象
    public static class InnerClass {
        private static final Honner honner = new Honner();
    }

    private Honner () {
    }

    public static Honner getInstance() {
        return InnerClass.honner;
    }
}
```

 在我们的**Honner**类中创建一个**InnerClass**的静态内部类，在静态内部类中创建对象的实例。

 **由于JVM的特性，只有在使用到静态内部类的时候，才会实例化该对象，实现了延迟加载，又避免了多线程下线程不安全的问题。**

### 使用枚举实现单例

```java
public enum User {
    user;  //这个user就相当于创建User对象的对象实例，也就是不需要创建对象，直接拿这个值就行
    private String userNm;

    public String getUserNm() {
        return userNm;
    }

    public void setUserNm(String userNm) {
        this.userNm = userNm;
    }
}

class test1{

    public static void main(String[] args) {
        User user1 = User.user; 
    }
}
```

这样我们就能直接拿到枚举创建的单例。

 是因为枚举类的**构造方法是私有的**，你是无法调用到的并且你也无法通过反射来创建该实例，这也是枚举的独特之处。



枚举是不让我们通过反射来创建对象，所以是安全的。

现在我们通过反射来验证一下枚举到底能不能通过反射创建对象呢？

```java
public static void main(String[] args) throws Exception {
    Constructor<User> declaredConstructor = User.class.getDeclaredConstructor(null);
    declaredConstructor.setAccessible(true);

    User user = declaredConstructor.newInstance();

    System.out.println(user);
}
```

![image-20210802140047124](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802140047124.png)

![image-20210802140101675](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802140101675.png)

在`newInstance`中有这么一句话，如果这个类是枚举的话就抛出异常

## 2.工厂模式

### 2.1工厂模式定义

```
工厂模式（Factory Pattern）是 Java 中最常用的设计模式之一。这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。
在工厂模式中，我们在创建对象时不会对客户端暴露创建逻辑，并且是通过使用一个共同的接口来指向新创建的对象。
```

```
工厂顾名思义就是创建产品，根据产品是具体产品还是具体工厂可分为简单工厂模式和工厂方法模式，根据工厂的抽象程度可分为工厂方法模式和抽象工厂模式。该模式用于封装和管理对象的创建，是一种创建型模式。本文从一个具体的例子逐步深入分析，来体会三种工厂模式的应用场景和利弊。
```

### 2.2 简单工厂模式

![image-20210802152902897](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802152902897.png)

```java
public interface Phone {
    void make();
}
```

```java
public class MiPhone implements Phone {
    public MiPhone() {
        this.make();
    }
    @Override
    public void make() {
        // TODO Auto-generated method stub
        System.out.println("make xiaomi phone!");
    }
}
```

```java
public class IPhone implements Phone {
    public IPhone() {
        this.make();
    }
    @Override
    public void make() {
        // TODO Auto-generated method stub
        System.out.println("make iphone!");
    }
}
```

```java
public class PhoneFactory {
    public Phone makePhone(String phoneType) {
        if(phoneType.equalsIgnoreCase("MiPhone")){
            return new MiPhone();
        }
        else if(phoneType.equalsIgnoreCase("iPhone")) {
            return new IPhone();
        }
        return null;
    }
}
```

```java
public class Demo {
   public static void main(String[] arg) {
       PhoneFactory factory = new PhoneFactory();
       Phone miPhone = factory.makePhone("MiPhone");            // make xiaomi phone!
       IPhone iPhone = (IPhone)factory.makePhone("iPhone");    // make iphone!
   }
}
```

### 2.3工厂方法模式(Factory Method)

和简单工厂模式中工厂负责生产所有产品相比，工厂方法模式**将生成具体产品的任务分发给具体的产品工厂**，其`UML`类图如下：

![image-20210802153453153](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802153453153.png)

也就是定义一个抽象工厂，其定义了产品的生产接口，但不负责具体的产品，将生产任务交给不同的派生类工厂。这样不用通过指定类型来创建对象了。

接下来继续使用生产手机的例子来讲解该模式。

其中和产品相关的`Phone`类、`MiPhone`类和`IPhone`类的定义不变。

```JAVA
public interface AbstractFactory {
    Phone makePhone();
}
```

```JAVA
public class XiaoMiFactory implements AbstractFactory{
    @Override
    public Phone makePhone() {
        return new MiPhone();
    }
}
```

```JAVA
public class AppleFactory implements AbstractFactory {
    @Override
    public Phone makePhone() {
        return new IPhone();
    }
}
```

```JAVA
public class Demo {
    public static void main(String[] arg) {
        AbstractFactory miFactory = new XiaoMiFactory();
        AbstractFactory appleFactory = new AppleFactory();
        miFactory.makePhone();            // make xiaomi phone!
        appleFactory.makePhone();        // make iphone!
    }
}
```

**总结：**

```
简单工厂和工厂方法模式的不同在于前者生成产生产品的行为封装在一个方法中，根据参数的类型进行实例化，同时不存在抽象接口。而后者则增加了抽象工厂，通过实现不同的工厂方法来创建不同的产品，一个方法通常对应一个产品，这种方式相较于前者扩展性更高，在需求增加时完全符合开闭原则和依赖倒置原则
```

### 2.4抽象工厂模式(Abstract Factory)

​	上面两种模式不管工厂怎么拆分抽象，都只是针对一类产品Phone（`AbstractProduct`），如果要生成另一种产品PC，应该怎么表示呢？

​	最简单的方式是把2中介绍的工厂方法模式完全复制一份，不过这次生产的是PC。但同时也就意味着我们要完全复制和修改Phone生产管理的所有代码，显然这是一个笨办法，并不利于扩展和维护。

​	抽象工厂模式通过在`AbstarctFactory`中增加创建产品的接口，并在具体子工厂中实现新加产品的创建，当然前提是子工厂支持生产该产品。否则继承的这个接口可以什么也不干。


![image-20210802155030321](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802155030321.png)

从上面类图结构中可以清楚的看到如何在工厂方法模式中通过增加新产品接口来实现产品的增加的。

接下来我们继续通过小米和苹果产品生产的例子来解释该模式。

为了弄清楚上面的结构，我们使用具体的产品和工厂来表示上面的`UML`类图，能更加清晰的看出模式是如何演变的：

![image-20210802155117148](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802155117148.png)

```JAVA
public interface PC {
    void make();
}
```

```JAVA
public class MiPC implements PC {
    public MiPC() {
        this.make();
    }
    @Override
    public void make() {
        // TODO Auto-generated method stub
        System.out.println("make xiaomi PC!");
    }
}
```

```JAVA
public class MAC implements PC {
    public MAC() {
        this.make();
    }
    @Override
    public void make() {
        // TODO Auto-generated method stub
        System.out.println("make MAC!");
    }
}
```

```JAVA
public interface AbstractFactory {
    Phone makePhone();
    PC makePC();
}
```

```JAVA
public class XiaoMiFactory implements AbstractFactory{
    @Override
    public Phone makePhone() {
        return new MiPhone();
    }
    @Override
    public PC makePC() {
        return new MiPC();
    }
}
```

```JAVA
public class AppleFactory implements AbstractFactory {
    @Override
    public Phone makePhone() {
        return new IPhone();
    }
    @Override
    public PC makePC() {
        return new MAC();
    }
}
```

```JAVA
public class Demo {
    public static void main(String[] arg) {
        AbstractFactory miFactory = new XiaoMiFactory();
        AbstractFactory appleFactory = new AppleFactory();
        miFactory.makePhone();            // make xiaomi phone!
        miFactory.makePC();                // make xiaomi PC!
        appleFactory.makePhone();        // make iphone!
        appleFactory.makePC();            // make MAC!
    }
}
```

**总结**

抽象工厂模式是工厂方法模式的升级版，后者面向单个产品，而前者面向的的是一个产品族。根据官方定义：为创建一组相关/互相依赖的对象提供一个接口而无需指定它们的具体类。
比如一个汽车工厂要生成骑车，而每种汽车都有车门、车轮胎等一系列产品，这意味着每增加一款汽车就需要增加一个新的工厂来提供新产品的实现。这时候就可以使用抽象工厂模式来进行设计。抽象工厂模式适用于一系列产品族。

## 3.建造者模式

### **建造者模式的定义**

建造者模式（Builder Pattern）也叫做生成器模式，其定义如下： Separate the construction of a complex object from its representation so that the same construction process can create different representations.**（将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。）**
**类型：**创建类模式



建造者模式(Builder Pattern)又叫生成器模式，是一种对象构建模式。它可以将复杂对象的建造过程抽象出来(抽象类别)，使这个抽象过程的不同实现方法可以构造出不同表现(属性)的对象。.

建造者模式是一步一步创建一个复杂的对象，它允许用户只通过指定复杂对象的类型和内容就可以构建它们，用户不需要知道内部的具体构建细节。


**建造者的通用类图如下：**

![image-20210802223648494](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210802223648494.png)

**在建造者模式中，有四个角色：**

* `Product`产品类：通常是实现了**模板方法模式**，也就是**有模板方法和基本方法**
* `Builder`抽象建造者：**规范产品的组建**，一般是由子类实现。**（抽象类或者interface接口）**
* `ConcreteBuilder`具体建造者：实现抽象类定义的所有方法，并且返回一个组建好的对象。**（实现抽象类或者interface接口）**
* `Director`导演类：负责安排已有模块的顺序，然后告诉Builder开始建造**（指导建造者建造“不同”的东西）**

**下面是一个通用建造者模式的简单例子：**

```java
// 电脑实体类，组装电脑需要 CPU 硬盘等
public class Computer {

    private String mCPU;
    private String mMemory;
    private String mHD;

    public void setCPU(String CPU) {
        this.mCPU = CPU;
    }

    public void setMemory(String memory) {
        this.mMemory = memory;
    }

    public void setHD(String HD) {
        this.mHD = HD;
    }

}
```

```java
// 抽象建造者
public abstract class BaseBuilder {

    public abstract void buildCPU(String cpu);//组装CPU

    public abstract void buildMemory(String memory);//组装内存

    public abstract void buildHD(String hd);//组装硬盘

    public abstract Computer create();//返回组装好的电脑

}
```

```java
// 具体建造者
public class ComputerBuilder extends BaseBuilder {

    private Computer computer = new Computer();

    @Override
    public void buildCPU(String cpu) {
        computer.setCPU(cpu);
    }

    @Override
    public void buildMemory(String memory) {
        computer.setMemory(memory);
    }

    @Override
    public void buildHD(String hd) {
        computer.setHD(hd);
    }

    @Override
    public Computer create() {
        return computer;
    }
}
```

```java
/**
 * 导演类 相当于封装了建造者 可以有多个
 */
public class Director {

    private BaseBuilder builder = new ComputerBuilder();


    public Computer getComputer() {
        builder.buildCPU("i9 CPU");
        builder.buildMemory("32G");
        builder.buildHD("500G SSD");
        return builder.create();
    }

}
```

### **建造者模式的优点**

首先，建造者模式的封装性很好。使用建造者模式可以有效的封装变化，在使用建造者模式的场景中，一般产品类和建造者类是比较稳定的，因此，将主要的业务逻辑封装在导演类中对整体而言可以取得比较好的稳定性。

其次，建造者模式很容易进行扩展。如果有新的需求，通过**实现一个新的建造者类**就可以完成，基本上不用修改之前已经测试通过的代码，因此也就不会对原有功能引入风险。

### **建造者模式与工厂模式的区别**

​	我们可以看到，建造者模式与工厂模式是极为相似的，总体上，建造者模式仅仅只比工厂模式多了一个“导演类”的角色。在建造者模式的类图中，假如把这个导演类看做是最终调用的客户端，那么图中剩余的部分就可以看作是一个简单的工厂模式了。

​	与工厂模式相比，建造者模式一般用来创建**更为复杂的对象**，因为对象的创建过程更为复杂，因此将对象的创建过程独立出来组成一个新的类——导演类。也就是说，工厂模式是将对象的全部创建过程封装在工厂类中，由工厂类向客户端提供最终的产品；而建造者模式中，建造者类一般只提供产品类中各个组件的建造，而将具体建造过程交付给导演类。由导演类负责将各个组件按照特定的规则组建为产品，然后将组建好的产品交付给客户端。

### 抽象工厂模式VS建造者模式

抽象工厂模式实现对产品家族的创建，一个产品家族是这样的一系列产品：具有不同分类维度的产品组合，采用抽象工厂模式不需要关心构建过程，只关心什么产品由什么工厂生产即可。而建造者模式则是要求按照指定的蓝图建造产品，它的主要目的是通过组装零配件而产生一个新产品

### 建造者模式的应用

- 封装性：使用建造者模式可以是客户端不必知道产品内部组成的细节。
- 建造者独立，容易扩展。
- 便于控制细节风险：由于具体的建造者是独立的，因此可以对建造过程逐步细化，而不对其他的模块穿上任何影响。

### 建造者模式的使用场景

* 相同的方法，不同的执行顺序，产生不同的事件结果时，可以采用建造者模式。
* 多个部件或零件，都可以装配到一个对象中，但是产生的运行结果又不相同时，则可 以使用该模式。
* 产品类非常复杂，或者产品类中的调用顺序不同产生了不同的效能，这个时候使用建 造者模式非常合适。
* 在对象创建过程中会使用到系统中的一些其他对象，这些对象在产品对象的创建过程 中不易得到时，也可以采用建造者模式封装该对象的创建过程。

### 建造者模式的注意事项

建造者模式关注的是零件类型和装配工艺（顺序），这是它与工厂方法模式最大不同的 地方，虽然同为创建类模式，但是注重点不同。

1. 客户端(使用程序)不必知道产品内部组成的细节，将产品本身与产品的创建过程解耦，使得相同的创建过程可以创建不同的产品对象。
2. 每一个具 体建造者都相对独立，而与其他的具体建造者无关，因此可以很方便地替换具体建造者或增加新的具体建造者，用户使用不同的具体建造者即可得到不同的产品对象。
3. 可以更加精细地控制产品的创建过程。将复杂产品的创建步骤分解在不同的方法中，使得创建过程更加清晰，也更方便使用程序来控制创建过程。
4. 增加新的具 体建造者无须修改原有类库的代码，指挥者类针对抽象建造者类编程，系统扩展方便，符合“开闭原则”
5. 建造者模式所创建的产品一般具有较多的共同点，其组成部分相似，如果产品之间的差异性很大，则不适合使用建造者模式，因此其使用范围受到一定的限制。
6. 如果产品的内部变化复杂，可能会导致需要定义很多具体建造者类来实现这种变化，导致系统变得很庞大，因此在这种情况下，要考虑是否选择建造者模式。
   

### **总结**

建造者模式与工厂模式类似，他们都是建造者模式，适用的场景也很相似。一般来说，如果产品的建造**很复杂**，那么请用工厂模式；如果产品的建造**更复杂**，那么请用建造者模式。

## 4.原型模式

### 定义

**定义：**用原型实例指定创建对象的种类，并通过拷贝这些原型创建新的对象。

**类型：**创建类模式

**类图：**

![image-20210803094049577](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803094049577.png)

​	原型模式主要用于**对象的复制**，它的核心是就是类图中的原型类Prototype。Prototype类需要具备以下两个条件：

* 实现`Cloneable`接口。在java语言有一个`Cloneable`接口，它的作用只有一个，就是在运行时通知虚拟机可以安全地在实现了此接口的类上使用clone方法。在java虚拟机中，只有实现了这个接口的类才可以被拷贝，否则在运行时会抛出`CloneNotSupportedException`异常。
* 重写Object类中的clone方法。Java中，所有类的父类都是Object类，Object类中有一个clone方法，作用是返回对象的一个拷贝，但是其作用域protected类型的，一般的类无法调用，因此，Prototype类需要将clone方法的作用域修改为public类型。

​        原型模式是一种比较简单的模式，也非常容易理解，实现一个接口，重写一个方法即完成了原型模式。在实际应用中，原型模式很少单独出现。经常与其他模式混用，他的原型类Prototype也常用抽象类来替代。

**实现代码：**

```java
class Prototype implements Cloneable {
	public Prototype clone(){
		Prototype prototype = null;
		try{
			prototype = (Prototype)super.clone();
		}catch(CloneNotSupportedException e){
			e.printStackTrace();
		}
		return prototype; 
	}
}
 
class ConcretePrototype extends Prototype{
	public void show(){
		System.out.println("原型模式实现类");
	}
}
 
public class Client {
	public static void main(String[] args){
		ConcretePrototype cp = new ConcretePrototype();
		for(int i=0; i< 10; i++){
			ConcretePrototype clonecp = (ConcretePrototype)cp.clone();
			clonecp.show();
		}
	}
}
```

### **原型模式的优点及适用场景**

 使用原型模式创建对象比直接new一个对象在性能上要好的多，因为Object类的clone方法是一个本地方法，它直接操作内存中的二进制流，特别是复制大对象时，性能的差别非常明显。

   使用原型模式的另一个好处是简化对象的创建，使得创建对象就像我们在编辑文档时的复制粘贴一样简单。

   因为以上优点，所以在需要重复地创建相似对象时可以考虑使用原型模式。比如需要在一个循环体内创建对象，假如对象创建过程比较复杂或者循环次数很多的话，使用原型模式不但可以简化创建过程，而且可以使系统的整体性能提高很多。

### **原型模式的注意事项**

​	使用原型模式复制对象**不会调用类的构造方法**。因为对象的复制是通过调用Object类的clone方法来完成的，它直接在内存中复制数据，因此不会调用到类的构造方法。不但构造方法中的代码不会执行，**甚至连访问权限都对原型模式无效**。单例模式中，只要将构造方法的访问权限设置为private型，就可以实现单例。但是clone方法直接无视构造方法的权限，所以，单例模式与原型模式是冲突的，在使用时要特别注意。

### **深拷贝和浅拷贝**

#### **浅拷贝**

浅拷贝只会拷贝对象本身相关的基本类型数据，直接看示例代码：

```java
public class EasyCopyExample implements Cloneable {
    private List<String> nameList = new ArrayList<>();

    @Override
    protected EasyCopyExample clone() throws CloneNotSupportedException {
        return (EasyCopyExample) super.clone();
    }

    public void addName(String name) {
        nameList.add(name);
    }

    public void printNames() {
        for (String name : nameList) {
            System.out.println(name);
        }
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        try {
            //创建一个原始对象并添加一个名字
            EasyCopyExample originalObject = new EasyCopyExample();
            originalObject.addName("test1");

            //克隆一个新对象并添加一个名字
            EasyCopyExample cloneObject = originalObject.clone();
            cloneObject.addName("test2");

            //打印原始对象和新对象的name
            originalObject.printNames();
            System.out.println();
            cloneObject.printNames();
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }

    }
}
```

输出结果：

![image-20210803095124394](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803095124394.png)

可以看到通过clone()创建的新对象与之前的对象都打印出了相同的name, 这说明新对象与原始对象是共用`nameList`的这个成员变量的，这就是浅拷贝，拷贝之后的对象会和原始对象共用一部分数据，这样会给使用上带来困扰，因为一个变量不是静态的但却可以多个对象同时修改它的值。**在java中除了基本数据类型（int long等）和String类型，数组引用和对象引用的成员变量都不会被拷贝。**

#### **深拷贝**

##### 方法一：

为了避免上面的情况，我们就需要对具有clone方法不支持拷贝的数据的对象自行处理，将上述示例代码修改如下：

```java
public class DeepCopyExample implements Serializable {
    private List<String> nameList = new ArrayList<>();
    private String name = "张三";
    private int age = 23;

    public DeepCopyExample deepClone() throws IOException, ClassNotFoundException {
        //将对象写到流里
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(this);
        //从流里读回来
        ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
        ObjectInputStream ois = new ObjectInputStream(bis);
        return (DeepCopyExample) ois.readObject();
    }

    public void addName(String name) {
        nameList.add(name);
    }

    public void printNames() {
        for (String name : nameList) {
            System.out.println(name);
        }
        System.out.println(name);
        System.out.println(age);
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        try {
            //创建一个原始对象并添加一个名字
            DeepCopyExample originalObject = new DeepCopyExample();
            originalObject.addName("test1");

            //克隆一个新对象并添加一个名字
            DeepCopyExample cloneObject = originalObject.deepClone();
            cloneObject.addName("test2");

            //打印原始对象和新对象的name
            originalObject.printNames();
            System.out.println("-----------");
            cloneObject.printNames();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

输出结果：

![image-20210803095415283](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803095415283.png)

​	上面的代码是通过序列化和反序列化的方式实现对象的拷贝的，通过实现`Serializable`接口，对象可以写到一个流里（序列化），再从流里读回来（反序列化），便可以重建对象。可以看到输出结果中新对象保留了原始对象的基本类型数据（name和age），同时针对新对象操作List数据不会影响原始对象，这说明跟原始对象是完全隔离开了，是两个完全独立的对象。

 能够使用这种方式做的前提是，对象以及对象内部所有引用到的对象都是可序列化的，否则，就需要仔细考察那些不可序列化的对象可否设成transient，从而将之排除在复制过程之外。

  有一些对象，比如线程(Thread)对象或Socket对象，是不能简单复制或共享的。不管是使用浅度克隆还是深度克隆，只要涉及这样的间接对象，就必须把间接对象设成transient而不予复制；或者由程序自行创建出相当的同种对象。

##### 方法二：

```java
public class Prototype2 implements Cloneable{
    public ArrayList list = new ArrayList();
    @Override
    public Prototype2 clone(){
        Prototype2 prototype = null;
        try{
            prototype = (Prototype2)super.clone();
            prototype.list = (ArrayList) this.list.clone();
        }catch(CloneNotSupportedException e){
            e.printStackTrace();
        }
        return prototype;
    }

    public static void main(String[] args) {
        Prototype2 prototype2 = new Prototype2();
        prototype2.list.add(1);
        Prototype2 clone = prototype2.clone();
        clone.list.add(2);
        System.out.println(prototype2.list);
        System.out.println(clone.list);

    }
}
```

**输出：**

![image-20210803095942856](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803095942856.png)

### **原型模式的优缺点**

优点很明显就是可以绕过繁琐的构造函数，快速创建对象，且比直接new一个对象性能优良，因为是直接内存二进制流拷贝。原型模式非常适合于你想要向客户隐藏实例创建的创建过程的场景，提供客户创建未知类型对象的选择。

  原型模式最主要的缺点是每一个类都必须配备一个克隆方法。配备克隆方法需要对类的功能进行通盘考虑，这对于全新的类来说不是很难，而对于已经有的类不一定很容易，特别是当一个类引用不支持序列化的间接对象，或者引用含有循环结构的时候。


## 5.观察者模式

### **5.1定义**

观察者模式（又被称为发布-订阅（Publish/Subscribe）模式，属于行为型模式的一种，它定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态变化时，会通知所有的观察者对象，使他们能够自动更新自己。

GOF 给观察者模式如下定义：

```
定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。
```

面向对象设计的一个重要原则——单一职责原则。系统的每个对象应该将重点放在问题域中的离散抽象上。因此理想的情况下，一个对象只做一件事情。这样在开发中也就带来了诸多的好处：提供了重用性和维护性，也是进行重构的良好的基础。


**在观察者模式中有如下角色：**

* `Subject`：抽象主题（抽象被观察者），抽象主题角色把所有观察者对象保存在一个集合里，每个主题都可以有任意数量的观察者，抽象主题提供一个接口，可以增加和删除观察者对象。
* `ConcreteSubject`：具体主题（具体被观察者），该角色将有关状态存入具体观察者对象，在具体主题的内部状态发生改变时，给所有注册过的观察者发送通知。
* `Observer`：抽象观察者，是观察者者的抽象类，它定义了一个更新接口，使得在得到主题更改通知时更新自己。
* `ConcrereObserver`：具体观察者，实现抽象观察者定义的更新接口，以便在得到主题更改通知时更新自身的状态。

在 Subject 这个抽象类中，提供了上面提到的功能，而且存在一个通知方法：notify。

还可以看到Subject 和ConcreteSubject 之间可以说是使用了模板模式（这个模式真是简单普遍到一不小心就用到了）。

这样当具体目标角色的状态发生改变，按照约定则会去调用通知方法，在这个方法中则会根据目标角色中注册的观察者名单来逐个调用相应的update 方法来调整观察者的状态。

这样观察者模式就走完了一个流程。


### 5.2**观察者模式简单实现**

#### 5.2.1**抽象观察者（Observer）**

里面定义了一个更新的方法：

```java
public interface Observer {
    public void update(String message);
}
```

#### 5.2.2**具体观察者（ConcrereObserver）**

微信用户是观察者，里面实现了更新的方法：

```java
public class WeixinUser implements Observer {
    // 微信用户名
    private String name;
    public WeixinUser(String name) {
        this.name = name;
    }
    @Override
    public void update(String message) {
        System.out.println(name + "-" + message);
    }
}
```

#### 5.2.3**抽象被观察者（Subject）**

抽象主题，提供了attach、detach、notify三个方法：

```java
public interface Subject {
    /**
     * 增加订阅者
     * @param observer
     */
    public void attach(Observer observer);
    /**
     * 删除订阅者
     * @param observer
     */
    public void detach(Observer observer);
    /**
     * 通知订阅者更新消息
     */
    public void notify(String message);
}
```

#### 5.2.4**具体被观察者（ConcreteSubject）**

微信公众号是具体主题（具体被观察者），里面存储了订阅该公众号的微信用户，并实现了抽象主题中的方法：

```java
public class SubscriptionSubject implements Subject {
    //储存订阅公众号的微信用户
    private List<Observer> weixinUserlist = new ArrayList<Observer>();

    @Override
    public void attach(Observer observer) {
        weixinUserlist.add(observer);
    }

    @Override
    public void detach(Observer observer) {
        weixinUserlist.remove(observer);
    }

    @Override
    public void notify(String message) {
        for (Observer observer : weixinUserlist) {
            observer.update(message);
        }
    }
}
```

#### 5.2.5**客户端调用**

```java
public class Client {
    public static void main(String[] args) {
        SubscriptionSubject mSubscriptionSubject=new SubscriptionSubject();
        //创建微信用户
        WeixinUser user1=new WeixinUser("杨影枫");
        WeixinUser user2=new WeixinUser("月眉儿");
        WeixinUser user3=new WeixinUser("紫轩");
        //订阅公众号
        mSubscriptionSubject.attach(user1);
        mSubscriptionSubject.attach(user2);
        mSubscriptionSubject.attach(user3);
        //公众号更新发出消息给订阅的微信用户
        mSubscriptionSubject.notify("刘望舒的专栏更新了");
    }
}
```

```
杨影枫-刘望舒的专栏更新了
月眉儿-刘望舒的专栏更新了
紫轩-刘望舒的专栏更新了
```

### 5.3**使用观察者模式的场景和优缺点**

#### 5.3.1**使用场景**

- 关联行为场景，需要注意的是，关联行为是可拆分的，而不是“组合”关系。
- 事件多级触发场景。
- 跨系统的消息交换场景，如消息队列、事件总线的处理机制。

#### 5.3.2**观察者模式** 主要解决了什么问题？

```
一个对象状态改变给其他对象通知的问题，而且要考虑到易用和低耦合，保证高度的协作。
```

**如何解决**

```
使用面向对象技术，可以将这种依赖关系弱化。
```

#### 5.3.3观察者模式 何时使用？

```
一个对象（目标对象）的状态发生改变，所有的依赖对象（观察者对象）都将得到通知，进行广播通知。
```

#### 5.3.4观察者模式的优缺点

```
【优点】

① 观察者和被观察者是抽象耦合的。
② 建立一套触发机制。
```

```
【缺点】

① 如果一个被观察者对象有很多的直接和间接的观察者的话，将所有的观察者都通知到会花费很多时间。
②如果在观察者和观察目标之间有循环依赖的话，观察目标会触发它们之间进行循环调用，可能导致系统崩溃。
③ 观察者模式没有相应的机制让观察者知道所观察的目标对象是怎么发生变化的，而仅仅只是知道观察目标发生了变化

在应用观察者模式时需要考虑一下开发效率和运行效率的问题，程序中包括一个被观察者、多个观察者，开发、调试等内容会比较复杂，而且在Java中消息的通知一般是顺序执行，那么一个观察者卡顿，会影响整体的执行效率，在这种情况下，一般会采用异步实现。

```

#### 5.3.5观察者模式的使用场景

一个抽象模型有两个方面，其中一个方面依赖于另一个方面。将这些方面封装在独立的对象中使它们可以各自独立地改变和复用。

一个对象的改变将导致其他一个或多个对象也发生改变，而不知道具体有多少对象将发生改变，可以降低对象之间的耦合度。

一个对象必须通知其他对象，而并不知道这些对象是谁。

需要在系统中创建一个触发链，A对象的行为将影响B对象，B对象的行为将影响C对象……，可以使用观察者模式创建一种链式触发机制。

#### 5.3.6观察者模式的注意事项

① JAVA 中已经有了对观察者模式的支持类。
② 避免循环引用。
③ 如果顺序执行，某一观察者错误会导致系统卡壳，一般采用异步方式。

## 6.适配器模式

### 模式定义

适配器模式(Adapter Pattern) ：**将一个接口转换成客户希望的另一个接口**，适配器模式**使接口不兼容的那些类可以一起工作**，其别名为**包装器(Wrapper)**。适配器模式既可以作为类结构型模式，也可以作为对象结构型模式。

顾名思义，就是把原本不兼容的接口，通过适配，使之兼容。

举个生活中简单的例子，以前的手机内存卡可以取出来，但是想和电脑之间传输音乐、视频等资料不能直接传输，需要通过USB读卡器，然后插入USB接口就可以传输了，这个USB读卡器就相当于适配器。

你经常使用的手机或电脑充电器，也属于适配器，它将220V的交流电转换为手机可用的直流电。下面，以手机充电器为例讲解适配器模式。

**适配器模式一般分为三类：类适配器模式、对象适配器模式、接口适配器模式（缺省适配器模式）**

### 模式结构

类适配器

![image-20210803112203736](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803112203736.png)

对象适配器

![image-20210803112224430](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803112224430.png)

1. Target：目标抽象类定义客户所需接口，可以是一个抽象类或接口，也可以是具体类
2. Adapter：适配器类可以调用另一个接口，作为一个转换器，对Adaptee和Target进行适配，适配器类是适配器模式的核心，在对象适配器中，它通过继承Target并关联一个Adaptee对象使二者产生联系
3. Adaptee：适配者类即被适配的角色，它定义了一个已经存在的接口，这个接口需要适配，适配者类一般是一个具体类，包含了客户希望使用的业务方法，在某些情况下可能没有适配者类的源代码
4. Client：客户类

### **类适配器模式**

一般手机充电器输出的直流电压为5V，我们把交流电220V称为源，希望得到的直流电5V称为目标，而充电器即为适配器。

```JAVA
//源，交流电
public class AC {
    public int outputAC(){
        return 220;
    }
}
//目标接口，直流电
public interface IDC {
    public int outputDC();
}
//适配器
public class ClsAdapter extends AC implements IDC{

    @Override
    public int outputDC() {
        return outputAC()/44;  //直流电为交流电的电压值除以44
    }

    public static void main(String[] args) {
        ClsAdapter adapter = new ClsAdapter();
        System.out.println("交流电电压:"   adapter.outputAC());
        System.out.println("直流电电压:"   adapter.outputDC());
    }
}

/** 
输出结果为：
交流电电压:220
直流电电压:5
*/
```

可以看到，类适配器是通过继承源类，实现目标接口的方式实现适配的。但是，由于Java单继承的机制，这就要求目标必须是接口，有一定的局限性。(就是将这个类转化为我们能用的)

### 对象适配器模式

对象适配器，不是继承源类，而是依据关联关系，持有源类的对象，这也隐藏了源类的方法。在这里，适配器和源类的关系不是继承关系，而是**组合关系**。**（组和）**

```java
public class ObjAdapter implements IDC {
    //持有源类的对象
    private AC ac;

    public ObjAdapter(AC ac){
        this.ac = ac;
    }

    public int outputAC(){
        return ac.outputAC();
    }

    @Override
    public int outputDC() {
        return ac.outputAC()/44;
    }

    public static void main(String[] args) {
        ObjAdapter adapter = new ObjAdapter(new AC());
        System.out.println("交流电电压:"   adapter.outputAC());
        System.out.println("直流电电压:"   adapter.outputDC());
    }
}
//输出结果同上
```

### 接口适配器模式

设想，我现在的目标接口有多个方法，可以输出5V，12V，20V的电压。按照正常逻辑，设计一个适配器去实现这个接口，很显然需要实现所有的方法。但是，实际使用中，其实只需要使用其中一个方法就可以了，比如我mac电脑直流电压20V，只需要实现20V的方法就可以了。

因此，设计一个中间类去把目标接口的所有方法空实现，然后适配器类再去继承这个中间类，选择性重写我所需要的方法，岂不是更好。代码如下，

```java
//目标接口，有多个方法
public interface IDCOutput {
    public int output5V();
    public int output12V();
    public int output20V();
}
//中间类，空实现所有方法，这是一个抽象类
public abstract class DefaultAdapter implements IDCOutput {
    @Override
    public int output5V() {
        return 0;
    }

    @Override
    public int output12V() {
        return 0;
    }

    @Override
    public int output20V() {
        return 0;
    }
}
//我的mac电源适配器只需要实现20V的方法即可
public class MacAdatper extends DefaultAdapter {

    private AC ac;

    public MacAdatper(AC ac){
        this.ac = ac;
    }

    @Override
    public int output20V() {
        return ac.outputAC()/11;
    }

    public static void main(String[] args) {
        MacAdatper adatper = new MacAdatper(new AC());
        System.out.println("mac电脑电压:"   adatper.output20V());
    }
}
//输出结果：
//mac电脑电压:20
```

总结：

1. 类适配器模式，**继承**源类，实现目标接口。
2. 对象适配器模式，**持有**源类的对象，把继承关系改变为组合关系。
3. 接口适配器模式，借助中间抽象类空**实现**目标接口所有方法，适配器选择性重写。

三种模式，各有优缺点，可根据实际情况选择使用。

### 模式优缺点

**将目标类和适配者类解耦**，通过引入一个适配器类来重用现有的适配者类，而无须修改原有代码。

**增加了类的透明性和复用性**，将具体的实现封装在适配者类中，对于客户端类来说是透明的，而且提高了适配者的复用性。

**灵活性和扩展性都非常好**，通过使用配置文件，可以很方便地更换适配器，也可以在不修改原有代码的基础上增加新的适配器类，完全符合“开闭原则”。

**类适配器模式还具有如下优点：**

由于适配器类是适配者类的子类，因此可以在适配器类中置换一些适配者的方法，使得适配器的灵活性更强。

**类适配器模式的缺点如下：**

对于Java、C#等不支持多重继承的语言，一次最多只能适配一个适配者类，而且目标抽象类只能为抽象类，不能为具体类，其使用有一定的局限性，不能将一个适配者类和它的子类都适配到目标接口。

**对象适配器模式还具有如下优点：**

一个对象适配器可以把多个不同的适配者适配到同一个目标，也就是说，同一个适配器可以把适配者类和它的子类都适配到目标接口。

**对象适配器模式的缺点如下：**

与类适配器模式相比，要想置换适配者类的方法就不容易。如果一定要置换掉适配者类的一个或多个方法，就只好先做一个适配者类的子类，将适配者类的方法置换掉，然后再把适配者类的子类当做真正的适配者进行适配，实现过程较为复杂。

## 7.责任链模式

责任链模式是一种对象的行为模式。

在责任链模式里，很多对象由每一个对象对其下家的引用而连接起来形成一条链。请求在这个链上传递，直到链上的某一个对象决定处理此请求。发出这个请求的客户端并不知道链上的哪一个对象最终处理这个请求，这使系统可以在不影响客户端的情况下动态的重新组织链和分配责任。

### 7.1模式的定义与特点

**模式的定义与特点**责任链（Chain of Responsibility）模式的定义：为了避免请求发送者与多个请求处理者耦合在一起，将所有请求的处理者通过前一对象记住其下一个对象的引用而连成一条链；当有请求发生时，可将请求沿着这条链传递，直到有对象处理它为止。

注意：责任链模式也叫职责链模式。

在责任链模式中，客户只需要将请求发送到**责任链**上即可，无须关心请求的处理细节和请求的传递过程，所以责任链将请求的发送者和请求的处理者解耦了。

责任链模式是一种对象行为型模式，其主要优点如下。

* **降低了对象之间的耦合度**。该模式使得一个对象无须知道到底是哪一个对象处理其请求以及链的结构，发送者和接收者也无须拥有对方的明确信息。
* 增强了系统的**可扩展性**。可以根据需要增加新的请求处理类，满足开闭原则。
* 增强了给对象指派职责的灵活性。当工作流程发生变化，可以动态地改变链内的成员或者调动它们的次序，也可动态地新增或者删除责任。
* 责任链**简化了对象之间的连接**。每个对象只需保持一个指向其后继者的引用，不需保持其他所有处理者的引用，这避免了使用众多的 if 或者 if···else 语句。
* **责任分担**。每个类只需要**处理自己该处理的工作**，不该处理的传递给下一个对象完成，明确各类的责任范围，符合类的单一职责原则。

**其主要缺点如下。**

* 不能保证每个请求一定被处理。由于一个请求没有明确的接收者，所以不能保证它一定会被处理，该请求可能一直传到链的末端都得不到处理。
* 对比较长的职责链，请求的处理可能涉及多个处理对象，系统性能将受到一定影响。
  职责链建立的合理性要靠客户端来保证，增加了客户端的复杂性，可能会由于职责链的错误设置而导致系统出错，如可能会造成循环调用。
* 模式的结构与实现通常情况下，可以通过数据链表来实现职责链模式的数据结构。

模式的结构职责链模式主要包含以下角色。

抽象处理者（Handler）角色：定义一个处理请求的接口，包含**抽象处理方法**和一个**后继连接**。
具体处理者（Concrete Handler）角色：**实现抽象处理者的处理方法**，**判断**能否处理本次请求，如果可以处理请求则处理，否则将该请求转给它的后继者。
客户类（Client）角色：创建处理链，并向链头的具体处理者对象提交请求，**它不关心处理细节和请求的传递过程。**

![image-20210803151547735](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803151547735.png)

```java
package 责任链;

public class Test{

    public static void main(String[] args) {
        //来一张请假条
        Leave leave = new XiaoMing("xiaoming",5,"事假");
        Handler groupLeader = new GroupLeader();
        Handler managerLeader = new Manager();
        Handler bigManager = new BigManager();
        groupLeader.setNextHandler(managerLeader);
        managerLeader.setNextHandler(bigManager);

        groupLeader.submit(leave);

    }
}

//请假条接口

interface Leave{
    String getName();
    int getDay();
    String getContent();
}

class XiaoMing implements Leave{

    private String name;
    private int day;
    private String content;

    public XiaoMing(String name,int day,String content){
        this.content = content;
        this.day = day;
        this.name = name;
    }

    @Override
    public String getContent() {
        return name;
    }

    @Override
    public int getDay() {
        return day;
    }

    @Override
    public String getName() {
        return content;
    }
}

abstract class Handler{
    //类变量
    protected static final int NUM_ONE = 1;
    protected static final int NUM_THREE = 3;
    protected static final int NUM_SEVEN = 7;

    //上级领导
    private Handler nextHandler;
    //设置该领导的请假天数范围

    private int numStart;
    private int numEnd;

    //上不封顶
    public Handler(int numStart){
        this.numStart = numStart;
    }
    public Handler(int numStart,int numEnd){
        this.numStart = numStart;
        this.numEnd = numEnd;
    }

    //设置上级领导
    public void setNextHandler(Handler nextHandler){
        this.nextHandler=nextHandler;
    }

    public final  void submit(Leave leave){

        if(this.numStart == 0){

            return;
        }
        //当前领导处理,处理不了交给上级领导处理
        if(leave.getDay() >= numStart){

            this.handleLeave(leave);

            if(leave.getDay() > numEnd && this.nextHandler != null){
                this.nextHandler.submit(leave);
            }
        }


    }
    public abstract void handleLeave(Leave leave);

}

//领导实现
class GroupLeader extends Handler{

    GroupLeader(){
        super(Handler.NUM_ONE,Handler.NUM_THREE);
    }
    @Override
    public void handleLeave(Leave leave){
        System.out.println(leave.getName() + "请假" + leave.getDay() + "天," + leave.getContent() + "。");
        System.out.println("小组长审批：同意。");
    }
}

class Manager extends Handler{

    Manager(){
        super(Handler.NUM_THREE,Handler.NUM_SEVEN);
    }
    @Override
    public void handleLeave(Leave leave){
        System.out.println(leave.getName() + "请假" + leave.getDay() + "天," + leave.getContent() + "。");
        System.out.println("部门经理审批：同意。");
    }
}

class BigManager extends Handler{

    BigManager(){
        super(Handler.NUM_SEVEN);
    }
    @Override
    public void handleLeave(Leave leave){
        System.out.println(leave.getName() + "请假" + leave.getDay() + "天," + leave.getContent() + "。");
        System.out.println("董事长审批：同意。");
    }
}
```

### 7.2纯的与不纯的责任链模式

​	一个纯的责任链模式要求一个具体的处理者对象只能在2个行为中选择一个：继承责任或者把责任推给下家。**不允许出现某一个具体处理者对象在承担了一部分责任后又把责任向下传的情况。**

​	在一个纯的责任链模式里面，**一个请求必须被某一个处理者对象所接收器**；在一个不纯的责任链模式里面，一个请求可以最终不被任何接收端对象所接收。

纯的责任链模式的例子很难找到，一般看到的例子都是不纯的责任链模式的实现。


### 7.3责任链模式的实现

#### 7.3.1.链结构的由来

责任链模式并不创建出责任链。责任链的创建必须由系统的其它部分创建出来
责任链模式减低了请求的发送端和接收端之间的耦合，使多个对象有机会处理这个请求。一个链可以是一条线，一个树，也可以是一个环。链的拓扑结构可以是单连通的或多连通的，责任链模式并不指定责任链的拓扑结构。但是责任链模式要求在同一时间里，命令只可以被传给一个下家（或被处理掉），而不可以传给多于一个下家。
责任链的成员往往是一个更大结构的一部分。如果责任链的成员不存在，那么为了使用责任链模式，就必须创建它们。责任链的具体处理者对象可以是同一个具体处理者的实例
在Internet Explorer的DHTML的DOM事件处理模型里，责任链则是DOM等级结构本身。

#### 7.3.2.命令的传递

在一个责任链上传递的可能不只有一个命令，而是多个命令。这些命令可以采取抽象化层、具体化层的多态性实现方式，从而可以将命令对象于责任链上的对象之间的责任分隔开，并将命令对象与传播命令的对象分隔开。
如果责任链上的传播命令只有一个、且是固定的命令，那么这个命令不一定要对象化。

## 8.代理模式

​	代理模式是常用的java设计模式，他的特征是代理类与委托类有同样的接口，代理类主要负责为委托类预处理消息、过滤消息、把消息转发给委托类，以及事后处理消息等。代理类与委托类之间通常会存在关联关系，一个代理类的对象与一个委托类的对象关联，代理类的对象本身并不真正实现服务，而是通过调用委托类的对象的相关方法，来提供特定的服务。简单的说就是，我们在访问实际对象时，是通过代理对象来访问的，代理模式就是在访问实际对象时引入一定程度的间接性，因为这种间接性，可以附加多种用途。

### 8.1静态代理

```
静态代理：由程序员创建或特定工具自动生成源代码，也就是在编译时就已经将接口、被代理类、代理类等确定下来。在程序运行之前，代理类的.class文件就已经生成。
```

​	根据上面代理模式的类图，来写一个简单的静态代理的例子：假如一个班的同学要向老师交班费，但是都是通过班长把自己的钱转交给老师。这里，班长代理学生上交班费，班长就是学生的代理。

​	**确定创建接口具体行为**

首先，我们创建一个Person接口。这个接口就是学生（被代理类），和班长（代理类）的公共接口，他们都有上交班费的行为。这样，学生上交班费就可以让班长来代理执行。

```java
/**
 * 创建Person接口
 */
public interface Person {
    //上交班费
    void giveMoney();
}
```

​	**被代理对象实现接口，完成具体的业务逻辑**

​	Student类实现Person接口。Student可以具体实施上交班费的动作：

```java
public class Student implements Person {
    private String name;
    public Student(String name) {
        this.name = name;
    }
    
    @Override
    public void giveMoney() {
       System.out.println(name + "上交班费50元");
    }
}
```

​	**代理类实现接口，完成委托类预处理消息、过滤消息、把消息转发给委托类，以及事后处理消息等。**

`StudentsProxy`类，这个类也实现了Person接口，但是还另外持有一个学生类对象。由于实现了Person接口，同时持有一个学生对象，那么他可以代理学生类对象执行上交班费（执行`giveMoney()`方法）行为。

```java
/**
 * 学生代理类，也实现了Person接口，保存一个学生实体，这样既可以代理学生产生行为
 * @author Gonjan
 *
 */
public class StudentsProxy implements Person{
    //被代理的学生
    Student stu;
    
    public StudentsProxy(Person stu) {
        // 只代理学生对象
        if(stu.getClass() == Student.class) {
            this.stu = (Student)stu;
        }
    }
    
    //代理上交班费，调用被代理学生的上交班费行为
    public void giveMoney() {
        stu.giveMoney();
    }
}
```

```java
public class StaticProxyTest {
    public static void main(String[] args) {
        //被代理的学生张三，他的班费上交有代理对象monitor（班长）完成
        Person zhangsan = new Student("张三");
        
        //生成代理对象，并将张三传给代理对象
        Person monitor = new StudentsProxy(zhangsan);
        
        //班长代理上交班费
        monitor.giveMoney();
    }
}
```

这里并没有直接通过张三（被代理对象）来执行上交班费的行为，而是通过班长（代理对象）来代理执行了，这就是代理模式。

代理模式最主要的就是有一个公共接口（Person），一个具体的类（Student），一个代理类（`StudentsProxy`），代理类持有具体类的实例，代为执行具体类实例方法。上面说到，代理模式就是在访问实际对象时引入一定程度的间接性，因为这种间接性，可以附加多种用途。这里的间接性就是指不直接调用实际对象的方法，那么我们在代理过程中就可以加上一些其他用途。就这个例子来说，加入班长在帮张三上交班费之前想要先反映一下张三最近学习有很大进步，通过代理模式很轻松就能办到：


只需要在代理类中帮张三上交班费之前，执行其他操作就可以了。这种操作，也是使用代理模式的一个很大的优点。最直白的就是在Spring中的面向切面编程（AOP），我们能在一个切点之前执行一些操作，在一个切点之后执行一些操作，这个切点就是一个个方法。这些方法所在类肯定就是被代理了，在代理过程中切入了一些其他操作。


### 8.2动态代理

代理类在程序运行时创建的代理方式被成为动态代理。

​	我们上面静态代理的例子中，代理类(`studentProxy`)是自己定义好的，在程序运行之前就已经编译完成。然而动态代理，代理类并不是在Java代码中定义的，而是在运行时根据我们在Java代码中的“指示”动态生成的。相比于静态代理， 动态代理的优势在于可以很方便的对代理类的函数进行统一的处理，而不用修改每个代理类中的方法。 比如说，想要在每个代理的方法前都加上一个处理方法：

    public void giveMoney() {
        //调用被代理方法前加入处理方法
        beforeMethod();
        stu.giveMoney();
    }
​	这里只有一个`giveMoney`方法，就写一次`beforeMethod`方法，但是如果除了`giveMonney`还有很多其他的方法，那就需要写很多次`beforeMethod`方法，麻烦。所以建议使用动态代理实现。


```JAVA
/**
 * 创建Person接口
 */
public interface Person {
    //上交班费
    void giveMoney();
}
```

```java
public class Student implements Person {
    private String name;
    public Student(String name) {
        this.name = name;
    }
    
    @Override
    public void giveMoney() {
        try {
            //假设数钱花了一秒时间
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
       System.out.println(name + "上交班费50元");
    }
}
```

```java
public class MonitorUtil {
    
    private static ThreadLocal<Long> tl = new ThreadLocal<>();
    
    public static void start() {
        tl.set(System.currentTimeMillis());
    }
    
    //结束时打印耗时
    public static void finish(String methodName) {
        long finishTime = System.currentTimeMillis();
        System.out.println(methodName + "方法耗时" + (finishTime - tl.get()) + "ms");
    }
}
```

​	创建`StuInvocationHandler`类，实现`InvocationHandler`接口，这个类中持有一个被代理对象的实例target。`InvocationHandler`中有一个invoke方法，所有执行代理对象的方法都会被替换成执行invoke方法。在invoke方法中执行被代理对象target的相应方法。在代理过程中，我们在真正执行被代理对象的方法前加入自己其他处理。这也是Spring中的`AOP`实现的主要原理，这里还涉及到一个很重要的关于java反射方面的基础知识。

```java
public class StuInvocationHandler<T> implements InvocationHandler {
    //invocationHandler持有的被代理对象
    T target;
    
    public StuInvocationHandler(T target) {
       this.target = target;
    }
    
    /**
     * proxy:代表动态代理对象
     * method：代表正在执行的方法
     * args：代表调用目标方法时传入的实参
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("代理执行" +method.getName() + "方法");  
        //代理过程中插入监测方法,计算该方法耗时
        MonitorUtil.start();
        Object result = method.invoke(target, args);
        MonitorUtil.finish(method.getName());
        return result;
    }
}
```

```java
public class ProxyTest {
    public static void main(String[] args) {
        
        //创建一个实例对象，这个对象是被代理的对象
        Person zhangsan = new Student("张三");
        
        //创建一个与代理对象相关联的InvocationHandler
        InvocationHandler stuHandler = new StuInvocationHandler<Person>(zhangsan);
        
        //创建一个代理对象stuProxy来代理zhangsan，代理对象的每个执行方法都会替换执行Invocation中的invoke方法
        Person stuProxy = (Person) Proxy.newProxyInstance(Person.class.getClassLoader(), new Class<?>[]{Person.class}, stuHandler)；
 
       //代理执行上交班费的方法
        stuProxy.giveMoney();
    }
}
```

​	**动态代理的优势在于可以很方便的对代理类的函数进行统一的处理，而不用修改每个代理类中的方法。**是因为所有被代理执行的方法，都是通过在`InvocationHandler`中的invoke方法调用的，所以我们只要在invoke方法中统一处理，就可以对所有被代理的方法进行相同的操作了。例如，这里的方法计时，所有的被代理对象执行的方法都会被计时，然而我只做了很少的代码量。

​	动态代理的过程，代理对象和被代理对象的关系不像静态代理那样一目了然，清晰明了。因为动态代理的过程中，我们并没有实际看到代理类，也没有很清晰地的看到代理类的具体样子，**而且动态代理中被代理对象和代理对象是通过`InvocationHandler`来完成的代理过程的**，其中具体是怎样操作的，为什么代理对象执行的方法都会通过`InvocationHandler`中的invoke方法来执行。带着这些问题，我们就需要对java动态代理的源码进行简要的分析，弄清楚其中缘由。


#### 8.2.1InvocationHandler接口和Proxy类详解

**InvocationHandler接口是proxy代理实例的调用处理程序实现的一个接口，每一个proxy代理实例都有一个关联的调用处理程序**；**在代理实例调用方法时，方法调用被编码分派到调用处理程序的invoke方法**。

当我们通过动态代理对象调用一个方法时候，这个方法的调用就会被转发到实现InvocationHandler接口类的invoke方法来调用，看如下invoke方法：

```java
    /**
    * proxy:代理类代理的真实代理对象com.sun.proxy.$Proxy0
    * method:我们所要调用某个对象真实的方法的Method对象
    * args:指代代理对象方法传递的参数
    */
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable;
```

**Proxy**类就是用来创建一个代理对象的类，它提供了很多方法，但是我们最常用的是`newProxyInstance`方法。

```JAVA
public static Object newProxyInstance(ClassLoader loader, 
                                            Class<?>[] interfaces, 
                                            InvocationHandler h)
```

这个方法的作用就是创建一个代理类对象，它接收三个参数，我们来看下几个参数的含义：

loader：一个classloader对象，定义了由哪个classloader对象对生成的代理类进行加载
interfaces：一个interface对象数组，表示我们将要给我们的代理对象提供一组什么样的接口，如果我们提供了这样一个接口对象数组，那么也就是声明了代理类实现了这些接口，代理类就可以调用接口中声明的所有方法。
h：一个InvocationHandler对象，表示的是当动态代理对象调用方法的时候会关联到哪一个InvocationHandler对象上，并最终由其调用。

#### **8.2.2JDK动态代理**

**采用JDK代理实现：JDK动态代理实现InvocationHandler接口**

```JAVA
 
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
 
/**
 * JDK动态代理实现InvocationHandler接口
 */
public class JdkProxy implements InvocationHandler {
 
    private Object targetObject;  //需要代理的目标对象
 
 
    //定义获取代理对象的方法（将目标对象传入进行代理）
    public Object getJDKProxy(Object targetObject){
        //为目标对象target赋值
        this.targetObject = targetObject;
        //JDK动态代理只能针对实现了接口的类进行代理，newProxyInstance 函数所需参数就可看出
        Object proxyObject = Proxy.newProxyInstance(targetObject.getClass().getClassLoader(),targetObject.getClass().getInterfaces(),this);
        //返回代理对象
        return proxyObject;
    }
 
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("JDK动态代理，监听开始！");
        // 调用invoke方法，result存储该方法的返回值
        Object result = method.invoke(targetObject,args);
        System.out.println("JDK动态代理，监听结束！");
        return result;
    }
}
```

- **JDK动态代理只能对实现了接口的类生成代理，而不能针对类 ，使用的是 Java反射技术实现，生成类的过程比较高效**。

- **JDK代理**是不需要第三方库支持，只需要JDK环境就可以进行代理，**使用条件:实现InvocationHandler + 使用Proxy.newProxyInstance产生代理对象 + 被代理的对象必须要实现接口**

#### 8.2.3采用CGLIB代理实现：需要导入asm版本包，实现MethodInterceptor接口

```
需要导入CGLib的jar文件，但spring的核心已包括了CGLib的功能，可以直接导入spring的核心包。
```



```java
import com.proxy.UserManager;
import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;
 
import java.lang.reflect.Method;
 
/**
 * Cglib动态代理：
 * (需要导入两个jar包，asm-5.0.3.jar,cglib-3.1.jar 版本可自行选择)
 */
 
//Cglib动态代理，实现MethodInterceptor接口
public class CglibProxy implements MethodInterceptor {
    private Object target;//需要代理的目标对象
 
    //重写拦截方法
    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        System.out.println("Cglib动态代理，监听开始！");
        Object result = method.invoke(target,args);//方法执行参数：target 目标对象 arr参数数组
        System.out.println("Cglib动态代理，监听结束！");
        return result;
    }
 
    //定义获取代理对象的方法
    public Object getCglibProxy(Object targetObject) {
        this.target = targetObject;//为目标对象target赋值
         //1、工具类
        Enhancer enhancer = new Enhancer();
        //设置父类,因为Cglib是针对指定的类生成一个子类，所以需要指定父类
        enhancer.setSuperclass(targetObject.getClass()); //UserManagerImpl
        enhancer.setCallback(this);//设置回调
        Object result = enhancer.create();//创建并返回代理对象
        return result;
    }
}
```

- **CGLIB**是针对类实现代理，主要是**对指定的类生成一个子类，覆盖其中的方法 ，使用asm字节码框架实现，相关执行的过程比较高效，生成类的过程可以利用缓存弥补，因为是继承，所以该类或方法最好不要声明成final** 

- **CGLib必须依赖于CGLib的类库**，但是它需要类来实现任何接口代理的是指定的类生成一个子类，覆盖其中的方法，是一种继承**但是针对接口编程的环境下推荐使用JDK的代理**；

## 9.装饰器模式

### 9.1产生背景

**为什么需要装饰器模式**
某些情况，当一个类已经存在，并且可以对外提供核心功能时，但是，某个时刻，希望对这个类进行功能增强（如：增加缓存）；通常情况，我们可以修改原来的类，并增加对应的增强功能即可；

但是，这种方式违背了“开-闭”原则，需要修改原来的代码；而且不够灵活，如果有某个时刻又不想使用缓存，又需要修改原来的代码，显然，这不是一个很好的解决方案；


### 9.2概念

装饰器模式（Decorator Pattern）允许向一个现有的对象添加新的功能，同时又不改变其结构。

**本质：** 引入一个中介类，这个类实现了被装饰者相同的接口，对外假装成被装饰者，并通过引用被装饰者，在调用被装饰者前后做一些附加功能（如：缓存，参数预处理）；

装饰器模式(Decorator Pattern),也叫包装模式 Wrapper Pattern

是指在**不改变原有对象的基础之上**,将**功能**附加到**对象**上.提供了比继承更灵活的替代方法 属于**结构型模式.**

类图：

![image-20210803194340539](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210803194340539.png)

从类图分析 主要包含4种角色
**抽象组件(Component):**可以是一个接口或者抽象类:其充当被装饰类的原始对象,定义了被装饰的对象方法(既 抽出公用的方法)
**具体实现类(ConcreteComponent):** 继承/实现Component的一个具体对象,也是被装饰对象
**抽象装饰器(Decorator)：**通用的装饰ConcreteComponent的装饰器,Decorator其内部必然有个属性指向Component 抽象组件;里面一般包含的是抽象类/接口,主要是为了让其子类按照其构造形式传入一个 Component 抽象组件，这是强制的通用行为（当然，如果系统中装饰逻辑单一，并不需要实现许多装饰器，那么我们可以直接省略该类，而直接实现一个具体装饰器（ConcreteDecorator）即可）；

具体装饰器（ConcreteDecorator）：Decorator 的具体实现类，理论上，每个 ConcreteDecorator
都扩展了Component对象的一种功能；

### 9.3目的（使用场景）

**不修改原来代码的情况下，动态地给一个对象添加一些额外的职责和功能**

**本质：**动态增加功能；把需要新增加的功能预先制作成零件，在需要时“动态“的添加到对象上；

装饰器模式相比生成子类更为灵活

本质：引入一个第三方中介类，这个类实现了被装饰类的接口，并引用了被装饰对象，对外假装成被装饰对象，对内通过调用被装饰对象完成最终功能，在调用被装饰对象之前之后，可以做一些额外的功能(这也是装饰模式功能增强的地方)；

* 引入中介对象
* 中介对象实现被装饰类的接口（对外假装成被装饰类）
* 中介对象内部引用被装饰类（并把真实功能委托给被装饰对象）；
* 中介对象在调用被装饰对象前后：增加特殊功能

### 9.4实例：

```java
//饮料-抽象构件
public abstract class Beverage {
	String description = "";
	public String getDescription() {
		return description;
	}
	public abstract double cost();
}
```

```java
//浓缩咖啡-具体构件1
public class Espresso extends Beverage{
	public Espresso() {
		description = "浓缩咖啡(Espresso)";
	}
 
	@Override
	public double cost() {
		return 1.99;
	}
}
```

```java
//调料-抽象装饰器
public abstract class CondimentDecorator extends Beverage{
	@Override
	public abstract String getDescription();
}
```

```java
//糖调料-具体装饰器
public class Sugar extends CondimentDecorator{
	Beverage beverage ;
	public Sugar(Beverage beverage) {
		this.beverage = beverage;
	}
 
	@Override
	public String getDescription() {
		return beverage.getDescription()+" + 糖 ";
	}
 
	@Override
	public double cost() {
		return 0.20+beverage.cost();
	}
}
```

```java
public static void main(String[] args) {
		Beverage coffee = new Espresso();//一杯浓缩咖啡
		System.out.println(coffee.getDescription()+" : $"+coffee.cost());
		coffee = new Milk(coffee);
		System.out.println(coffee.getDescription()+" : $"+coffee.cost());
		coffee = new Sugar(coffee);
		System.out.println(coffee.getDescription()+" : $"+coffee.cost());
		//+双份糖的深焙咖啡
		coffee = new DarkRoast();
		coffee = new Sugar(new Sugar(coffee));
		System.out.println(coffee.getDescription()+" : $"+coffee.cost());
	}/* Output:
		浓缩咖啡（Espresso）: $1.99
		浓缩咖啡（Espresso） + 牛奶 : $2.29
		浓缩咖啡（Espresso） + 牛奶  + 糖 : $2.49
		深焙咖啡(DarkRoast) + 糖  + 糖  : $1.29
	 */
```

### 9.5优缺点

**优点：**
松耦合
在不修改原来代码的情况下，动态的为原类增加新功能

扩展性高
只需要增加新的装饰类，就可以对原类不断增加新功能

灵活
不需要通过继承来扩展，而且可以动态增加或去除新装饰类，从而随意对原对象增加或减少某些功能
**最核心的目的：在不修改原代码的情况下，动态的为对象增加或减少某些功能**

**缺点:**
额外引入第三方

### 9.6应用场景

扩展类的功能时
动态增加或取消某些功能时
**“与代理模式的区别”**
在学习装饰器模式时，会发现它与代理模式无论从实现结构，还是功能目的都非常接近；

装饰器模式侧重的是对功能的增强，不改变原功能；
装饰器模式使用方明确知道自己需要什么的增强功能，硬编码使用；

代理模式侧重于对原功能的改变（特别是访问权限的控制）
代理模式分为静态和动态代理，动态代理是在调用方不知情的情况下使用；

如果代理模式使用静态代理实现，而且也是侧重对功能的增强，那么他们之间没有任何区别（如：spring中通过动态代理实现缓存或日志）

因此：代理在java中，更多的应用在动态AOP上；


### 9.7现实案例

JDK中的流处理；
ByteArrayInputStream
FileInputStream
ObjectInputStream
PipedInputStream

## 10.桥接模式

### 10.1桥接模式的定义与特点

桥接（Bridge）模式的定义如下：将抽象与实现分离，使它们可以独立变化。它是用**组合关系**代替继承关系来实现，从而降低了抽象和实现这两个可变维度的耦合度。

桥接（Bridge）模式的优点是：

- 由于**抽象与实现分离**，所以扩展能力强；
- 其实现细节对客户透明。

缺点是：由于聚合关系建立在抽象层，要求开发者针对抽象化进行设计与编程，这增加了系统的理解与设计难度。

**桥接（Bridge）是用于把抽象化与实现化解耦，使得二者可以独立变化。这种类型的设计模式属于结构型模式，它通过提供抽象化和实现化之间的桥接结构，来实现二者的解耦。**

这种模式涉及到一个作为桥接的接口，使得实体类的功能独立于接口实现类。这两种类型的类可被结构化改变而互不影响。

### 10.2 什么是抽象与实现的问题

**问题：**
	这里的抽象与实现是什么意思呢？先来看一个例子：
假如你有一个几何形状Shape类，从它能扩展出两个子类：  圆形Circle和 方形Square 。 你希望对这样的类层次结构进行扩展以使其包含颜色，所以你打算创建名为红色Red和蓝色Blue的形状子类。 但是， 由于你已有两个子类， 所以总共需要创建四个类才能覆盖所有组合， 例如 蓝色圆形Blue­Circle和 红色方形Red­Square。

在层次结构中新增形状和颜色将导致代码复杂程度指数增长。 **例如添加三角形状， 你需要新增两个子类， 也就是每种颜色一个； 此后新增一种新颜色需要新增三个子类， 即每种形状一个。 照这样下去，所有组合类的数量将以几何级数增长，情况会越来越糟糕。**

**解决方案：**
问题的根本原因在于我们试图在两个独立的维度——形状与颜色上进行扩展。这在处理继承时是很常见的问题。

桥接模式 通过将继承改为组合的方式来解决这个问题。 具体来说， 就是抽取其中一个维度并使之成为独立的类层次， 这样就可以在初始类中引用这个新层次的对象， 从而使得一个类不必拥有所有的状态和行为。

根据该方法， 我们可以将颜色相关的代码抽取到拥有 红色和 蓝色两个子类的颜色类中， 然后在 形状类中**添加一个指向某一颜色对象的引用成员变量**。 现在， 形状类可以将所有与颜色相关的工作委派给连入的颜色对象。 **这样的引用就成为了 形状和 颜色之间的桥梁**。 此后， 新增颜色将不再需要修改形状的类层次， 反之亦然。

### 10.3桥接模式的结构与实现

可以将抽象化部分与实现化部分分开，取消二者的继承关系，改用组合关系。（使他们都可以进行独立的变化）

把这种多角度分类分离出来，让它们独立变化，减少它们之间耦合。

### 10.4模式的结构

桥接（Bridge）模式包含以下主要角色。

1. Abstraction（抽象类）：用于定义抽象类的接口，它一般是抽象类而不是接口，其中定义了一个 Implementor（实现类接口）类型的对象并可以维护该对象，它与 Implementor 之间具有关联关系。
2. RefinedAbstraction（提炼抽象类）：扩充由 Abstraction 定义的接口，通常情况下它不再是抽象类而是具体类，它实现了在 Abstraction 中声明的抽象业务方法，在 RefinedAbstraction 中可以调用在 Implementor 中定义的业务方法。
3. Implementor（实现类接口）：定义实现类的接口，这个接口不一定要与 Abstraction 的接口完全一致，事实上这两个接口可以完全不同，一般而言，Implementor 接口仅提供基本操作，而 Abstraction 定义的接口可能会做更多更复杂的操作。Implementor 接口对这些基本操作进行了声明，而具体实现交给其子类。通过关联关系，在 Abstraction 中不仅拥有自己的方法，还可以调用到 Implementor 中定义的方法，使用关联关系来替代继承关系。
4. ConcreteImplementor（具体实现类）：具体实现 Implementor 接口，在不同的 ConcreteImplementor 中提供基本操作的不同实现，在程序运行时，ConcreteImplementor 对象将替换其父类对象，提供给抽象类具体的业务操作方法。

![image-20210805085327067](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210805085327067.png)

### 10.5实例

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public interface ColorAPI {
    public void paint();
}
```

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public class BlueColorAPI implements ColorAPI {
    @Override
    public void paint() {
        System.out.println("画上蓝色");
    }
}
```

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public class RedColorAPI implements ColorAPI
{
    @Override
    public void paint() {
        System.out.println("画上红色");
    }
}
```

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public abstract class Shape {
    protected ColorAPI colorAPI;    //添加一个颜色的成员变量以调用ColorAPI 的方法来实现给不同的形状上色

    public void setDrawAPI(ColorAPI colorAPI) {      //注入颜色成员变量
        this.colorAPI= colorAPI;
    }
 
    public abstract void draw();        
}
```

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public class Circle extends Shape {
    @Override
    public void draw() {
        System.out.print("我是圆形");
        colorAPI.paint();
    }
}
```

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public class Rectangle extends Shape {
    @Override
    public void draw() {
        System.out.print("我是长方形");
        colorAPI.paint();
    }
}
```

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public class Client {

    public static void main(String[] args) {
        //创建一个圆形
        Shape shape = new Circle();
        //给圆形蓝色的颜料
        shape.setDrawAPI(new BlueColorAPI());
        //上色
        shape.draw();


        //创建一个长方形
        Shape shape1 = new Rectangle();
        //给长方形红色的颜料
        shape1.setDrawAPI(new RedColorAPI());
        //上色
        shape1.draw();

    }
}
```

```java'
我是圆形画上蓝色
我是长方形画上红色
```

假如现在客户让我们增了一个三角形，我们只需要新增一个三角形类就可以了，而无需把每一种颜色都增加一个，我们在客户端调用时只需按照需求来挑选即可：

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public class Triangle extends Shape {
    @Override
    public void draw() {
        System.out.println("我是三角形");
        colorAPI.paint();
    }
}
```

增加颜色也是一样，我们只需要增加一个新的颜色并实现ColorAPI的接口即可，而无需更改类的层次，例如增加一个绿色：

```java
/**
 * Created on 2020/3/18
 * Package com.design_pattern.bridge
 *
 * @author dsy
 */
public class GreenColorAPI implements ColorAPI {
    @Override
    public void paint() {
        System.out.println("画上绿色");
    }
}
```

### 10.6优缺点分析

**优点：**

* 实现抽象和实现的分离
* 桥接模式提高了系统的可扩充性，在两个变化维度中任意扩展一个维度，都不需要修改原有系统
* 桥接模式有时类似于多继承方案，但是多继承方案违背了类的单一职责原则（即一个类只有一个变化的原因），复用性比较差，而且多继承结构中类的个数非常庞大，桥接模式是比多继承方案更好的解决方法

**缺点：**

* 桥接模式的引入会增加系统的理解与设计难度，由于聚合关联关系建立在抽象层，要求开发者针对抽象进行设计与编程。
* 桥接模式要求正确识别出系统中两个独立变化的维度，因此其使用范围具有一定的局限性。
