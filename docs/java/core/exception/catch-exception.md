#  捕获异常

## 多 catch 语句

支持通过多个 ``catch`` 语句，每个 ``catch`` 分配捕获对应的 ``Exception`` 及其子类。 

``catch`` 捕获是从上往下进行执行，如果上一个没有捕获到，往下传递，直到捕获到或者没有捕获到为止。

```java
try {
    // 可能抛出异常的代码
} catch(IOException e) {
    // 处理 IOException
} catch(SQLException e) {
    // 处理 SQLException
} catch(Exception e) {
    // 处理其他 Exception
}
```

另外，当存在多个 ``catch`` 语句时，子类写前面，否则子类永远无法被捕获到。

```java
try {
    // throw UnsupportedEncodingException
 } catch (IOException e) {
    System.out.println("IO error");
} catch (UnsupportedEncodingException e) { // 永远捕获不到
    System.out.println("Bad encoding");
}
```

## finally 语句

``finally`` 语句块中的代码无论是否发生异常都会被执行，通常用于资源的清理工作。

```java
try {
    // 可能抛出异常的代码
} catch(Exception e) {
    // 处理异常
} finally {
    // 无论是否发生异常都会执行的代码
}
```

注意 ``finally`` 有几个特点：

* ``finally`` 总是最后执行的，即使在 ``try`` 块中有 ``return`` 语句，``finally`` 也会在返回之前执行。
* ``finally`` 语句不是必须的，可写可不写。

