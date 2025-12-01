# 部署

## Node.js Server

通过 node 来启动应用程序。

```shell
node .output/server/index.mjs
```

这将启动默认监听端口 ``3000`` 的生产 ``Nuxt`` 服务器。

下面是关于运行时环境变量：

* NITRO_PORT 或 PORT (默认是 3000)
* NITRO_HOST 或 HOST (默认是 '0.0.0.0')
* NITRO_SSL_CERT 和 NITRO_SSL_KEY - 如果两者都指定，将启动 HTTPS 服务模式。通常只有在测试的时候可能会使用到它，在正式部署时，通常会使用
反响代理工具（如：Cloudflare 或 Nginx），此时有关 SSL 配置都会在这些工具中配置。

## PM2

```ts
module.exports = {
  apps: [
    {
      name: 'example-project', // 
      exec_mode: 'cluster', // “cluster” or “fork”, 默认是 fork 单进程模式
      instances: 2, // 可选值：max || 指定特定实例数，0 ｜ max 表示 PM2 将根据 cpu 数量启动最大进程（集群模式）
      max_memory_restart: '500M', // 每个实例使用内存，超过内容自动重启
      script: './.output/server/index.mjs', // 应用启动脚本
      env: {
        PORT: '3000', // 启动端口
      },
    },
  ],
}
```

* name: 应用名称，不指定情况下，默认是脚本名称(不含扩展)
* exec_mode: “cluster” or “fork”, 默认是 fork。
  * fork 模式：单进程运行应用，适合开发或资源有限的场景。
  * cluster 模式：多进程运行应用，适合生产环境，能更好地利用服务器多核资源。
* instances： 开启集群模式时可用，在不指定特定数量时， PM2 将根据 cpu 数量启动最大进程。
* max_memory_restart：如果每个实例超过指定内容时，将自动重启。
* script：应用启动脚本
* env：环境变量

关于 pm2 更多使用，请阅读 [pm2](https://pm2.keymetrics.io/docs/usage/application-declaration/) 文档。


## 静态宿主环境

通过下面的两种方式，可以将 Nuxt.js 应用部署到任何静态宿主服务

* Static site generation (SSG)：当 ``ssr: true`` 时，``nuxt generate`` 会在构建时预渲染所有路由，生成对应的静态 HTML 文件，并自动生成 ``/200.html`` 和 ``/404.html`` 作为 ``SPA`` 的回退页面。
* Single page application：当 ``ssr: false`` 时，``nuxt generate`` 只会生成一个带有空 ``<div id="__nuxt"></div>`` 的 ``index.html``，以及 ``/200.html`` 和 ``/404.html``，页面内容完全由客户端渲染，``SEO 效果较差``。


## nginx

nginx（发音为 "engine x"）是一个 HTTP 服务器，同时支持反向代理、内容缓存、负载均衡、TCP/UDP 代理和邮件代理等功能。

在前端项目的生产环境中，无论是静态站点还是需要后端支持的应用，``nginx`` 都常被用作反向代理和资源托管服务器。

接下来，分别来配置静态站点和非静态站点：

### 静态站点

```shell
location /{
  root /Users/****/project/项目名/.output/public/;
  index  index.html index.htm;
  try_files $uri $uri/ /index.html;
  add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

配置说明：
* root：指定静态资源根目录，这里指向构建产物所在路径。
* index：定义默认访问的首页文件，例如 index.html 或 index.htm。
* try_files：当访问路径对应的资源文件不存在时，会依次尝试匹配，最终回退到 index.html。这一配置对 SPA（单页应用） 部署尤为重要，可以确保前端路由正常工作。
* add_header：设置响应头，这里指定了 Cache-Control 策略，禁止缓存，确保资源每次都从服务端获取。

上面只是简单配置，确保项目能正常访问。


### 非静态站点 (SSR模式)

SSR 模式下，Nuxt 默认监听 3000 端口。``nginx`` 作为反向代理，将外部请求转发到 ``Nuxt`` 服务。

```shell
location / {
  proxy_pass http://localhost:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  # 如果项目中使用 Websocket 且需要将请求正常转发给 Nuxt 服务，那么需要设置如下两行。
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_cache_bypass $http_upgrade;
}
```

上述配置中，nginx 只是做了简单的代理转发，所有请求都会经过 Nuxt 服务。

这样虽然能保证功能完整，但也会带来一些问题：

Nuxt 提供 public 目录来存放静态资源，但如果直接通过 Nuxt 进程去处理这些文件，请求链路会变为：

> 客户端 -> nginx -> Nuxt -> nginx -> 客户端

也就是说，当访问图片、文件时，Nuxt 需要先将资源读入进程，再以流的方式返回客户端。如果资源较多或并发量较大，容易导致 内存和 CPU 占用过高。

### 静态资源交给 nginx

为了避免 Nuxt 被动承担静态资源请求，可以交由 nginx 直接处理：

> 客户端 -> nginx -> 客户端

配置示例：

```shell
location /_nuxt/ {
  root /Users/****/project/项目名/.output/public/;
  access_log off;
}

location /images/{
  root /Users/****/project/项目名/.output/public/;
  access_log off;
}

location / {
  proxy_pass http://localhost:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
# 如果项目中使用 Websocket 且需要将请求正常转发给 Nuxt 服务，那么需要设置如下两行。
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_cache_bypass $http_upgrade;
}
```

这样就实现了分工明确：

* nginx 直接托管静态资源。
* Nuxt 仅负责做动态渲染的部分。

这种方式不仅能减轻 Nuxt 进程的压力，还能显著提升页面访问效率。


## 总结

在 Nuxt 项目的生产部署中，常见的方式包括 直接使用 Node.js 启动服务、借助 PM2 进行进程管理，以及将应用部署到 静态宿主环境。针对不同的运行模式，部署策略也有所不同：

* **Node.js/PM2**：适合 SSR 模式或需要动态渲染的场景，PM2 可以提供多进程集群与内存管理能力，提升服务的稳定性与可用性。
* **静态宿主环境**：适合 SSG 或纯 SPA 模式，能直接将构建产物托管到任意静态资源服务中，部署方式简单高效。
* **nginx**：在实际生产环境中，nginx 几乎是标配。
  * 对于 静态站点，nginx 可以直接托管构建后的产物，并通过合理的缓存策略优化性能。
  * 对于 SSR 模式，nginx 既能作为反向代理，又能承担静态资源的分发，从而减轻 Nuxt 服务的压力，避免资源请求造成的内存和 CPU 过高占用。

综上，最佳实践是将``动态渲染交给 Nuxt``，而将``静态资源交由 nginx`` 托管。这种分工方式不仅提升了访问效率，也增强了服务的稳定性与可扩展性。