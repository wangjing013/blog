# 深度解析 HTTP 协议原理

HTTP 协议分为如下几个步骤：

* 握手阶段
* 身份认证
* 建立连接
* 转发阶段

## 一、握手阶段

此处的握手指的是底层 ``TCP`` 连接的建立。当客户端与代理服务器完成 ``TCP`` 三次握手后，``Bun`` 触发 ``open`` 事件，此时代理服务器开始准备接收 ``HTTP`` 请求。

```js
import type { Socket, TCPSocket } from "bun";

const HANDSHAKE = "handshake";
const CONNECTING = "connecting";
const AUTH = "auth";
const REQUEST = "request";
const FORWARDING = "forwarding";
const AUTH_FAIL_RES = "HTTP/1.1 407 Proxy Authentication Required\r\n" +
      "Proxy-Authenticate: Basic realm=\"Access to internal proxy\"\r\n" +
      "\r\n";

type SocketData = {
    status: typeof HANDSHAKE | typeof CONNECTING | typeof AUTH | typeof REQUEST | typeof FORWARDING,
    remoteSocket?: TCPSocket | null
}

Bun.listen<SocketData>({
    hostname: "localhost",
    port: 3000,
    socket: {
        open(socket) {
            console.log("握手成功");
            socket.data = {
                status: HANDSHAKE
            }
        },
        data(socket, data) {
        },
        close(socket){
            // 连接关闭
        },
        error(socket){
            // 异常
        }
    }
})
```

## 二、身份认证

当使用 ``HTTP`` 账密认证连接代理服务器时，自动在 ``HTTP`` 请求头中添加 ``Proxy Authentication`` 头信息。 代理服务器可通过解析该字段，获取对应用户名和密码。

接下来，通过一个示例深入了解下：

```sh
curl -v -x admin:123456@localhost:3000 ipinfo.io
```

当执行 curl 命令时，代理服务器将接收如下内容：

```sh
GET http://ipinfo.io/ HTTP/1.1
Host: ipinfo.io
Proxy-Authorization: Basic YWRtaW46MTIzNDU2
User-Agent: curl/8.7.1
Accept: */*
Proxy-Connection: Keep-Alive
```

* 第一行：请求方式、目标地址、协议
* 第二行：目标地址 Host 信息
* 第三行：认证信息，``YWRtaW46MTIzNDU2`` 账密信息，只是经过 Base64 编码处理。
* 第四行：用户代理
* 第五行：客户端允许接收的内容
* 第六行：代理连接 Keep-Alive

接下来，获取 ``Proxy-Authorization`` 内容来完成认证。

```js
import type { Socket, TCPSocket } from "bun";

const HANDSHAKE = "handshake";
const CONNECTING = "connecting";
const AUTH = "auth";
const REQUEST = "request";
const FORWARDING = "forwarding";
const AUTH_FAIL_RES = "HTTP/1.1 407 Proxy Authentication Required\r\n" +
      "Proxy-Authenticate: Basic realm=\"Access to internal proxy\"\r\n" +
      "\r\n";

type SocketData = {
    status: typeof HANDSHAKE | typeof CONNECTING | typeof AUTH | typeof REQUEST | typeof FORWARDING,
    remoteSocket?: TCPSocket | null
}

const getAuthInfo = (rawStr: string) => {
    const match = rawStr.match(/Proxy-Authorization:\s+Basic\s+([^\r\n]+)/i);

    if (!match || !match[1]) {
        return null;
    }

    try {
        const encodeStr = match[1].trim(); 
        const decoded = Buffer.from(encodeStr, "base64").toString();
        
        const colonIndex = decoded.indexOf(':');
        if (colonIndex === -1) {
            return null;
        }
        
        const username = decoded.slice(0, colonIndex);
        const password = decoded.slice(colonIndex + 1);
        return { username, password };
    } catch (error) {
        return null;
    }
}

const hasAuthHeader = (rawStr: string) => {
    return rawStr.includes("Proxy-Authorization")
}

const validateAuth = (rawStr: string) =>{
    const authInfo =  getAuthInfo(rawStr);

    if(!authInfo) {
        return false;
    }

    const { username, password } = authInfo;
    return username === 'admin' && password === '123456';
}

const handler = (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    const rawStr = data.toString();

    // 1、 账密认证
    if (!(hasAuthHeader(rawStr) && validateAuth(rawStr))) {
        return socket.end(AUTH_FAIL_RES);
    }
}


Bun.listen<SocketData>({
    hostname: "localhost",
    port: 3000,
    socket: {
        open(socket) {
            console.log("握手成功");
            socket.data = {
                status: HANDSHAKE
            }
        },
        data(socket, data) {
            handler(socket, data);
        },
        close(socket){
            // 连接关闭
        },
        error(socket){
            // 异常
        }
    }
})
```

