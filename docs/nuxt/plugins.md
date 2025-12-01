# Plugins

``Nuxt`` 包含一个插件系统，可以用于添加 ``Vue plugin`` 等。

``Nuxt`` 会在创建 Vue 应用程序时自动读取 ``plugins/`` 目录中的文件并加载它们。


## 创建插件

### 通过方法方式

插件在执行时会接收到一个参数 ``nuxtApp``。

```js
export default defineNuxtPlugin(nuxtApp => {
})
```

### 通过对象语法

通过传入对象语法的方式，去解锁进阶的用法：

```js

export default defineNuxtPlugin({
  name: 'my-plugin', // 插件名称
  enforce: 'pre', // or 'post' 。这里控制插件执行顺序，pre 在所有插件之前，post 所有插件之后。
  parallel: true, // 并行加载
  async setup (nuxtApp) { 
    // 这里等价于通过方法方式声明插件
  },
  hooks: {
    // 注册 Nuxt 运行时的勾子函数
    'app:created'() {
      const nuxtApp = useNuxtApp()
    }
  }
})
```


## 插件注册

* 默认只会注册 plugins 顶层文件以及子文件夹中 index 文件

```md
-| plugins/
---| foo.ts      // 加载
---| bar/
-----| baz.ts    // 不会加载
-----| foz.ts   // 不会加载
-----| index.ts  // 加载(已经过时，不推荐)
```

需要加载子文件夹中其他文件，需要手动在 ``nuxt.config.ts`` 中引入

```js
export default defineNuxtConfig({
  plugins: [
    '~/plugins/bar/baz',
    '~/plugins/bar/foz'
  ]
})
```

## 插件注册顺序

通过字母数字作为文件前缀去控制插件的注册顺序。

```md
plugins/
 | - 01.myPlugin.ts
 | - 02.myOtherPlugin.ts
```
在上面案例中，myPlugin 可以访问到 myOtherPlugin 插件中注入的任何内容。


## 插件的加载策略

### 并行

默认情况下，Nuxt 会按顺序加载插件。您可以将插件定义为并行，因此 ``Nuxt`` 不会等到插件执行结束，然后再加载下一个插件。

```js
export default defineNuxtPlugin({
  name: 'my-plugin',
  parallel: true,
  async setup (nuxtApp) {
    // 下一个插件将立即被执行
  }
})
```

这种机制对于那些执行时间较长但不影响其他插件的操作（如数据初始化、第三方服务连接等）特别有用，可以提高应用的加载性能。

``注意``： 这里是会改变他下一个插件执行时机，并非自身。

### 基于依赖

如果一个插件需要依赖其他插件，也就是等待别的插件先执行。那么可以通过 ``dependsOn`` 配置项来指定。

```js
export default defineNuxtPlugin({
  name: 'depends-on-my-plugin',
  dependsOn: ['my-plugin'],
  async setup (nuxtApp) {
    // 插件将等待 my-pligin 执行完成后再执行
  }
})
```

这种机制确保了插件之间的执行顺序，特别是当一个插件的功能依赖于另一个插件提供的功能时非常有用。

如果只是依赖个别的，我们可以通过前面讲通过字母数字进行文件命名来控制执行顺序，当依赖插件个数多的情况下，通过指定 ``dependsOn`` 会更直观和更好管理。

```js
export default defineNuxtPlugin({
  name: 'complex-plugin',
  dependsOn: ['auth-plugin', 'api-plugin', 'state-plugin'],
  async setup (nuxtApp) {
    // 这个插件会等待所有列出的插件执行完成后才运行
  }
})
```

这种方式的优势在于：

* 依赖关系更加明确，不需要通过文件名来推断
* 当依赖多个插件时更容易管理
* 代码更具可读性和自文档性
* 不需要担心文件名排序的复杂性


## 使用 Composables

可以在插件中使用 ``Composables`` 以及 ``utils``。

```js
export default defineNuxtPlugin((nuxtApp) => {
  const foo = useFoo()
})
```

间接说明，Composables 自动导入时机在插件之前。 虽 Composables 和 utils 确实可以在插件中使用，但存在一些限制和注意事项。

如果组合函数依赖别的插件的功能时，此时可能就会出现异常的情况。毕竟前面讲到插件存在执行顺序的问题。


## 提供辅助函数或工具

如果您希望在 NuxtApp 实例上提供帮助函数，可以通过从插件返回带有 provide 属性的对象来实现。

```js
export default defineNuxtPlugin(() => {
  return {
    provide: {
      hello: (msg: string) => `Hello ${msg}!`
    }
  }
})
```

“定义完成后，即可在组件中调用该辅助函数，如下：

```js
<script setup lang="ts">
const { $hello } = useNuxtApp()
</script>

<template>
  <div>
    {{ $hello('world') }}
  </div>
</template>
```

## TS 支持

从插件内部返回辅助函数或工具时，当在使用它时，通常是能自动推断出它的类型。  有的时候，当推断不出来行时，我们也可以显示去声明指定返回的帮助函数类型。

```ts
declare module '#app' {
  interface NuxtApp {
    $hello (msg: string): string
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $hello (msg: string): string
  }
}

export {}
```

什么情况下出现推断不出情况，比如: 批量导入定义好的接口文件，发现此处导出文件的类型会变成 unknown。

```ts
const apiModules = import.meta.glob('@/api/**/*.ts', { eager: true })
const apiMap: Record<string, unknown> = {}
Object.keys(apiModules).forEach((key) => {
  const name = key.split('/').pop()?.replace(/\.(j|t)s/, '') as string
  apiMap[name] = (apiModules[key] as { default: (api: Fetch) => unknown }).default(api)
})
```

此时可以显示去声明对应类型：

```ts
import type { apiGlobal } from '@/api/global'
import type { apiUser } from '@/api/user'

declare module '#app' {
  interface NuxtApp {
    $api: {
      user: apiUser
      global: apiGlobal
    }
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: {
      user: apiUser
      global: apiGlobal
    }
  }
}
```

当使用辅助函数或工具时，也可以获取到类型。

## 使用 Vue 插件

当想要在项目中使用 Vue Plugin 时，可以在插件中进行引入: 

下面引入谷歌分析标签

```js
import VueGtag, { trackRouter } from 'vue-gtag-next'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueGtag, {
    property: {
      id: 'GA_MEASUREMENT_ID'
    }
  })
  trackRouter(useRouter())
})
```

## 定义 Vue 指令

在插件中定义自定义指令

```js
import { useUserStore } from '@/store/user'

export default defineNuxtPlugin((nuxtApp) => {
  const userStore = useUserStore()
  const hasPermission = (permission: string) => {
    return userStore.userInfo?.permission?.includes(permission)
  }
  nuxtApp.vueApp.directive('auth', {
    mounted(el, binding) {
      if (!hasPermission(binding.value)) {
        el.style.display = 'none'
      }
    },
    updated(el, binding) {
      if (!hasPermission(binding.value)) {
        el.style.display = 'none'
      }
    },
    getSSRProps(binding) {
      // 在SSR期间
      return !hasPermission(binding.value)
        ? { style: { display: 'none' } }
        : {}
    },
  })
})
```

