# 优雅处理跳转前登录校验

在开发 `uniapp` 应用时，常常需要确保用户在访问某些页面或执行某些操作前已经登录。本文将介绍如何通过对 `uniapp` 的导航方法进行封装，在导航前执行用户认证检查。

## 1. 概述

1.  定义需要封装的方法：列出需要进行认证检查的导航方法。
2.  封装导航方法：重写这些方法，使其在导航前进行用户认证检查。

## 2. 代码示例

### 2.1 定义需要拦截的方法

```js
const methodToPatch = ['navigateTo', 'redirectTo', 'switchTab'];
```

### 2.2 封装导航方法

```js
const TOKEN_KEY = 'token';
methodToPatch.map((item) => {
  const original = uni[item];
  uni[item] = function (opt = {}) {
    if (opt.needAuth) {
      const token = uni.getStorageSync(TOKEN_KEY);
      // 此处不处理 token 无效的问题，通常会在接口请求时判断是否登录超时或 token 无效，因此无需在此关心 token 的有效性。
      if (!token) {
        uni.navigateTo({
          url: '/pages/login/login',
        });
      }
    } else {
      return original.call(this, opt);
    }
  };
});
```

## 3. 示例用法

假设我们有以下导航调用：

```js
uni.navigateTo(
  {
    url: '/pages/secure/securePage',
  },
  { needAuth: true }
);
```

在执行上述代码时，由于 `needAuth` 为 true，我们的封装方法会首先进行用户认证检查。如果用户未登录，将会被重定向到登录页面；如果用户已登录，则正常导航到指定页面。

## 4. 总结

通过上述方法，我们可以在 uniapp 中轻松实现导航前的用户认证检查，确保未登录用户无法访问受限页面。这种封装方法不仅增强了应用的安全性，还提升了用户体验。希望本文对你在 uniapp 开发中的认证需求有所帮助。

如果大家觉得有帮助，请点赞、收藏、分享，谢谢！
