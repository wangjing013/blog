# 保存图片到相册

同 APP 一样，小程序本身也是原生作为它的宿主环境。对于不同来源的图片，保存方式上存在差异。

- 网络图片

```js
uni.downloadFile({
  url: 'https://www.example.com/file/test', //仅为示例，并非真实的资源
  success: (res) => {
    if (res.statusCode === 200) {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success() {
          console.log('save success');
        },
      });
    }
  },
});
```

- 本地图片(相册、相机)

```js
// 单张
uni.chooseImage({
  count: 1,
  sourceType: ['camera'],
  success: function (res) {
    uni.saveImageToPhotosAlbum({
      filePath: res.tempFilePaths[0],
      success: function () {
        console.log('save success');
      },
    });
  },
});

// 批量
uni.chooseImage({
  count: 2,
  sourceType: ['camera'],
  success: function (res) {
    const tempFilePaths = res.tempFilePaths;
    const len = tempFilePathss.length;
    for (let i = 0; i < len; i++) {
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePaths[i],
        success: function () {
          console.log('保存成功');
        },
        fail: function () {
          console.log('保存失败');
        },
      });
    }
  },
});
```

- Canvas

在小程序中基本上海报功能是一个常见的需求，涉及保存到相册就显得很常见。 小程序中提供了对应 API [`uni.canvasToTempFilePath`](https://uniapp.dcloud.io/api/canvas/canvasToTempFilePath.html#canvastotempfilepath) 。把 Canvas 转换为临时文件目录，本质猜测底层跟 App 实现原理一样，先转换为 `Base64` 再使用 `Bitmap` 转为临时目录。

具体代码实现如下:

```js
uni.canvasToTempFilePath({
  canvasId: 'canvas', // canvasId
  success: function (res) {
    uni.saveImageToPhotosAlbum({
      filePath: res.tempFilePath,
      success: function () {
        console.log('保存成功');
      },
      fail: function () {
        console.log('保存失败');
      },
    });
  },
  fail: function () {
    console.log('保存失败');
  },
});
```