由于每个客户端连接上来时，生成 ``socket`` 是独立的。因为每个都是独立，所以利用这个特点，把 ``socket`` 连接中间态信息存储 ``socket.data`` 中，这样可以很好实现状态共享。


> 注意：在 HTTP 协议（HTTP/1.1 及以前）的规范中，\r\n（CRLF）就是官方指定的“标准分界符”。不管是请求头（Request Headers）还是响应头（Response Headers），每一行之间都必须用 \r\n 来结束。

## 三、建立连接

* 解析地址信息

```js
const getAddressInfo = (rawStr: string) => {
    const headers = rawStr.split(/\r\n/);
    const firstLine = headers[0];
    if(!firstLine) {
       return null
    }
    const [method, url] = firstLine?.split(' ');
    if (!method || !url) {
        return;
    }
    try {
        const urlObj = new URL(url);
        return {
            hostname: urlObj.hostname,
            port: parseInt(urlObj.port) ||  80
        }
    } catch (e) {
        return null;
    }   
}


const handler = (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    const rawStr = data.toString();

    // 1、 账密认证
    if (!(hasAuthHeader(rawStr) && validateAuth(rawStr))) {
        console.info("认证失败")
        return socket.end(AUTH_FAIL_RES);
    }
    socket.data.status = AUTH;

    // 2、获取服务地址
    const addr = getAddressInfo(rawStr);
    if (!addr) {
        return socket.end();
    }
}
```

* 通过 ``Bun.Connect`` 建立 TCP 连接

```js
const handler = async (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    const rawStr = data.toString();

    // 1、 账密认证
    if (!(hasAuthHeader(rawStr) && validateAuth(rawStr))) {
        console.info("认证失败")
        return socket.end(AUTH_FAIL_RES);
    }

    // 2、获取服务地址
    const addr = getAddressInfo(rawStr);
    if (!addr) {
        return socket.end();
    }

    const { hostname, port} = addr;
    try {
        // 1. 建立连接
        const remoteSocket = await Bun.connect({
            hostname,
            port,
            socket: {
                open(remoteSocket) {
                    socket.data.remoteSocket = remoteSocket;
                },
                data(_remoteSocket, data) {
                    socket.write(data);
                },
                close(remoteSocket, error) {
                    socket.close();
                },
                error(remoteSocket, error) {
                    socket.close();
                },
            }
        });

        // 2. 主动目标服务器发送消息，目标服务接收到消息之后，才会做相应处理。
        // 另外，这里为什么需要认证信息给移除？认证信息只是对于自身代理服务器，跟目标服务器无关。
        remoteSocket.write(data.toString().replace(/Proxy-Authorization:.*?\r\n/i, ""));
        socket.data.status = FORWARDING;
    } catch (error) {
        socket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
    }
}
```


由于与目标服务建立连接是异步的。为了避免客户端多次发送消息，重复发送与目标服务器的连接请求，需要 ``socket.data.status === CONNECTING`` 检查。

```ts
const handler = async (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    const rawStr = data.toString();
    // 1、 账密认证
    if (!(hasAuthHeader(rawStr) && validateAuth(rawStr))) {
        console.info("认证失败")
        return socket.end(AUTH_FAIL_RES);
    }

    // 2、获取服务地址
    const addr = getAddressInfo(rawStr);
    if (!addr) {
        return socket.end();
    }

    // 2.1、避免多次出出发触发连接远端服务
    if (socket.data.status === CONNECTING) {
        return;
    }
    socket.data.status = CONNECTING;

    const { hostname, port} = addr;
    try {
        // 2.2、建立连接
        const remoteSocket = await Bun.connect({
            hostname,
            port,
            socket: {
                open(remoteSocket) {
                    console.log("远程服务器连接成功")
                    socket.data.remoteSocket = remoteSocket;
                },
                data(_remoteSocket, data) {
                    socket.write(data);
                },
                close(remoteSocket, error) {
                    socket.close();
                },
                error(remoteSocket, error) {
                    socket.close();
                },
            }
        });

        // 2.3、主动目标服务器发送消息，目标服务接收到消息之后，才会做相应处理。
        // 另外，这里为什么需要认证信息给移除？认证信息只是对于自身代理服务器，跟目标服务器无关。
        remoteSocket.write(data.toString().replace(/Proxy-Authorization:.*?\r\n/i, ""));
        socket.data.status = FORWARDING;
    } catch (error) {
        socket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
    }
}
```

