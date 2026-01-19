# 路由

路由是指确定应用程序如何响应客户端对特定端点的请求，该端点是一个 URI（或路径）以及一种特定的 HTTP 请求方法（如 GET、POST 等）。

每个路由可以有一个或多个处理函数，当路由被匹配，这些函数将被执行。

路由定义如下结构：

```js
app.METHOD(PATH, HANDLER)
```

* app 是 express 实例。
* METHOD 是一个 HTTP 请求方法。
* PATH 是服务器上的 path。
* HANDLER 当路由被匹配时，将会执行处理函数。 

以下示例说明如何定义简单路由。

* GET

```js
app.get('/', (req, res) => {
  res.send('Hello World!')
})
```

* POST

```js
app.post('/', (req, res) => {
  res.send('Got a POST request')
})
```

* PUT 

```js
app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})
```

* DELETE

```js
app.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})
```