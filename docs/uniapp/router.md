# 路由

## 为什么使用 uni-simple-router

``uniapp`` 只提供基础路由的功能，能满足日常简单业务需求。往往实际的业务场景都会比较复杂，例如涉及权限的管控，哪些页面只能登录后访问。

针对这样的需求，在不引入外部插件的情况下，能想到的就是在页面级别的钩子中去完成，比如 ``onLoad`` 中。 假设控制页面很多，可能需要在每个页面中添加对应鉴权逻辑。 为了减少代码重复，可以通过 ``mixins`` 的方式共用其鉴权的逻辑。这些都不是理想的处理方式。 为什么？ 首先 ``minxins`` 并不够直观，这也就是 ``vue3`` 放弃它的一个原因之一。其次一般页面级别守卫通常针对当前页面设计，并不能把全局(应用)级别控制的放入进来。

有没有像 ``Vue-router`` 那样，既支持页面级、以及全局的守卫功能，答案有，也就是 [uni-simple-router](https://hhyang.cn/v2/start/tsUse.htmlhttps://hhyang.cn/v2/start/tsUse.html)。

uni-simple-router 官方对其介绍如下：

* 首先属于它是 uniapp 的一个插件
* 简明优先 (语法同 vue-router 一样)
* 多端发布 (开发者编写一套代码可发布到多个平台)

现在开始使用它吧。

## 快速上手

[参考官网提供快速上手](https://hhyang.cn/v2/start/quickstart.html)

## 跨平台注意事项

针对小程序的原生组件比如 ``tabbar``、``header`` 这些动作出发页面跳转时，``uni-simple-router`` 是没办法拦截的，如果需要拦截这些页面，只能通过自定义 ``tabbar``、``header`` 的方式来实现。

同样针对不同的端，也会有些注意事项：

* H5 端

在不考虑跨端的情况下，``uni-simple-router`` 完成可以像使用 ``vue-router`` 的方式来使用它。

* APP 端

如果APP首页是通过 ``nvue`` 的方式，您需要使用 ``vue`` 来替代它，同时你需要在 ``manifest.json`` 下把 ``App常用其他设置`` 中的 ``fast启动模式`` 关闭掉。打开源码视图对比以下配置：

```js
// 在源码视图下的 app-plus 节点下
"splashscreen" : {
    "alwaysShowBeforeRender" : false,
    "waiting" : true,
    "autoclose" : false,
    "delay" : 0
}
```

## 导航方式

按照编写方式不同，分为： ``组件式导航``、``编程式路由``。

### 组件式导航

顾名思义通过组件来进行页面跳转，同时为了兼容小程序，组件需要在 ``main.js`` 中引入并注册

```js
// main.js
import Mylink from './node_modules/uni-simple-router/dist/link.vue'
Vue.component('my-link',Mylink)
```

使用：

```html
<!-- 一个简单的name跳转 -->
<my-link to="{name: 'tabbar-4',params: {name: 'my-link'}}">
  <button type="primary">使用name对象跳转</button>
</my-link>
```

### 编程式路由

| uni-simple-router   |  uni-app   | 描述 |
| ----------- | ----------- |----------- |
| router.push()      |   uni.navigateTo()     |   会在页面栈中添加路由记录。 注意事项，当提供了 path 时，则会忽略 params。同样提供 name 时，则会忽略 query。 通常 query 提供查询参，params 提供动态路由参数|
| router.replace()   |  uni.redirectTo()        | 使用方式通过 push 一样，但是它不会在页面栈中新增记录，只会替换栈中当前记录信息。        |
| router.replaceAll()   |   uni.reLaunch()        | 将所有的页面都关掉，打开一个新的页面 |
| router.pushTab()   |    uni.switchTab()       | 打开 uni-app 自带的tab 菜单 |
| router.back(n,{...})    |    uni.navigateBack()       | 这个方法的参数是一个正整数，意思是在 history 记录中后退多少步，类似 ``window.history.go(n)`` |




## 路由传参

* 动态路由时传参注意事项

通常路由支持 ``动态路由``，``通配符`` 以及 ``全路径`` 的方式。 不同的路由方式在使用时，需要注意。当使用 uni 提供的 API 来进行动态路由跳转时，系统会出现警告。 正常的做法如下:

```json
// pages.json
{
	"pages": [
    {
        "path": "pages/page2/page2",
        "aliasPath":"/page2/:id",
        "name":"page2"
    }
  ]
}
```

```js
// 跳转方式
this.$Router.push({
  name:'page2',
  params:{
    id:12
  }
})
```

除了跳转之外，获取动态参数也需要注意，通常获取参数都是 ``onLoad`` 中的 ``options`` 。如果当前路由是动态参数时，``uni-app`` 是不能正确解析，那么只能通过如下方式获取：

```js
export default {
  onLoad(options){
    console.log(options); // {}
    console.log(this.$Route); // { id: 12}
  }
}
```

## 导航守卫( 路由守卫 )

### 全局路由守卫

| 钩子 | 描述 |
| ----------- | ----------- |
| router.beforeEach()    |   全局导航前置钩子|
| router.afterEach()   | 全局导航后置钩子|

### 路由独享的守卫

| 钩子 | 描述 |
| ----------- | ----------- |
| beforeEnter    |   全局导航前置钩子|

### 组件内的守卫

| 钩子 | 描述 |
| ----------- | ----------- |
| beforeRouteLeave    |   在组件内配置 |

### 插件构建时的守卫

```js
const router = createRouter({
    platform: process.env.VUE_APP_PLATFORM,
    routerBeforeEach:(to, from, next) => {
        // 每次导航触发前都会执行这个，比所有守卫都先执行
        next();
    },
    routerAfterEach:(to, from) => {
        // 跳转结束后执行 守卫守卫执行完毕后再执行
    },
    routerErrorEach:(error, router)=>{
        // 跳转时错误后执行的守卫
    }
})
```

### 完整的导航解析流程

1. 导航被触发。

2. 调用插件 ``routerBeforeEach`` 钩子

3. 在失活的组件里调用离开守卫 ``beforeRouteLeave``。

4. 调用全局的 ``beforeEach`` 守卫。

5. 在路由配置里调用 ``beforeEnter``。

6. 导航被确认。

7. 调用全局的 ``afterEach`` 钩子。

8. 调用插件 ``routerAfterEach`` 钩子

9. ``H5端`` 触发 ``DOM`` 更新，``其他端`` 底层调用 ``uni Api``


