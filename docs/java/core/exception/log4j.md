# Log4j

## 大概架构图

```md
log.info("User signed in.");
 │
 │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
 ├──▶│ Appender │───▶│  Filter  │───▶│  Layout  │───▶│ Console  │
 │   └──────────┘    └──────────┘    └──────────┘    └──────────┘
 │
 │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
 ├──▶│ Appender │───▶│  Filter  │───▶│  Layout  │───▶│   File   │
 │   └──────────┘    └──────────┘    └──────────┘    └──────────┘
 │
 │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
 └──▶│ Appender │───▶│  Filter  │───▶│  Layout  │───▶│  Socket  │
     └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

## 为什么使用 Log4j

* Appender（多通道输出）： 支持将日志灵活定向至控制台、文件、Socket、数据库或消息队列等多种介质。
* Filter（维度过滤）： 可根据日志级别（Level）、关键字内容或自定义规则，精确控制哪些信息需要被记录。
* Layout（格式化定制）： 支持将原始消息转换为 CSV、JSON、HTML 或自定义文本格式，方便机器解析或人工阅读。
* Metadata（元数据增强）： 自动捕获并填充时间戳、类名/方法名、行号、线程信息及严重级别等上下文，极大地提升了排查问题的效率。


## 使用

结合前面讲到 commons logging 模块，它会自动去动态查找当前 Classpath 中检索是不是存在 log4j。

继续使用前面的案例，如下：

```java
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class CommonsLoggingExample {
    public static void main(String[] args) {
        Log log = LogFactory.getLog(CommonsLoggingExample.class);
        log.info("start");
        log.warn("end");
    }
}
```

给在 ``Classpath`` 中添加对应 ``log4j`` 模块，从这里[下载](https://logging.apache.org/log4j/2.x/download.html)。

* log4j-api-2.x.jar
* log4j-core-2.x.jar
* log4j-jcl-2.x.jar

再次执行代码：

```shell
java -cp .:commons-logging-1.3.6.jar:log4j-api-2.25.4.jar:log4j-core-2.25.4.jar:log4j-jcl-2.25.4.jar CommonsLoggingExample 
```

此时，发现控制台没有任何内容输出。

这是为什么？ Log4j2 在启动时，如果没有找到任何配置文件， 它会默认只记录 ``ERROR`` 级别以上的日志到控制台。

解决办法，可以在同级目录添加一个 ``log4j2.xml``，告诉 ``log4j``，需要把 ``INFO`` 级别以及以上内容输出到控制台。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
        <!-- 定义输出到控制台 -->
        <Console name="Console" target="SYSTEM_OUT">
            <!-- 定义输出格式 -->
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
    </Appenders>
    <Loggers>
        <!-- 默认配置：将 INFO 级别及以上的日志发送到上面的 Console -->
        <Root level="info">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

再次执行，控制台输出内容如下：

```log
22:40:14.225 [main] INFO  CommonsLoggingExample - start
22:40:14.226 [main] WARN  CommonsLoggingExample - end
```


## 诊断模式

通过诊断模式，可以方便排查定位配置问题。拿前面案例，在没有配置 log4j2.xml 时，控制台并不会打印日志，此时，就可以通过下面的命令，确定 log4j 是不是已经被 commons logging 正常发现和加载。

```shell
java -Dorg.apache.commons.logging.diagnostics.dest=STDOUT -cp .:commons-logging-1.3.6.jar:log4j-1.2-api-2.25.4.jar:log4j-core-2.25.4.jar:log4j-jcl-2.25.4.jar CommonsLoggingExample
```

当执行上述语句后，可在控制台看到如下：

```log
[LogFactory from jdk.internal.loader.ClassLoaders$AppClassLoader@2056016791] Created object org.apache.logging.log4j.jcl.LogFactoryImpl@664740647 to manage class loader jdk.internal.loader.ClassLoaders$AppClassLoader@2056016791
```

上面这句话，大概意思 ``Log4j 为当前的类加载器（即你的 AppClassLoader）创建了一个专属的配置实例``。 这说名 log4j 是加载成功了。

间接，把问题范围缩小 log4j 为什么不打印日志了。


## 总结

* 讲解 log4j 组成
* 为什么使用 log4j
* log4j 与 commons logging 整合
* 通过诊断模式排查问题








