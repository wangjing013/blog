# RequestContextHolder

为什么 `RequestContextHolder` 能被写成一个 Utils 工具类？它的核心原理是什么？在使用时又有哪些坑需要注意？本文将为你一一解答。

## 1. 核心原理：ThreadLocal

Spring 在处理每一个 Web 请求时，都会分配一个独立的线程。为了让这个请求的数据在整个线程执行过程中“随叫随到”，Spring 使用了 `ThreadLocal`。

* **工作流程：**
    1.  当请求到达 **DispatcherServlet** 时，Spring 会把当前的请求对象（`HttpServletRequest`）包装成 `ServletRequestAttributes`。
    2.  Spring 调用 `RequestContextHolder.setRequestAttributes()`，将这个对象存入当前线程的 `ThreadLocal` 变量中。
    3.  由于 `ThreadLocal` 的特性，只要是在**同一个线程**内，无论你是在 Controller、Service 还是 Utils 类里，调用 `getRequestAttributes()` 都能拿到同一个对象。
    4.  **请求结束时：** Spring 会非常负责地执行 `resetRequestAttributes()`，清理掉线程里的变量，防止内存泄漏。

## 2. 为什么它可以被写成 Utils？

因为它本质上访问的是一个**静态（static）**方法。

在 Java 中，静态方法不属于某个对象实例，而是属于类本身。只要你的 Utils 工具类和 `RequestContextHolder` 都在同一个类加载器下，你就可以通过如下方式轻松封装：

```java
public class HttpUtils {
    public static HttpServletRequest getCurrentRequest() {
        // 从当前线程的存储空间中获取属性
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return (attributes != null) ? attributes.getRequest() : null;
    }
}
```

## 3. 使用时的“坑”与注意事项
虽然它很方便，但有两个硬性限制你需要知道：

| 限制点 | 原因 |
| :--- | :--- |
| **异步/多线程失效** | 如果你在 Controller 里开启了一个新线程（如 `new Thread()`），新线程里拿不到原线程的 `ThreadLocal` 数据，除非手动传递。 |
| **非 Web 环境失效** | 如果你的代码不是通过 HTTP 请求触发的（比如定时任务 `Scheduled` 或 MQ 消费者），调用它会返回 `null`。 |

### 💡 一个小技巧
如果你确实需要在**子线程**中使用，Spring 提供了一个配置方案：
```java
// 在主线程中设置，允许子线程继承上下文
RequestContextHolder.setRequestAttributes(attributes, true); 
```

**总结：** `RequestContextHolder` 通过将请求绑定到执行线程上，打破了参数传递的限制。你把它抽离到 Utils，本质上只是给“访问当前线程变量”这门生意找了个更方便的“代理商”而已。