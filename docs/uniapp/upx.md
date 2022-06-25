# 响应式单位

## 尺寸单位

[尺寸单位](https://uniapp.dcloud.io/tutorial/syntax-css.html#%E5%B0%BA%E5%AF%B8%E5%8D%95%E4%BD%8D)


## 单位之间的转换

* uniapp px rpx 互相转换

```js
// 100rpx to px
var px = uni.upx2px(100)

// 200px to rpx
var rpx = 200 / (uni.upx2px(100) / 100);
```