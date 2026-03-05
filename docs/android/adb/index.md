# ADB

## 什么是 ADB? 

Android Debug Bridge (ADB) 是一个多功能命令行工具，允许您与设备进行通信。它是 Android SDK 的一部分，提供了各种功能，如安装和调试应用程序、访问设备的 Unix shell 等。

## ADB 的主要功能

- **安装和卸载应用程序**：使用 ADB，您可以轻松地安装和卸载应用程序，而无需在设备上进行操作。
- **调试应用程序**：ADB 允许开发人员调试应用程序，查看日志输出，并与设备进行交互。
- **访问设备的 Unix shell**：您可以使用 ADB 进入设备的 Unix shell，执行各种命令来管理设备。
- **文件传输**：ADB 还支持在计算机和设备之间传输文件，使得管理设备上的数据更加方便。

## ADB 的使用场景
- **开发和测试**：开发人员使用 ADB 来安装和调试应用程序，查看日志输出，并与设备进行交互。
- **设备管理**：用户可以使用 ADB 来管理设备上的应用程序，传输文件，以及执行各种命令来维护设备。
- **数据备份和恢复**：ADB 还可以用于备份和恢复设备上的数据，确保重要信息的安全。

## ADB 的安装和配置
1. **下载 Android SDK**：首先，您需要下载并安装 Android SDK。您可以从 Android 开发者网站上获取最新版本的 SDK。
2. **设置环境变量**：安装完成后，您需要将 ADB 的路径添加到系统的环境变量中，以便在命令行中使用 ADB 命令。
3. **连接设备**：确保您的 Android 设备通过 USB 连接到计算机，并且已启用 USB 调试模式。
4. **验证连接**：在命令行中输入 `adb devices`，如果设备列表中显示您的设备，则说明连接成功。

## ADB 的常用命令
- **列出连接的设备**：
```bash
adb devices
```

- **安装应用程序**：
```bash
adb install path/to/your_app.apk
```
- **卸载应用程序**：
```bash
adb uninstall your.package.name
```
- **进入设备的 Unix shell**：
```bash
adb shell
```
- **查看日志输出**：
```bash
adb logcat
```
- **传输文件**：
```bash
adb push local_file_path /sdcard/remote_file_path
adb pull /sdcard/remote_file_path local_file_path
```

## 举例，通过ADB下载手机应用

* 连接设备：首先，确保您的 Android 设备通过 USB 连接到计算机，并且已启用 USB 调试模式。
* 打开命令行：在计算机上打开命令行界面（如终端或命令提示符）。
* 找到下载内容， pm list packages -3 
* 使用以下命令下载应用程序： adb pull /data/app/your.package.name-1/base.apk /path/to/save/your_app.apk

### 1、列出已安装的应用程序
```bash
adb shell pm list packages
```

### 2、列出第三方应用程序
```bash
adb shell pm list packages -3
```

### 3、列出特定应用程序
```bash
adb shell pm list packages | grep your.package.name
```

### 4、下载应用程序
```bash
adb pull /data/app/your.package.name-1/base.apk 本地路径/your_app.apk
```
