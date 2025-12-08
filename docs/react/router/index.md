# 路由

React Router 是 React 中最流行的路由库，在本篇文章中，将讲解如何集成和使用。

## React Router 支持三种模式

* 框架模式
* 数据模式
* 声明模式

在这里主要使用数据模式。

## 数据模式

### 安装

#### 创建项目模版

```shell
npx create-vite@latest
```

#### 安装 React Router

```shell
npm i react-router
```

#### 创建路由并引入

```js
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from "react-router";
import { RouterProvider } from 'react-router/dom';

cont root = document.getElementById('root')
const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
]);

createRoot(root).render(
  <RouterProvider router={router} />,
);
```

### 路由

#### 路由对象

路由对象定义了路由的行为，除了``路径``和``组件``之外，还包括``data loading``和``actions``。

```tsx
import {
  createBrowserRouter,
  useLoaderData,
} from "react-router";

createBrowserRouter([
  {
    path: "/teams/:teamId",
    loader: async ({ params }) => {
      let team = await fetchTeam(params.teamId);
      return { name: team.name };
    },
    Component: Team,
  },
]);

function Team() {
  let data = useLoaderData();
  return <h1>{data.name}</h1>;
}

```

#### 嵌套路由

通过 ``children`` + ``Outlet`` 实现嵌套路由。

```js
createBrowserRouter([
  {
    path: "/dashboard",
    Component: Dashboard,
    children: [
      { index: true, Component: Home },
      { path: "settings", Component: Settings },
    ],
  },
]);
```

父级路径会自动包含在子级路径中，因此该配置会同时创建 ``/dashboard``和``/dashboard/settings`` URL。

子路由通过父路由中的 ``Outlet`` 组件渲染。

```js
// Dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet />
    </div>
  );
}
```

#### 布局路由

布局路由也是嵌套路由的一种，只不过他不需要指定 ``path`` 字段，且不会在子路由上添加任何内容。

布局路由只承担 UI 布局，不影响 URL 结构。

```tsx
createBrowserRouter([
  {
    // 父路由上没有指定 path，只有 component
    Component: MarketingLayout,
    children: [
      { index: true, Component: Home },
      { path: "contact", Component: Contact },
    ],
  },

  {
    path: "projects",
    children: [
      { index: true, Component: ProjectsHome },
      {
        // 同样，没有路径，只是布局的一个组件
        Component: ProjectLayout,
        children: [
          { path: ":pid", Component: Project },
          { path: ":pid/edit", Component: EditProject },
        ],
      },
    ],
  },
]);
```

#### Index Routes

有时我们需要指定某个路由作为首页，或者在嵌套路由中指定默认展示的页面，这时就可以使用 Index 路由。 

``Index`` 路由通过在路由对象上设置 ``index: true`` 来定义，并且不需要指定``path`` 属性。

```js
{ index: true, Component: Home }
```

Index 路由渲染在父路由中 ``Outlet`` 中，访问地址为父路由的 URL。

```js
import { createBrowserRouter } from "react-router";

createBrowserRouter([
  // "/"
  { index: true, Component: Home },
  {
    Component: Dashboard,
    path: "/dashboard",
    children: [
      // "/dashboard"
      { index: true, Component: DashboardHome },
      { path: "settings", Component: DashboardSettings },
    ],
  },
]);
```

注意：Index 路由不能包含子路由。


#### 前缀路由(分组路由)

路由对象只有 path ，不包含 Component 属性。与 LayoutRoute 相反，通常用于去创建一个分组路由。

```tsx
createBrowserRouter([
  {
    // 没有 Component, 只有 path
    path: "/projects",
    children: [
      { index: true, Component: ProjectsHome },
      { path: ":pid", Component: Project },
      { path: ":pid/edit", Component: EditProject },
    ],
  },
]);
```

上面生成路由：`/projects`、`/projects/:pid`、`/projects/:pid/edit`。


#### 动态路由

如果路径段以冒号 (:) 开头，则它就成为一个``动态段``。当路由与 URL 匹配时，动态段将从 URL 中解析出来，并作为参数提供给其他路由 API。

```js
{
  path: "teams/:teamId",
  loader: async ({ params }) => {
    // params 在 loaders 和 actions 中可访问到
    let team = await fetchTeam(params.teamId);
    return { name: team.name };
  },
  Component: Team,
}
```

```js
import { useParams } from "react-router";

function Team() {
  // 在组件中通过 useParams 访问
  let params = useParams();
}
```

你可以在一个路由 path 中，包含多个动态参数：

```json
{
  path: "c/:categoryId/p/:productId";
}
```

#### 可选参数

可以在路由段后添加 ``?``，表示是可选的。

```json
{
  path: ":lang?/categories";
}
```

一个路由 ``path`` 中，可以包含必填段和可选段：

```json
{
  path: "users/:userId/edit?";
}
```


#### 通配符

通常用来处理 404 页，用来捕获所有未被匹配到路由。

```json
{
  path: "*";
  Component: NotFoundComponent
}
```

