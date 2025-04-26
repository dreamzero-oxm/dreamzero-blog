---
title: JWT的原理和使用
description: JWT的原理和使用
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - JWT
updated: 2022-07-28
comments: false
---
# JWT的原理和使用

## JWT

在用户注册或登录后，我们想记录用户的登录状态，或者为用户创建身份认证的凭证。我们不再使用Session认证机制，而使用Json Web Token认证机制。

## 什么是JWT

Json web token (JWT), 是为了在网络应用环境间传递声明而执行的一种基于JSON的开放标准（(RFC 7519).该token被设计为紧凑且安全的，特别适用于分布式站点的单点登录（SSO）场景。JWT的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息，以便于从资源服务器获取资源，也可以增加一些额外的其它业务逻辑所必须的声明信息，该token也可直接被用于认证，也可被加密。

### 起源

说起JWT，我们应该来谈一谈基于token的认证和传统的session认证的区别。

### 传统的session认证

我们知道，http协议本身是一种无状态的协议，而这就意味着如果用户向我们的应用提供了用户名和密码来进行用户认证，那么下一次请求时，用户还要再一次进行用户认证才行，因为根据http协议，我们并不能知道是哪个用户发出的请求，所以为了让我们的应用能识别是哪个用户发出的请求，我们只能在服务器存储一份用户登录的信息，这份登录信息会在响应时传递给浏览器，告诉其保存为cookie,以便下次请求时发送给我们的应用，这样我们的应用就能识别请求来自哪个用户了,这就是传统的基于session认证。

但是这种基于session的认证使应用本身很难得到扩展，随着不同客户端用户的增加，独立的服务器已无法承载更多的用户，而这时候基于session认证应用的问题就会暴露出来.

### 基于session认证所显露的问题

**Session:** 每个用户经过我们的应用认证之后，我们的应用都要在服务端做一次记录，以方便用户下次请求的鉴别，通常而言session都是保存在内存中，而随着认证用户的增多，服务端的开销会明显增大。

**扩展性:** 用户认证之后，服务端做认证记录，如果认证的记录被保存在内存中的话，这意味着用户下次请求还必须要请求在这台服务器上,这样才能拿到授权的资源，这样在分布式的应用上，相应的限制了负载均衡器的能力。这也意味着限制了应用的扩展能力。

**CSRF:** 因为是基于cookie来进行用户识别的, cookie如果被截获，用户就会很容易受到跨站请求伪造的攻击。

**基于token的鉴权机制**
基于token的鉴权机制类似于http协议也是无状态的，它不需要在服务端去保留用户的认证信息或者会话信息。这就意味着基于token认证机制的应用不需要去考虑用户在哪一台服务器登录了，这就为应用的扩展提供了便利。

**流程上是这样的：**

* 用户使用用户名密码来请求服务器
* 服务器进行验证用户的信息
* 服务器通过验证发送给用户一个token
* 客户端存储token，并在每次请求时附送上这个token值
* 服务端验证token值，并返回数据
* 这个token必须要在每次请求时传递给服务端，它应该保存在请求头里， 另外，服务端要支持CORS(跨来源资源共享)策略，一般我们在服务端这么做就可以了Access-Control-Allow-Origin: *。

那么我们现在回到JWT的主题上。

## JWT长什么样？

JWT是由三段信息构成的，将这三段信息文本用.链接一起就构成了Jwt字符串。就像这样:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

## JWT的构成

第一部分我们称它为头部（header),第二部分我们称其为载荷（payload, 类似于飞机上承载的物品)，第三部分是签证（signature).

### header

jwt的头部承载两部分信息：

* 声明类型，这里是jwt
* 声明加密的算法 通常直接使用 HMAC SHA256

**完整的头部就像下面这样的JSON：**

```json
{
  'typ': 'JWT',
  'alg': 'HS256'
}
```

