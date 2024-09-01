# 保存图片到相册

通常有几种方式基于`流`、`图片资源URL`、`Base64`。

## 添加响应头

- Content-Disposition: 'attachmeent'
- Content-Type: application/octet-stream

## 如何在 `base64` 示例中应用 `URL.createObjectURL()`

- 1. 如何把 base 64 转换为 blob

```js
import { base64StringToBlob } from 'blob-util';

const contentType = 'image/png';
const b64Data = 'iVb........'; // base64 数据

const blob = base64StringToBlob(b64Data, contentType);
```

- 2.  base64 转换为 blob

```js
const byteCharacters = atob(b64);
const byteNumbers = new Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i);
}
const byteArray = new Uint8Array(byteNumbers);
const blob = new Blob([byteArray], { type: 'audio/mp3' });
```

- 3. 下载示例

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
