# 组件库

选择一个好的组件库，可让开发更加高效。目前市面上常用移动端组件库有有赞的 [vant -H5](https://youzan.github.io/vant/#/zh-CN)、[vant-weapp -小程序](https://youzan.github.io/vant-weapp/#/home)、[uni-ui](https://uniapp.dcloud.io/component/uniui/uni-ui.html) 、后起之秀 [uviewui -多端通用](https://www.uviewui.com/)。

这里侧着讲下 uviewui，先来看看官方对 uviewui 介绍:

* uView UI，是全面兼容 nvue 的 uni-app 生态框架，全面的组件和便捷的工具会让您信手拈来，如鱼得水。
* 一次编写，多端发布。

从介绍或定位来看，可以出它功能非常强大。让我们可以更加注重再业务测的开发，无需太过于关心平台化的差异。

现在基于前面创建的 ``Uniapp`` 模版，引入 ``uView UI`` 组件库，大概的步骤如下:

## 使用步骤

* 安装

```shell
npm install uview-ui
or
yarn add uview-ui
```

* 引入

```js
import Vue from 'vue';
import uView from 'uview-ui';
import "uview-ui/index.scss";
Vue.use(uView);
```

* vue.confing.js

```js
module.exports = {
  transpileDependencies: ['uview-ui'],
};
```

* 按需引入

```json
  // src/pages.json
	{
    "easycom": {
      "^u-(.*)": "uview-ui/components/u-$1/u-$1.vue"
    }
  }
```