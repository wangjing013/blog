# MySQL 忘记密码了怎么办？

### 1. 彻底关闭当前运行的 MySQL

在重置之前，必须先杀掉已经在运行的进程。在终端输入：
```bash
mysql.server stop
```
或者（如果上面失效）：
```bash
sudo pkill mysql
```

### 2. 开启“跳过权限验证”模式

我们要启动一个“不设防”的 MySQL，这样登录就不需要密码。
1. 在终端输入：
   ```bash
   mysqld_safe --skip-grant-tables &
   ```
2. **注意**：输入完后，终端可能会卡住或显示一堆日志，这是正常的。**直接按回车**，或者**新开一个终端窗口**继续操作。

### 3. 免密登录并修改密码

在**新的**窗口中执行以下操作：

1. **进入 MySQL：**
   ```bash
   mysql -u root
   ```
   *（此时应该直接进去了，不需要密码）*

2. **刷新权限（关键步）：**
   ```sql
   FLUSH PRIVILEGES;
   ```

3. **修改密码（请根据你的 MySQL 版本选一个）：**
   * **如果是 MySQL 8.0 及以上版本（最常见）：**
       ```sql
       ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
       ```
   * **如果报错，尝试这个兼容命令：**
       ```sql
       SET PASSWORD FOR 'root'@'localhost' = '新密码';
       ```
   *（注意：把 `新密码` 换成你想设的，别忘了末尾的分号 `;`）*

4. **再次刷新并退出：**
   ```sql
   FLUSH PRIVILEGES;
   exit;
   ```

### 4. 正常重启并测试
先把刚才那个“不设防”的模式关掉：
```bash
mysql.server stop
```
然后正常启动：
```bash
mysql.server start
```
最后用新密码登录试试：
```bash
mysql -u root -p
```


**特别提醒：**
如果你在执行 `ALTER USER` 时提示 `The MySQL server is running with the --skip-grant-tables option`，那是因为你忘记执行第一步里的 `FLUSH PRIVILEGES;` 了，记得补上。