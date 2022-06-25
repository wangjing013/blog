# 静默获取 openId

## openId 是什么？

用户在当前小程序的唯一标识（openid）。

## 小程序中如何获取 openId

<img src="./images/api-login.jpg"/>

小程序端伪代码如下:

```js
wx.login({
  success(res){
    if(res.code){
      wx.request({
        url: "https://example.com/api/login",
        data: {
          code: res.code
        },
        success(res){
          // 存储自定义的登录状态；例如 token
        }
      })
    }
  }
})
```

## 说明
* 调用 [wx.login()](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html) 获取 临时登录凭证code ，并回传到开发者服务器。
* 调用 [auth.code2Session](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html) 接口，换取 用户唯一标识 OpenID 、 用户在微信开放平台帐号下的唯一标识UnionID（若当前小程序已绑定到微信开放平台帐号） 和 会话密钥 session_key。

## 注意事项
* 会话密钥 ``session_key`` 是对用户数据进行 [加密签名](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html) 的密钥。为了应用自身的数据安全，开发者服务器**不应该把会话密钥下发到小程序，也不应该对外提供这个密钥**。
* 临时登录凭证 ``code`` 只能使用一次