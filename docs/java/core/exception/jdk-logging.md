# JDK Logging

## 原始的调试手段

在接触规范的日志框架之前，我们往往习惯于使用 ``System.out.println()`` 这种最直观的语句。在开发调试阶段，通过控制台输出每个关键阶段的运行结果，来实时观测程序的行为。

### 这种方式痛点

这种方式在项目进入生产阶段后，会暴露出严重的局限性：

* 资源损耗：日志打印会占用服务器的 I/O 资源和内存，为了性能，我们不得不手动移除这些调试代码。
* 维护冗余：当新的问题出现时，又需要重新插入打印语句、重新打包部署。
* 不可持续性：这种“用时加、完事删”的行为形成了一个低效的死循环，导致历史调试经验无法沉淀，线上突发问题依然如同“黑盒”。

有没有办法去很好解决这些问题呢？有，引入日志系统。

## 日志系统

### 日志系统好处

* 支持日志分级，比如 DEBUG、INFO、ERROR 等级别
* 无需修改代码，仅通过配置方式可以控制内容输出
* 日志内容可以保存到本地文件或远端服务器，方便通过分析日志查找问题

### 使用 Java Logging

```java
import java.util.logging.Logger;
public class LoggingExample {
    public static void main(String[] args) throws MyException {
        Logger logger = Logger.getGlobal();
        logger.severe("SEVERE LEVEL");
        logger.warning("WARNING LEVEL");
        logger.info("INFO LEVEL");
        logger.fine("ignored.");
    }
}
```

执行后，在控制台可以看到如下内容：

```log
5月 02, 2026 10:29:44 下午 LoggingExample main
严重: SEVERE LEVEL
5月 02, 2026 10:29:44 下午 LoggingExample main
警告: WARNING LEVEL
5月 02, 2026 10:29:44 下午 LoggingExample main
信息: INFO LEVEL
```

从输出内容来看，细心用户会发现控制台输处内容并没有 ``fine`` 的内容。 这是因为日志默认输出的最低级别是``INFO``。也就是日志级别低于 ``INFO`` 都不会被打印。

如下，是 Logging 日志级别的排序：

* SEVERE > WARNING > INFO > CONFIG > FINE > FINER > FINEST

由于 FINE 的级别低于 ``INFO``，它被系统视为“非必要信息”而自动拦截了。这种机制的本质是为了在保障关键信息可见的同时，避免大量低级别调试信息对系统性能和存储造成冲击。


使用 Java 标准的内置的 ``Logging`` 库有以下局限：

* Logging 系统在JVM启动时读取配置文件并完成初始化，一旦开始运行 main() 方法，就无法修改配置
* 配置不太方便，需要在 JVM 启动时传递参数 -D java.util.logging.config.file=<config-file-name>。

因此，Java标准库内置的 ``Logging`` 使用并不是非常广泛。这里我们只需要了解即可。





