# 预渲染

Nuxt 允许在构建时对页面进行静态渲染，这对于提升性能或优化 SEO 指标非常重要。

Nuxt 允许去选择一些页面在构建时完成静态渲染。当用户用户访问时，是直接将提前构建好的页面返回而不是在请求时去生成返回。

## 基于爬虫完成预渲染

使用 ``nuxt generate`` 命令，通过 ``Nitro 爬虫`` 来构建并预渲染你的应用程序。 此命令类似于执行 ``nuxt build``，但会将 ``nitro.static`` 选项设置为 ``true``。
或运行 ``nuxt build --prerender``。

```shell
npx nuxt generate
```

执行完 ``nuxt generate`` 后，即可将 ``.output/public`` 目录下的内容部署到任意静态托管服务上。若想在本地预览，可以直接使用 ``npx serve .output/public``。

``Nitro crawler`` 工作原理：

1. 加载应用的根路由（/）、``~/pages 目录下的非动态页面``，以及 ``nitro.prerender.routes`` 数组中定义的路由的 HTML 内容。
2. 将生成的 ``HTML`` 和 ``payload.json`` 保存到 ``~/.output/public/`` 目录中，以便作为静态资源进行服务。
3. 在生成 HTML 中，查找导航其他路由的锚点标签。
4. 对找到的每个锚点标签重复执行步骤 1-3，直到没有新的锚点可供爬取。

## 选择需要预渲染的路由

你可以手动指定需要在构建时预渲染的路由，或忽略掉一些不希望被预渲染的路由（例如 /dynamic）。

```ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/user/1', '/user/2'],
      ignore: ['/dynamic'],
    },
  },
})
```

最后，你可以手动使用 ``routeRules`` 选项进行配置：

```ts
export default defineNuxtConfig({
  routeRules: {
    '/rss.xml': { prerender: true },
    '/this-DOES-NOT-get-prerendered': { prerender: false },
    // 可以使用通配符，任何在 blog 下面的内容都会被预渲染。
    '/blog/**': { prerender: true },
  },
})
```

``Nuxt`` 提供对上面定义的一种简写形式，可以在页面中使用 ``defineRouteRules`` 方法，去设置是否开启预渲染。

```html
<script setup>
defineRouteRules({
  prerender: true,
})
</script>

<template>
  <div>
    <h1>首页</h1>
    <p>构建时预渲染</p>
  </div>
</template>
```

上面写法，在构建时会转换为：

```js
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
  },
})
```


## 运行时设置预渲染的路由

### prerenderRoutes

你可以在 Nuxt 上下文的运行时使用此方法，为 ``Nitro`` 添加更多需要预渲染的路由。

```ts
<script setup>
prerenderRoutes(['/some/other/url'])
prerenderRoutes('/api/content/article/my-article')
</script>

<template>
  <div>
    <h1>这将在预渲染时注册其他需要预渲染的路由</h1>
  </div>
</template>
```

### prerender:routes Nuxt hook

该钩子函数在预渲染之前被调用，可以在该方法动态注册需要预渲染的路由：

```ts
export default defineNuxtConfig({
  hooks: {
    async 'prerender:routes' (ctx) {
      const { pages } = await fetch('https://api.some-cms.com/pages').then(
        res => res.json(),
      )
      for (const page of pages) {
        ctx.routes.add(`/${page.name}`)
      }
    },
  },
})
```

### prerender:generate Nitro hook

每个路由预渲染时都会调用该钩子函数。 你可以利用它对每个被预渲染的路由进行精细化处理。

```ts
export default defineNuxtConfig({
  nitro: {
    hooks: {
      'prerender:generate' (route) {
        if (route.route?.includes('private')) {
          route.skip = true
        }
      },
    },
  },
})
```

## 总结

1. **预渲染概念**
   预渲染（Prerendering）是在构建阶段将页面生成静态 HTML 的过程。用户访问时，可以直接返回预构建的页面，而无需在请求时生成，从而提升性能和 SEO 表现。

2. **实现方式**
   Nuxt 的预渲染是基于 **Nitro 爬虫** 实现的。通过爬虫，它会：

   * 加载应用根路由、`~/pages` 目录下的非动态页面以及 `nitro.prerender.routes` 指定的路由；
   * 保存生成的 HTML 和 payload.json 到 `.output/public/` 目录；
   * 查找 HTML 中的所有锚点链接，递归爬取其他路由，直到没有新的锚点可爬取。

3. **路由控制**

   * 可以在 **nuxt.config** 中通过 `nitro.prerender.routes` 手动指定要预渲染的路由或忽略某些路由；
   * 也可以通过 `routeRules` 或 `defineRouteRules` 在页面中配置是否启用预渲染；
   * 运行时可使用 `prerenderRoutes()` 方法动态添加需要预渲染的路由；
   * 钩子函数 `prerender:routes` 和 `prerender:generate` 可用于动态生成或精细化处理每个路由。

4. **执行流程**

   * 当执行 `nuxt generate` 时，Nuxt 会根据指定路由和爬虫逻辑生成静态页面；
   * 所有生成内容存放在 `.output/public/` 下，可直接部署到任意静态托管服务；
   * 本地预览可以使用 `npx serve .output/public`。

5. **优势**

   * 提升页面加载速度；
   * 改善 SEO；
   * 保留动态路由灵活性，同时让非动态页面静态化；
   * 支持精细化控制和运行时动态扩展路由。