上面解决重复连接问题。在未建立连接之前，我们直接把处理客户端发送请求内容给丢弃了。这里我们需要把内容进行缓存一下，等连接建立之后一次性 write 给目标服务器。

```js
type SocketData = {
    status: typeof HANDSHAKE | typeof CONNECTING | typeof AUTH | typeof REQUEST | typeof FORWARDING
    remoteSocket?: TCPSocket | null
    // 新增 cacheBuffer
    cacheBuffer?: Buffer<ArrayBufferLike>[]
}

const handler = async (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    const rawStr = data.toString();
    // 1、 账密认证
    if (!(hasAuthHeader(rawStr) && validateAuth(rawStr))) {
        console.info("认证失败")
        return socket.end(AUTH_FAIL_RES);
    }

    // 2、获取服务地址
    const addr = getAddressInfo(rawStr);
    if (!addr) {
        return socket.end();
    }

    // 2.1 避免多次出出发触发连接远端服务
    if (socket.data.status === CONNECTING) {
        socket.data.cacheBuffer?.push(data);
        return;
    }
    socket.data.status = CONNECTING;
    socket.data.cacheBuffer = [data];

    const { hostname, port} = addr;
    try {
        // 2.2 建立连接
        const remoteSocket = await Bun.connect({
            hostname,
            port,
            socket: {
                open(remoteSocket) {
                    console.log("远程服务器连接成功")
                    socket.data.remoteSocket = remoteSocket;
                },
                data(_remoteSocket, data) {
                    socket.write(data);
                },
                close(remoteSocket, error) {
                    socket.close();
                },
                error(remoteSocket, error) {
                    socket.close();
                },
            }
        });

        // 2.3 主动目标服务器发送消息，目标服务接收到消息之后，才会做相应处理。
        // 另外，这里为什么需要认证信息给移除？认证信息只是对于自身代理服务器，跟目标服务器无关。
        socket.data.status = FORWARDING;

        // 把缓存内容一次性推送到目标服务器
        if (socket.data.cacheBuffer && socket.data.cacheBuffer.length) {
            const buffer = Buffer.concat(socket.data.cacheBuffer);=
            remoteSocket.write(buffer.toString().replace(/Proxy-Authorization:.*?\r\n/i, ""));
            socket.data.cacheBuffer = [];
        }        
    } catch (error) {
        socket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
    }
}
```

## 四、转发阶段

一切就绪之后，就进入转发阶段。 此时，只需在 ``handler`` 函数开头添加转发逻辑。

```js
const handler = async (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    // 3、转发
    if (socket.data.status === FORWARDING) {
        return socket.data.remoteSocket?.write(data);
    }

    const rawStr = data.toString();
    // 1、 账密认证
    if (!(hasAuthHeader(rawStr) && validateAuth(rawStr))) {
        console.info("认证失败")
        return socket.end(AUTH_FAIL_RES);
    }

    // 2、获取服务地址
    const addr = getAddressInfo(rawStr);
    if (!addr) {
        return socket.end();
    }

    // 2.1 避免多次出出发触发连接远端服务
    if (socket.data.status === CONNECTING) {
        socket.data.cacheBuffer?.push(data);
        return;
    }
    socket.data.status = CONNECTING;
    socket.data.cacheBuffer = [data];

    const { hostname, port} = addr;
    try {
        // 2.2 建立连接
        const remoteSocket = await Bun.connect({
            hostname,
            port,
            socket: {
                open(remoteSocket) {
                    console.log("远程服务器连接成功")
                    socket.data.remoteSocket = remoteSocket;
                },
                data(_remoteSocket, data) {
                    socket.write(data);
                },
                close(remoteSocket, error) {
                    socket.close();
                },
                error(remoteSocket, error) {
                    socket.close();
                },
            }
        });

        // 2.3 主动目标服务器发送消息，目标服务接收到消息之后，才会做相应处理。
        // 另外，这里为什么需要认证信息给移除？认证信息只是对于自身代理服务器，跟目标服务器无关。
        socket.data.status = FORWARDING;
        if (socket.data.cacheBuffer && socket.data.cacheBuffer.length) {
            const buffer = Buffer.concat(socket.data.cacheBuffer);
            remoteSocket.write(buffer.toString().replace(/Proxy-Authorization:.*?\r\n/i, ""));
            socket.data.cacheBuffer = [];
        }
    } catch (error) {
        socket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
    }
}
```

