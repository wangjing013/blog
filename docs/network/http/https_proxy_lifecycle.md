# HTTPS 代理建立的完整生命周期

主要包括六部分：

* 客户端与代理服务器建立连接
* 代理服务器与目标服务器建立连接 (隧道)
* 客户端与目标服务器建立端到端的安全隧道 (TLS)
    * 在已建立的隧道内，建立端到端安全隧道
    * 隧道不关心传输内容，只负责传输
* 客户端与目标服务器确定传输协议 (HTTP/2)
    * 协议用来确定传输内容规范，方便客户端与目标服务能够理解传输内容
* 客户端往目标服务器发送内容
* 服务端响应
    * TLS handshake Ticket：目的，在有效期内容，下一次客户端发送内容时，带上这个票据就可以免 TLS 握手环节
    * 响应客户端 TLS 隧道最大生命周期 (防止资源浪费)
    * 响应客户端需要的内容


## 通过案例来理解

```sh
curl -v -x admin:123456@localhost:3000 https://ipinfo.io
```

通过添加 ``-v`` 可以查看完整交互日志，内容如下：

```log
* Host localhost:3000 was resolved.                     // 客户端与目标服务器建立连接
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:3000...
* CONNECT: no ALPN negotiated
* allocate connect buffer
* Proxy auth using Basic with user 'admin'              // 使用 Basic 认证，用户名 admin
* Establish HTTP proxy tunnel to ipinfo.io:443          // 建立 http 代理隧道去 ipinfo.io:443
> CONNECT ipinfo.io:443 HTTP/1.1 
> Host: ipinfo.io:443
> Proxy-Authorization: Basic YWRtaW46MTIzNDU2
> User-Agent: curl/8.20.0
> Proxy-Connection: Keep-Alive
>
< HTTP/1.1 200 Connection Established                   // 代理服务器与目标服务器建立连接
<
* CONNECT phase completed                               // 连接阶段完整
* CONNECT tunnel established, response 200              // 连接隧道已建立
* ALPN: curl offers h2,http/1.1                         // 应用传输协议协商：客户端支持 h2，http/1.1 传输协议
* TLSv1.3 (OUT), TLS handshake, Client hello (1):       // 客户端向目标服务器发送 ``Client Hello`` 报文。 
* SSL Trust Anchors:                                    // 客户端信任的证书列表
*   Native: Apple SecTrust                              // 优先使用苹果安全信任框架来验证证书
*   OpenSSL default paths (fallback)                    // 备用
* TLSv1.3 (IN), TLS handshake, Server hello (2):        // 目标服务器响应 ``Server hello`` 报文
* TLSv1.3 (IN), TLS change cipher, Change cipher spec (1): // 在 TLS 1.3 中，这纯粹是为了向前兼容那些旧版的中继网络设备（防止它们误以为这不是合法的 TLS 流量而拦截）。它释放了一个信号：接下来的数据包在传输层都将被视为加密流。
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8): // 目标服务器握手，加密扩展 
* TLSv1.3 (IN), TLS handshake, Certificate (11):        // 目标服务器把自己的 数字证书链 整体打包发送给客户端，用来向客户端自证身份
* TLSv1.3 (IN), TLS handshake, CERT verify (15):        // 服务器发送一个使用自己证书私钥生成的数字签名（Certificate Verify）。客户端一会儿将用证书里的公网公钥去解密它，以此证明服务器确实合法拥有这张证书，而不是冒牌货。
* TLSv1.3 (IN), TLS handshake, Finished (20):           // 表示服务器这一侧的加密握手和密钥计算已经全部搞定
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1): // 客户端（curl）在收到服务器的所有信息后，也生成了对应的加密规则
* TLSv1.3 (OUT), TLS handshake, Finished (20):          // 向服务器回传了自己的 ``Finished`` 报文
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / x25519 / RSASSA-PSS // 最终确定 SSL 连接使用：TLSV1.3（安全协议）|  TLS_AES_256_GCM_SHA384(负责业务内容传输的对称加密算法) ｜ x25519 (用于双方计算密钥的 椭圆曲线密钥交换算法) | RSASSA-PSS (服务器证书签名的算法格式)
* ALPN: server accepted h2                              // 服务端结合前面 ALPN 告诉服务客户端支持传输协议，服务端接受并采用 h2（HTTP/2）作为我们接下来传输内容的协议规范
* Server certificate:                                   // 服务器返回的证书信息
*   subject: CN=ipinfo.io
*   start date: May  3 16:36:00 2026 GMT
*   expire date: Aug  1 16:35:59 2026 GMT
*   issuer: C=US; O=Let's Encrypt; CN=R12
*   Certificate level 0: Public key type RSA (2048/112 Bits/secBits), signed using sha256WithRSAEncryption
*   Certificate level 1: Public key type RSA (2048/112 Bits/secBits), signed using sha256WithRSAEncryption
*   Certificate level 2: Public key type RSA (4096/152 Bits/secBits), signed using sha256WithRSAEncryption
*   subjectAltName: "ipinfo.io" matches cert's "ipinfo.io"
* OpenSSL verify result: 0                             // OpenSSL 认证证书，0 表示证书内容没有问题
* SSL certificate verified via OpenSSL.                // 证书通过 OpenSSL 的验证 
* Established connection to localhost (::1 port 3000) from ::1 port   客户端源端口 ``64520``  与 ``localhost:3000`` 建立连接
* using HTTP/2                                         // 使用 HTTP2 协议传输
* [HTTP/2] [1] OPENED stream for https://ipinfo.io/
* [HTTP/2] [1] [:method: GET]
* [HTTP/2] [1] [:scheme: https]
* [HTTP/2] [1] [:authority: ipinfo.io]
* [HTTP/2] [1] [:path: /]
* [HTTP/2] [1] [user-agent: curl/8.20.0]
* [HTTP/2] [1] [accept: */*]
> GET / HTTP/2
> Host: ipinfo.io
> User-Agent: curl/8.20.0
> Accept: */*
>
* Request completely sent off                          // 客户端请求全部发送完成
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):  // 服务端响应 TLS 握手会话凭证
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):  
< HTTP/2 200                                           // 目标服务器通过 HTTP/2 协议返回内容
< access-control-allow-origin: *
< content-type: application/json
< content-length: 271
< date: Sun, 17 May 2026 10:12:08 GMT
< vary: accept-encoding
< via: 1.1 google
< alt-svc: h3=":443"; ma=2592000                       // 告诉客户端隧道保活时长
<
{
  "ip": "220.202.244.184",
  "city": "Shanghai",
  "region": "Shanghai",
  "country": "CN",
  "loc": "31.2222,121.4581",
  "org": "AS4837 CHINA UNICOM China169 Backbone",
  "postal": "200000",
  "timezone": "Asia/Shanghai",
  "readme": "https://ipinfo.io/missingauth"
* Connection #0 to host ipinfo.io:443 left intact
}%
```





