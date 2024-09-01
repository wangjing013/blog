# 状态管理

## 安装 pinia-plugin-persistedstate

> npm i pinia-plugin-persistedstate -S

## 定义 Store

```js
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(piniaPluginPersistedstate);
export default store;
```

## 引入 Store

```js
import { createSSRApp } from 'vue';
import App from './App.vue';
import Store from '@/store/index.js';

export function createApp() {
  const app = createSSRApp(App);
  app.use(Store);
  return {
    app,
  };
}
```

## 持久化

默认情况下，pinia 的状态是瞬时的，这意味着在应用刷新或重新打开时，状态会丢失。然而，对于某些用户信息，如登录凭证，我们需要将其持久化存储，以便在后续请求中使用。

`pinia-plugin-persistedstate` 是专为 `pinia` 设计的持久化插件，默认情况下使用 `localStorage` 进行存储。然而，在小程序或 APP 中并没有 `localStorage` 对象的支持。

好在 `pinia-plugin-persistedstate` 支持传入自定义的 `storage` 对象。

为在 `H5`、`小程序`和 `APP` 中统一使用持久化存储，你可以通过自定义 `storage` 来实现。在自定义 storage 时，需要知道 `storage` 对象需要什么。

### storage 定义

```js
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
```

也就是只需要提供一个 `get`、`set`方法即可。

### 实现自定义 Storage

在不同的上下文中，`uni.getStorageSync` 会调用相应的存储 `API`，因此可以直接使用它来实现自定义存储。

```js
import { defineStore } from 'pinia';
import { getUserInfo, getOpenId } from '@/api/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
    openId: '',
    unionId: '',
    sessionKey: '',
  }),
  getters: {
    isLogin() {
      return !!this.token;
    },
    isAdmin() {
      const userInfo = this.userInfo;
      return !!(
        userInfo &&
        userInfo.rolePermission &&
        userInfo.rolePermission.includes('admin')
      );
    },
  },
  persist: {
    storage: {
      getItem: (key) => uni.getStorageSync(key),
      setItem: (key, value) => uni.setStorageSync(key, value),
    },
  },
});
```
