# SSE

理解 SSE(Server-Sent Events) 

* 实时新闻
* 体育
* 聊天

一般采用短轮训 或 WebSockets实时通信。现在有种更简单、高效的方式：Server-Sent Events(SSE)。

SSE 为服务器提供了一种通过 HTTP 向客户端推送更新的有效方法。

在本指南中，我们将解释什么是 SSE，它与其他实时技术的比较，并通过实际示例演示如何在 Node.js 中使用它。


## 什么是 SSE

Server-Sent Events (SSE) 允许服务器通过HTTP连接向客户端发起单向更新流，不像 WebSockets，WebSockets 是全双工通信(客户端可发送服务端，服务端可以发送给客户端)
SSE 只支持一种方式：服务端发送更新并且客户端接收。

### SSE 工作流程

* 客户端发送一个标准的 HTTP 请求到服务端
* 服务器保持此连接打开，并根据需要向客户端发送更新
* 客户端监听更新并且实时处理它们


SSE 特别适用于服务端需要持续或间断性发送内容到客户端并且不需要接口客户端的响应。案例如下：

* 实时新闻
* 股票价格更新
* 现场体育比分
* 实时监测看板


## SSE与其他技术

### SSE vs WebSockets

这两者都支持实时通信，这两者上存在区别：

* WebSockets 是全双工通信，客户端和服务端都需要相互发送消息。
* SSE 只允许服务端发送消息给客户端


### SSE vs Polling

* 长轮训：客户端重复发送请求给服务端，询问是否有新数据可以用。这是非常低效的，因为即使没有新数据，客户端也必须继续发送请求。
* SSE: 客户端与服务端建立一次连接，当有新数据时，服务端发送数据给客户端。不需要客户端去轮训。


## 进阶

* 简单：SSE 基于 HTTP，因此它可以轻松地在传统的 HTTP/2 或 HTTP/1.1 上工作。而无需像 WebSockets 这样更复杂的协议。
* 自动重连：如果连接被断开，浏览器会自动重新连接到服务器，使其健壮且易于维护。
* 轻量：SSE 是单项协议，相比 WebSockets 占用资源更少。
* 跨浏览器支持：现在浏览器像 Chrome、Firefox以及 Safari 内置就支持 SSE

## 何时使用 SSE

SSE 非常适合需要持续的服务器到客户端数据流的应用程序，这些应用程序

* 客户端只需接收来自服务器的更新。
* 通信可以容忍偶尔的延迟。
* 性能和资源效率至关重要。


## SSE 的工作原理：技术细节

SSE 基于标准 HTTP 连接，使用特定的 content type 和 数据格式去发送更新内容。服务端响应 ContentType 类型为 ``text/event-stream``，并且发送的数据结构如下格式：

* Data：每条消息可以包含多个数据字段，每个字段之间用换行符 ``(\n)`` 分隔。事件必须以两个换行符 ``(\n\n)`` 结尾。
* Event: 可选，用于定义自定义的类型
* ID: 可选消息 ID，允许客户端跟踪和处理重新连接情况。

下面是一个简单结构：

```md
id: 123
event: message
data: Hello World
data: This is another message line
```

## 基于 Nodejs 实现 SSE

### 第一步：设置 Node.js 服务

我们将首先创建一个基本的 Node.js 服务器，用于将事件流式传输到客户端。``express`` 库可用于处理路由，但也可以使用原生 ``HTTP`` 模块实现 SSE。

```js

```

在 Server-Sent Events (SSE) 协议中，浏览器端的 EventSource 会自动将连续收到的多行数据（在一次 HTTP 响应中、没有被空行分隔的多行）合并为一个事件进行处理。

```js
res.write("id: " + data.id + "\n");
res.write("data: " + JSON.stringify(data) + "\n\n");
```

这两行实际上是一条完整的 SSE 消息，格式如下：

```txt 
id: 0
data: {"id":0}
```

SSE 协议规定：以一个空行（\n\n）作为一条事件的结束。只要没有遇到空行，EventSource 会把多行内容合并为同一个事件的不同字段（比如 id、data、event 等）。只有遇到空行，EventSource 才会把前面收到的内容当作一条完整的事件推送到 onmessage 处理。


## 疑问

* SSE 为什么不需要心跳检查 ？当客户发送连接请求到服务端后，由服务端保持这个连接状态
* [understanding-server-sent-events](https://itsfuad.medium.com/understanding-server-sent-events-sse-with-node-js-3e881c533081#cfdd)