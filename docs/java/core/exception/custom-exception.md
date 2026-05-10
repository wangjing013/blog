# 自定义异常

常见的 Java 内置异常类包括：

```md
Exception
├─ RuntimeException
│  ├─ NullPointerException // 空指针异常
│  ├─ IndexOutOfBoundsException // 索引越界异常
│  ├─ SecurityException // 安全异常
│  └─ IllegalArgumentException //  非法参数异常
│     └─ NumberFormatException // 数字格式异常
├─ IOException // IO异常
│  ├─ UnsupportedCharsetException // 不支持的字符集异常
│  ├─ FileNotFoundException // 文件未找到异常
│  └─ SocketException // Socket异常
├─ ParseException // 解析异常
├─ GeneralSecurityException // 安全异常
├─ SQLException // SQL异常
└─ TimeoutException // 超时异常
```

在我们日常编写代码中，代码中尽可能使用Java内置的异常类来处理错误情况，但有时我们需要定义一些特定于应用程序的异常类，以更好地描述和处理特定的错误情况。这时，我们可以通过继承 `Exception` 或 `RuntimeException` 来创建自定义异常类。

这里建议通过继承 `RuntimeException` 来创建自定义异常类，因为它是一个非受检异常（unchecked exception），不需要强制捕获或声明抛出。这使得代码更简洁，并且在许多情况下更符合实际需求。

## 自定义异常类

通常可以定义 ``BaseException`` 作为所有自定义异常的基类，然后在此基础上创建具体的异常类。

```java
// 定义一个基类异常
public class BaseException extends RuntimeException {
    BaseException(){
        super();
    }
    BaseException(String message) {
        super(message);
    }
    BaseException(Throwable cause) {
        super(cause);
    }
    BaseException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

为什么是上述四个构造函数呢？这是参考了 Java 内置异常类的构造函数设计，提供了多种方式来创建异常对象，以满足不同的需求：

* 无参构造函数：允许创建一个没有任何详细信息的异常对象。
* 带有消息参数的构造函数：允许创建一个包含错误消息的异常对象，这有助于提供更多的上下文信息。
* 带有消息和原因参数的构造函数：允许创建一个包含错误消息和导致异常的原因（另一个 Throwable 对象）的异常对象，这有助于链式异常处理。
* 带有原因参数的构造函数：允许创建一个包含导致异常的原因（另一个 Throwable 对象）的异常对象，而不需要提供错误消息。 这种设计使得异常类更加灵活和易于使用，能够适应不同的错误处理场景。


然后其他具体的异常类可以继承 `BaseException`：

```java
class UserNotFoundException extends BaseException {
    UserNotFoundException() {
        super();
    }
    UserNotFoundException(String message) {
        super(message);
    }
    UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

## 使用自定义异常

在代码中，我们可以使用自定义异常来处理特定的错误情况：

```java
class User {}

class UserService {
    public User findUserById (String userId) {
        // 假设用户没有找到
        throw new UserNotFoundException("用户 ID " + userId + " 未找到");
    }
}
```

在调用 `findUserById` 方法时，我们可以捕获 `UserNotFoundException` 来处理用户未找到的情况：

```java
class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public void getUser (String userId ) {
        try {
            User user = userService.findUserById(userId);
            System.out.println(user.toString());
        } catch (UserNotFoundException e) {
            e.printStackTrace();
        }
    }
}

public class CustomException {
    public static void main(String[] args) {
        UserService userService = new UserService();
        UserController userController = new UserController(userService);
        userController.getUser("1");
    }
}
```


## 总结

* 自定义异常类可以帮助我们更好地描述和处理特定的错误情况，使代码更具可读性和可维护性。
* 通过继承 `RuntimeException` 来创建自定义异常类，可以使代码更简洁，并且在许多情况下更符合实际需求。
* 定义一个基类异常（如 `BaseException`）可以提供一个统一的异常处理机制，方便我们在整个应用程序中管理和处理异常。