## 扩展

当访问的目标地址为 ``https``，命令如下：

```sh
curl -v -x admin:123456@localhost:3000 https://ipinfo.io
```

当执行上述命令后，控制台会输出：

```sh
* Connected to localhost (::1) port 3000
* CONNECT tunnel: HTTP/1.1 negotiated
* allocate connect buffer
* Proxy auth using Basic with user 'admin'
* Establish HTTP proxy tunnel to ipinfo.io:443
> CONNECT ipinfo.io:443 HTTP/1.1
> Host: ipinfo.io:443
> Proxy-Authorization: Basic YWRtaW46MTIzNDU2
> User-Agent: curl/8.7.1
> Proxy-Connection: Keep-Alive
>
< HTTP/1.1 502 Bad Gateway
<
* CONNECT tunnel failed, response 502
* Closing connection
```

首先与目标服务器是连接成功，当尝试与目标服务器连接时报错了。 造成该错误原因，我们在获取目标服务器地址的方法未正确解析 ``HTTPS`` 协议的目标地址信息。


当发送尝试连接到 ``HTTPS`` 目标地址，收到的头信息如下：

```sh
CONNECT ipinfo.io:443 HTTP/1.1
Host: ipinfo.io:443
Proxy-Authorization: Basic YWRtaW46MTIzNDU2
User-Agent: curl/8.7.1
Proxy-Connection: Keep-Alive
```

发现与标准 `HTTP` 请求不同的地方：

* **请求方法变更**：客户端使用了 `CONNECT` 方法，这是 HTTPS 隧道代理的专属特征，表明客户端希望代理服务器建立一条盲转发的 TCP 通道。
* 建立连接的方法： ``CONNECT``
* **目标地址格式变化**：请求行中的地址并不是一个标准的 URL（不包含 `https://` 协议头），而是标准的 `host:port` 格式（如 `ipinfo.io:443`），且客户端会自动补全 HTTPS 的默认端口 `443`。

回顾，前面获取目标服务 ``hostname`` 和 ``port`` 是通过 ``URL`` 对象：

```js
// 继续通过 URL 解析 HTTPS 目标地址
const urlObj = new URL("ipinfo.io:443"); 
// 打印 urlOBj
console.log(urlObj);
```

``urlObj`` 内容，如下：

```sh
{
  href: "ipinfo.io:443",
  origin: "null",
  protocol: "ipinfo.io:",
  username: "",
  password: "",
  host: "",
  hostname: "",
  port: "",
  pathname: "443",
  hash: "",
  search: ""
}
```

**URL 解析失败的根源**：由于 `CONNECT` 后面的地址只有 `ipinfo.io:443`，缺乏 `http://` 或 `https://` 这样的标准协议前缀，导致 ``JS`` 的 `new URL()` 无法正确识别域名与端口，最终解析出了一堆空值。

针对 ``HTTPS`` 协议，需要做特殊处理：

```ts
const getAddressInfo = (rawStr: string) => {
    const headers = rawStr.split(/\r\n/);
    const firstLine = headers[0];
    if(!firstLine) {
       return null
    }
    const [method, url] = firstLine?.split(' ');
    if (!method || !url) {
        return;
    }
    try {
        // 针对 HTTPS 获取 hostname 和 port 方式作调整
        const isHttps = method.toLocaleUpperCase() === "CONNECT";
        if (isHttps) {
            const parts = url.split(":");
            return  {
                isHttps,
                hostname: parts[0]!,
                port: parseInt(`${parts[1] || 443}`)
            }
        } else {
            const urlObj = new URL(url);
            return {
                isHttps,
                hostname: urlObj.hostname,
                port: parseInt(`${urlObj.port || 80}`)
            }
        }
    } catch (e) {
        return null;
    }   
}
```

再次执行 ``curl`` 命令时，发现错误变成：

