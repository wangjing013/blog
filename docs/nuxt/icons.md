# Icon 

提供两种使用 ``Icon`` 的方式。

* FontIcon
* SvgIcon

## FontIcon

默认字体文件放置在 ``assets/fonts`` 目录中，包括 ``ttf``、``woff``、``woff2`` 三种格式。 每次新增字体 ICON 就需要去替换目录下文件。

引入字体类型文件后，然后需要替换 ``styles/iconfont.scss`` 文件，这个文件用于定义字体类。 如下：

```css
@font-face {
    font-family: "iconfont"; 
    src: url('@/assets/fonts/iconfont.woff2?t=1744183444940') format('woff2'),
         url('@/assets/fonts/iconfont.woff?t=1744183444940') format('woff'),
         url('@/assets/fonts/iconfont.ttf?t=1744183444940') format('truetype');
  }
  
.iconfont {
    font-family: "iconfont" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.icon-chakancs:before {
    content: "\e660";
}

.icon-canshu:before {
    content: "\e661";
}
```

替换完成后，页面中可以通过如下方式使用：

```html
<FontIcon :name="chakancs"/>
```

为什么不是 ``icon-chakancs`` ，为了简化使用，FontIcon 组件内部自动拼接 ``icon`` 前缀。


## SvgIcon

支持项目中直接使用 svg，只需要两个步骤：


* 复制 svg 文件放入到 ``assets/svg`` 目录下
* 通过 svg-icon 去使用

现在把 canshu.svg 放入到 svg 目录下，结构如下：

```md
├── assets                  静态资源
│   ├── svg                 图片资源
│   └──── canshu.svg              全局样式
```

直接去代码中使用：

```html
<SvgIcon name="canshu"/>
```



