# 反射

Java 的反射是指程序在运行期可以拿到一个对象的所有信息。

正常情况下，我们要访问某个对象属性和方法时，通常会传入该对象的实例：

```java
public class Main {
    String getFullName(Person p) {
        return p.getFirstName() + " " + p.getLastName();
    }
}
```

但是，如果不能获得 Person 类，只有一个 Object 实例，比如这样：

```java
String getFullName(Object obj) {
    return ???
}
```

怎么办？强制转型吗？

```java
String getFullName(Object obj) {
    Person p = (Person) obj;
    return p.getFirstName() + " " + p.getLastName();
}
```

强制转型的时候，你会发现一个问题：编译上面的代码，仍然需要引用Person类。不然，去掉import语句，你看能不能编译通过？

所以，反射是为了解决在运行期，对某个实例一无所知的情况下，如何调用其方法。


