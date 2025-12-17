# REM 实现响应式布局

## 1 安装插件

```shell
npm install postcss-pxtorem
npm install amfe-flexible
```

## 2 vite 添加配置

```ts
// vite.config.js
import pxtorem from 'postcss-pxtorem'
export default {
    css: {
        postcss: {
            plugins: [
                // 默认值
                pxtorem({
                    rootValue: 16, // 表示 1rem 对应的像素值
                    unitPrecision: 5, // 精度
                    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
                    selectorBlackList: [], // 选择器黑明单
                    replace: true, 
                    mediaQuery: false, // 转换媒体查询内的像素值，默认不转换
                    minPixelValue: 0, // 最小像素值
                    exclude: /node_modules/i // 指定不转换的目录下内容
                })
            ]
        }
    }
}
```

## 3. `postcss-pxtorem` 中的 `rootValue` 是什么？

`rootValue` 指的是 **1 rem 对应的像素值**。  

在用 `postcss-pxtorem` 转换时，所有 px 单位都会被转换为 rem，转换公式是：  

```
1rem = rootValue px
```

- 例如，`rootValue: 75` 时，`75px` 会被转换为 `1rem`，`37.5px` 会被转为 `0.5rem`。
- 这样做的目的是让所有尺寸都相对于根元素的 `font-size`（一般是 html 的 font-size）来缩放，实现适配。

## 4. 如何和设计稿关联起来？

这和你用什么策略设置根元素的 `font-size`（html 的 font-size）有关。 常用方式 —— **amfe-flexible**

### ``amfe-flexible`` 的核心逻辑：

```js
// HTML font-size = 视口宽度 / 10
docEl.style.fontSize = docEl.clientWidth / 10 + 'px'
```

- 设计稿宽度 750px，1rem = 750 / 10 = 75px
- 设备视口宽度 414px，1rem = 414 / 10 = 41.4px

### px 转 rem 的方式：

- 标题设计稿是 `34px`，构建时经过 postcss-pxtorem 转换为：  
  `34px / 75px ≈ 0.4533rem`
- 到设备上渲染：  
  `0.4533rem * 41.4px = 18.7px`

### 反推验证：

- 设计稿到设备实际像素缩放：  
  `34 / (750/414) = 18.768px`
- 设备上 rem 换算：  
  `18.768 / 41.4 ≈ 0.4533rem`

结果一致，验证了等比例适配。

---

## 5. 适配原理总结

- **所有尺寸的 rem 都是根据设计稿（rootValue）来的**
- **实际 px 取决于当前屏幕的 html 字号**
- 用 rem 的根本原因是，只要根元素随设备宽度改变，页面尺寸就能等比例缩放，完美适配各种屏幕

---

**结论：**  

`rem` 单位适配的本质是：  
> **通过让 html 的 font-size 随屏幕变化，所有用 rem 表示的尺寸都会等比例跟着缩放，从而适配不同屏幕。**

---