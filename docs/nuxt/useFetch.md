# useFetch 

* useFetch 是对 ``useAsyncData`` 和 ``$fetch`` 的封装，提供了更便捷的调用方式。
* 使用 ``useAsyncData`` 时，通常需要手动指定一个 ``key``（用于缓存和去重），而 ``useFetch`` 会根据请求的 ``URL`` 和``参数``自动生成 ``key``，无需你手动指定。
* ``useFetch`` 还会根据服务端 API 路由自动推断请求的类型和响应类型，提供类型提示。
* 这样可以让你在组件的 ``<script setup>`` 中直接调用 ``useFetch``，无需关心 key 的生成和类型推断，开发体验更好。

## 使用

```ts
<script setup lang="ts">
const { data, status, error, refresh, execute, clear } = await useFetch('/api/modules', {
  pick: ['title']
})
</script>
```

上面请求返回中，``data``、``status`` 和 ``error`` 是 ``Vue`` 的 ``ref`` 对象，在 ``<script setup>`` 中需要通过 ``.value`` 访问其值；而 ``refresh``、``execute`` 和 ``clear`` 是普通函数，可以直接调用。

注意⚠️：如果你自定义了一个包裹 useFetch 的组合式函数（composable），不要在这个组合函数内部对 useFetch 的返回值使用 await，否则可能会导致不可预期的行为。如果需要自定义数据获取逻辑，建议参考官方文档，基于 $fetch 创建新的 fetcher 实例来实现。

## 参数

* URL 属性值支持如下：
  * 可以是一个字符串（如 '/api/posts'），
  * 也可以是一个 Request 对象，
  * 还可以是一个 Vue 的 ref（响应式引用），
  * 或者是一个返回字符串或 Request 的函数。

这样设计的好处是：你可以让 ``URL`` 具备响应性（reactivity），比如用 ref 或 computed 包裹，当 URL 发生变化时，
useFetch 会自动重新发起请求，动态获取最新数据，非常适合处理依赖路由参数或其他动态变量的场景。

* options:  ``fetch`` 请求的配置对象。它继承 ``unjs/ofetch`` 和 ``AsyncDataOptions`` 的选项。 所有选项值可以是一个
静态值，ref 或 计算属性。

更多参数，可以参考： [parameters](https://nuxt.com/docs/4.x/api/composables/use-fetch#parameters)



## 拦截器

useFetch 支持使用拦截器，在不同阶段对请求和响应进行处理。

```ts
const { data, status, error, refresh, clear } = await useFetch('/api/auth/login', {
  onRequest({ request, options }) {
    // 设置请求头
    // 注意，这依赖于ofetch >= 1.4.0—您可能需要刷新您的lockfile
    options.headers.set('Authorization', '...')
  },
  onRequestError({ request, options, error }) {
    // 处理请求错误
  },
  onResponse({ request, response, options }) {
    // 处理响应数据
  },
  onResponseError({ request, response, options }) {
    // 处理响应错误
  }
})
```

## 支持响应式 Key 和 共享状态

你可以使用一个 computed ref 或一个普通 ref 作为 URL，允许动态数据获取，当URL改变时自动更新：

```ts
<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id)

// 当路由发生变化或id更新时，会自动重新获取数据
const { data: post } = await useFetch(() => `/api/posts/${id.value}`)
</script>
```

此外，当我们在多个组件中使用相同 ``URL`` 和 ``Option`` 时，它们会共享同一个 ``data``、``error`` 和 ``status`` ref。这确保了组件之间的一致性，同步状态变化。

## 返回值
