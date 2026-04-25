# LambdaQueryWrapperX 详解

它是对 MyBatis-Plus 原生 `LambdaQueryWrapper` 的二次封装，核心目标是：**消除繁琐的 `if` 判空，实现声明式的 SQL 拼接。**

## 1. 核心设计哲学：IfPresent（存在即拼接）

在传统的 MyBatis-Plus 中，如果你想实现“如果前端传了参数才查询”的逻辑，你需要这么写：

```java
// 原生写法：既啰嗦又容易出错
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
if (req.getName() != null) {
    wrapper.like(User::getName, req.getName());
}
if (req.getStatus() != null) {
    wrapper.eq(User::getStatus, req.getStatus());
}
```

而使用 **`LambdaQueryWrapperX`**，代码会变成：

```java
// 增强写法：一行流，逻辑极简
return new LambdaQueryWrapperX<User>()
    .likeIfPresent(User::getName, req.getName())
    .eqIfPresent(User::getStatus, req.getStatus());
```
**它的精髓在于：** 内部自动集成了 `ObjectUtil.isNotEmpty(val)` 的判断。只有当 `val` 不为 `null` 且不为空字符串（或空集合）时，对应的 SQL 条件才会生效。

## 2. 常用“招式”详解

`LambdaQueryWrapperX` 提供了非常丰富的语义化方法：

### ① 等值匹配（Equality）
* **`eqIfPresent(column, val)`**：$WHERE\ column = val$
* **`neIfPresent(column, val)`**：$WHERE\ column != val$（不等于）

### ② 范围与集合（Range & Collection）
* **`inIfPresent(column, collection)`**：$WHERE\ column\ IN\ (...)$。它会自动帮你判空，防止集合为空导致的 SQL 报错。
* **`betweenIfPresent(column, val1, val2)`**：$WHERE\ column\ BETWEEN\ val1\ AND\ val2$。常用于日期区间过滤。

### ③ 模糊查询（Fuzzy Search）
* **`likeIfPresent(column, val)`**：$WHERE\ column\ LIKE\ '\%val\%'$
* **`likeLeftIfPresent(column, val)`**：$WHERE\ column\ LIKE\ '\%val'$（左模糊，性能通常优于全模糊）

### ④ 逻辑组合（Logic）
* **`and(...)` / `or(...)`**：用于处理复杂的括号嵌套逻辑。
* **`orderByDesc(column)` / `orderByAsc(column)`**：排序。

## 3. 链式调用的魅力

由于它采用了 **Fluent API（流式编程）** 设计，你可以像搭积木一样连续调用。

**实战案例：**
假设你要查询：*属于某个用户，状态是正常，备注里包含“代理”，且按创建时间倒序排* 的账户。

```java
return selectList(new LambdaQueryWrapperX<ApiAccountDO>()
    .eqIfPresent(ApiAccountDO::getUserId, userId)
    .eq(ApiAccountDO::getStatus, 0) // 这里的 eq 是强制匹配，不带 IfPresent
    .likeIfPresent(ApiAccountDO::getRemark, "代理")
    .betweenIfPresent(ApiAccountDO::getCreateTime, startTime, endTime)
    .orderByDesc(ApiAccountDO::getId)
);
```

## 4. 为什么使用 `::` (Method Reference) 而不是字符串？

你可能注意到代码里写的是 `ApiAccountDO::getUserId`。这利用了 Java 的 **Lambda 表达式**。

* **普通 Wrapper**：可能需要传字符串 `"user_id"`。万一你手抖写成 `"userid"`，只有程序运行报错你才知道。
* **LambdaWrapper**：直接引用 DO 类的方法名。
    * **类型安全**：编译器会检查方法是否存在。
    * **重构友好**：如果你在 DO 类里改了字段名，IDE 会自动更新这里。

## 5. 易错点提示

1.  **`eq` vs `eqIfPresent`**：
    * 如果你确定这个参数**必须**有值，或者即使是 `null` 也要去查数据库里的 `NULL`，用 `eq`。
    * 如果这个参数是**可选**的搜索条件，用 `eqIfPresent`。
2.  **空字符串问题**：
    * `eqIfPresent` 通常会把空字符串 `""` 也视为“无效”，从而不拼接 SQL。这在处理前端搜索框时非常有用。
3.  **多线程安全**：
    * 注意 Wrapper 对象不是线程安全的，它应该在方法内部创建并使用，不要定义为类成员变量。

## 6. 总结：这套工具对你学习的帮助

作为学习者，你不需要去深究它是如何解析 Lambda 表达式的（那涉及到复杂的反射和序列化），你只需要记住：

> **`LambdaQueryWrapperX` 是你和数据库沟通的“提词器”。你只需要告诉它字段和值，它就负责帮你拼出一句完美、安全且会自动过滤空值的 SQL。**