# 路由

``Nuxt3`` 基于文件系统生成路由。 只需在 ``pages`` 目录进行创建即可。

通常在开发页面时，用得最多三种路由方式分别是``平级路由``、``嵌套路由``、``动态路由`` 。

接下来分别在 Nuxt3 中来实现：


## 路由方式

* 平级路由

平级路由：最基本的路由形式，每个页面都是独立的，相互之间没有嵌套关系

```md
-| pages/
---| index.vue         # 路由: /
---| about.vue         # 路由: /about
---| contact.vue       # 路由: /contact
```

* 嵌套路由

允许在父页面内显示子页面内容，通过 ``<NuxtPage />`` 组件实现。子页面会在父页面的特定位置渲染，而不会覆盖整个父页面。

```md
-| pages/
---| parent/
------| child.vue      # 路由: /parent/child
---| parent.vue        # 路由: /parent
```

在 ``parent.vue`` 中需要添加 <NuxtPage /> 来显示子页面内容。 

```vue
<template>
    <div class="parent">
        <h1>父内容</h1>
        <NuxtPage />
    </div>
</template>
```

```vue
<template>
    <div class="child">
        子内容
    </div>
</template>
```

最后渲染的结构如下：

```vue
    <template>
        <div class="parent">
            <h1>父内容</h1>
            <div class="child">
                子内容
            </div>
        </div>
    </template>
```

希望列表与详情展示在一个页面时，可以考虑使用``嵌套路由``的方式。


* 动态路由

使用方括号 ``[参数名]`` 语法创建可变的路由部分，用于处理不同的内容但使用相同页面组件的情况。

```md
-| pages/
---| users/
------| index.vue      # 路由： /users 列表页面
------| [id].vue       # 路由: /users/123, /users/456 等 用户详情页面
```

页面中通过 ``useRoute`` 方式来获取动态路由参数:

```js
const { params } = useRoute();
console.log(params.id); 访问动态参数
```


## 获取路由参数

* 获取查询参

```js
const { query } = useRoute();
console.log(query.id); 
```


* 获取动态参数

```js
const { params } = useRoute();
console.log(params.id); 
```


## 注意

是的，默认情况下，Nuxt 会将 pages 目录下所有子目录和文件（支持的扩展名如 .vue、.js、.ts 等）都自动解析为路由，每个文件对应一个 URL 路径。 当我们有组件需要在多个页面中复用时，可以将其放在全局的 ``components`` 目录下，而不是 ``pages`` 目录。这样可以避免将组件误解析为路由。

如果依然希望放在就在页面目录下，可以通过指定 ``pages`` 的 ``pattern`` 来排除特定文件或目录。可以在 ``nuxt.config.js`` 中配置 ``pages.pattern`` 选项来实现。

```js
export default defineNuxtConfig({
  pages: {
    pattern: ['**/*.vue', '!**/components/*.vue'],
  },
});
```