然后将头部进行base64加密（该加密是可以对称解密的),构成了第一部分.

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
```

### payload

载荷就是存放有效信息的地方。这个名字像是特指飞机上承载的货品，这些有效信息包含三个部分

* 标准中注册的声明
* 公共的声明
* 私有的声明

**标准中注册的声明 (建议但不强制使用) ：**

* iss: jwt签发者
* sub: jwt所面向的用户
* aud: 接收jwt的一方
* exp: jwt的过期时间，这个过期时间必须要大于签发时间
* nbf: 定义在什么时间之前，该jwt都是不可用的.
* iat: jwt的签发时间
* jti: jwt的唯一身份标识，主要用来作为一次性token,从而回避重放攻击。

**公共的声明 ：** 公共的声明可以添加任何的信息，一般添加用户的相关信息或其他业务需要的必要信息.但不建议添加敏感信息，因为该部分在客户端可解密.

**私有的声明 ：** 私有声明是提供者和消费者所共同定义的声明，一般不建议存放敏感信息，因为base64是对称解密的，意味着该部分信息可以归类为明文信息。

定义一个payload:

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```

然后将其进行base64加密，得到JWT的第二部分。

```
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9
```

### signature

JWT的第三部分是一个签证信息，这个签证信息由三部分组成：

* header (base64后的)
* payload (base64后的)
* secret

这个部分需要base64加密后的header和base64加密后的payload使用.连接组成的字符串，然后通过header中声明的加密方式进行加盐secret组合加密，然后就构成了jwt的第三部分。

