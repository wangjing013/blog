# redis


## 安装

```bash
# 使用 Homebrew 安装 Redis
brew install redis
```

## 启动 Redis 服务

```bash
# 启动 Redis 服务
redis-server
```

## 访问 Redis

默认情况下，Redis 服务会在 `6379` 端口启动。你可以通过以下命令访问 Redis：

```bash
# 连接到 Redis 服务器
redis-cli
```

在 Redis CLI 中，你可以执行各种 Redis 命令，例如：

```bash
# 设置一个键值对
set mykey "Hello, Redis!"
# 获取键的值
get mykey
``` 

## 停止 Redis 服务

```bash
# 停止 Redis 服务
redis-cli shutdown
```