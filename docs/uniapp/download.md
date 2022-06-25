# 保存图片到相册

## APP

通常图片的来源分为``网络图片``，``本地图片(相册、相机)``，``Base64``。 不同的来源，图片保存有一定的差异性。 下面分别针对不同来源，实现图片保存操作。

* 网络图片

在 app 实现保存网络图片到相册，这个功能还是比较简单的，只需要使用 ``uni.downloadFile`` 和 ``uni.saveImageToPhotosAlbum`` 两个 API 即可。前者用来下载网络图片到本地，获取临时路径。 后者基于临时路径进行保存到相册操作。

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
        }
      });
		}
	}
});
```

* 本地图片(相册、相机)

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
			}
		});
	}
});
```

* 基于 base64

通常出现 ``base64`` 编码格式的图片情况，通常出现在营销活动宣传海报的。比如基于 ``canvas`` 绘制课程海报，活动推广等。

接下来现分析具体的实现思路:

从 ``uni.saveImageToPhotosAlbum`` 方法入手，它接收参数为 ``临时路径`` 或 ``永久路径`` (不支持网络图片)。 意味着，只需要想办法把 ``base64`` 编码格式图片转成本地文件，获取其临时文件路径即可。

思路有了，那么在 ``uniapp`` 中有提供这样的支持 ? 有，可以利用 ``Bitmap(位图)``

Bitmap 是什么？

> 即位图。它本质上就是一张图片的内容在内存中的表达形式

这里不详细展开，具体可以通过查阅资料了解更多关于 ``Bitmap`` 的知识。

如何去构建对应的 ``Bitmap`` 对象? 在 ``uniapp`` 中，可以通过 ``plus+`` 中提供 ``plus.nativeObj.Bitmap`` 构建位图对象。

下面具体的实现:

```js
const bitmap = new plus.nativeObj.Bitmap('bitmap');
const base64 = '';
// 加载 Base64 编码格式图片到 Bitmap 对象
bitmap.loadBase64Data(
  base64,
  () => {
    // 指定存储临时目录
    const url = `_doc/${Date.now()}.png`;
    // 保存图片
    bitmap.save(url, {
      overwrite: true,
    }, (i) => {
      // 保存图片到相册
      uni.saveImageToPhotosAlbum({
        filePath: i.target,
        success(){
          console.log('save success');
        }
      })
    }, () => {
      uni.showToast({
        title: '保存图片失败',
      });
    });
  },
);
```

关于 ``plus.nativeObj.Bitmap`` 详细介绍，可以参考[这里](https://www.shouce.ren/api/html5plus/doc/nativeobj.html#plus.nativeObj.Bitmap).

## 小程序

同 APP 一样，小程序本身也是原生作为它的宿主环境。对于不同来源的图片，保存方式上存在差异。

* 网络图片

```js
uni.downloadFile({
	url: 'https://www.example.com/file/test', //仅为示例，并非真实的资源
	success: (res) => {
		if (res.statusCode === 200) {
			uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success(){
          console.log('save success');
        }
      })
		}
	}
});
```

* 本地图片(相册、相机)

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
			}
		});
	}
});

// 批量
uni.chooseImage({
	count: 2,
	sourceType: ['camera'],
	success: function (res) {
    const tempFilePaths = res.tempFilePaths;
    const len = tempFilePathss.length;
    for(let i = 0; i< len; i++) {
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePaths[i],
        success: function () {
          console.log("保存成功")
        },
        fail: function(){
          console.log("保存失败")
        }
      });
    }
	}
});
```

* Canvas

在小程序中基本上海报功能是一个常见的需求，涉及保存到相册就显得很常见。 小程序中提供了对应 API [``uni.canvasToTempFilePath``](https://uniapp.dcloud.io/api/canvas/canvasToTempFilePath.html#canvastotempfilepath) 。把 Canvas 转换为临时文件目录，本质猜测底层跟 App 实现原理一样，先转换为 ``Base64`` 再使用 ``Bitmap`` 转为临时目录。

具体代码实现如下:

```js
uni.canvasToTempFilePath({
  canvasId: 'canvas', // canvasId
  success: function(res){
    uni.saveImageToPhotosAlbum({
      filePath: res.tempFilePath,
      success: function () {
        console.log("保存成功")
      },
      fail: function(){
        console.log("保存失败")
      }
    });
  },
  fail: function(){
    console.log("保存失败")
  }
})
```

## H5中

通常有几种方式基于``流``、``图片资源URL``、``Base64``。

*

### 添加响应头

* Content-Disposition: 'attachmeent'
* Content-Type: application/octet-stream

### 如何在 ``base64`` 示例中应用 ``URL.createObjectURL()``

* 1. 如何把 base 64 转换为 blob

```js
import { base64StringToBlob } from 'blob-util';

const contentType = 'image/png';
const b64Data = 'iVb........'; // base64 数据

const blob = base64StringToBlob(b64Data, contentType)
```

* 2.  base64 转换为 blob

```js
  const byteCharacters = atob(b64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {type: 'audio/mp3'});
```

* 3. 下载示例

```js
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function downloadFile(url, name = 'defalut') {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', name);
  a.setAttribute('target', '_blank');
  const clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent('click', true, true);
  a.dispatchEvent(clickEvent);
}

function downloadFileByBase64(base64, name) {
  const myBlob = dataURLtoBlob(base64);
  const myUrl = URL.createObjectURL(myBlob);
  downloadFile(myUrl, name);
}
```