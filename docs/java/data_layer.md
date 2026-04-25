# 数据访问层（DAL, Data Access Layer）


## 1. 核心定义：它是数据库的“翻译官”
DAL 是位于 **业务逻辑层 (Service)** 和 **数据存储源 (Database/NoSQL/File)** 之间的一个抽象层。

在没有 DAL 的时代，业务逻辑里会充斥着大量的数据库连接、结果集解析代码。有了 DAL 后，Service 层只需要说：“给我那个 ID 为 10 的用户信息”，而不需要关心这个信息是存在 MySQL、Redis 还是某个远程接口里。

## 2. DAL 的内部构造

一个健壮的 DAL 通常由以下几个核心部分组成：

| 组成部分 | 职责 | 在你代码中的体现 |
| :--- | :--- | :--- |
| **Mapper / DAO** | 定义操作数据的接口 | `ApiAccountMapper` 接口 |
| **Entity / DO** | 映射数据库表结构的 Java 对象 | `ApiAccountDO` 类 |
| **DSL / SQL 引擎** | 构建具体的查询逻辑 | `LambdaQueryWrapperX` |
| **数据源管理** | 连接池、事务管理、读写分离 | Spring Boot 的 `DataSource` 配置 |

## 3. DAL 的四大核心职能

### ① 屏蔽复杂性（Abstraction）
DAL 隐藏了底层数据库的细节。比如你的代码里，`eqIfPresent` 自动处理了参数判空。Service 层不需要写 `if (reqVO.getUserId() != null)`，DAL 帮你搞定了这些琐碎的拼装逻辑。

### ② 统一入口（Centralization）
所有对 `api_account` 表的操作都必须经过 `ApiAccountMapper`。
* **好处**：如果你想在所有查询里加一个“逻辑删除”的过滤（`is_deleted = 0`），你只需要在 Mapper 这一层加，而不用去翻几百个 Service。

### ③ 维护一致性（Consistency）
DAL 通常与 **事务管理 (Transaction Management)** 紧密结合。在 Service 开启事务后，DAL 里的多个 Mapper 操作会共享同一个数据库连接，确保要么全部成功，要么全部回滚。

### ④ 性能优化（Optimization）
DAL 是做**缓存**（如 Redis）和 **索引优化** 的最佳场所。
* 你可以在 DAL 层拦截某些高频查询，直接返回缓存数据，而 Service 层甚至不知道底层发生了缓存。

## 4. 为什么你的代码里 DAL 看起来“变薄了”？

你可能会发现，现代 Spring Boot 项目里，DAL 层好像就是几个接口，没写多少代码。这是因为 DAL 经历了三个进化阶段：

1.  **JDBC 时代 (手动)**：每一条查询都要写几十行代码，处理连接、读取 ResultSet。
2.  **ORM 时代 (半自动)**：如原始 MyBatis。需要写接口 + 复杂的 XML SQL。
3.  **高级插件时代 (全自动)**：如你正在使用的 **MyBatis-Plus**。
    * 它通过 **泛型**（`BaseMapperX<ApiAccountDO>`）和 **Lambda 语法**，把 90% 的常规 DAL 逻辑都通用化了。

## 5. 常见的设计原则

在管理这一层时，通常遵循以下原则：

* **单表对应**：原则上一个 Mapper 只操作一张主表。
* **无业务逻辑**：DAL 只负责“拿”和“存”，不应该判断“用户是否有权限”。权限判断属于 Service。
* **返回 DO (Data Object)**：DAL 应该返回与数据库结构对应的 DO 对象，由上层将其转换为 VO 或 DTO。

> **总结：**

> **DAL (数据访问层)** 是后端的一道“防火墙”。它把脏活、累活（SQL 拼接、连接管理、结果转换）全都拦在自己内部，给上层的 **Service** 留下一片干净的、只谈业务逻辑的沃土。