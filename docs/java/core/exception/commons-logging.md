# Commons Logging

Commons Logging 是一个 Apache 创建的日志模块。

Commons Logging 的特色是，它可以挂接不同的日志系统，并通过配置文件指定挂接的日志系统

Commons Logging 采用动态发现机制：它会优先在 ``Classpath`` 中检索是否存在 ``Log4j`` 适配库；若检索失败，则自动回退（Fallback）至 JDK 自带的 ``java.util.logging``。

## Commons Logging 的使用

* 第一步，通过 LogFactory 获取 Log 实例
* 第二步，使用 Log 实例的方法打印日志

大概示例如下：

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

由于本项目尚未引入 ``Maven`` 或 ``Gradle`` 等构建工具，[``Commons Logging``](https://commons.apache.org/proper/commons-logging/download_logging.cgi) 作为第三方依赖，需手动下载其 ``JAR`` 文件并配置到 ``Classpath`` 中。

下载后，放置到 与 CommonsLoggingExample 同级目录中，如下：

```md
src
├─ commons-logging-1.3.6.jar
└─ CommonsLoggingExample.java
```

接下，先通过 ``javac`` 生成 CommonsLoggingExample 的可执行文件 ``CommonsLoggingExample.class``

```shell
javac -cp .:commons-logging-1.3.6.jar CommonsLoggingExample.java
```

* -cp:  ClassPath 的缩写，用来告诉 JVM 从哪里去找对应文件
* .: 表示当前目录


编译成功后，当前目录下会生成一个 ``CommonsLoggingExample.class`` 文件，紧接着，就可以通过 ``java`` 命令来执行生成二进制文件。

```md
src
├─ commons-logging-1.3.6.jar
└─ CommonsLoggingExample.java
└─ CommonsLoggingExample.class
```


```shell
java -cp .:commons-logging-1.3.6.jar CommonsLoggingExample    
```

执行后，打印内容如下：

```log
5月 03, 2026 6:38:36 下午 CommonsLoggingExample main
信息: start
5月 03, 2026 6:38:36 下午 CommonsLoggingExample main
警告: end
```

## 日志级别

Commons Logging 定义六个级别：

* FATAL
* ERROR
* WARNING
* INFO
* DEBUG
* TRACE

默认级别是 INFO。






