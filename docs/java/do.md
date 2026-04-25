# DO（Data Object）：数据库表的“镜像”

在后端开发中，**DO 是最“老实”的对象**，它直接映射数据库，是数据的原始载体。

## 1. DO 的核心定义

**DO (Data Object)**，在某些框架或公司也被称为 **Entity（实体）** 或 **PO (Persistant Object)**。

它的唯一职责是：**作为数据库表在 Java 程序中的“镜像”。**
* **对应关系**：通常一个 DO 类对应一张数据库表。
* **字段关系**：DO 的每一个属性（Field）对应表里的一个字段（Column）。

## 2. DO 的特点：它是“有态”且“纯粹”的

一个标准的 DO 对象通常具备以下特征：

1.  **禁止包含业务逻辑**：它只是一个承载数据的容器（POJO），除了 Getter/Setter，不应该有任何复杂的计算。
2.  **严格遵循表结构**：
    * 数据库是 `user_id` (下划线)，DO 是 `userId` (小驼峰)。
    * 数据库有 `is_deleted`，DO 也要有这个字段，即使业务上你可能用不到它。
3.  **包含审计字段**：DO 通常会包含一些通用的“管理”字段，比如：
    * `createTime` (创建时间)
    * `updateTime` (更新时间)
    * `creator` (创建人)
    * `updater` (更新人)
    * `deleted` (逻辑删除标识)

## 3. DO 在架构中的流转边界

**DO 的活动范围应该严格限制在 Service 层和 DAL 层之间。**

* **向外（向上）**：Service 获取到 DO 后，必须转换成 DTO 或 VO 才能丢给 Controller。
* **向内（向下）**：Service 接收到操作请求后，将数据组装成 DO，交给 Mapper 存入数据库。

> **为什么要这么严谨？**
> 假设你在数据库表里加了一个字段 `internal_notes`（内部备注），如果你直接把 DO 丢给 Controller 返回，前端就会直接看到这个内部备注。通过 **DO ➔ VO** 的转换，你可以精准控制哪些数据能出去，哪些数据必须留在系统内部。


## 4. 结合 MyBatis-Plus 的 DO 示例

使用了 MyBatis-Plus，这让 DO 的定义变得非常简洁：

```java
@TableName("api_account") // 指定对应的数据库表名
@Data
public class ApiAccountDO {
    @TableId // 指定主键
    private Long id;
    
    private String appId;
    
    private String appKey;
    
    /**
     * 逻辑删除：1-已删除，0-未删除
     */
    @TableLogic
    private Integer deleted;

    /**
     * 创建时间
     * 虽然 VO 可能是字符串，但 DO 必须是 LocalDateTime 或 Date，与数据库对齐
     */
    private LocalDateTime createTime;
}
```

## 5. 常见数据对象对比总结
现在你可以清晰地看到整个“变身”链路了：

| 对象类型 | 缩写全称 | 核心作用 | 活动区域 |
| :--- | :--- | :--- | :--- |
| **VO** | View Object | 负责**展示**（给前端看，带校验，脱敏） | Controller |
| **DTO** | Data Transfer Object | 负责**传输**（跨层、跨系统数据协议） | Service 出入参 |
| **DO** | Data Object | 负责**存储**（对齐数据库表结构） | Service / DAL |
