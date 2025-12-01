# utils 

``NuxtJS`` 应用会自动加载定义在 ``utils`` 目录下的工具函数。 ``utils`` 目录的主要目的是允许在语义上区分 ``composables`` 和其他自动导入的工具函数。

## 1. 导出方式

NuxtJS 支持两种导出工具方法的方式：

### 1.1 具名导出
```js
// utils/format.js
export const format = ()=> {}
```

### 1.2 默认导出
```js
// utils/format.js
export default function (){}
```

当使用默认导出，方法名称就是文件名。 如果文件名是通过 ``-`` 或 ``_`` 链接，默认会被转换为驼峰的格式，比如 "format-date"，在应用中使用时则变为 ``formatDate``。

### 1.3 使用方法
定义好之后，就可以直接在页面中进行使用:

```js
<template>
  <p>{{ format(1234) }}</p>
</template>
```

## 2. 文件扫描方式

默认情况下 ``NuxtJS`` 只会扫描 ``utils`` 目录下的顶层文件，嵌套目录中文件不会被自动导入。 如果需要使用嵌套目录中的文件，有两种方式：

* 直接在顶层文件中重新导出这些函数。
* 在 nuxt.config.ts 中配置 imports.dirs 选项来包含嵌套目录。

## 3. 使用范围

其次 ``utils`` 目录下定义的这些方法，只能在 Vue 部分进行使用，也就是客户端部分能使用。 要在服务端访问，可以在 ``server/utils`` 中进行定义。


## 4. shared 目录

在 ``Nuxt v3.14+`` 中，新增了 shared/ 目录，允许在 Vue 应用和 Nitro 服务器之间共享代.

默认 NuxtJS 不会自动去导入该目录下的内容，当启用这种方式，您需要在 ``nuxt.config.ts`` 中设置。

```ts
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
})
```

这样设置后，您就可以在客户端和服务器端同时使用这些共享的工具函数了。
