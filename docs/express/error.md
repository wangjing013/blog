# 错误处理

``Express`` 提供处理同步和异步错误的方式。 为了确保能被 ``Express`` 捕获，同步和异步代码上抛出错误方式会有一些区别。

## 同步代码

在路由和中间件里面，直接 ``throw`` 方式

```js
app.get('/', (req, res) => {
  throw new Error('BROKEN') // Express will catch this on its own.
})
```

## 异步代码

对于从路由处理程序和中间件的异步代码中返回错误时，你必须要把错误对象传递给 ``next()`` 中，这样才能被 ``Express`` 捕获和处理。

```js
app.get('/', (req, res, next) => {
  fs.readFile('/file-does-not-exist', (err, data) => {
    if (err) {
      next(err) // Pass errors to Express.
    } else {
      res.send(data)
    }
  })
})
```

从 ``Express5`` 开始，路由处理程序和中间件如果返回一个 ``Promise``，当 ``Promise`` 被 ``reject`` （例如在 async 函数中 throw 一个错误）时，``Express`` 自动捕获这个错误，并将错误内容传递给 ``next(value)`` 中。

```js
app.get('/user/:id', async (req, res, next) => {
  const user = await getUserById(req.params.id)
  res.send(user)
})
```

如果 ``getUserById`` ``throw error`` 或 ``reject`` ，则将使用 ``throw error`` 或 ``reject`` 的值调用 ``next``。如果没有提供 ``reject`` 的值，``Express router`` 提供自定义错误对象并传递给 ``next`` 。

在 ``Express`` 中，如果 ``next(value)`` 的 ``value`` 是 ``truthy`` 值，视为异常：跳过剩余非错误处理中间件/路由，转入错误链。

对于只需检查错误、不传数据的中间件，可简化异步回调：

```js
app.get('/', [
  function (req, res, next) {
    // next 没有异常
    // fs.writeFile('/inaccessible-path', 'data', err => {});
    fs.writeFile('/inaccessible-path', 'data', next)
  },
  function (req, res) {
    res.send('OK')
  }
])
```

上述代码中，直接将 ``next`` 传入（如 ``fs.writeFile(path, data, next)``）。成功时回调 ``next(null)``（null 为 falsy，等同 next()，正常继续）；失败时 ``next(err)``（err 为 truthy，触发异常）。

你必须捕获由路由处理程序或中间件调用的异步代码中出现的错误，并将它们传递给 Express 进行处理。例如：

```js
app.get('/', (req, res, next) => {
  setTimeout(() => {
    try {
      throw new Error('BROKEN')
    } catch (err) {
      next(err)
    }
  }, 100)
})
```

上面的示例使用 ``try...catch`` 块来捕获异步代码中的错误，并将它们传递给 Express。如果省略 ``try...catch`` 块，Express 将无法捕获该错误，因为它不属于同步处理程序代码的一部分。


使用 Promise 去避免 ``try...catch`` 代码块的开销或者，使用那些返回 Promise 的函数时（fetch等）。例如：

```js
app.get('/', (req, res, next) => {
  Promise.resolve().then(() => {
    throw new Error('BROKEN')
  }).catch(next) // 错误将传递给 Express
})
```

由于 ``Promise`` 会自动捕获同步错误和被拒绝的 Promise，因此您可以简单地将 next 作为最终的 catch 处理程序，Express 将捕获错误，因为 ``catc``h 处理程序会将错误作为第一个参数传递。


你还可以使用一系列处理程序来实现同步错误捕获，从而将异步代码简化到极致。例如：

```js
app.get('/', [
  function (req, res, next) {
    fs.readFile('/maybe-valid-file', 'utf-8', (err, data) => {
      res.locals.data = data
      next(err)
    })
  },
  function (req, res) {
    res.locals.data = res.locals.data.split(',')[1]
    res.send(res.locals.data)
  }
])
```

无论你使用哪种方法，如果你希望 ``Express`` 错误处理器被调用且应用程序能够正常运行，就必须确保 ``Express`` 接收到该错误。

## 默认错误处理程序

默认的错误处理中间件函数被添加到中间件函数栈的末尾。

如果你传一个错误给 ``next()`` 并且没有在自定义错误处理器中处理它，那么它将由内置错误处理器来处理。错误将连同堆栈跟踪信息一起发送给客户端。 堆栈跟踪信息不会包含在生产环境中。

当写入错误时，以下信息会被添加到响应中：

  * res.statusCode 设置为 err.status。如果 status 值不是 400-599 之间值，Express 将自动设置为 500。
  * res.statusMessage 是根据状态码设置的。
  * 当在生产环境时，返回的 HTML body 内容为状态码对应消息，否则将返回 ``err.stack`` 。
  * 任何在 err.headers 对象中指定的头部信息（如果你在错误对象（err）上附加了一个名为 headers 的属性（这是一个普通 JavaScript 对象），Express 会将这个对象中的键值对作为 HTTP 响应头部（headers） 添加到最终的响应中。）

如果你在开始写入响应后，再调用 ``next (err)`` 并传入错误 （例如，在向客户端流式传输响应时遇到错误），Express 默认的错误处理程序会关闭连接并使请求失败。

因此，当你添加自定义错误处理器时，必须在响应头部已经发送给客户端的情况下，将错误委托（传递）给默认的 Express 错误处理器：

```js
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}
```

* 怎么理解，当响应头部（headers）已经发送给客户端时，将错误委托（传递）给默认的 Express 错误处理器
  * HTTP 响应流程：一旦 ``res.writeHead()`` 或 ``res.send()`` 等操作发送了头部（status code、content-type 等），你就不能再修改响应（e.g., 不能再设置状态码或头部，否则会报错如 ``ERR_HTTP_HEADERS_SENT``）。
  * 在这种情况下，自定义处理器别试图发送新响应（e.g., 别 ``res.status(500).send()``），而是直接 ``next(err)`` 委托给默认处理器——默认处理器会检查 ``res.headersSent``（头部是否已发），如果是，就只静默处理（e.g., 控制台日志），不发响应，避免冲突。

请注意，如果你在代码中多次调用带有错误的 ``next ()``，即使已设置了自定义错误处理中间件，默认的错误处理器也可能会被触发。