# VO：表现层的数据载体

**VO (View Object)** 确实会进一步拆分为 **请求 VO (Request VO)** 和 **响应 VO (Response VO)**。

这种拆分的核心目的只有一个：**职责分离，互不干扰**。

## 1. 为什么不能用同一个 VO？

初学者常想：“反正字段都差不多，定义一个 `UserVO` 又接参数又返结果不行吗？”
但在实际项目中，这会导致严重的混乱：

* **字段不对等**：创建用户时需要 `password`（Request），但返回用户信息时绝对不能包含 `password`（Response）。
* **校验逻辑冲突**：请求时 `id` 通常为空（数据库自增），而返回时 `id` 必须有值。
* **Swagger/接口文档混乱**：如果混用，前端看到接口文档时会很困惑：“这个 `createTime` 是我要传给你的，还是你返给我的？”

## 2. 请求 VO (Request VO / ReqVO)

**定义**：前端发给后端的“入参”对象。
* **核心职责**：承载用户输入的数据。
* **常用注解**：大量使用 `javax.validation.constraints` 提供的校验注解（如 `@NotBlank`, `@Min`, `@Pattern`）。
* **细分场景**：
    * **SaveReqVO**：创建时使用，通常不带 `id`。
    * **UpdateReqVO**：更新时使用，必须带 `id`。
    * **PageReqVO**：分页查询时使用，包含 `pageNo`, `pageSize` 以及搜索条件。

## 3. 响应 VO (Response VO / RespVO)

**定义**：后端返回给前端的“出参”对象。
* **核心职责**：展示数据，保证安全。
* **关键特性**：
    * **过滤敏感信息**：屏蔽掉密码、逻辑删除标识、内部盐值等。
    * **格式化输出**：比如将数据库的 `Long` 型时间戳转为 `String` 格式的 `"yyyy-MM-dd"`，或者将状态码 `1` 转为 `已支付`。
    * **数据聚合**：可能包含一些数据库里没有、但在 UI 上需要显示的计算字段（如“剩余过期天数”）。

## 4. 你的代码上下文中的体现
* **`ApiAccountExportReqVO`**：这是一个**请求 VO**，专门用于“导出”操作的过滤条件。
* **`ApiAccountPageReqVO`**：这是一个**请求 VO**，用于分页查询。
* **`ApiAccountRespVO`**：这是一个**响应 VO**，用于给前端展示账户列表的数据。

```java
// 请求 VO：侧重于约束和输入
public class ApiAccountSaveReqVO {
    @NotBlank(message = "AppID 不能为空")
    private String appId;
    
    @NotBlank(message = "AppKey 不能为空")
    private String appKey;
}

// 响应 VO：侧重于展示和脱敏
public class ApiAccountRespVO {
    private Long id;
    private String appId;
    private LocalDateTime createTime; // 数据库可能是 Long，这里给前端 LocalDateTime
}
```

## 5. 总结对照表

| 特性 | 请求 VO (ReqVO) | 响应 VO (RespVO) |
| :--- | :--- | :--- |
| **流向** | 前端 -> 后端 (Controller) | 后端 -> 前端 (JSON) |
| **重点内容** | 校验逻辑、输入限制 | 数据格式化、安全性、展示字段 |
| **敏感字段** | 包含密码、验证码等 | 严禁包含密码、盐值等 |
| **ID 处理** | 新增时通常无 ID，更新时必有 ID | 通常必有 ID，用于前端后续操作 |
| **转换方向** | ReqVO -> DTO -> DO | DO -> RespVO |

### 进阶建议：自动转换工具

由于 ReqVO、DO 和 RespVO 之间有大量重复字段，手动写 `set/get` 转换会非常痛苦。在你现在的项目中，大概率会看到类似 **MapStruct** 这种工具（比如你代码里可能存在的 `ApiAccountConvert`）。