# MapStruct：Java 开发中的“变身大师”

Java 开发中消除“搬砖代码”的神器——**MapStruct**。

在复杂的层级架构（ReqVO -> DO -> RespVO）中，对象之间的属性拷贝是频率最高、也最枯燥的工作。``MapStruct`` 的出现就是为了解决这个问题。

## 1. 为什么需要 MapStruct？

在没有它之前，如果你要把一个 `ApiAccountSaveReqVO` 转换成 `ApiAccountDO`，你得这么写：
```java
public ApiAccountDO convert(ApiAccountSaveReqVO vo) {
    ApiAccountDO do = new ApiAccountDO();
    do.setAppId(vo.getAppId());
    do.setAppKey(vo.getAppKey());
    // 如果有 30 个字段，这里就要写 30 行...
    return do;
}
```
这种写法不仅累，还容易漏掉字段。MapStruct 的核心思想是：**你定义接口，它帮你写实现代码。**

## 2. MapStruct 的核心原理：编译时生成

这是 MapStruct 与其他工具（如 `BeanUtils.copyProperties`）最大的区别：

* **BeanUtils (运行时反射)**：程序运行的时候才去查找字段、匹配类型。**性能差**，且如果字段名写错，运行才会报错。
* **MapStruct (编译时生成)**：当你按下 IDE 的编译按钮时，MapStruct 会自动生成一个接口的实现类（`.class` 文件）。它的底层依然是普通的 `set/get`，所以**性能等同于手写**，且有问题在编译阶段就能发现。

## 3. 标准代码演示

结合你看到的项目，典型的 MapStruct 转换器长这样：

```java
@Mapper(componentModel = "spring") // 交给 Spring 管理，可以 @Autowired 注入
public interface ApiAccountConvert {
    // 惯例：定义一个全局唯一的实例
    ApiAccountConvert INSTANCE = Mappers.getMapper(ApiAccountConvert.class);

    // 1. 基本转换：字段名完全一致时，一行搞定
    ApiAccountDO convert(ApiAccountSaveReqVO bean);

    // 2. 字段名不一致：通过 @Mapping 映射
    @Mapping(source = "reqAppId", target = "appId")
    ApiAccountRespVO convert(ApiAccountDO bean);
}
```

## 4. MapStruct 的高级特性

MapStruct 不只是简单的搬运工，它还能处理复杂的逻辑：

* **格式转换**：自动处理 `String` 到 `Integer`，或者 `LocalDateTime` 到 `String` 的转换。
* **忽略字段**：如果你不想拷贝某个字段（如密码），可以使用 `@Mapping(target = "password", ignore = true)`。
* **自定义逻辑**：如果某个字段需要复杂的计算，你可以写一个 `default` 方法或者使用 `@AfterMapping`。
* **多个源对象**：可以把两个不同的对象（比如 User 和 Address）合并转换成一个返回对象。

## 5. 为什么你的项目里一定要用它？

结合你之前的 **VO 分层**：
1.  **解耦**：ReqVO 变了，你只需要改一下 `@Mapping`，Service 层的代码不需要动。
2.  **安全**：转换过程中可以轻松剔除 DO 里的敏感字段（如删除标志、权限位），确保 RespVO 只有展示数据。
3.  **优雅**：Service 层从几十行 `set` 代码变成了 `ApiAccountConvert.INSTANCE.convert(reqVO)`，逻辑极其清晰。

## 6. 总结：数据对象的“变身”链路

整个数据流转的过程，就像一场由 MapStruct 导演的变身秀：

1.  **用户输入**：`ApiAccountSaveReqVO` (带参数校验)
2.  **MapStruct 变身 1** ➔ `ApiAccountDO` (准备存入数据库)
3.  **数据库取出**：`ApiAccountDO` (包含所有数据库信息)
4.  **MapStruct 变身 2** ➔ `ApiAccountRespVO` (脱敏、格式化，准备展示)

> **小贴士**：如果你在代码里改了字段名，发现转换失效了，记得点击 Maven 的 **`clean`** 然后 **`compile`**，让 MapStruct 重新生成一下实现类。