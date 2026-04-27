# Mapper

`BaseMapperX` 和 `Mapper` 的关系可以类比为 **“工具箱”** 与 **“操作员”** 的关系。

为了让你看清这两者是如何协作的，我们需要拆开它们的底面。

## 1. Mapper：业务操作的定义者

这里的 `Mapper` 指的是你定义的业务接口（如 `ApiAccountMapper`）。

* **本质**：它是一个**门户**。它继承了底层的通用能力，并根据业务需求定义特定的查询逻辑。
* **职责**：
    * 作为 Service 层调用的入口。
    * 定义 `default` 方法来封装常用的、带有业务语义的 Lambda 查询。
    * 定义 `getApiAccountPage` 这种复杂的、需要手写 SQL 的方法。

## 2. BaseMapperX：增强版通用工具箱

这是你项目中对 MyBatis-Plus 原生 `BaseMapper` 的一次**二次封装**。

### 为什么不直接用原生的 `BaseMapper`？

MyBatis-Plus 原生的 `BaseMapper` 只提供了最基础的 CRUD（如 `insert`, `selectById`）。而在实际开发中，我们经常需要处理“如果参数不为空才查询”这种逻辑。

**`BaseMapperX` 的核心增强点：**

* **封装了 LambdaQueryWrapperX**：它引入了像 `eqIfPresent`、`likeIfPresent` 这种方法。当参数为 `null` 时，它会自动忽略该查询条件，不再需要你写繁琐的 `if` 判断。
* **统一的逻辑删除支持**：它往往预集成了对 `deleted` 字段的处理。
* **批量操作优化**：有的 `BaseMapperX` 会额外提供 `insertBatch` 等高效的批量处理方法。

## 3. 两者的协作关系：继承与扩展

在你的代码中，关系是这样的：

$$ApiAccountMapper \xrightarrow{extends} BaseMapperX \xrightarrow{extends} BaseMapper$$

### 协作流程：
1.  **基础能力继承**：`ApiAccountMapper` 只要写了 `extends BaseMapperX<ApiAccountDO>`，它就立刻拥有了存、取、改、删、以及高级 Lambda 查询的所有能力。
2.  **业务逻辑定制**：你在 `ApiAccountMapper` 中写的 `selectList` 方法，本质上是在调用父类（BaseMapperX）提供的工具。


## 4. 深度对比：原生 BaseMapper vs 增强 BaseMapperX

| 特性 | MyBatis-Plus 原生 BaseMapper | 你的项目 BaseMapperX |
| :--- | :--- | :--- |
| **基础查询** | `eq(column, val)` | `eqIfPresent(column, val)` |
| **判空逻辑** | 需要手动在 Service 或 Mapper 写 `if` | 自动判空，代码极其简洁 |
| **返回类型** | 通常只返回 DO | 往往支持直接返回 VO (搭配 MapStruct) |
| **分页支持** | 标准 IPage 接口 | 深度集成了项目通用的 PageResult |


## 5. 为什么你的架构里这样设计？

这种设计是为了**极致的开发效率**。

看看你之前的截图，在 `selectList` 方法里：
```java
return selectList(new LambdaQueryWrapperX<ApiAccountDO>()
    .eqIfPresent(ApiAccountDO::getUserId, reqVO.getUserId())
    // ... 其他条件
);
```
如果没有 `BaseMapperX`，这段代码可能会变成：
```java
LambdaQueryWrapper<ApiAccountDO> wrapper = new LambdaQueryWrapper<>();
if (reqVO.getUserId() != null) {
    wrapper.eq(ApiAccountDO::getUserId, reqVO.getUserId());
}
// 每个字段都要写一遍 if... 
return baseMapper.selectList(wrapper);
```
**`BaseMapperX` 的存在，让 DAL 层（数据访问层）的代码量减少了 60% 以上。**


## 6. 总结：如何理解这套玩法？

* **`BaseMapperX`**：是项目组为了让你少加班，把所有通用的、好用的 SQL 拼接逻辑写在了一个“父类”里。它是一个**工业级的地基**。
* **`Mapper`**：是你根据业务需求，在地基上盖的**房子**。它通过 `default` 方法复用父类的工具，或者通过 XML 编写特殊的业务 SQL。
