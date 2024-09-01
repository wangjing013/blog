# 保存图片到相册

## APP

通常图片的来源分为`网络图片`，`本地图片(相册、相机)`，`Base64`。 不同的来源，图片保存有一定的差异性。 下面分别针对不同来源，实现图片保存操作。

- 网络图片

在 app 实现保存网络图片到相册，这个功能还是比较简单的，只需要使用 `uni.downloadFile` 和 `uni.saveImageToPhotosAlbum` 两个 API 即可。前者用来下载网络图片到本地，获取临时路径。 后者基于临时路径进行保存到相册操作。

具体代码实现:

```js
uni.downloadFile({
  url: 'https://www.example.com/file/test',
  success: (res) => {
    if (res.statusCode === 200) {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: function () {
          console.log('save success');
        },
      });
    }
  },
});
```

- 本地图片(相册、相机)

需要访问用户相册、相机，在使用时需要获取系统访问权限。

```js
uni.chooseImage({
  count: 1,
  sourceType: ['camera'], //支持 'camera', 'album' ，在不指定 sourceType 时，默认情况下支持两种方式
  success: function (res) {
    uni.saveImageToPhotosAlbum({
      filePath: res.tempFilePaths[0],
      success: function () {
        console.log('save success');
      },
    });
  },
});
```

- 基于 base64

通常出现 `base64` 编码格式的图片情况，通常出现在营销活动宣传海报的。比如基于 `canvas` 绘制课程海报，活动推广等。

接下来现分析具体的实现思路:

从 `uni.saveImageToPhotosAlbum` 方法入手，它接收参数为 `临时路径` 或 `永久路径` (不支持网络图片)。 意味着，只需要想办法把 `base64` 编码格式图片转成本地文件，获取其临时文件路径即可。

思路有了，那么在 `uniapp` 中有提供这样的支持 ? 有，可以利用 `Bitmap(位图)`

Bitmap 是什么？

> 即位图。它本质上就是一张图片的内容在内存中的表达形式

这里不详细展开，具体可以通过查阅资料了解更多关于 `Bitmap` 的知识。

如何去构建对应的 `Bitmap` 对象? 在 `uniapp` 中，可以通过 `plus+` 中提供 `plus.nativeObj.Bitmap` 构建位图对象。

下面具体的实现:

```js
const bitmap = new plus.nativeObj.Bitmap('bitmap');
const base64 = '';
// 加载 Base64 编码格式图片到 Bitmap 对象
bitmap.loadBase64Data(base64, () => {
  // 指定存储临时目录
  const url = `_doc/${Date.now()}.png`;
  // 保存图片
  bitmap.save(
    url,
    {
      overwrite: true,
    },
    (i) => {
      // 保存图片到相册
      uni.saveImageToPhotosAlbum({
        filePath: i.target,
        success() {
          console.log('save success');
        },
      });
    },
    () => {
      uni.showToast({
        title: '保存图片失败',
      });
    }
  );
});
```

关于 `plus.nativeObj.Bitmap` 详细介绍，可以参考[这里](https://www.shouce.ren/api/html5plus/doc/nativeobj.html#plus.nativeObj.Bitmap).
