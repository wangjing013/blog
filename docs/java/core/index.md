# Java

## 名称概念

* JDK：Java Development Kit，Java开发工具包，是Java开发的基础环境，包含了编译器、运行时环境和各种工具。
* JRE：Java Runtime Environment，Java运行时环境，是JVM和核心类库的集合，提供了运行Java程序所需的环境。
* JVM：Java Virtual Machine，Java虚拟机，是Java程序运行的核心组件，负责执行Java字节码并提供平台无关性。
* Runtime Library：Java运行时库，包含了Java程序运行所需的核心类库，如java.lang、java.util等。

他们之间的关系是： JDK包含了JRE，而JRE包含了``JVM`` 和 ``Runtime Library``。开发者使用JDK进行Java程序的开发，而用户运行Java程序时需要安装JRE。``JVM`` 负责执行Java字节码，使得 Java 程序能够在不同的平台上运行，而 ``Runtime Library`` 提供了Java程序所需的核心类库支持。

Java 之所以能在不同平台运行，得益于 JVM 的平台无关性设计。Java程序被编译成字节码（.class文件），而不是直接编译成特定平台的机器码。JVM在运行时将字节码解释或即时编译成适合当前平台的机器码，从而实现了Java程序的跨平台运行能力。这种设计使得Java程序能够在任何安装了兼容JVM的操作系统上运行，而无需修改代码。

## Java 常用的 bin 目录下的工具：

* `javac`：Java 编译器，用于将Java源代码（.java文件）编译成字节码（.class文件）。
* `java`：Java 运行时工具，用于执行编译后的Java字节码文件
* `javadoc`：Java文档生成工具，用于从Java源代码中生成API文档。
* `jar`：Java归档工具，用于创建和管理Java归档文件（.jar文件），可以将多个.class文件和资源文件打包成一个.jar文件。
* `jdb`：Java调试工具，用于调试Java程序，提供了断点设置、变量查看等功能。
* `javap`：Java类文件反编译工具，用于查看Java类文件的结构和内容，帮助开发者理解编译后的字节码。
* `jconsole`：Java监视和管理工具，用于监视Java应用程序的性能和资源使用情况，提供了图形化界面。


