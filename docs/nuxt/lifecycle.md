# Nuxt Lifecycle

分两个部分：

* 服务端声明周期
* 客户端声明周期

## 服务端声明周期

### 1. 执行 Nitro Server 和 Nitro Plugins (只执行一次)

Nuxt 基于 [Nitro](https://nitro.unjs.io/) 进行服务端渲染，Nitro 是一个现代的服务引擎。

当 ``Nitro`` 启动时，它会执行所有的 ``Nitro`` 插件，也就是 ``server/plugins`` 目录下的文件。这里可以做一些事情，比如：

* 捕获和处理应用程序的错误
* 当 Nitro Shutdown 时，执行一些清理工作
* 注册请求生命周期事件的钩子，例如：修改请求头、响应头等

### 2. 执行 Nuxt Server 中间件

Nitro 服务初始化完成后，Nuxt 会执行所有的 Nuxt Server 中间件，也就是 ``server/middleware`` 目录下的文件。这里可以做一些事情，比如：

* 鉴权
* 日志
* 请求转换(请求到达最终处理程序之前修改或增强请求内容的过程)
    * 修改请求参数
    * 修改响应内容

### 3. 初始化 Nuxt App 和执行 Nuxt App 插件

Vue 和 Nuxt 的应用程序实例会在这里创建。之后 Nuxt 会执行服务端插件。包括：

* 内置插件，例如 Vue Router 和 unhead
* 用户插件，例如 plugins 目录下的文件，包括插件有 my-plugin.js 和 my-plugin.server.js。 插件不指定后缀修饰符时，服务端和客户端都会执行。

插件执行会按特定顺序执行，具体可以参考 [plugins](./plugins.md)

### 4. 路由验证

插件初始化后，中间件执行之前，当在 ``definePageMeta`` 中定义了 ``validate`` 方法时，将会执行 ``validate`` 方法。 

``validate`` 可以是同步或异步。 通常使用 ``validate`` 方法来校验动态路由参数的合法性。

* 如果参数合法，返回 true，继续执行
* 如果参数不合法，返回 false 或 一个包含 statusCode 和 statusMessage 的对象以
  终止请求并返回错误信息

### 5. 执行 Nuxt APP 中间件

导航到特定路由之前执行。可以在中间件中执行一些操作，例如： 鉴权、日志、重定向

Nuxt 包括三种类型的中间件：

* 全局路由中间件
* 命名路由中间件
* 匿名或内部路由中间件

全局路由中间件在每次路由导航时都会执行。命名路由中间件只在特定路由上执行。匿名或内部路由中间件只在特定路由上执行。具体可以查阅 [middleware](./middleware.md)    

### 6. 页面和组件

Nuxt 在此步骤中初始化页面及其组件，并使用 ``useFetch`` 和 ``useAsyncData`` 获取任何所需的数据。由于服务器上没有动态更新，也没有 DOM作发生，因此 Vue 生命周期钩子（如 onBeforeMount、onMounted 和后续钩子）在 SSR 期间不会执行。

### 7. 渲染和生成HTML输出

所有组件初始化和数据请求完成后，Nuxt 将组合组件和 ``unhead`` 中的设置，生成完整的 HTML。

> 当 Vue application 渲染为 ``html`` 之后，将执行 ``app:rendered`` 钩子。 
> 响应返回 HTML 内容之前， Nitro 将调用 render:html 钩子。 这勾子允许去操作生成的 HTML，例如：添加一些 meta 标签、修改 html 内容和注入脚本等。


## 客户端声明周期

下面部分的声明周期发生在客户端。

### 1. 初始化 Nuxt App 和执行 Nuxt App 插件

此步骤类似服务端插件的执行，同时也包括两个部分：内置插件和用户自定义插件。

> 此步骤之后，Nuxt 会调用 app:created 钩子，该钩子可用于执行其他逻辑。


### 2. 路由验证

此步骤与服务器端执行相同。 当在 ``definePageMeta`` 中定义了 ``validate`` 方法时，将会执行 ``validate`` 方法。 

### 3. 执行 Nuxt APP 中间件

Nuxt 中间件会在客户端和服务端运行。如果想某些代码只运行在特定的环境中，可以使用 ``import.meta.client`` 和 ``import.meta.server` 来判断当前环境。

### 4. 挂载 Vue 实例和 hydration

调用 ``app.mount('#__nuxt')`` 会将 Vue 应用挂载到 DOM 上。如果应用使用 SSR 或 SSG 模式，Vue 会执行 ``hydration`` 步骤，使客户端应用可交互。

在 hydration 过程中，Vue 会重新创建应用（不包括服务器组件），将每个组件与其对应的 ``DOM`` 节点匹配，并附加 ``DOM`` 事件监听器。


> 在挂载 Vue 应用程序之前，Nuxt 会调用 app:beforeMount 钩子。

> 在挂载 Vue 应用程序之后，Nuxt 会调用 app:mounted 钩子。 


### 5. 执行 Vue 声明周期钩子

与服务端不同，浏览器会执行完整的 Vue 生命周期钩子。