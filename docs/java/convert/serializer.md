# Serializer（序列化器）详解

在后端开发中，**Serializer（序列化器）** 是一个非常关键的转换工具。

如果说 **MapStruct** 是在“Java 对象”之间进行转换（如 VO 转 DO），那么 **Serializer** 就是在 **“Java 对象”** 与 **“传输格式（如 JSON、字节流）”** 之间进行转换。

## 1. 核心定义

**序列化 (Serialization)**：将内存中的 Java 对象转换为可以存储或传输的格式（通常是 JSON 字符串、XML 或二进制流）。
**反序列化 (Deserialization)**：将传输过来的格式（如前端发来的 JSON）还原为内存中的 Java 对象。

## 2. 为什么需要自定义 Serializer？
虽然 Spring Boot 默认使用 **Jackson** 库能自动处理绝大多数转换，但在以下场景中，你需要手写或配置特殊的 Serializer：

### A. 脱敏处理（最常见）
比如数据库存的是手机号 `13812345678`，你希望返回给前端时变成 `138****5678`。你可以在字段上挂一个自定义的序列化器。

### B. 解决长整型精度丢失（重点）
在 Java 中，`Long` 类型最多支持 19 位数字。但 JavaScript 的 `Number` 类型由于遵循 IEEE 754 标准，在超过 16 位后会产生精度丢失。
* **解决办法**：配置一个 `LongToStringSerializer`，在序列化时自动把 `Long` 转成 `String` 返回给前端。

### C. 格式化输出
比如日期类型，数据库里是 `Date` 或 `LocalDateTime`。如果你不配置序列化器，JSON 可能会输出一串时间戳；配置了 Serializer 后，可以统一输出为 `"yyyy-MM-dd HH:mm:ss"`。

## 3. 在代码中如何体现？

在 Spring Boot 项目中，你通常会看到以下几种形式：

### ① 注解式（局部控制）
使用 Jackson 提供的注解，直接在 **VO** 的字段上指定：
```java
public class ApiAccountRespVO {
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    @JsonSerialize(using = ToStringSerializer.class) // 防止前端 Long 精度丢失
    private Long id;
}
```

### ② 全局配置（统一风格）
在配置类中定义 `Jackson2ObjectMapperBuilderCustomizer`，这样全项目所有的日期或长整型都会按统一规则序列化。

## 4. Serializer 与你的架构图

我们可以把之前的分层再完善一下，看看 Serializer 发生在哪个环节：

1.  **用户** ➔ 发送 JSON
2.  **Spring MVC (反序列化器)** ➔ 将 JSON 转为 **ReqVO**
3.  **Controller -> Service -> DAL** ➔ 处理业务
4.  **Service** ➔ 返回 **RespVO**
5.  **Spring MVC (序列化器)** ➔ 将 **RespVO** 转为 JSON ➔ **用户看到结果**

## 5. 易混淆点：MapStruct vs Serializer

* **MapStruct**：是 **“搬家公司”**。负责把家具（数据）从 A 房间（DO）挪到 B 房间（VO）。它们都是 Java 对象。
* **Serializer**：是 **“打包拆箱公司”**。负责把家具（VO 对象）拆散装进集装箱（JSON 字符串），或者从集装箱里拿出来组装好。

## 6. 总结

在学习这套架构时，如果你发现：
* 接口返回的日期格式不对；
* 前端拿到的 ID 最后几位变成了 000；
* 某些字段明明有值但没显示出来。

这时候，你就要去检查 **Jackson 序列化配置** 或者对应的 **Serializer** 了。