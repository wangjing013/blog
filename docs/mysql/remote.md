# 本地连接远程数据库


## 一 通过 SSH 隧道连接（最推荐、最安全）

这种方式不需要你在防火墙上暴露 3306 端口，也不需要修改 MySQL 的权限配置。它通过加密的 SSH 通道转发流量，安全级别最高。

### 1.1 使用场景

* 本地开发
* 临时维护

### 1.2 操作步骤

以 MySQL Workbench 为例，**MySQL Workbench** 是官方提供的工具，内置了非常完善的远程连接功能。

### 1.3 在 MySQL Workbench 中设置 SSH 隧道连接

1.  **新建连接**：点击主界面 “MySQL Connections” 旁边的 **“+”** 号。
2.  **选择连接类型 (Connection Method)**：
    在下拉菜单中选择 **`Standard TCP/IP over SSH`**。
3.  **配置参数**：
    你需要填写两个部分的信息：
    * **SSH 参数（连接服务器）：**
        * **SSH Hostname**: 服务器的公网 IP。
        * **SSH Username**: 服务器的登录账号（通常是 `root`）。
        * **SSH Password/Key File**: 如果是用密码登录就点 `Password`；如果是用私钥（如 `.pem` 或 `.pub` 文件），点击 `SSH Key File` 旁边的 `...` 选择你的私钥文件。
    * **MySQL 参数（服务器内部的数据库信息）：**
        * **MySQL Hostname**: 保持 **`127.0.0.1`**（因为是通过 SSH 登录后再本地访问）。
        * **MySQL Port**: 保持 **`3306`**。
        * **Username**: 数据库的用户名（如 `root`）。
        * **Password**: 点击 `Store in Keychain` 输入数据库的登录密码。

4.  **测试连接**：点击右下角的 **`Test Connection`**。


### 1.4 常见问题

* **如果测试失败：** 请检查你本地是否能通过终端（Terminal）直接 SSH 连上服务器。如果终端都连不上，通常是服务器的 22 端口没开或者秘钥/密码不对。