```sh
* Connected to localhost (::1) port 3000
* CONNECT tunnel: HTTP/1.1 negotiated
* allocate connect buffer
* Proxy auth using Basic with user 'admin'
* Establish HTTP proxy tunnel to ipinfo.io:443
> CONNECT ipinfo.io:443 HTTP/1.1
> Host: ipinfo.io:443
> Proxy-Authorization: Basic YWRtaW46MTIzNDU2
> User-Agent: curl/8.7.1
> Proxy-Connection: Keep-Alive
>
* Proxy CONNECT aborted
* Closing connection
curl: (56) Proxy CONNECT aborted
```

客户端主动断开了连接，迟迟未收到代理服务响应。 在 ``HTTPS`` 当与目标服务器建立连接之后，我们主动告诉客户端连接已建立。

```ts
socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
```

接下来，我们需要调整连接建立后的处理逻辑。对于 ``HTTPS`` 协议，当代理与远端服务器成功建立连接后，必须立刻向客户端回显 ``HTTP/1.1 200 Connection Established`` 的响应。

此时，客户端才会触发后续的 TLS 握手并继续发送加密数据，而代理服务器也将正式进入纯二进制流的 “盲转阶段”（Tunnel 模式）。

```ts
const handler = async (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    // 3、转发
    if (socket.data.status === FORWARDING) {
        return socket.data.remoteSocket?.write(data);
    }

    const rawStr = data.toString();
    // 1、 账密认证
    if (!(hasAuthHeader(rawStr) && validateAuth(rawStr))) {
        console.info("认证失败")
        return socket.end(AUTH_FAIL_RES);
    }

    // 2、获取服务地址
    const addr = getAddressInfo(rawStr);
    if (!addr) {
        return socket.end();
    }

    // 2.1 避免多次出出发触发连接远端服务
    if (socket.data.status === CONNECTING) {
        socket.data.cacheBuffer?.push(data);
        return;
    }
    socket.data.status = CONNECTING;
    socket.data.cacheBuffer = [data];

    const { hostname, port, isHttps } = addr;
    try {
        // 2.2 建立连接
        const remoteSocket = await Bun.connect({
            hostname,
            port,
            socket: {
                open(remoteSocket) {
                    console.log("远程服务器连接成功")
                    socket.data.remoteSocket = remoteSocket;
                },
                data(_remoteSocket, data) {
                    socket.write(data);
                },
                close(remoteSocket, error) {
                    socket.close();
                },
                error(remoteSocket, error) {
                    socket.close();
                },
            }
        });

        // 2.3 状态流转为转发阶段
        socket.data.status = FORWARDING;
        // 2.4 针对 HTTPS 协议，向【客户端】回显 200，告诉客户端隧道已建好，可以发送加密的 TLS 握手了
        if (isHttps) {
            socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
            socket.data.cacheBuffer = [];
        } else {
            // HTTP 协议：将之前缓存的客户端请求，过滤掉代理认证头后，发送给【目标服务器】
            if (socket.data.cacheBuffer && socket.data.cacheBuffer.length) {
                const buffer = Buffer.concat(socket.data.cacheBuffer);
                remoteSocket.write(buffer.toString().replace(/Proxy-Authorization:.*?\r\n/i, ""));
                socket.data.cacheBuffer = [];
            }
        }
    } catch (error) {
        socket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
    }
}
```


到此为止，一个完整的 ``HTTP(S) 正向代理服务器`` 就编写完成了。

为了能更直观地理解``客户端``、``代理服务器``以及``目标服务器`` 三者之间的网络交互，可以参考下面的整体交互时序图:

```md
客户端 (curl)                 代理服务器 (Bun)               目标服务器 (ipinfo.io)
    |                               |                               |
    |------- 1. TCP 三次握手 ------->|                               |
    |                               |                               |
    |--- 2. HTTP Request + Auth --->|                               |
    |                               |-- 3. 校验账密 & 解析 Host --    |
    |                               |                               |
    |                               |------- 4. TCP 三次握手 ------> |
    |                               |                               |
    |                               |--- 5. 转发请求 (移除Auth) ----> |
    |                               |                               |
    |                               |<------ 6. 返回响应数据 -------  |
    |<------ 7. 透传响应数据 -------  |                               |
```

## 总结

* HTTP 协议大概分为如下四个阶段
    * 握手阶段 （指的是 TCP 底层的三次握手）
    * 认证阶段
    * 建立连接
    * 转发阶段

