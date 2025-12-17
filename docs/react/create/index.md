# 创建 React 应用

如果希望基于 ``React`` 去构建一个新的 ``app`` 或 ``网站``，建议从一个框架开始。

## Next.js (App Router) 

``Next.js`` 的 ``App Router`` 是一个 React 框架，它充分利用了 React 的架构，从而能够构建全栈 React 应用。

```shell
npx create-next-app@latest
```

``Next.js`` 由 ``Vercel`` 维护。您可以将 ``Next.js`` 应用部署到任何支持 ``Node.js`` 或 ``Docker`` 容器的托管服务提供商，或者部署到您自己的服务器上。``Next.js`` 还支持静态化，无需服务器。

## React Router (v7) 

``React Router`` 是 ``React`` 最流行的路由库，可以与 ``Vite`` 结合使用，构建全栈 ``React`` 框架。它强调标准 Web API，并提供多个适用于各种 ``JavaScript`` 运行时和平台的即用型模板。

```shell
npx create-react-router@latest
```

React Router 是由 Shopify 维护。

## Expo (for native apps) 

``Expo`` 是一个 ``React`` 框架，它允许你创建具有真正原生 UI 的通用 ``Android``、``iOS`` 和`` Web 应用程序``。

```shell
npx create-expo-app@latest
```

如果不想使用框架，也可以使用 ``Vite`` 脚手架来生成基础项目模版

## Vite

```shell
npm create vite@latest
```