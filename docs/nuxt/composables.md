# 内置组合函数

## useRequestURL

当我们要访问请求的URL时， 可使用 ``useRequestURL`` 组合函数。

``useRequestURL`` 是一个辅助函数，它返回一个 [URL 对象](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)，并且可在客户端和服务端使用。

 在 ``Nuxt/Nitro`` 的 [``Hybrid Rendering``](https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering) 场景下，如果你开启了缓存（如 ``route rules`` 里的 ``cache``），当 ``Nitro`` 返回缓存内容时，所有原始请求头（headers）都会被丢弃。这意味着像 ``useRequestURL()`` 这样的函数在服务端渲染时，获取到的 ``host`` 会是 ``localhost``，而不是用户真实请求的 ``host``。这对于多租户``（multi-tenant）``场景会导致缓存混淆或 ``host`` 信息丢失。

下面，通过简单的案例演示下：

* 修改 nuxt.config.ts

```ts
// nuxt.config.ts
export default defineNuxtConfig({
    routeRules: {
        '/**': {
            cache: {
                swr: true,
            },
        },
    }
})
```

* 修改 ``app.vue`` 文件

```html
<script lang="ts" setup>
const url = useRequestURL()
console.log(url)
</script>
```

* 访问页面 ``http://192.168.100.83:3000/login``

控制台输出内容如下：

```json
{
    host: "localhost"
    hostname: "localhost"
    href: "http://localhost/login"
    origin: "http://localhost"
}
```

为了解决这个问题，你可以在 ``route rules`` 里通过 ``cache.varies`` 指定哪些 ``headers`` 参与缓存 ``key`` 的生成，比如 ``host`` 或 ``x-forwarded-host``。这样 ``Nitro`` 会根据这些 ``header`` 的不同值分别缓存和返回内容，从而实现多租户隔离。

* 修改 ``nuxt.config.ts``

```ts
export default defineNuxtConfig({
   routeRules: {
    '/**': {
      cache: {
        swr: true,
        // 当请求访问站点是带端口时且通过 nginx 转发时，记得添加 x-forwarded-port 头，否则 port 会丢失。
        varies: ['host', 'x-forwarded-host', 'x-forwarded-port'],
      },
    },
  }
})
```

* 访问页面 ``http://192.168.100.83:3000/login``

```json
{
    host: "192.168.100.83:3000",
    hostname: "192.168.100.83"
    href: "http://192.168.100.83:3000/login",
    origin: "http://192.168.100.83:3000"
}
```

查看控制台，可以正常获取到实际的 ``headers`` 信息。


> 多租户场景的特点：
> * 多个站点/域名指向同一套代码部署
> * 根据请求的域名（host header）来区分不同的租户
> * 每个租户看到不同的内容，但共享相同的应用代码

### 总结

* ``useRequestURL``：用于获取请求的 URL 信息，返回的是一个标准 URL 对象，可在客户端和服务端使用。
* ``缓存场景下的问题``：当使用缓存策略时，``useRequestURL`` 会返回 ``localhost`` 作为 ``host`` 头，而不是实际的请求 ``host``。这是因为 ``Nitro`` 在返回缓存内容时会丢弃所有原始请求头。  
* ``解放方案``：通过在 ``route rules`` 中使用 ``cache.varies`` 选项来指定哪些 ``headers`` 参与缓存 ``key`` 的生成。这对于多租户``（multi-tenant）``实现特别重要。





