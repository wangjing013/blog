# nacos

Nacos 是阿里巴巴开源的一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。


## Nacos 安装

* 下载 Nacos

https://github.com/alibaba/nacos

* 解压并进入 `bin` 目录，执行 `startup.sh` 启动 Nacos 服务

```bash
cd nacos/bin
./startup.sh -m standalone
```


## 访问

默认情况下，Nacos 服务会在 `8848` 端口启动。你可以通过以下 URL 访问 Nacos 控制台：``http://localhost:8848/nacos``