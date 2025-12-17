#  viewport 实现响应式布局

## 1. 什么是 viewport

Viewport（视口）指的是浏览器窗口中用于显示网页内容的可见区域。它不一定等于整个屏幕大小，而是受浏览器设置、设备分辨率和 CSS 影响。

在桌面端，``viewport`` 通常与浏览器窗口大小一致；在移动端由于屏幕较少，浏览器引入``虚拟视口``来优化显示。

## 2. 什么是虚拟视口

虚拟视口 - 或叫布局视口(``layout viewport``)：默认移动端上面，虚拟视窗口为 ``980``，通过 ``document.documentElement.offsetWidth`` 可以获得。这样设计目的尽可能把未适配移动端的网页，能通过水平和垂直滚动方式查看到更多内容。

为什么是980px？这是为了兼容桌面网站，移动屏幕窄（比如iPhone早期320px），如果直接用设备宽度布局，桌面网站会挤成一团看不清。所以浏览器“虚拟”出一个宽视口，让内容按桌面尺寸渲染，用户通过捏合/滚动查看。

## 3. viewport 适配原理(依然是等比缩放)

通过相对单位（如 vw、vh、vmin）将设计稿的绝对像素``（px）``映射到设备的 ``viewport`` 宽度，实现等比缩放，从而达到适配不同屏幕尺寸。

举例：

* 设计稿(750px) 标题: 34px。 
* 转换为 vm 如下
  * 750px = 100vm
  * 1vm = 7.5px
  * 34/7.5 = 4.533333333333333vm
* 在 414 设备上
  * 414px = 100vw
  * 1vm = 4.14px
  * 4.533333333333333vm = 18.768px

## 4. 使用

### 4.1 安装插件

```shell
npm install postcss-px-to-viewport
```

### 4.2 vite 添加配置

```ts
// vite.config.js
import pxtoviewport from 'postcss-px-to-viewport'
export default {
    css: {
        postcss: {
        plugins: [
            pxtoviewport({
                unitToConvert: 'px', // 转化为 px
                viewportWidth: 750, // 可视窗口大小，设计稿的宽度
                unitPrecision: 5, // 精度
                propList: ['*'], // 所有属性
                viewportUnit: 'vw', // 单位
                fontViewportUnit: 'vw', // 字体大卫
                selectorBlackList: [], // 选择器黑名单，排除那些选择器下对应单位不转换为 vm
                minPixelValue: 1, // 最小像素值
                mediaQuery: false, 
                replace: true,
                exclude: [/node_modules/], // 排除那些文件不做处理。
                landscape: false, // 横屏
                landscapeUnit: 'vw', // 横屏单位
                landscapeWidth: 568
            })
        ]
        }
    }
}
```

