# 中间件

Nuxt 提供中间件，在导航到特定路由之前运行代码。

Nuxt 提供一个自定义的路由中间件框架，你可以在整个应用中使用它。非常适合在导航到特定路由之前执行想要运行的代码。

Nuxt 有三种中间件

* 匿名（或内联）路由中间件直接在页面内定义
* 命名路由中间件，放置在 ``app/middleware/``目录下，在页面中使用时通过异步导入自动加载。
* 全局路由中间件，放置在``app/middleware/`` 目录下，以 ``.global`` 为后缀，会在每次路由切换时自动执行.

前两种路由中间件可以在 ``definePageMeta`` 中定义.

> 命名中间件遵循 ``Kebab-case`` 命名规范，例如：my-middleware

> 路由中间件只会在你的 ``Nuxt`` 应用的前端（Vue 部分）执行，与 ``server middleware`` 名字看起来很相似，两者区别非常大。后者在应用的 ``Nitro 服务器``部分运行。

## 使用

路由中间件是导航守卫，它会接收当前路由（from）和即将进入的下一个路由（to）作为参数。

```ts
// middleware/my-middleware.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.params.id === '1') {
    return abortNavigation()
  }

  if (to.path !== '/') {
    return navigateTo('/')
  }
})
```

Nuxt 提供两个全局可以用的帮助函数，可以直接从中间件中返回。

* ``navigateTo`` - 重新到一个给定的路由。
* ``abortNavigation`` - 中止导航，并显示可选的错误消息。

与 ``vue-router`` 导航守卫不同，没有传入第三个参数 ``next``，而是，通过在中间件中返回一个值来确定执行重定向或取消导航。


可能返回的值：

* 不返回（简单返回或不返回） - 不会阻止导航，并将转到下一个中​​间件函数（如果有），或完成路由导航。
* ``return navigateTo('/')`` - 重定向到给定的路由，如果重定向发生在服务端，并将重定向状态设置为 302。
* ``return navigateTo('/', { redirectCode: 301 })`` - 重定向到给定的路由，如果重定向发生在服务端，并将重定向状态设置为 301。
* ``return abortNavigation()`` - 放弃当前导航
* ``return abortNavigation(error)`` - 拒绝当前导航并抛出一个错误。

## 中间件执行顺序

中间件按以下顺序运行：

* 全局路由中间件
* 页面定义的中间件顺序 (如果有多个中间件，使用数组语法)

```md 
-| middleware/
---| analytics.global.ts
---| setup.global.ts
---| auth.ts
```

```html
// pages/profile.vue
<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      // 自定义内连中间件
    },
    'auth',
  ],
})
</script>
```

中间件将按如下顺序执行：

* analytics.global.ts
* setup.global.ts
* 自定义内连中间件
* auth.ts

### 指定全局中间件顺序

默认，全局中间件执行顺序按文件名的字母顺序执行。

然而，有时您可能需要定义一个特定的顺序。例如：在上面案例中，``setup.global.ts`` 可能需要在 ``analytics.global.ts`` 之前运行.

在这种情况下，我们建议给全局中间件加上 ``字母顺序`` 编号。

```md
-| middleware/
---| 01.setup.global.ts
---| 02.analytics.global.ts
---| auth.ts
```

## 中间件运行时

如果你的站点是服务端渲染（SSR）或静态生成（SSG）的，那么路由中间件会被执行两次：

* 第一次是在服务器端渲染页面时执行，对于 SSG (构建时会被执行)
* 第二次是在客户端（浏览器）页面加载并“激活”后再次执行。

这样设计的原因是，有些中间件逻辑必须在浏览器环境下运行，比如：

* 你的网站是静态生成的，页面内容已经提前生成好，只有在客户端才能获取到最新的用户信息。
* 你对响应做了强缓存，导致服务端渲染时拿不到最新数据，需要在客户端再执行一次中间件。
* 你需要访问 localStorage 这样的浏览器 API，这只能在客户端执行。

然后，如果想要控制中间件执行行为，可以这样：

```ts
export default defineNuxtRouteMiddleware((to) => {
  // 不在服务端执行
  if (import.meta.server) {
    return
  }

  // 不在客户端执行
  if (import.meta.client) {
    return
  }

  // 只有在客户端首次页面激活（hydration）时，中间件会被跳过，而后续的客户端路由跳转仍然会执行中间件。
  const nuxtApp = useNuxtApp()
  if (import.meta.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) {
    return
  }
})
```

即使你在服务端中间件中抛出错误并渲染错误页面，该中间件仍会在浏览器端再次运行。

>  在 ``Nuxt`` 的 ``SSR`` 或 ``SSG`` 模式下，页面首次加载时，Vue 会对服务端渲染的 HTML 进行 ``hydration``，使页面变为可交互。这个 ``hydration`` 过程只会在页面初次激活时发生一次。之后的客户端路由跳转，不会再次对同一个页面进行 ``hydration``，而是直接渲染和挂载新的组件。


## 在中间件中访问路由

在中间件中，始终应该使用 ``to`` 和 ``from`` 参数去访问下一个路由和上一个路由。这里上下文中完全避免使用 ``useRoute `` 组合函数。因为在中间件中没有 “当前路由” 的概念，但是可以在中间件中中止导航或重定向到不同的路由。

## 动态添加中间件

可以使用 ``addRouteMiddleware（）`` 辅助函数手动添加``全局``或``命名路由中间件``，例如： 在插件中

```ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-test', () => {
    // 在插件中添加全局中间件，它将在每个路由变化时执行。

  }, { global: true })

  addRouteMiddleware('named-test', () => {
    // 在插件中添加命名中间件，并且会覆盖已经存在同名的中间件。
  })
})
```

## 在构建时添加中间件

当我们需要为每个页面添加相同的中间件时，您无需在每个页面上使用 ``definePageMeta``，而是可以在 ``pages:extend`` 钩子中添加命名路由中间件。

```ts
import type { NuxtPage } from 'nuxt/schema'

export default defineNuxtConfig({
  hooks: {
    'pages:extend' (pages) {
      function setMiddleware (pages: NuxtPage[]) {
        for (const page of pages) {
          if (Math.random() > 0.5) {
            page.meta ||= {}
            // 注意，这将覆盖页面中‘ definePageMeta ’中设置的任何中间件
            page.meta.middleware = ['named']
          }
          if (page.children) {
            setMiddleware(page.children)
          }
        }
      }
      setMiddleware(pages)
    },
  },
})
```

## 总结

* 中间件的类型
    * 匿名（或内联）
    * 命名路由中间件，放置在 ``app/middleware/`` 目录下 
    * 全局中间件，放置在 ``app/middleware/`` 目录下，以 ``.global`` 结尾（如 auth.global.ts），每次路由切换自动执行。
* 中间件中可能的返回值
* 中间件的执行顺序
* 调整中间件的顺序
* 在插件中动态添加中间件
* 使用 ``pages:extend`` 钩子函数，在构建时添加路由中间件