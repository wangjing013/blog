# useAsyncData

``useAsyncData`` 是 ``Nuxt`` 提供的一个组合式函数（composable），用于在页面、组件或插件中异步获取数据，并且它是 ``SSR``（服务端渲染）友好的。

它的主要作用是：
* 支持在服务端渲染时获取数据，并将数据通过 Nuxt 的 ``payload`` 机制传递到客户端，避免了页面 ``hydration`` 时重复请求数据。
* 返回的数据、状态和错误都是 Vue 的响应式 ref，可以直接在 ``<script setup>`` 中通过 ``.value`` 访问。
* 可以通过 ``refresh``、``execute`` 等方法手动刷新或重新获取数据。


## 使用

```ts
<script setup lang="ts">
const { data, status, error, refresh, execute, clear } = await useAsyncData(
  'mountains',
  () => $fetch('https://api.nuxtjs.dev/mountains')
)
</script>
```

上面请求返回中，``data``、``status`` 和 ``error`` 是 ``Vue`` 的 ``ref`` 对象，在 ``<script setup>`` 中需要通过 ``.value`` 访问其值；而 ``refresh``、``execute`` 和 ``clear`` 是普通函数，可以直接调用。

注意⚠️：如果你自定义了一个包裹 useAsyncData 的组合式函数（composable），不要在这个组合函数内部对 useAsyncData 的返回值使用 await，否则可能会导致不可预期的行为。如果需要自定义数据获取逻辑，建议参考官方文档，基于 $fetch 创建新的 fetcher 实例来实现。


### 监听参数

当检查到参数值发生变化时， useAsyncData 内部会自动重新发送请求：

```ts
<script setup lang="ts">
const page = ref(1)
const { data: posts } = await useAsyncData(
  'posts',
  () => $fetch('https://fakeApi.com/posts', {
    params: {
      page: page.value
    }
  }), {
    watch: [page]
  }
)
</script>
```

### 响应式 Key

我们可以给 ``useAsyncData`` 设置一个 Key，其中 Key 的值可以是一个 computed 属性、ref 或 getter 函数，这样可以实现动态的数据获取。当 key 的值发生变化时，
Nuxt 会自动重新发起数据请求，并且会清理旧的数据（如果没有其他组件在使用）。


## 参数

* key： 为了确保数据请求能够在多次请求之间被正确地去重（即避免重复请求），你需要为 ``useAsyncData`` 提供一个唯一的 ``key``。如果你没有手动提供 ``key``，``Nuxt`` 会自动为你生成一个 ``key``，这个 ``key`` 会基于 ``useAsyncData`` 在代码中的文件名和行号来生成，从而保证每个实例都是唯一的
* handler： 
    * handler 函数必须返回一个“真值”（truthy value），比如对象、数组、字符串、数字等。
    * 如果 handler 返回的是 undefined 或 null（即“假值”），那么在客户端 hydration 时，Nuxt 可能会认为数据没有获取到，从而重复发起请求，导致同一个数据被多次请求。

这种机制的原因，是为了区分“数据还没获取到”和“数据已经获取到但值为 ``null/undefined``的情况。如果 ``handler`` 返回 ``null/undefined``，Nuxt 无法判断数据是否已经获取，于是会在客户端再执行一次 ``handler``，造成重复请求。

举例说明：

```ts
const { data } = await useAsyncData('user', async () => {
  // 如果这里返回 null 或 undefined，客户端会重复请求
  return null // ❌ 不推荐
  // return { name: 'Tom' } // ✅ 推荐
})
```


## 名词概念

* 什么是 hydration

在 Nuxt（和 Vue SSR）中，“hydration（激活/水合）”指的是：浏览器端用 Vue 实例“激活”服务端渲染（SSR）生成的静态 HTML，使其变为可交互的应用。

具体过程如下：
* 服务端渲染：Nuxt 在服务器上运行 Vue 代码，生成完整的 HTML 页面并返回给浏览器。
* 浏览器端 ``hydration``：浏览器下载 HTML 后，Vue 在客户端再次运行同样的代码，将事件监听、响应式等“挂载”到已有的 DOM 上，而不是重新生成 DOM。

这样页面就变得可交互了。