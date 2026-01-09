# JSON Web Tokens

JSON Web Token (JWT) 是一种开放标准 (RFC 7519)，它定义了一种紧凑且自包含的方式，用于在各方之间安全地以 JSON 对象的形式传输信息。由于信息经过数字签名，因此可以核实并值得信赖。JWT 可以使用密钥（使用 HMAC 算法）或公钥/私钥对（使用 RSA 或 ECDSA）进行签名。

虽然 JWT 可以被加密以在各方之间提供保密性，但我们将重点关注签名令牌。签名令牌能够验证其中包含的声明的完整性，而加密令牌则会向其他方隐藏这些声明。当使用公钥/私钥对为令牌签名时，该签名还能证明只有持有私钥的一方才是签名者。

## 什么时候应该使用 JSON Web Tokens

### Authorization (认证)
这是 JWT 最常见的使用场景。一旦用户登录，后续每个请求都会包含 JWT，从而允许用户访问该令牌允许的路由、服务和资源。单点登录是广泛使用 JWT 的一个特性，因为它的开销很小，并且可以在不同的域中轻松使用。

### Information Exchange (信息交换)
JSON Web Tokens 是在各方之间安全传输信息的好方法。因为可以对 JWT 进行签名，所以您可以确保发送者就是他们所说的那个人。此外，由于签名是使用头和有效负载计算的，您还可以验证内容是否未被篡改。

## JSON Web Tokens 结构

JWT 由三部分组成，用点（.）分隔：
- Header（头信息）
- Payload（数据）
- Signature（签名）

因此，JWT 通常如下所示：
```
xxxxx.yyyyy.zzzzz
```

### Header
Header 通常由两部分组成：令牌的类型（JWT）和所使用的签名算法，如 HMAC SHA256 或 RSA。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

然后，这个 JSON 被 Base64Url 编码以形成 JWT 的第一部分。

### Payload

Payload 包含声明。声明是关于实体（通常是用户）和其他数据的陈述。声明分为三种类型：

1. **Registered claims**（注册声明）：一组预定义的声明，如 `iss`（签发者）、`exp`（过期时间）、`sub`（主题）、`aud`（受众）等
2. **Public claims**（公共声明）：由 JWT 使用者定义的声明
3. **Private claims**（私有声明）：为在同意使用它们的各方之间共享信息而创建的自定义声明

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022
}
```

### Signature
要创建签名部分，您必须获得编码的 header、编码的 payload、一个密钥、header 中指定的签名算法，并对其进行签名。

例如，如果您使用 HMAC SHA256 算法，签名将按以下方式创建：

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

签名用于验证消息在整个过程中没有更改，并且对于使用私钥签名的令牌，它还可以验证发送者的身份。

## 在 Node.js 中使用 JWT

### 安装
```bash
npm install jsonwebtoken
```

### 创建 JWT
```javascript
const jwt = require('jsonwebtoken');

const payload = {
  sub: '1234567890',
  name: 'John Doe',
  admin: true
};

const secret = 'your-secret-key';
const options = {
  expiresIn: '1h',
  issuer: 'your-app'
};

const token = jwt.sign(payload, secret, options);
console.log(token);
```

### 验证 JWT
```javascript
const jwt = require('jsonwebtoken');

const token = 'your-jwt-token';
const secret = 'your-secret-key';

try {
  const decoded = jwt.verify(token, secret);
  console.log(decoded);
} catch (err) {
  console.error('Token verification failed:', err.message);
}
```

### 解码 JWT（不验证签名）
```javascript
const jwt = require('jsonwebtoken');

const token = 'your-jwt-token';
const decoded = jwt.decode(token, { complete: true });

console.log(decoded.header);
console.log(decoded.payload);
```

## JWT 最佳实践

1. **保持 JWT 简洁**：只包含必要的信息，避免在 payload 中存储敏感数据
2. **设置合理的过期时间**：不要让 JWT 永不过期
3. **使用强密钥**：确保签名密钥足够复杂和安全
4. **使用 HTTPS**：始终通过 HTTPS 传输 JWT
5. **定期轮换密钥**：定期更改签名密钥以提高安全性
6. **考虑使用刷新令牌**：对于长期访问，使用刷新令牌机制

## 常见问题

### JWT 是否安全？
JWT 本身是安全的，但安全性取决于实现方式。确保使用强密钥、设置合理的过期时间，并通过 HTTPS 传输。

### JWT 可以存储敏感信息吗？
不建议。JWT 的 payload 只是 Base64 编码，不是加密，任何人都可以解码查看内容。

### JWT 如何处理过期？
使用 `exp`（expiration time）声明设置过期时间。验证时，JWT 库会自动检查令牌是否过期。

### JWT 和 Session 的区别？
- JWT 是无状态的，不需要服务器端存储
- Session 是有状态的，需要在服务器端存储会话信息
- JWT 适合分布式系统，Session 适合单体应用

