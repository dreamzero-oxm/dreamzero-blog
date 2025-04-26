---
title: Spring中AOP应用
description: Spring配备多个数据库
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - Spring
    - AOP
updated: 2022-07-28
comments: false
---
# AOP 应用

## SpringAOP简介

面向切面编程（Aspect Oriented Programming）提供了另一种角度来思考程序的结构，通过这种方式弥补面向对象编程(Object Oriented Programming)的不足。除了类以外，AOP提供了切面，切面对关注点进行模块化，例如横切多个类型和对象的事务管理（这些关注点术语通常称作横切(crosscutting)关注点）。Spring AOP是Spring的一个重要组件，但是Spring IOC并不依赖于Spring AOP，这意味着你可以自由选择是否使用AOP，AOP提供了强大的中间件解决方案，这使得Spring IOC更加完善。我们可以通过AOP来实现日志监听，事务管理，权限控制等等。

## AOP概念

* 切面（Aspect）：一个关注点的模块化，这个关注点可能会横切多个对象。事务管理是Java应用程序中一个关于横切关注点的很好的例子。在Spring AOP中，切面可以使用通过类（基于模式（XML）的风格）或者在普通类中以@Aspect注解（AspectJ风格）来实现。
  连接点（Join point）：程序执行过程中某个特定的点，比如某方法调用的时候或者处理异常的时候。在Spring AOP中一个连接点总是代表一个方法的执行。个人理解：AOP拦截到的方法就是一个连接点。通过声明一个org.aspectj.lang.JoinPoint类型参数我们可以在通知(Advice)中获得连接点的信息。这个在稍后会给出案例。
* 通知(Advice)：在切面（Aspect）的某个特定连接点上（Join point）执行的动作。通知的类型包括"around"，"before"，"after"等等。通知的类型将在后面进行讨论。许多AOP框架，包括Spring 都是以拦截器作为通知的模型，并维护一个以连接点为中心的拦截器链。总之就是AOP对连接点的处理通过通知来执行。个人理解：Advice指当一个方法被AOP拦截到的时候要执行的代码。
* 切入点（Pointcut）：匹配连接点（Join point）的断言。通知（Advice）跟切入点表达式关联，并在与切入点匹配的任何连接点上面运行。切入点表达式如何跟连接点匹配是AOP的核心，Spring默认使用AspectJ作为切入点语法。个人理解：通过切入点的表达式来确定哪些方法要被AOP拦截，之后这些被拦截的方法会执行相对应的Advice代码。
* 引入（Introduction）：声明额外的方法或字段。Spring AOP允许你向任何被通知(Advice)对象引入一个新的接口（及其实现类）。个人理解：AOP允许在运行时动态的向代理对象实现新的接口来完成一些额外的功能并且不影响现有对象的功能。
* 目标对象（Target object）：被一个或多个切面（Aspect）所通知（Advice）的对象，也称作被通知对象。由于Spring AOP是通过运行时代理实现的，所以这个对象永远是被代理对象。个人理解：所有的对象在AOP中都会生成一个代理类，AOP整个过程都是针对代理类在进行处理。
* AOP代理（AOP proxy）：AOP框架创建的对象，用来实现切面契约（aspect contract）（包括通知方法执行等功能），在Spring中AOP可以是JDK动态代理或者是CGLIB代理。
* 织入（Weaving）：把切面（aspect）连接到其他的应用程序类型或者对象上，并创建一个被通知对象。这些可以在编译时（例如使用AspectJ编译器），类加载时和运行时完成。Spring和其他纯AOP框架一样，在运行时完成织入。个人理解：把切面跟对象关联并创建该对象的代理对象的过程。

**通知(Advice)的类型：**

* 前置通知（Before advice）：在某个连接点（Join point）之前执行的通知，但这个通知不能阻止连接点的执行（除非它抛出一个异常）。
* 返回后通知（After returning advice）：在某个连接点（Join point）正常完成后执行的通知。例如，一个方法没有抛出任何异常正常返回。
* 抛出异常后通知（After throwing advice）：在方法抛出异常后执行的通知。
* 后置通知（After（finally）advice）：当某个连接点（Join point）退出的时候执行的通知（不论是正常返回还是发生异常退出）。
* 环绕通知（Around advice）：包围一个连接点（Join point）的通知，如方法调用。这是最强大的一种通知类型。环绕通知可以在方法前后完成自定义的行为。它也会选择是否继续执行连接点或直接返回它们自己的返回值或抛出异常来结束执行。

## **定义切面**

Spring 借助AspectJ的切点表达式语言来定义Spring切面。

![image-20210807193721366](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210807193721366.png)

我们使用execution()指示器选择LoginController的test()方法。方法表达式以“*”号开始，表明我们不关心方法返回值的类型。然后，我们指定了全限定类名和方法名。对于方法参数列表，我们使用两个点好(..)表明切点要选择任意的 test()方法，无论该方法的参数是什么。

### 坑！

在IDEA2020.3.2版本中

需要使用：

```java
execution(* com.moi.controller..*.*(..))
```

正常官方来说的是：

```
execution(* com.moi.controller.*(..))
```



Audience类使用@Aspect注解进行了标注。该注解表明Audience不仅仅是一个POJO，还是一个切面。Audience类中的方法都使用注解来定义切面的具体行为。



Spring使用AspectJ注解来声明通知方法

@Before  通知方法还会在目标方法调用之前执行

@Around 通知方法会将目标方法封装起来

@AfterThrowing 通知方法会在目标方法抛出异常后调用

@AfterReturning 通知方法会在目标方法返回后调用

@After 通知方法会在目标方法返回或抛出异常后调用

```
@Component
@Aspect
public class Audience {
   
	@Before("execution(* com.lin.controller.LoginController.test(..))")
	public void before(){
	    RequestAttributes ra = RequestContextHolder.getRequestAttributes();
            ServletRequestAttributes sra = (ServletRequestAttributes) ra;
            HttpServletRequest request = sra.getRequest();  //获取request 可以从中获取参数或cookie
		System.out.println("我是切面");
	}	
}
```

