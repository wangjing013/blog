# 路由对象

| 属性        | 描述        | 
| :----------- | :--------------| 
| path | 对应路由的URL |
| Component    | 当对应 path 匹配时，渲染的组件  | 
| middleware    | 中间件通常用于打印日志或路由鉴权，他可以执行在路由之前以及路由之后 | 
| loader |  loader 用于在路由渲染前提加载数据，供路由组件使用  | 
| action |    | 
| lazy | 路由懒加载，可以减少项目初始化加载时 bundle 的大小   | 


## Component

路由对象中 ``Component`` 属性，指定当路由被匹配时该属性对应组件将被渲染。

```json
createBrowserRouter([
  {
    path: "/",
    Component: MyRouteComponent,
  },
]);

function MyRouteComponent() {
  return (
    <div>
      MyRouteComponent
    </div>
  );
}
```

## middleware

```js
createBrowserRouter([
  {
    path: "/",
    middleware: [loggingMiddleware],
    loader: rootLoader,
    Component: Root,
    children: [{
      path: 'auth',
      middleware: [authMiddleware],
      loader: authLoader,
      Component: Auth,
      children: [...]
    }]
  },
]);

async function loggingMiddleware({ request }, next) {
  let url = new URL(request.url);
  console.log(`开始导航: ${url.pathname}${url.search}`);
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`导航完成 ${duration}ms`);
}

const userContext = createContext<User>();

async function authMiddleware ({ context }) {
  const userId = getUserId();

  if (!userId) {
    throw redirect("/login");
  }

  context.set(userContext, await getUserById(userId));
};
```


## loader 

```js
import {
  useLoaderData,
  createBrowserRouter,
} from "react-router";

createBrowserRouter([
  {
    path: "/",
    loader: loader,
    Component: MyRoute,
  },
]);

async function loader({ params }) {
  return { message: "Hello, world!" };
}

function MyRoute() {
  let data = useLoaderData();
  return <h1>{data.message}</h1>;
}
```

