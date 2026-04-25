# Yudao Java 项目架构

## 核心模块

● [Controller](./controller.md)：接收客户端请求，传递给 Service
  ○ [VO（Value Object）](./vo.md)：返回给客户端的内容
● [Service](./service.md):  传递进来数据进行封装、处理业务逻辑。调用 DAL 层操作数据库
● [DAL (Data Access Layer)](./data_layer.md):  DAL 位于 业务逻辑层 ( Service Layer ) 和 数据库 ( Database ) 之间。它的唯一任务就是：屏蔽底层存储的复杂性，为上层提供统一的数据操作接口。
  ○ [DO (Data Object)](./do.md)：数据库表对应的对象
  ○ [Mapper(mybatis-plus)](./mapper.md)：Mapper 接口就是 Java 代码与 SQL 语句之间的“桥梁”
  ○ [LambdaQueryWrapperX](./lambda_query_wrapper_x.md)：DSL (Domain Specific Language，领域特定语言)，用编写代码的方式，来表达 SQL 的逻辑。
● Resources：存放复杂的自定义 SQL XML 文件 (推荐优先使用 Mapper，如果不能满足再使用自定义的方式)。

## 其他模块：

● config : 存放配置文件
● constants ：存放常量类
● [convert](./mapstruct.md)
  ○ 将 VO 对象转为 DO 对象
  ○ 将 DO 对象转为 VO 对象
● enums： 枚举
● job: 定时任务
● [serializer](./serializer.md): 序列化和反序列化工具类
● utils: 工具类
● websocket:  websocket 相关的内容