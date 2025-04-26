---
title: 全局异常捕获
description: 全局异常捕获
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
# 全局异常捕获

## CommonCode

```java
package com.qg.exception;


/**
 * @author MOITY IceClean
 */

public enum  CommonCode implements ResultCode {
    /**
     * asd
     */
    EXCEPTIONCOUSTM(false,10000,"自定义异常"),
    OTHER_EXCEPTION(false,99999,"不可预测异常"),
    IO_EXCEPTION(false,20000,"IO异常");

    private Boolean success;
    private Integer code;
    private String message;

    CommonCode(Boolean success, Integer code, String message) {
        this.success = success;
        this.code = code;
        this.message = message;
    }

    @Override
    public boolean success() {
        return success;
    }

    @Override
    public int code() {
        return code;
    }

    @Override
    public String message() {
        return message;
    }

}
```

## ExceptionCatch

```java
package com.qg.exception;

import com.google.common.collect.ImmutableMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;


/**
 * @author MOITY IceClean
 */
@ControllerAdvice
@ResponseBody
public class ExceptionCatch {
    /**
     * log4j打印日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(ExceptionCatch.class);


    /**
     * 使用EXCEPTIONS存放异常类型和错误代码的映射
     */
    private static ImmutableMap<Class<? extends Throwable>, ResultCode> EXCEPTIONS;


    /**
     * 使用builder来构建一个异常类型和错误代码的异常集合
     */
    protected static ImmutableMap.Builder<Class<? extends Throwable>, ResultCode> builder = ImmutableMap.builder();

    /*
      加载异常类型，可以加载n个
     */
    static {
        builder.put(IOException.class,CommonCode.IO_EXCEPTION);
    }

    /**
     * 捕获自定义异常类型
     * @param exceptionCoustm
     * @return
     */
    @ExceptionHandler(ExceptionCoustm.class)
    public void exceptionCoustm(ExceptionCoustm exceptionCoustm){
        ResultCode resultCode = exceptionCoustm.getResultCode();
        LOGGER.info(exceptionCoustm.getMessage());
        LOGGER.error("catch exception:{}",exceptionCoustm);
        LOGGER.error("catch exception:{}",resultCode);
        exceptionCoustm.printStackTrace();
    }

    @ExceptionHandler(Exception.class)
    public void exception(Exception exception){
        LOGGER.info(exception.getMessage());
        //打印记录日志
        LOGGER.error("catch exception:{}",exception);
        exception.printStackTrace();
        if (EXCEPTIONS==null){
        //ImmutableMap创建完成，不可在更改数据
            EXCEPTIONS=builder.build();
        }

        //获取异常类型,与定义相符的存入（resultCode）多态
        ResultCode resultCode = EXCEPTIONS.get(exception.getClass());

    }

}

```

## ExceptionCoustm

```java
package com.qg.exception;

/**
 * @author MOITY IceClean
 */
public class ExceptionCoustm extends RuntimeException{

    private ResultCode resultCode;

    public ResultCode getResultCode() {
        return resultCode;
    }

    public ExceptionCoustm(ResultCode resultCode) {
//        super必须在构造的第一行，this也一样，所以两者不能同时出现
        super("错误代码:"+resultCode.code()+"错误信息:"+resultCode.message());
        this.resultCode = resultCode;

    }
}
```

## ResultCode

```java
package com.qg.exception;

/**
 * @author MOITY IceClean
 */
public interface ResultCode {
    /**
     * 操作是否成功,true为成功，false操作失败
     * @return
     */
    boolean success();

    /**
     * 操作代码
     * @return
     */
    int code();

    /**
     * 提示信息
     * @return
     */
    String message();
}

```

## 依赖(guava)

```xml
<dependency>
            <groupId>com.google.collections</groupId>
            <artifactId>google-collections</artifactId>
            <version>1.0</version>
        </dependency>
```

# SpringMvc全局异常统一处理

```java
/**
 * 统一异常处理
 */
@RestControllerAdvice
public class ControllerExceptionHandler {
 
    private static final Logger logger = LoggerFactory.getLogger(ControllerExceptionHandler.class);
 
    /**
     * 400 - Bad Request 参数绑定出错
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(BindException.class)
    public Resp<String> handleBindException(BindException e) {
        logger.error("绑定参数出错", e);
        return new Resp<String>().error(RespType.BIND_PARAM_ERROR);
    }
 
    /**
     * 400 - Bad Request
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Resp<String> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        logger.error("请求参数读取错误", e);
        return new Resp<String>().error(RespType.BAD_REQUEST);
    }
 
    /**
     * 400 - Bad Request
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler({MethodArgumentNotValidException.class})
    public Resp<String> handleValidationException(MethodArgumentNotValidException e) {
        logger.error("请求参数验证失败", e);
        return new Resp<String>().error(RespType.BAD_REQUEST);
    }
 
    /**
     * 405 - Method Not Allowed。HttpRequestMethodNotSupportedException
     * 是ServletException的子类,需要Servlet API支持
     */
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public Resp<String> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        logger.error("请求方法不支持", e);
        return new Resp<String>().error(RespType.METHOD_NOT_ALLOWED);
    }
 
    /**
     * 415 - Unsupported Media Type。HttpMediaTypeNotSupportedException
     * 是ServletException的子类,需要Servlet API支持
     */
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    @ExceptionHandler({HttpMediaTypeNotSupportedException.class})
    public Resp<String> handleHttpMediaTypeNotSupportedException(Exception e) {
        logger.error("content-type类型不支持", e);
        return new Resp<String>().error(RespType.UNSUPPORTED_MEDIA_TYPE);
    }
 
    /**
     * 500 - Internal Server Error
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public Resp<String> handleException(Exception e) {
        logger.error("服务器内部错误", e);
        return new Resp<String>().error(RespType.INTERNAL_SERVER_ERROR);
    }
    
}
```

