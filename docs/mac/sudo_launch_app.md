# 管理员方式启动应用程序

## 1. 命令行提权启动（慎用）

如果你确实需要赋予 App 读写系统受限文件的权限，通常在终端（Terminal）中使用以下格式：

### 命名建议：`sudo_launch_app.sh`

```bash
# 格式：sudo /Applications/应用名.app/Contents/MacOS/可执行文件名
sudo /Applications/TextEdit.app/Contents/MacOS/TextEdit
```
> **注意：** 这样启动后，该 App 创建的所有文件所有者都会变成 `root`。
