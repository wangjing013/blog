# MySQL Workbench

## 本地连接远程 MySQL 数据库

### 通过 SSH 连接

#### 通过 Workbench 连接远程 MySQL 数据库

1. 打开 MySQL Workbench，点击 `+` 号创建新的连接。
2. 在连接设置中，选择 `Standard TCP/IP over SSH` 作为连接方法。
3. 填写 SSH 主机地址、SSH 用户名和 SSH 密码。
4. 填写 MySQL 主机地址、MySQL 用户名和 MySQL 密码。
5. 点击 `Test Connection` 测试连接是否成功。


#### 通过 SSH 隧道连接远程 MySQL 数据库

1. 在终端中使用 SSH 命令创建 SSH 隧道：

```bash
ssh -L 3307:localhost:3306 user@remote_host
```
这将把本地的 3307 端口转发到远程主机的 3306 端口。

2. 打开 MySQL Workbench，点击 `+` 号创建新的连接。
3. 在连接设置中，选择 `Standard (TCP/IP)` 作为连接方法。
4. 填写 `localhost` 作为 MySQL 主机地址，`3307` 作为端口号，MySQL 用户名和 MySQL 密码。
5. 点击 `Test Connection` 测试连接是否成功。

### 直接连接

1. 打开 MySQL Workbench，点击 `+` 号创建新的连接。
2. 在连接设置中，选择 `Standard (TCP/IP)` 作为连接方法。
3. 填写 MySQL 主机地址、MySQL 用户名和 MySQL 密码。
4. 点击 `Test Connection` 测试连接是否成功。


