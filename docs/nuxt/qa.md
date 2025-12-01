# 常见问题

## 0. 为什么选择 Nuxt 3

Nuxt 3 是一个基于 Vue 3 的现代化框架，具有以下优势：

* 生态系统丰富，拥有大量的插件和模块
* 项目结构清晰，易于维护
* 基于文件系统的路由配置，简化了路由管理
* 支持静态站点生成（SSG）、服务器端渲染（SSR）和客户端渲染（CSR）
* 提供自动化的代码引入

## 1. 在使用 Teleport 时

Nuxt 在应用程序初始化时会创建一个特定的 DOM 元素，默认情况下它的 ID 是 ``teleports``，这个元素专门用于接收通过 <Teleport> 组件传送的内容。

## 2. Teleport 组件的 disabled 属性

当在做 ``Static Generation`` 时，``disabled`` 属性不会生效。此时，推荐通过条件渲染来控制 Teleport 的显示与否。

## 3. 什么是 SSG

SSG 是 Static Site Generation 的缩写，意为静态站点生成。它是 Nuxt 3 中的一种渲染模式，可以在构建时将页面预渲染为静态 HTML 文件，从而提高页面加载速度和 SEO 性能。

那些场景适合使用 SSG？ 博客、官网、不依赖服务器端数据的页面等静态内容适合使用 SSG。SSG 可以在构建时将页面预渲染为静态 HTML 文件，从而提高页面加载速度和 SEO 性能。


## 4. 什么是 CSR

CSR 是 Client-Side Rendering 的缩写，意为客户端渲染。它是 Nuxt 3 中的一种渲染模式，可以在浏览器中动态加载和渲染页面内容。CSR 适合需要频繁更新数据的页面，如企业后台管理系统、实时数据展示等。

## 5. 什么是 SSR

SSR 是 Server-Side Rendering 的缩写，意为服务器端渲染。 减少页面白屏时间，提高首屏加载速度。


## 6. 混合渲染模式

Nuxt3 支持混合渲染模式，可以在同一个应用中使用 SSG、SSR 和 CSR。 通常需要在 ``nuxt.config.ts`` 中配置。

如下：

```js
export default defineNuxtConfig({
  routeRules: {
    // 在构建时预渲染首页
    '/': { prerender: true }, 
    // 按需生成的产品页面，后台重新验证，缓存直到 API 响应更改
    '/products': { swr: true },
    // 按需生成的产品页面，后台重新验证，缓存 1 小时。 
    '/products/**': { swr: 3600 },
    // 博客文章页面按需生成，后台重新验证，缓存 1 小时
    '/blog': { isr: 3600 },
    // 博客文章页面按需生成，直到下次部署，缓存到 CDN
    '/blog/**': { isr: true },
    // 管理仪表板仅在客户端渲染
    '/admin/**': { ssr: false },
    // API 添加 CORS 头
    '/api/**': { cors: true },
    // 重定旧的 URL
    '/old-page': { redirect: '/new-page' }
  }
})
```

### 6.1 什么是预渲染

了解预渲染，先了解页面的生命周期

1. 预渲染：在构建时生成静态 HTML 文件(打包时)
2. 服务器端渲染：在请求时生成静态 HTML 文件(请求时)
3. 客户端渲染：在浏览器中生成静态 HTML 文件(浏览器中)

预渲染是指在构建时将页面预先渲染为静态 HTML 文件的过程。它可以提高页面加载速度和 SEO 性能。预渲染的页面在请求时不会再进行服务器端渲染，而是直接返回静态 ``HTML`` 文件。



