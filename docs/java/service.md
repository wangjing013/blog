# Service：业务逻辑的“大脑与灵魂”

已经了解了负责“接待”的 **Controller** 和负责“搬砖”的 **DAL (Mapper)**，现在我们来聊聊整个后端系统的**灵魂与大脑**——**Service 层（业务逻辑层）**。

在 Spring 架构中，Service 层是承上启下的核心。如果 Controller 是前台，Mapper 是仓库，那么 **Service 就是后台的大厨**：他决定了如何组合食材（数据），并按照菜谱（业务规则）烹饪出最终的成品。

## 1. Service 层核心定义
Service 层的主要职责是**实现具体的业务逻辑**。它不关心数据是从哪来的（那是 Mapper 的事），也不关心数据要发给谁（那是 Controller 的事），它只关心**规则**。

## 2. 为什么需要 Service 层？（它的核心价值）

### ① 事务管理 (Transaction Control)
这是 Service 层最重要的职责。
* **场景**：你转账 100 元给朋友。这涉及两个 DAL 操作：你的余额 `-100`，朋友的余额 `+100`。
* **作用**：Service 负责确保这两个操作**要么同时成功，要么同时失败**。通过在 Service 方法上加 `@Transactional` 注解，Spring 就会帮你管理这个事务。

### ② 业务逻辑的“组装”
Service 就像乐高玩家。一个业务动作往往需要调用多个 Mapper：
* **注册用户业务**：
    1. 调用 `UserMapper` 插入账号。
    2. 调用 `RoleMapper` 分配权限。
    3. 调用 `MessageService` 发送欢迎短信。

这些逻辑必须写在 Service 里，而不是 Controller 或 Mapper。

### ③ 复杂的计算与判断
比如“计算订单折扣”、“判断用户是否有抽奖资格”、“多表关联后的数据清洗”。这些带有“思考”属性的逻辑都属于 Service。

## 3. Service 层的标准结构
在 Spring 开发中，习惯上我们会将 Service 分为 **接口 (Interface)** 和 **实现类 (Impl)**。

1.  **接口 (`UserService`)**：定义“能做什么”。暴露给 Controller 使用。
2.  **实现类 (`UserServiceImpl`)**：具体的“怎么做”。标注 `@Service` 注解，被 Spring IoC 容器管理。

```java
@Service
public class ApiAccountServiceImpl implements ApiAccountService {

    @Autowired
    private ApiAccountMapper accountMapper; // 注入 DAL

    @Override
    @Transactional // 开启事务
    public Long createAccount(ApiAccountSaveReqVO saveReqVO) {
        // 1. 业务校验：判断 AppID 是否已存在
        if (accountMapper.existsByAppId(saveReqVO.getAppId())) {
            throw new BusinessException("AppID 已存在");
        }
        
        // 2. 数据转换：VO -> DO
        ApiAccountDO accountDO = ApiAccountConvert.INSTANCE.convert(saveReqVO);
        
        // 3. 调用 DAL 执行存储
        accountMapper.insert(accountDO);
        return accountDO.getId();
    }
}
```

## 4. Service 层的设计原则

### 保持业务完整性
一个 Service 方法应该对应一个**完整的业务用例**。例如“下单”是一个方法，而不是把“减库存”、“创订单”拆开给 Controller 分别调用。

### 杜绝 Web 特性
**Service 层代码应该是“干净”的 Java 代码。**
* **不要**在 Service 里处理 `HttpServletRequest` 或 `HttpSession`。
* **理由**：如果以后你要从 Web 访问改为定时任务（Job）调用，带了 Web 参数的代码将无法运行。

### 复用性
如果你发现多个 Controller 都要用到同一段逻辑（比如“获取当前登录用户信息”），就应该把这段逻辑封装进一个 Service 方法中。

## 5. 总结：三层协作的大合影

| 层级 | 比喻 | 核心任务 | 处理的数据对象 |
| :--- | :--- | :--- | :--- |
| **Controller** | 接线员 | 校验参数、转发请求 | **VO / DTO** |
| **Service** | 大脑/厨师 | **业务判断、事务控制、逻辑编排** | **DTO / DO** |
| **DAL (Mapper)** | 搬砖工/仓库 | 纯粹的数据库增删改查 | **DO (Entity)** |


### 给你的建议：

在你看到的 `ApiAccountMapper` 代码中，你会发现它继承了 `BaseMapperX` 并写了一些 `default` 方法。

* **注意**：这种 `default` 方法只能写**简单的、跟数据库紧密相关的查询逻辑**（比如拼接查询条件）。
* **千万不要**在 Mapper 的 `default` 方法里写跨表的操作或事务逻辑，那依然是 Service 的地盘。
