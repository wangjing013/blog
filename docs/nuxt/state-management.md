# 状态管理

## useState

* 对 SSR 友好

``useState`` 本质上是对 Vue 的 ref 的一个封装，但它专门为 SSR 场景设计。普通的 ``ref`` 在服务端渲染时，每个请求之间可能会共享同一个状态，导致数据泄漏。而 ``useState`` 会为每个请求创建独立的状态，并在服务端渲染后，把这个状态序列化到 ``HTML`` 里，客户端 ``hydration``（激活）时再还原回来，
保证了状态的一致性和安全性。

* 服务端渲染之后会保留数据

通过 ``useState`` 创建的状态，在 ``SSR`` 阶段生成后，会被自动同步到客户端。这样，客户端在 ``hydration`` 时不会重新初始化状态，
而是直接使用服务端传递过来的数据，避免了“闪烁”或数据不一致的问题。

* 用于跨组件共享数据

在调用 ``useState`` 时需要传递一个唯一的 ``key``。只要在同一个请求/页面中，所有用相同 ``key`` 调用 ``useState`` 的地方，拿到的都是同一个响应式状态。
这就实现了全局共享状态的效果。

## 基本使用

### 跨组件共享

例如在 ``A`` 组件中定义一个 ``useState`` 对象 ``config``，在 ``B`` 组件中去使用，发现获取值是一样的。

```js
<script setup lang="ts">
const config = useState('config')
config.value = 'shared'
</script>
```

在 B 组件中使用：

```js
<script setup lang="ts">
const config = useState('config')
console.log(config.value) // 'shared'
</script>
```

### 初始化状态数据 

在实际开发中，如果需要通过异步接口获取初始化状态数据（如网站配置信息），并在其他页面或组件中共享，推荐在 app.vue 组件中使用 Nuxt 内置的 callOnce 工具方法进行数据获取，
并将结果存储到 useState 中。这样可以实现全局响应式共享，并避免重复请求。

* callOnce 保证数据只会在 SSR 或 CSR 时获取一次，防止多次请求同一数据。
* 通过 useState，可以在应用的任意页面和组件中全局共享和响应式访问该数据。

示例代码：

```HTML
<script setup lang="ts">
const websiteConfig = useState('config')

await callOnce(async () => {
  websiteConfig.value = await $fetch('https://**/api/website-config')
})
</script>
```

> callOnce 在 Nuxt 3/4 中的用法，确实类似于 Nuxt 2 的 nuxtServerInit，都用于在页面渲染前获取数据并填充全局状态（如 store 或 useState），实现服务端初始化数据的目的。

这种方式很好解决在客户端获取数据带来页面闪烁的问题，大大提升用户体验。


### 与 Pinia 一起使用

通过 ``Pinia`` 定义全局一个 ``store``，然后通过 ``callOnce`` 获取初始化数据，用于应用间数据共享。

```ts
// app/store/website.ts
export const useWebsiteStore = defineStore('websiteStore', {
  state: () => ({
    name: '',
    description: ''
  }),
  actions: {
    async fetch() {
      const infos = await $fetch('https://api.nuxt.com/modules/pinia')

      this.name = infos.name
      this.description = infos.description
    }
  }
})
```

初始化状态数据

```html
<script setup lang="ts">
const website = useWebsiteStore()

await callOnce(website.fetch)
</script>

<template>
  <main>
    <h1>{{ website.name }}</h1>
    <p>{{ website.description }}</p>
  </main>
</template>
```





