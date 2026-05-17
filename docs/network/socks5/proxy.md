# 实现 Socks5 代理服务器

```ts
import type { Socket, TCPSocket } from "bun";

// 中间态
const HANDSHAKE = "handshake";
const CONNECTING = "connecting";
const AUTH = "auth";
const REQUEST = "request";
const FORWARDING = "forwarding";

// 通用类型
interface SocketData {
    status: typeof HANDSHAKE | typeof CONNECTING | typeof AUTH | typeof REQUEST | typeof FORWARDING
    remoteSocket?: TCPSocket
  }

// Socks5 常量
const VER_5 = 0x05;
const AUTH_MODE = [0x05, 0x02];
const AUTH_SUCCESS = [0x01, 0x00];
const AUTH_FAIL = [0x01, 0x01];
const ATYP_V4 = 0x01;
const ATYP_DOMAIN = 0x03;
const ATYP_V6 = 0x04;
const CONNECT_SUCCESS = [0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
const CONNECT_ERROR = [0x05, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];


const getAuthInfo = (data: Buffer<ArrayBufferLike>)=> {
    try {
        const usernameLen = data[1]!;
        const usernameStart = 2;
        const usernameEnd = usernameStart + usernameLen;
        const username = Uint8Array.prototype.slice.call(data, usernameStart, usernameEnd).toString();
        const password = Uint8Array.prototype.slice.call(data, usernameEnd + 1).toString();
        return {
            username,
            password
        }
    } catch (error) {
        return null;   
    }
}

const validateAuth = (data: Buffer<ArrayBufferLike>)=> {
    const authInfo = getAuthInfo(data);
    if (!authInfo) {
       return false
    }

    return authInfo.username === 'admin' && authInfo.password === '123456';
}   

const getAddressInfo = (data:  Buffer<ArrayBufferLike>) => {
    const atyp = data[3];
    let hostname = '';
    let port = 0;
    if (atyp === ATYP_V4) { 
        hostname = `${data[4]}.${data[5]}.${data[6]}.${data[7]}`;
        port = data.readUInt16BE(8);
    } else if (atyp === ATYP_DOMAIN) {
        const len = data[4]!;
        hostname = Uint8Array.prototype.slice.call(5, 5 + len).toString();
        port =  data.readUInt16BE(5 + len);
    } else if(atyp === ATYP_V6) {
        const segments = [];
        const startIndex = 4;
        // IPV6 是 128 位的地址，采用冒号分割的十六进制表示法，其格式 x:x:x:x:x:x:x:x

        for (let i = 0; i < 8; i++) {
            segments.push(data.readUInt16BE(startIndex + i * 2).toString(16));
        }
        hostname = segments.join(":");
        port = data.readUInt16BE(startIndex + 16);
    }

    return {
        hostname,
        port
    }
}

const handler = async (socket: Socket<SocketData>, data: Buffer<ArrayBufferLike>) => {
    // 1、握手阶段 (版本协商) <Buffer 05 03 00 01 02>
    const state = socket.data;
    if (state.status === HANDSHAKE) {
        const ver = data[0];
        if (ver !== VER_5) {
            socket.end();
        }
        socket.write(Buffer.from(AUTH_MODE));
        state.status = AUTH;
    } else if (state.status === AUTH) {
        // 2、认证阶段 <Buffer 01 05 61 64 6d 69 6e 06 31 32 33 34 35 36>
       if (!validateAuth(data)) {
         return socket.end(Buffer.from(AUTH_FAIL))
       }
       socket.write(Buffer.from(AUTH_SUCCESS));
       state.status = REQUEST;
    } else if (state.status === REQUEST) {
        // 3、获取 ATYP 目标地址类型 <Buffer 05 01 00 01 22 75 3b 51 01 bb>
        const { hostname, port } = getAddressInfo(data);
        try {
            const remoteSocket = await Bun.connect({
                hostname,
                port,
                socket: {
                    data(_remoteSocket, data) {
                        socket.write(data);
                    },
                    close() {
                        socket.close();
                    },
                    error(){
                        socket.end();
                    }
                }
            });
            state.remoteSocket = remoteSocket;
            state.status = FORWARDING;
            socket.write(Buffer.from(CONNECT_SUCCESS));
        } catch (error) {
            socket.end(Buffer.from(CONNECT_ERROR));
        }
    } else if (state.status === FORWARDING) {
        // 4. 转发阶段
        state.remoteSocket?.write(data);
    }
}


Bun.listen<SocketData>({
    hostname: "localhost",
    port: 3000,
    socket: {
        open(socket) {
            socket.data = {
                status: HANDSHAKE
            };
        },
        data(socket, data) {
            handler(socket, data)
        },
        error(socket, error) {
            socket.data.remoteSocket?.end();
        },
        close(socket) {
            socket.data.remoteSocket?.close();
        }
    }
})
```