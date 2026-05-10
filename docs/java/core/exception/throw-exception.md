# 抛出异常

抛出自定义异常，分为两步：

* 定义一个异常类，继承自 `Exception` 或 `RuntimeException`。
* 在需要抛出异常的地方，使用 `throw` 关键字抛出异常对象。


## 定义异常类

```java

public class MyException extends Exception {
    public MyException(String message) {
        super(message);
    }
}
```

## 抛出异常

```java
public class Main {
    public static void main(String[] args) {
        try {
            throw new MyException("这是一个自定义异常");
        } catch (MyException e) {
            System.out.println("捕获到异常: " + e.getMessage());
        }
    }
}
```

在上面的例子中，我们定义了一个名为 `MyException` 的自定义异常类，并在 `main` 方法中抛出了该异常。通过 `try-catch` 块捕获异常并打印异常信息。


## 多层次异常

当处理抛出的异常时，尽量保留异常的原始信息，以便于调试和定位问题。

```java
class MyException extends Exception {
    public MyException(String message) {
        super(message);
    }
}

public class ThrowsExceptionExample {
     static void process1() throws MyException {
        throw new MyException("这是 process1 中的异常");
    }

    static void process2() throws MyException {
        try {
            process1();
        } catch (MyException e) {
            // 这里把异常重新创建并抛出，并没有把原始异常的信息传递下去，导致丢失了原始异常的堆栈信息
            throw new MyException("这是 process2 中的异常");
        }
    }

    public static void main(String[] args) {
        try {
            process2();
        } catch (MyException e) {
            e.printStackTrace();
        }
    }
}
```

执行代码，会看到 `process2` 中的异常信息，但无法看到 `process1` 中的异常信息，因为在 `process2` 中重新创建了一个新的异常对象，并没有将原始异常作为参数传递给新的异常对象，导致丢失了原始异常的堆栈信息。

```log
MyException: 这是 process2 中的异常
	at ThrowsExceptionExample.process2(ThrowsExceptionExample.java:16)
	at ThrowsExceptionExample.main(ThrowsExceptionExample.java:22)
```


这种方式不推荐，因为它会丢失原始异常的堆栈信息，导致调试困难。正确的做法是将原始异常作为参数传递给新的异常：

```java

class MyException extends Exception {
    public MyException(String message) {
        super(message);
    }

    // 添加一个新的构造方法，接受一个 Throwable 类型的参数，用于传递原始异常
    public MyException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class ThrowsExceptionExample {
     static void process1() throws MyException {
        throw new MyException("这是 process1 中的异常");
    }

    static void process2() throws MyException {
        try {
            process1();
        } catch (MyException e) {
            // 这里把原始异常作为参数传递给新的异常对象，保留了原始异常的堆栈信息
            throw new MyException("这是 process2 中的异常", e);
        }
    }

    public static void main(String[] args) {
        try {
            process2();
        } catch (MyException e) {
            e.printStackTrace();
        }
    }
}
```

最后，执行代码看到完整的异常信息，包括 `process1` 和 `process2` 中的异常：

```log
MyException: 这是 process2 中的异常
	at ThrowsExceptionExample.process2(ThrowsExceptionExample.java:21)
	at ThrowsExceptionExample.main(ThrowsExceptionExample.java:27)
Caused by: MyException: 这是 process1 中的异常
	at ThrowsExceptionExample.process1(ThrowsExceptionExample.java:14)
	at ThrowsExceptionExample.process2(ThrowsExceptionExample.java:19)
	... 1 more
```

这里通过 `Caused by` 关键字显示了原始异常的信息，保留了完整的异常堆栈信息，方便调试和定位问题。

## 总结

在 Java 中抛出异常时，应该尽量保留原始异常的信息，以便于调试和定位问题。