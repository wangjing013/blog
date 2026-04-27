# 如何卸载 MySQL 8.0 并安装 5.7

如果你之前安装了 MySQL 8.0，但现在需要切换回 5.7，以下是两种常见的方案：

### 方案一：如果你不再需要 8.0（最推荐，干净整洁）
如果你只是想把版本降回来，先彻底清理 8.0 是最稳妥的，可以避免各种路径和配置文件的冲突。

1. **停止并卸载 8.0**：
   ```bash
   brew services stop mysql
   brew uninstall mysql
   ```

2. **清理残留的数据文件（关键！）**：
   MySQL 8.0 的数据存在 `/usr/local/var/mysql`（Intel Mac）或 `/opt/homebrew/var/mysql`（M系列 Mac）。5.7 没法用这些数据。
   **警告：这会删除所有 8.0 里的数据库！**
   ```bash
   rm -rf /usr/local/var/mysql  # 请根据你的 brew 路径确认
   ```

3. **然后再按照上一步的方法安装 5.7**。


### 方案二：你想保留 8.0，但切换到 5.7
如果你以后还想用 8.0，只是现在要切到 5.7。

1. **停止 8.0 服务**：
   ```bash
   brew services stop mysql
   ```

2. **取消 8.0 的链接（Unlink）**：
   这会让 `mysql` 命令暂时失效，方便我们链接 5.7。
   ```bash
   brew unlink mysql
   ```

3. **安装并强制链接 5.7**：
   ```bash
   brew install mysql@5.7
   brew link --force mysql@5.7
   ```

### 总结建议
如果你现在是在给 **Yuanjing Interaction（远景互动）** 做项目，或者在折腾 **CueIP/OnesProxy** 的后端环境，老牌的 IP 代理系统确实对 5.7 兼容性更好。

* **省事方案**：直接卸载 8.0 并清理数据文件夹，然后重装 5.7。
* **专业方案**：使用 **Docker**。你可以同时跑 10 个不同版本的 MySQL，互不干扰，连端口都可以映射成 3307、3308。