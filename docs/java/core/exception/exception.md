# 异常处理

Java 中异常分为两大类：

* Throwable
    * Error
        * OutOfMenoryError
    * Exception 
        * Checked Exception
        * Unchecked Exception

## Error

``Error`` 是 Java 虚拟机无法处理的严重问题，通常是系统级别的问题，如内存不足等。程序无法捕获或处理 Error，因此不应该尝试捕获它们。

## Exception

Exception 是程序可以捕获和处理的异常。 Exception 又分为两类：``Checked Exception`` 和 ``Unchecked Exception``。

### Checked Exception

``Checked Exception`` : 编译器会盯着你，如果你不 ``try-catch`` 或者 ``throws``，代码连编译都过不去。这通常用于描述那些“偶然发生但无法完全避免”的外部情况（如：网络断开、文件不存在）。


示例如下：

```java
import java.util.Arrays;

public class ExceptionExample {
    public static void main(String[] args){
        byte[] bs = toGBK("中文");
        System.out.println(Arrays.toString(bs));
    }

    static byte[] toGBK(String str){
        return str.getBytes("GBK");
    }
}
```

上述代码在编译时，就会提示如下错误：

> Unhandled exception: java.io.UnsupportedEncodingException


如何解决这个问题呢？有两种方式：


* 显示捕获异常：

```java
import java.io.UnsupportedEncodingException;
import java.util.Arrays;

public class ExceptionExample {
    public static void main(String[] args){
        byte[] bs = toGBK("中文");
        System.out.println(Arrays.toString(bs));
    }

    static byte[] toGBK(String str){
        try {
            // 1. 在 toGBK 捕获该异常
            return str.getBytes("GBK");
        } catch (UnsupportedEncodingException e) {
            System.out.println(e);
            return str.getBytes();
        }
    }
}
```

* 通过 throws ，由上层调用处来捕获异常：

```java
import java.io.UnsupportedEncodingException;
import java.util.Arrays;

public class ExceptionExample {
    // 2、调用 toGBK 处获 UnsupportedEncodingException 异常
    public static void main(String[] args){
        try {
            byte[] bs = toGBK("中文");
            System.out.println(Arrays.toString(bs));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }

    static byte[] toGBK(String str) throws UnsupportedEncodingException {
        return str.getBytes("GBK");
    }
}
```

另外，当我们捕获 Checked Exception 时，应该尽量提供有意义的异常处理逻辑，而不是忽略它们。这样可以提高程序的健壮性和用户体验。

```java
// 不推荐
static byte[] toGBK(String str){
    try {
        return str.getBytes("GBK");
    } catch (UnsupportedEncodingException e) {
       // 什么也不做
    }
    return null;
}

// 及时现在不处理，也应该把错误记录下来，至少要知道发生了什么异常
static byte[] toGBK(String str){
    try {
        return str.getBytes("GBK");
    } catch (UnsupportedEncodingException e) {
       e.printStackTrace();
    }
    return null;
}
```

### Unchecked Exception

``Unchecked Exception``（非检查型异常）: 指的是继承自 ``RuntimeException`` 的异常类。

编译器在编译阶段不强制要求对其进行捕获或声明抛出。

这类异常通常源于程序逻辑错误（如 NullPointerException 或 IndexOutOfBoundsException）。

由于它们在本质上是可规避的编程失误，因此最佳实践是通过完善代码逻辑来根除，而非通过异常处理机制进行被动修补。