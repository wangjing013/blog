# 请求库

> 在各个小程序平台运行时，网络相关的 API 在使用前需要配置域名白名单。

与后端交互，网络请求库是必不可少的工具。在 ``uniapp`` 中，它内置 ``uni.request`` 工具，当开发者在使用时，无需再安装其它依赖。

使用方式如下:

```js
uni.request({
    url: 'https://www.example.com/request', //仅为示例，并非真实接口地址。
    data: {
        text: 'uni.request'
    },
    header: {
        'custom-header': 'hello' //自定义请求头信息
    },
    success: (res) => {
        console.log(res.data);
        this.text = 'request success';
    }
});
```

关于 uni.request 更多详细的使用，可以参考官方文档介绍 [``uni.request``](https://uniapp.dcloud.io/api/request/request.html#request)

通常在实际开发场景中，不可能只是简单的发送网络请求。比如优化体验会在请求时添加 loading 、统一异常拦截。登录时全局添加 token、auth2等等。

如果想要满足上面业务需要，那么需要在 ``uni.request`` 的基础上做一层封装才行。

下面分别解决上述的问题:

```js
import { merge } from 'lodash-es';
import store from '@/store/index'; // 默认如果不用 vuex，可以通过本地存储替代

const errorStatusList = [525, 524, 526, 401];
const defaultConfig = {
  method: 'get',
  timeout: 6000,
  dataType: 'json',
  responseType: 'text',
  withCredentials: false, // 仅H5支持
  firstIpv4: false,
  header: {
    'content-type': 'application/json',
  },
  success() { },
  fail() { },
  complete() {},
};
const request = (params) => {
  // 全局设置请求头
  if (store?.state?.token) {
    defaultConfig.header.Authorization = store.state.token;
  }
  return new Promise((resolve, reject) => {
    const {
      showLoading = true,
    } = params;
    // Loading
    if (showLoading) {
      uni.showLoading({
        title: '加载中',
        mask: true,
      });
    }
    uni.request(
      merge(defaultConfig, params, {
        success: (res) => {
          const { data: resData, statusCode, errMsg } = res;
          if (showLoading) uni.hideLoading();
          // 全局异常拦截
          if (errorStatusList.includes(statusCode)) {
            uni.showToast({
              title: errMsg,
              icon: 'none',
            });
            uni.clearStorageSync();
            // toLogin
            return;
          }
          resolve(resData);
        },
        fail: (err) => {
          if (showLoading) uni.hideLoading();
          reject(err);
        },
        complete: () => {
          if (showLoading) uni.hideLoading();
        },
      }),
    );
  });
};

export const get = (params) => request({ ...params, method: 'GET' });
export const post = (params) => request({ ...params, method: 'POST' });
export default {};
```







