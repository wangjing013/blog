# MySQL

## Mac 安装 mysql

```bash
brew install mysql
```
## 配置环境变量

编辑 .bash_profile 或 .zshrc 文件，添加以下内容：

下面是通过在 .bash_profile 文件中添加 MySQL 的路径来配置环境变量的示例：

### 编辑 .bash_profile 文件
```bash
vim ~/.bash_profile
```

### 添加 MySQL 路径
```bash
export PATH="/opt/homebrew/Cellar/mysql@8.4/8.4.8_1/bin:$PATH"
```

### 保存并退出
按下 `Esc` 键，然后输入 `:wq` 并按回车

### 使更改生效
```bash
source ~/.bash_profile
```
### 验证 MySQL 是否安装成功
```bash
mysql --version
// 或者
mysql -V
```

如果显示 MySQL 的版本信息，说明安装和环境变量配置成功。

## MySQL 常用命令

### 启动 MySQL 服务
```bash
mysql.server start
```

### 停止 MySQL 服务
```bash
mysql.server stop
```

### 重启 MySQL 服务
```bash
mysql.server restart
```

### 登录 MySQL
```bash
mysql -u root -p
```
### 创建数据库
```sql
CREATE DATABASE my_database;
```
### 显示所有数据库
```sql
SHOW DATABASES;
```

### 删除数据库
```sql
DROP DATABASE my_database;
```
### 选择数据库
```sql
USE my_database;
```



## 资料

- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [mac 免费客户端]
    * DBeaver
    * Workbench Community Edition
    * Sequel Pro
    * TablePlus