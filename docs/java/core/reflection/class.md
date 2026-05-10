# Java Class 类型与反射机制

在 Java 中，除了基本类型（Primitive Types）外，其他类型全都是 `class`（引用类型）。

## 一、 JVM 类加载机制

### 1. 动态加载（Dynamic Loading）
JVM 在运行过程中，并非一次性加载所有类，而是在第一次**“主动使用”**某个类时，才将其加载进内存。

### 2. 内存布局与关联
*   **唯一性**：每加载一个类，JVM 都会在**堆内存（Heap）**中为其创建一个唯一的 `java.lang.Class` 实例。
*   **结构封装**：该 `Class` 实例负责封装该类在**方法区（Method Area/Metaspace）**内的所有结构数据（如方法、字段、构造函数等）。
*   **对象头指针**：该类所有普通实例的**对象头（Object Header）**中，都包含一个指向该 `Class 实例` 的指针（Klass Pointer），使实例在运行时能识别自己的类型。

## 二、 获取 Class 实例的三种方式
由于 `Class` 实例在 JVM 中是唯一的，以下三种方式获取的地址完全相同，可以使用 `==` 进行比较。

| 方式 | 语法 | 适用场景 |
| :--- | :--- | :--- |
| **类名静态变量** | `String.class` | 编译期已知类名，最安全、性能最高。 |
| **实例 getClass()** | `str.getClass()` | 已有对象实例，需获取其运行时类型。 |
| **Class.forName()** | `Class.forName("java.lang.String")` | 仅知全限定类名字符串（如从配置文件读取）。 |

## 三、 反射 (Reflection) 的核心操作

### 1. 获取类基本信息

通过 `Class` 实例，可以获取类的完整定义信息。

```java
public static void printObjectInfo(Object obj) {
    Class<?> clazz = obj.getClass();
    System.out.println("全类名: " + clazz.getName());        // java.lang.String
    System.out.println("简易类名: " + clazz.getSimpleName()); // String
    System.out.println("包名: " + clazz.getPackageName());
    
    // 类型判断
    System.out.println("是否为接口: " + clazz.isInterface());
    System.out.println("是否为枚举: " + clazz.isEnum());
    System.out.println("是否为数组: " + clazz.isArray());
}
```

### 2. 动态创建实例

反射允许我们在运行时动态创建对象，而不需要显式使用 `new` 关键字。

```java
// 获取 String 的 Class 实例
Class<String> cls = String.class;

// 动态创建实例
String s = cls.getDeclaredConstructor().newInstance(); 
```

## 四、案例：Commons Logging 的动态发现机制

``Commons Logging`` 之所以能实现“自动适配日志框架”，核心原理就是利用了 反射探测 触发的 动态加载。

```java

LogFactory factory = null;
if (isClassPresent("org.apache.logging.log4j.Logger")) {
    factory = createLog4j();
} else {
    factory = createJdkLog();
}

// 探测环境：判断 Log4j 是否在当前的 Classpath 中
boolean isClassPresent(String name) {
    try {
        // 尝试触发动态加载
        Class.forName(name);
        return true;
    } catch (Exception e) {
        // 如果 Classpath 中没这个包，加载会失败，捕获异常即表示不存在
        return false;
    }
}
```

这样做的好处？

* 解耦：代码中不需要显式 ``import org.apache.log4j.*``，避免了编译期的强制耦合。
* 热插拔：开发者只需将 ``log4j.jar`` 放入 ``Classpath``，无需修改任何代码，``isClassPresent`` 就会在运行时检测到并切换逻辑。


## 五、 关键注意事项与约束

### 1. 实例化限制

使用 `Class.newInstance()`（或现代化的 `getDeclaredConstructor().newInstance()`）有以下局限：

*   **构造方法访问权限**：默认只能调用 `public` 构造方法。若需调用 `private` 构造器，需先调用 `setAccessible(true)`。
*   **参数匹配**：`newInstance()` 只能调用无参构造。若需调用带参构造，必须先获取指定的 `Constructor` 对象。

### 2. 性能开销

反射涉及动态类型解析，JVM 无法对这部分代码进行深度优化（如内联），因此其执行效率低于直接的 Java 代码。

### 3. 类型安全

反射是在运行时（Runtime）操作的，编译器无法在编译阶段检查出类型错误。因此，使用反射时务必处理好 `ClassNotFoundException` 等异常。

