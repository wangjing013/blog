# 访问字段

Class 实例，提供获取获取字段方法：

* getFields() 获取所有 public 字段，包含从父类继承而来的。
* getField(name) 获取指定的某个 public 字段，包含从父类继承而来的。
* getDeclaredFields() 获取当前类中定义的所有字段（无论 public 还是 private），但不包括父类字段。
* getDeclaredField(name) 获取当前类中定义的某个指定字段（无论 public 还是 private），但不包括父类字段。

现在通过简单案例，理解一下：

```java
class Person {
    private String name;
    public int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }
}

class Student extends Person {
    public int score;
    private int grade;

    Student (String name, int age, int score) {
        super(name, age);
        this.score = score;
    }
}


public class ClassExample {
    public static void main(String[] args) {
        Class clazz = Student.class;
        try {
            System.out.println(clazz.getDeclaredField("grade")); // private int com.reflection.Student.grade
            System.out.println(clazz.getField("grade")); // java.lang.NoSuchFieldException: grade
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }
}
```


## 获取字段值

利用反射拿到字段的一个 ``Field`` 实例只是第一步，我们还可以拿到一个实例对应的该字段的值

例如，对于一个 ``Person`` 实例，我们可以先拿到 ``name`` 字段对应的 ``Field``，再获取这个实例的 ``name`` 字段的值：

```java
class Person {
    private String name;
    public int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }
}

public class ClassExample {
    public static void main(String[] args) {
       try {
            Person p = new Person("张三", 20); // 创建实例
            Class clazz1 = p.getClass();      // 获取 Person 对应 Class 实例
            Field filed = clazz1.getDeclaredField("name"); // 获取自身声明的属性
            Object value   = filed.get(p); // 获取 p 属性的值
            System.out.println(value);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}
```

运行上面的代码，会得到一个 ``IllegalAccessException`` 异常，也就是非法访问异常。 由于 name 使用的是 private 修饰符。导致不能被访问。

通过如下两种方式解决：

* 改为 public 修饰符
* 通过 setAccessible 方法

这里使用 ``setAccessible`` 方法，使用如下：

```java
class Person {
    private String name;
    public int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }
}

public class ClassExample {
    public static void main(String[] args) {
       try {
            Person p = new Person("张三", 20); // 创建实例
            Class clazz1 = p.getClass();      // 获取 Person 对应 Class 实例
            Field filed = clazz1.getDeclaredField("name"); // 获取自身声明的属性
            filed.setAccessible(true); // 允许访问
            Object value   = filed.get(p); // 获取 p 属性的值
            System.out.println(value);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}
```