```js
// javascript
var encodedString = base64UrlEncode(header) + '.' + base64UrlEncode(payload);

var signature = HMACSHA256(encodedString, 'secret'); // TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

将这三部分用.连接成一个完整的字符串,构成了最终的jwt:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

**注意：secret是保存在服务器端的，jwt的签发生成也是在服务器端的，secret就是用来进行jwt的签发和jwt的验证，所以，它就是你服务端的私钥，在任何场景都不应该流露出去。一旦客户端得知这个secret, 那就意味着客户端是可以自我签发jwt了。**

## 如何应用

一般是在请求头里加入**Authorization**，并加上**Bearer**标注：

```http
fetch('api/user/1', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

服务端会验证token，如果验证通过就会返回相应的资源。整个流程就是这样的:

![image-20210725220840526](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210725220840526.png)

## 总结

### 优点

* 因为json的通用性，所以JWT是可以进行跨语言支持的，JAVA,JavaScript,NodeJS,PHP等很多语言都可以使用。
* 因为有了payload部分，所以JWT可以在自身存储一些其他业务逻辑所必要的非敏感信息。
* 便于传输，jwt的构成非常简单，字节占用很小，所以它是非常便于传输的。
* 它不需要在服务端保存会话信息, 所以它易于应用的扩展

### 安全相关

* 不应该在jwt的payload部分存放敏感信息，因为该部分是客户端可解密的部分。
* 保护好secret私钥，该私钥非常重要。
* 如果可以，请使用https协议

## 在Java应用程序中使用

JWT说到底是一个安全规范的协议，现在它在Java中有很多比较好的实现。其中用的很多的就有https://github.com/jwtk/jjwt

下面就用jjwt来演示一下怎么实现JWT。
新建一个Maven项目，添加如下依赖：

```xml
   <!-- JWT依赖-->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>${jwt.version}</version>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>${jwt.version}</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>${jwt.version}</version>
    </dependency>
```

创建一个JWT：

```java
/**
* 生成一个JWT
*
* @param audience        用户
* @param privateClaims   可以由使用JWT的人随意定义。但为避免冲突，推荐参考：https://www.iana.org/assignments/jwt/jwt.xhtml
* @param effectiveMillis 生效时间，单位为毫秒
* @param singKey         签名算法密钥
* @return JWT字符串
*/
public static String createToken(String audience, Map<String, Object> privateClaims, long effectiveMillis, String singKey) {
   //jwt主题
   String subject = "Authentication";
   //jwt生效时间
   Date createTime = new Date();
   //根据给定的生效时间长度，生成jwt的失效时间点
   Date expiredTime = new Date(createTime.getTime() + effectiveMillis);
   //生成签名密钥，基于HMAC-SHA算法
   Key key = Keys.hmacShaKeyFor(SecureUtil.sha256(singKey).getBytes());
   //发行人，取服务器的信息与应用信息
   String issuer = "sun-" + SystemUtil.getHostInfo().getAddress();

   //设置申明信息
   Claims claims = new DefaultClaims();
   claims.setId(IDWorker.getIdStr());
   claims.setIssuer(issuer);
   claims.setSubject(subject);
   claims.setAudience(audience);
   claims.setIssuedAt(createTime);
   claims.setExpiration(expiredTime);
   //添加自定义申明
   claims.putAll(privateClaims);

   return Jwts.builder()
              .setClaims(claims)
              .setHeaderParam("author", "ZHAODC")
              .signWith(key, SignatureAlgorithm.HS256)
              .compact();
}
```

这样就能生成了一个JWT。

然后就是解析JWT ,代码如下：

```java
    /**
     * 获取JWT的JSON格式对象
     *
     * @param jwtStr  token
     * @param signKey 密钥
     * @return json格式的明文
     */
    public static JsonObject getJwt(String jwtStr, String signKey) {
        Jwt jwt = Jwts.parser()
                      .setSigningKey(Keys.hmacShaKeyFor(SecureUtil.sha256(signKey).getBytes()))
                      .parse(jwtStr);
        Gson gson = new Gson();
        String str = gson.toJson(jwt);

        return gson.fromJson(str, JsonObject.class);
    }

```

再获取JWT对象中申明Claims：

```java
    /**
     * 解析JWT，获取JWT中的有效载荷
     *
     * @param jwtStr  JWT字符串
     * @param singKey 签名密钥
     * @return 有效载荷
     */
    public static Claims getClaims(String jwtStr, String singKey) {
        Key key = Keys.hmacShaKeyFor(SecureUtil.sha256(singKey).getBytes());
        return Jwts.parser()
                   .setSigningKey(key)
                   .parseClaimsJws(jwtStr)
                   .getBody();
    }

```

再看一下这个申明Claims对象是如何定义的：

![image-20210725222720709](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210725222720709.png)

先看顶级接口：

```java
/**
 * Mutation (modifications) to a {@link io.jsonwebtoken.Claims Claims} instance.
 *
 * @param <T> the type of mutator
 * @see io.jsonwebtoken.JwtBuilder
 * @see io.jsonwebtoken.Claims
 * @since 0.2
 */
public interface ClaimsMutator<T extends ClaimsMutator> {

    /**
     * Sets the JWT <a href="https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-4.1.1">
     * <code>iss</code></a> (issuer) value.  A {@code null} value will remove the property from the JSON map.
     *
     * @param iss the JWT {@code iss} value or {@code null} to remove the property from the JSON map.
     * @return the {@code Claims} instance for method chaining.
     */
    T setIssuer(String iss);

    /**
     * Sets the JWT <a href="https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-4.1.2">
     * <code>sub</code></a> (subject) value.  A {@code null} value will remove the property from the JSON map.
     *
     * @param sub the JWT {@code sub} value or {@code null} to remove the property from the JSON map.
     * @return the {@code Claims} instance for method chaining.
     */
    T setSubject(String sub);

    /**
     * Sets the JWT <a href="https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-4.1.3">
     * <code>aud</code></a> (audience) value.  A {@code null} value will remove the property from the JSON map.
     *
     * @param aud the JWT {@code aud} value or {@code null} to remove the property from the JSON map.
     * @return the {@code Claims} instance for method chaining.
     */
    T setAudience(String aud);

    /**
     * Sets the JWT <a href="https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-4.1.4">
     * <code>exp</code></a> (expiration) timestamp.  A {@code null} value will remove the property from the JSON map.
     *
     * <p>A JWT obtained after this timestamp should not be used.</p>
     *
     * @param exp the JWT {@code exp} value or {@code null} to remove the property from the JSON map.
     * @return the {@code Claims} instance for method chaining.
     */
    T setExpiration(Date exp);

    /**
     * Sets the JWT <a href="https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-4.1.5">
     * <code>nbf</code></a> (not before) timestamp.  A {@code null} value will remove the property from the JSON map.
     *
     * <p>A JWT obtained before this timestamp should not be used.</p>
     *
     * @param nbf the JWT {@code nbf} value or {@code null} to remove the property from the JSON map.
     * @return the {@code Claims} instance for method chaining.
     */
    T setNotBefore(Date nbf);

    /**
     * Sets the JWT <a href="https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-4.1.6">
     * <code>iat</code></a> (issued at) timestamp.  A {@code null} value will remove the property from the JSON map.
     *
     * <p>The value is the timestamp when the JWT was created.</p>
     *
     * @param iat the JWT {@code iat} value or {@code null} to remove the property from the JSON map.
     * @return the {@code Claims} instance for method chaining.
     */
    T setIssuedAt(Date iat);

    /**
     * Sets the JWT <a href="https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-4.1.7">
     * <code>jti</code></a> (JWT ID) value.  A {@code null} value will remove the property from the JSON map.
     *
     * <p>This value is a CaSe-SenSiTiVe unique identifier for the JWT. If specified, this value MUST be assigned in a
     * manner that ensures that there is a negligible probability that the same value will be accidentally
     * assigned to a different data object.  The ID can be used to prevent the JWT from being replayed.</p>
     *
     * @param jti the JWT {@code jti} value or {@code null} to remove the property from the JSON map.
     * @return the {@code Claims} instance for method chaining.
     */
    T setId(String jti);
}


```

可以看到，Claims继承了Map,然后里面包含了以下这些内置的基本字段：

| 规范编码 | **对应Claims属性** | **值**                                      |
| -------- | ------------------ | ------------------------------------------- |
| iss      | issuer             | 用户，JWT的签发者                           |
| sub      | subject            | 主题，值为这个JWT的主题，入登录用户信息认证 |
| aud      | audience           | 受众群体，记录JWT的接受者                   |
| exp      | expiration         | JWT的过期时间                               |
| nbf      | notBefore          | 时间，表示JWT在这个时间之前是不可用的       |
| iat      | issuedAt           | JWT的签发时间                               |
| jti      | id                 | JWT的ID，唯一标识                           |

再来看一下它的默认实现DefaultClaims 。

![image-20210725222928008](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210725222928008.png)

可以看到，它的构造函数里面就传了Map ,其实这个就是自定义的申明。

再来看一下JWT的实现

![image-20210725222939845](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210725222939845.png)

JWT接口的定义：

```java
/**
 * An expanded (not compact/serialized) JSON Web Token.
 *
 * @param <B> the type of the JWT body contents, either a String or a {@link Claims} instance.
 *
 * @since 0.1
 */
public interface Jwt<H extends Header, B> {

    /**
     * Returns the JWT {@link Header} or {@code null} if not present.
     *
     * @return the JWT {@link Header} or {@code null} if not present.
     */
    H getHeader();

    /**
     * Returns the JWT body, either a {@code String} or a {@code Claims} instance.
     *
     * @return the JWT body, either a {@code String} or a {@code Claims} instance.
     */
    B getBody();
}

```

可以看到，JWT接口里面定了Header和Body(对应的是Payload)

```java

/**
 * An expanded (not compact/serialized) Signed JSON Web Token.
 *
 * @param <B> the type of the JWS body contents, either a String or a {@link Claims} instance.
 *
 * @since 0.1
 */
public interface Jws<B> extends Jwt<JwsHeader,B> {

    String getSignature();
}


```

Jws里面定义了Signature对应的就是JWT标准中的Signature ，类型是String

默认实现DefaultJws ：

```java
public class DefaultJws<B> implements Jws<B> {

    private final JwsHeader header;
    private final B body;
    private final String signature;

    public DefaultJws(JwsHeader header, B body, String signature) {
        this.header = header;
        this.body = body;
        this.signature = signature;
    }

    @Override
    public JwsHeader getHeader() {
        return this.header;
    }

    @Override
    public B getBody() {
        return this.body;
    }

    @Override
    public String getSignature() {
        return this.signature;
    }

    @Override
    public String toString() {
        return "header=" + header + ",body=" + body + ",signature=" + signature;
    }
}

```

可以看到这里面就刚好包含了JWT中的三个部分header ，body（Payload） ，signature

再来看Header的实现：

![image-20210725223018966](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210725223018966.png)

Header接口源码：

![image-20210725223031119](C:\Users\13228\AppData\Roaming\Typora\typora-user-images\image-20210725223031119.png)

可以看到Header接口中定义了JWT规范中的类型和加密算法两个字段。具体的源码实现可以自己查阅。

**下面将重点了，JWT的构建过程**
JWT的构建是通过io.jsonwebtoken.Jwts这个工具类完成，看代码：

```java
/**
 * Factory class useful for creating instances of JWT interfaces.  Using this factory class can be a good
 * alternative to tightly coupling your code to implementation classes.
 *
 * @since 0.1
 */
public final class Jwts {

    private static final Class[] MAP_ARG = new Class[]{Map.class};

    private Jwts() {
    }

    /**
     * Creates a new {@link Header} instance suitable for <em>plaintext</em> (not digitally signed) JWTs.  As this
     * is a less common use of JWTs, consider using the {@link #jwsHeader()} factory method instead if you will later
     * digitally sign the JWT.
     *
     * @return a new {@link Header} instance suitable for <em>plaintext</em> (not digitally signed) JWTs.
     */
    public static Header header() {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultHeader");
    }

    /**
     * Creates a new {@link Header} instance suitable for <em>plaintext</em> (not digitally signed) JWTs, populated
     * with the specified name/value pairs.  As this is a less common use of JWTs, consider using the
     * {@link #jwsHeader(java.util.Map)} factory method instead if you will later digitally sign the JWT.
     *
     * @return a new {@link Header} instance suitable for <em>plaintext</em> (not digitally signed) JWTs.
     */
    public static Header header(Map<String, Object> header) {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultHeader", MAP_ARG, header);
    }

    /**
     * Returns a new {@link JwsHeader} instance suitable for digitally signed JWTs (aka 'JWS's).
     *
     * @return a new {@link JwsHeader} instance suitable for digitally signed JWTs (aka 'JWS's).
     * @see JwtBuilder#setHeader(Header)
     */
    public static JwsHeader jwsHeader() {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultJwsHeader");
    }

    /**
     * Returns a new {@link JwsHeader} instance suitable for digitally signed JWTs (aka 'JWS's), populated with the
     * specified name/value pairs.
     *
     * @return a new {@link JwsHeader} instance suitable for digitally signed JWTs (aka 'JWS's), populated with the
     * specified name/value pairs.
     * @see JwtBuilder#setHeader(Header)
     */
    public static JwsHeader jwsHeader(Map<String, Object> header) {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultJwsHeader", MAP_ARG, header);
    }

    /**
     * Returns a new {@link Claims} instance to be used as a JWT body.
     *
     * @return a new {@link Claims} instance to be used as a JWT body.
     */
    public static Claims claims() {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultClaims");
    }

    /**
     * Returns a new {@link Claims} instance populated with the specified name/value pairs.
     *
     * @param claims the name/value pairs to populate the new Claims instance.
     * @return a new {@link Claims} instance populated with the specified name/value pairs.
     */
    public static Claims claims(Map<String, Object> claims) {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultClaims", MAP_ARG, claims);
    }

    /**
     * Returns a new {@link JwtParser} instance that can be configured and then used to parse JWT strings.
     *
     * @return a new {@link JwtParser} instance that can be configured and then used to parse JWT strings.
     */
    public static JwtParser parser() {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultJwtParser");
    }

    /**
     * Returns a new {@link JwtBuilder} instance that can be configured and then used to create JWT compact serialized
     * strings.
     *
     * @return a new {@link JwtBuilder} instance that can be configured and then used to create JWT compact serialized
     * strings.
     */
    public static JwtBuilder builder() {
        return Classes.newInstance("io.jsonwebtoken.impl.DefaultJwtBuilder");
    }
}

```

可以看到io.jsonwebtoken.impl.DefaultJwtBuilder是真正构建JWT的类，看它的源码：

```java

public class DefaultJwtBuilder implements JwtBuilder {

    private Header header;
    private Claims claims;
    private String payload;

    private SignatureAlgorithm algorithm;
    private Key key;

    private Serializer<Map<String,?>> serializer;

    private Encoder<byte[], String> base64UrlEncoder = Encoders.BASE64URL;

    private CompressionCodec compressionCodec;

    ...
    @Override
    public JwtBuilder signWith(Key key, SignatureAlgorithm alg) throws InvalidKeyException {
        Assert.notNull(key, "Key argument cannot be null.");
        Assert.notNull(alg, "SignatureAlgorithm cannot be null.");
        alg.assertValidSigningKey(key); //since 0.10.0 for https://github.com/jwtk/jjwt/issues/334
        this.algorithm = alg;
        this.key = key;
        return this;
    }

    @Override
    public JwtBuilder signWith(SignatureAlgorithm alg, byte[] secretKeyBytes) throws InvalidKeyException {
        Assert.notNull(alg, "SignatureAlgorithm cannot be null.");
        Assert.notEmpty(secretKeyBytes, "secret key byte array cannot be null or empty.");
        Assert.isTrue(alg.isHmac(), "Key bytes may only be specified for HMAC signatures.  If using RSA or Elliptic Curve, use the signWith(SignatureAlgorithm, Key) method instead.");
        SecretKey key = new SecretKeySpec(secretKeyBytes, alg.getJcaName());
        return signWith(key, alg);
    }

    @Override
    public JwtBuilder signWith(SignatureAlgorithm alg, String base64EncodedSecretKey) throws InvalidKeyException {
        Assert.hasText(base64EncodedSecretKey, "base64-encoded secret key cannot be null or empty.");
        Assert.isTrue(alg.isHmac(), "Base64-encoded key bytes may only be specified for HMAC signatures.  If using RSA or Elliptic Curve, use the signWith(SignatureAlgorithm, Key) method instead.");
        byte[] bytes = Decoders.BASE64.decode(base64EncodedSecretKey);
        return signWith(alg, bytes);
    }

    @Override
    public JwtBuilder signWith(SignatureAlgorithm alg, Key key) {
        return signWith(key, alg);
    }

   ...

    @Override
    public String compact() {

        if (this.serializer == null) {
            //try to find one based on the runtime environment:
            InstanceLocator<Serializer<Map<String,?>>> locator =
                Classes.newInstance("io.jsonwebtoken.impl.io.RuntimeClasspathSerializerLocator");
            this.serializer = locator.getInstance();
        }

        if (payload == null && Collections.isEmpty(claims)) {
            throw new IllegalStateException("Either 'payload' or 'claims' must be specified.");
        }

        if (payload != null && !Collections.isEmpty(claims)) {
            throw new IllegalStateException("Both 'payload' and 'claims' cannot both be specified. Choose either one.");
        }

        Header header = ensureHeader();

        JwsHeader jwsHeader;
        if (header instanceof JwsHeader) {
            jwsHeader = (JwsHeader) header;
        } else {
            //noinspection unchecked
            jwsHeader = new DefaultJwsHeader(header);
        }

        if (key != null) {
            jwsHeader.setAlgorithm(algorithm.getValue());
        } else {
            //no signature - plaintext JWT:
            jwsHeader.setAlgorithm(SignatureAlgorithm.NONE.getValue());
        }

        if (compressionCodec != null) {
            jwsHeader.setCompressionAlgorithm(compressionCodec.getAlgorithmName());
        }

        String base64UrlEncodedHeader = base64UrlEncode(jwsHeader, "Unable to serialize header to json.");

        byte[] bytes;
        try {
            bytes = this.payload != null ? payload.getBytes(Strings.UTF_8) : toJson(claims);
        } catch (SerializationException e) {
            throw new IllegalArgumentException("Unable to serialize claims object to json: " + e.getMessage(), e);
        }

        if (compressionCodec != null) {
            bytes = compressionCodec.compress(bytes);
        }

        String base64UrlEncodedBody = base64UrlEncoder.encode(bytes);
        //拼接JWT字符串  header+"."+body
        String jwt = base64UrlEncodedHeader + JwtParser.SEPARATOR_CHAR + base64UrlEncodedBody;

        if (key != null) { //jwt must be signed:
            //通过加密算法名称和加密秘钥，构建一个签名器        
            JwtSigner signer = createSigner(algorithm, key);
            //使用签名器对header和body进行签名，             
            String base64UrlSignature = signer.sign(jwt);
            // 使用"."隔开将结果添加到jwt的后面，最后得到的格式就是jwtStr = header.body.signature
            jwt += JwtParser.SEPARATOR_CHAR + base64UrlSignature;
        } else {
            // no signature (plaintext), but must terminate w/ a period, see
            // https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25#section-6.1
            jwt += JwtParser.SEPARATOR_CHAR;
        }

        return jwt;
    }
    /*
     * @since 0.5 mostly to allow testing overrides
     */
    protected JwtSigner createSigner(SignatureAlgorithm alg, Key key) {
        return new DefaultJwtSigner(alg, key, base64UrlEncoder);
    }

}


```

这里最终实现Header, payload, Signature的加密和拼接的逻辑在compact()方法中，里面有主要的注释。到此，JWT的使用就讲完了。

## 实际应用代码：

### JwtUtils

```java
package com.qg.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.apache.tomcat.util.codec.binary.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;
import java.util.Map;

/**
 * @author MOITY IceClean
 */
public class JwtUtils {

    public String createJwt(String id, String subject, long ttlMillis, Map<String, Object> claims) {
        // 指定签名的时候使用的签名算法，也就是header那部分，jjwt已经将这部分内容封装好了。
        SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

        // 生成JWT的时间
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        SecretKey key = generalKey();

        // 下面就是在为payload添加各种标准声明和私有声明了
        // 这里其实就是new一个JwtBuilder，设置jwt的body
        JwtBuilder builder = Jwts.builder()
                // 如果有私有声明，一定要先设置这个自己创建的私有的声明，这个是给builder的claim赋值，一旦写在标准的声明赋值之后，就是覆盖了那些标准的声明的
                .setClaims(claims)
                // 设置jti(JwtId)：是JWT的唯一标识，根据业务需要，这个可以设置为一个不重复的值，主要用来作为一次性token,从而回避重放攻击。
                .setId(id)
                // iat: jwt的签发时间
                .setIssuedAt(now)
                // sub(Subject)：代表这个JWT的主体，即它的所属人，这个是一个json格式的字符串，可以存放什么userid，roleId之类的，作为什么用户的唯一标志。
                .setSubject(subject)
                // 设置签名使用的签名算法和签名使用的秘钥
                .signWith(signatureAlgorithm, key);
        if (ttlMillis >= 0) {
            long expMillis = nowMillis + ttlMillis;
            Date exp = new Date(expMillis);
            // 设置过期时间
            builder.setExpiration(exp);
        }

        // 就开始压缩为"xxxxxxxxxxxxxx.xxxxxxxxxxxxxxx.xxxxxxxxxxxxx"这样的jwt
        return builder.compact();
    }

    /**
     * 解密jwt
     * @param jwt token码
     * @return 解析出来的东西
     */
    public Claims parseJwt(String jwt) {
        // 签名秘钥，和生成的签名的秘钥一模一样
        SecretKey key = generalKey();

        // 得到DefaultJwtParser
        return Jwts.parser()
                // 设置签名的秘钥
                .setSigningKey(key)
                // 设置需要解析的jwt
                .parseClaimsJws(jwt).getBody();
    }

    /**
     * 由字符串生成加密key
     * @return 秘钥
     */
    public SecretKey generalKey() {
        // 本地的密码解码
        byte[] encodedKey = Base64.decodeBase64("11001100110011001100110011001100");	// 放二进制
        // 根据给定的字节数组使用AES加密算法构造一个密钥，使用
        return new SecretKeySpec(encodedKey, 0, encodedKey.length, "AES");
    }
}
```

### JwtInterceptor

```java
package com.qg.interceptor;

import com.qg.po.User;
import com.qg.utils.JsonUtils;
import com.qg.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author MOITY IceClean
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        response.setCharacterEncoding("UTF-8");

        JwtUtils util = new JwtUtils();
        String jwt = request.getHeader("Authorization");
        if (jwt == null) {
            jwt = request.getParameter("Authorization");
        }

        System.out.println("-------- 启动了拦截器 ----------");

        try {
            System.out.println(jwt);

            if (jwt == null) {
                System.out.println("用户未登录，无 Token");
                response.getWriter().write(JsonUtils.getJson("status", "0"));
//                response.sendRedirect("/qgdisplay/view/login.html");
            } else {
                Claims c;
                c = util.parseJwt(jwt);
                // 比较用户 id 是否一致

                System.out.println("用户id" + c.get("user") + "已是登录状态");
                return true;
            }
        } catch (Exception e) {
            System.out.println("Token 无效");
            response.getWriter().write(JsonUtils.getJson("status", "-1"));
//            response.sendRedirect("/qgdisplay/view/login.html");
        }
        return false;

    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {

    }
}
```