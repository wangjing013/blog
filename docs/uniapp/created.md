# 快速上手

Uniapp 官方提供两种创建项目的方式：

* HBuilderX 开发者工具
* vue-cli 命令行工具

具体两者创建的区别，大家可以查阅 ``Uniapp`` 官方的介绍 [cli创建项目和使用HBuilderX可视化界面创建项目有什么区别
#](https://uniapp.dcloud.io/quickstart-cli.html#%E4%BD%BF%E7%94%A8cli%E5%88%9B%E5%BB%BA%E9%A1%B9%E7%9B%AE%E5%92%8C%E4%BD%BF%E7%94%A8hbuilderx%E5%8F%AF%E8%A7%86%E5%8C%96%E7%95%8C%E9%9D%A2%E5%88%9B%E5%BB%BA%E9%A1%B9%E7%9B%AE%E6%9C%89%E4%BB%80%E4%B9%88%E5%8C%BA%E5%88%AB)。

通过 ``vue-cli`` 创建的项目模版，更接近平常开发 Vue 项目结构，这样能够减少熟悉的成本。

下面通过 ``vue-cli`` 来创建项目模版。

## 步骤如下

### 安装 CLI

假设已经安装的话，可以忽略当前步骤。

```shell
npm install -g @vue/cli@4
```

### 创建 uni-app

* 使用正式版（对应HBuilderX最新正式版）

```shell
vue create -p dcloudio/uni-preset-vue my-project
```

* 使用alpha版（对应HBuilderX最新alpha版）

```shell
vue create -p dcloudio/uni-preset-vue#alpha my-alpha-project
```

### 注意事项

``dcloudio/uni-preset-vue`` 是一个预设的模版，它内容是在 Github 上，在安装的时可能会出现查找模版失败的问
题。

```shell
ERROR Failed fetching remote preset dcloudio/uni-preset-vue:
ERROR RequestError: read ECONNRESET
```

上面错误是，需要科学上网才能正常访问。

通常可以把 ``dcloudio/uni-preset-vue`` 模版下载下来，然后创建时 ``dcloudio/uni-preset-vue`` 指向本地的模版，如下:

```shell
vue create -p ./本地目录/dcloudio/uni-preset-vue my-project
```


## 使用自定义模版

[uni-vue-template](https://github.com/wangjing013/uni-vue-template)

上面的模版也是通过 Vue CLI 创建的，只是在它基础上添加一些内容。

* 常见工具类封装(路由、请求、登录、获取手机号码等等)。
* 代码检测(ESLint，Git hook，lint-staged) 等等。

基本可以开箱即用，让我们更加聚焦在业务层面的开发。

