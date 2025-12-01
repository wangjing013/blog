# 定义 API

项目请求库，是基于 ``Nuxt`` 内部提供的 ``$fetch`` 进行的封装， 关于 [$fetch](https://nuxt.com/docs/api/utils/dollarfetch) 可以自行查看文档。

接下里讲解项目API定义流程：

##  1. 在 api 目录下创建您的接口文件

在 ``api`` 目录下文件都会被自动引入，在应用中可以通过 ``$api.[接口文件名称].方法`` 去访问。 接下来在 ``api`` 目录下创建一个 ``user.ts``，如下：

```js
// api/user.ts
import type { SmsScene } from '@/constants'

type SmsParams = {
  mobile: string
  scene: SmsScene.Register | SmsScene.ResetPassword
}

type LoginParams = {
  mobile: string
  password: string
}

type LoginResult = {
  access_token: string
  nickname: string
}

const userFn = (request: Fetch) => {
  return {
    sendSmsCode: async (
      body: SmsParams,
    ): Promise<ResponseResult<boolean | null>> => {
      return request('/app-api/member/auth/send-sms-code', {
        method: 'POST',
        body,
      })
    },

    login: async (
      body: LoginParams,
    ): Promise<ResponseResult<LoginResult | null>> => {
      return request('/webLogin', {
        method: 'POST',
        body,
      })
    },

    getUserInfo: async (): Promise<ResponseResult<User | null>> => {
      return request('/getUserInfo')
    },
  }
}

export type apiUser = ReturnType<typeof userFn>
export default userFn
```

## 2. 在类型声明文件中，引入 apiUser 类型

```ts
// types/api.d.ts
import type { apiUser } from '@/api/user'

declare module '#app' {
  interface NuxtApp {
    $api: {
      user: apiUser
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: {
      user: apiUser
    }
  }
}
```

显示指定目的，能让在使用时 TS 能知道每个API的类型。


## 3. 使用

上面两个步骤完成后，可以在页面中通过如下方式去访问：

```js
const { $api } = useNuxtApp();
$api.user.getUserInfo();
```

