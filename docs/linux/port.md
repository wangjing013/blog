# 端口相关操作 

## 端口占用排查

```shell
lsof -i :8080
```

## 终止进程

```shell
kill <PID>
kill -9 <PID> # 发送 SIGKILL 信号 (强制终止，仅在进程无响应时使用)
```