# RESTful API

在讲解 Strapi RESTful API 之前，先理解一个概念 `Endpoints`，一系列 API Endpoint 的。

什么是 API Endpoint ? 以及与我们经常说的 API 有什么区别。

## 什么是 API

API，全称是 `Application Programming Interface`，也就是应用程序编程接口。简单来说，API 就是应用程序之间交流的桥梁。

API 有很多种，比如 RESTful API、GraphQL。

## API 端点

API 端点就是一个 API 接口，只不过 API 端点（Endpoint）是一个专有名词而已。

## API 和 API 端点的包含关系

假设我们有一个用户管理 API：

API:

- 这个 API 的整体设计包括多个端点，可以创建、读取、更新和删除用户。
- 包括文档，描述了 API 的所有功能和使用方法。
- 包含认证机制，确保只有授权用户才能访问。
- 定义了错误处理机制和数据格式。

API 端点：

- /users（GET）：获取所有用户列表。
- /users/123（GET）：获取 ID 为 123 的用户信息。
- /users（POST）：创建一个新用户。
- /users/123（PUT）：更新 ID 为 123 的用户信息。
- /users/123（DELETE）：删除 ID 为 123 的用户。

API 端点是 API 的一部分，但 API 的范围更大，包含了 API 的整体设计、实现和支持文档。`每个端点负责处理具体的请求和响应，但所有端点共同组成了完整的 API`。

## API 端点组成部分

- 基础 URL 和路径
- HTTP 方法
- 请求头和响应头
- 请求参数
- 返回状态码

讲完这部分基础内容之后，接着来看下 strapi 中 RESTful Api 的使用。

## Endpoints

在 strapi 中，每个 Content-Type，都会自动生成如下 Endpoints。 注意这里的 `Content-Type` 并不是接口请求或响应头中的指示资源的原始媒体类型。 而是表示如下：

- Collection Types
- Single Types

每个不同的类型，对应 Endpoints 是不一样的。

- Collection Types

| **方法**   | **URL**                         | **描述**                           |
| ---------- | ------------------------------- | ---------------------------------- |
| **GET**    | `/api/:pluralApiId`             | 获取一组文档（列表）。             |
| **POST**   | `/api/:pluralApiId`             | 创建一个新的文档。                 |
| **GET**    | `/api/:pluralApiId/:documentId` | 获取一个特定的文档。               |
| **PUT**    | `/api/:pluralApiId/:documentId` | 更新一个特定的文档（替换式更新）。 |
| **DELETE** | `/api/:pluralApiId/:documentId` | 删除一个特定的文档。               |

- Single Types

| **方法**   | **URL**               | **描述**           |
| ---------- | --------------------- | ------------------ |
| **GET**    | `/api/:singularApiId` | 获取文档           |
| **PUT**    | `/api/:singularApiId` | 更新和创建一个文档 |
| **DELETE** | `/api/:singularApiId` | 删除一个特定的文档 |

## 请求返回结构如下

```json
{
  "data": [],
  "meta": {}, // 包含： 分页、公共状态、可用的 locales 。
  "error": {} // 包含请求中抛出来的错误
}
```

## API parameters 使用

可以通过 API parameters 和 RESTful 结合使用，对返回的结果进行过滤、分页、排序、指定返回字段以及查询关联的内容。

下面是可以用 API parameters:

| Operator   | Type             | 描述                         |
| ---------- | ---------------- | ---------------------------- |
| populate   | String or Object | 填充关联关系、组件或动态区块 |
| fields     | Array            | 仅选择特定字段进行显示       |
| filters    | Object           | 筛选响应数据                 |
| locale     | String           | 选择语言区域                 |
| status     | String           | 选择草稿或已发布状态         |
| sort       | String or Array  | 对响应数据进行排序           |
| pagination | Object           | 对条目进行分页               |

查询参数使用 [LHS bracket syntax](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets)。

## 填充字段

默认情况下，RESTful api 不会返回任何关联、媒体、组件以及动态时区字段。可以通过 populate 参数去指定这些字段的返回。同时还可以结合 `fields` 去指定返回结果的字段。

### fields 使用

查询参数可以接收 fields 参数去选择返回的字段。默认情况下，只会返回如下类型的字段：

- string types: string, text, richtext, enumeration, email, password, and uid,
- date types: date, time, datetime, and timestamp,
- number types: integer, biginteger, float, and decimal,
- generic types: boolean, array, and JSON.

#### 使用方式

- 单个字段

```md
fields=name
```

- 多个字段

```md
fields[0]=name&fields[1]=description
```

## 相关文章

[RESTful API 设计原则](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets)
