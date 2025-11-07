# 上传

上传功能在各类应用中非常常见，比如上传头像或封面。由于涉及多个使用场景，复用性自然成为关键考虑因素。这篇文章将介绍如何编写一个优秀的上传组件。

<img src="./images/upload/1.png"/>

实现上面一个上传组件，应该如何去实现，拆解步骤：

- 上传 placeholder
- 支持设置默认值(已上传、 传入上传文件类型)
- 支持配置文件上传类型
- 支持自定义插槽内容
- 上传成功事件
- 上传失败事件

## 组件实现

```html
<template>
  <view class="upload" @click="handleUpload">
    <slot>
      <view class="upload__placeholder"></view>
      <view class="upload__view"></view>
    </slot>
  </view>
</template>

<script>
  import { useUpload } from '@/composables/useUpload';

  export default {
    name: 'Upload',
    emits: ['success'],
    props: {
      mediaType: {
        type: Array,
        default: () => ['image', 'video'],
      },
    },
    setup(props, { emit }) {
      const { upload } = useUpload();

      const chooseMedia = async () => {
        return new Promise((resolve, reject) => {
          uni.chooseMedia({
            count: 1,
            maxDuration: 60,
            mediaType: props.mediaType,
            success(res) {
              resolve(res.tempFiles[0]);
            },
            fail(err) {
              reject(err);
            },
          });
        });
      };

      const handleUpload = async () => {
        try {
          const { fileType, tempFilePath } = await chooseMedia();
          uni.showLoading({
            title: '上传中...',
          });
          const result = await upload({
            tempFilePath,
          });
          if (result) {
            return emit('success', {
              ...result,
              type: fileType,
            });
          }
          uni.showToast({
            icon: 'error',
            title: '上传失败',
          });
        } catch (error) {
          console.error(error);
        } finally {
          setTimeout(() => {
            uni.hideLoading();
          }, 200);
        }
      };
      return {
        handleUpload,
      };
    },
  };
</script>
```

```js
// useUpload.js
import { getOssConfig } from '@/api/oss';

export const useUpload = () => {
  const fileSystemManager = uni.getFileSystemManager();
  const fetchOssConfig = async () => {
    const res = await getOssConfig();
    return res.data;
  };

  const getFileInfo = async (tempFilePath) => {
    return new Promise((resolve, reject) => {
      fileSystemManager.getFileInfo({
        filePath: tempFilePath,
        success(res) {
          resolve(res);
        },
        reject(err) {
          reject(new Error(`getFileInfo failed: ${err.errMsg}`));
        },
      });
    });
  };

  const uploadFile = async ({ digest, ossConfig, tempFilePath }) => {
    return new Promise((resolve, reject) => {
      const ext = tempFilePath.split('.').pop();
      const key = `${ossConfig.path}${digest}.${ext}`;
      const { host, policy, ossAccessKeyId, signature } = ossConfig;
      uni.uploadFile({
        url: host,
        filePath: tempFilePath,
        name: 'file',
        formData: {
          key,
          policy,
          signature,
          OSSAccessKeyId: ossAccessKeyId,
        },
        success(res) {
          if (res.statusCode === 204) {
            const url = `${host}${key}`;
            resolve({
              url,
              md5: digest,
            });
          } else {
            reject(new Error(`upload failed: ${res.errMsg}`));
          }
        },
        fail(err) {
          reject(new Error(`upload failed: ${err.errMsg}`));
        },
      });
    });
  };

  const upload = async ({ tempFilePath }) => {
    try {
      const { digest } = await getFileInfo(tempFilePath);
      const ossConfig = await fetchOssConfig();
      const result = await uploadFile({
        digest,
        ossConfig,
        tempFilePath,
      });
      return {
        ...result,
      };
    } catch (error) {
      console.error('upload error', error);
      return null;
    }
  };

  return {
    upload,
  };
};
```
