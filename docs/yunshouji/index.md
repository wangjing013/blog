# 云手机

## 本地如何连接云手机

* openvpn 连接到云手机所在的网络
* 通过 adb connect 连接到云手机的 IP 地址
* 通过 adb shell 连接到云手机的 shell
* 通过对应命令执行相关操作

查看云手机的 IP 地址：

```bash
// 连接到云手机所在的网络
adb connect IP:PORT
// 查看连接的设备
adb devices
// 连接到云手机的 shell
adb shell
// 查看云手机的 IP 地址
ip addr
```