# 本地连接远程数据库

## 通过 SSH 连接

### 通过 Workbench 连接远程 MySQL 数据库

1. 打开 MySQL Workbench，点击 `+` 号创建新的连接。
2. 在连接设置中，选择 `Standard TCP/IP over SSH` 作为连接方法。
3. 填写 SSH 主机地址、SSH 用户名和 SSH 密码。
4. 填写 MySQL 主机地址、MySQL 用户名和 MySQL 密码。
5. 点击 `Test Connection` 测试连接是否成功。


### 通过 SSH 隧道连接远程 MySQL 数据库

1. 在终端中使用 SSH 命令创建 SSH 隧道：

```bash
ssh -L 3307:localhost:3306 user@remote_host
```
这将把本地的 3307 端口转发到远程主机的 3306 端口。

2. 打开 MySQL Workbench，点击 `+` 号创建新的连接。
3. 在连接设置中，选择 `Standard (TCP/IP)` 作为连接方法。
4. 填写 `localhost` 作为 MySQL 主机地址，`3307` 作为端口号，MySQL 用户名和 MySQL 密码。
5. 点击 `Test Connection` 测试连接是否成功。


#### 案例

通过跳板机连接远程 MySQL 数据库的示例命令：

```shell
ssh -L 3307:localhost:3306 -p 2233 username@remote_host
```

* `-L` : 隧道语法，参数格式是 [本地端口]:[目标IP]:[目标端口]。
* `-p` ：跳板机的端口号，默认为 22，如果跳板机使用了非默认端口，需要指定。
* `username` 是跳板机的 SSH 用户名。
* `remote_host` 是跳板机的地址。

按回车后，输入 SSH 密码，成功连接后，MySQL Workbench 就可以通过 `localhost:3307` 访问远程 MySQL 数据库了。

### 直接连接

1. 打开 MySQL Workbench，点击 `+` 号创建新的连接。
2. 在连接设置中，选择 `Standard (TCP/IP)` 作为连接方法。
3. 填写 MySQL 主机地址、MySQL 用户名和 MySQL 密码。
4. 点击 `Test Connection` 测试连接是否成功。
