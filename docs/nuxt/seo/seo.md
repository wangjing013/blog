# SEO

* Robots：告诉机器人哪些页面可被爬取，哪些不可被爬取。
* Sitemap：帮助爬虫抓取页面
* OG Image：
* Schema.org：
* Link Checker：在开发和构建时，对页面链接进行检查，确保搜索引擎爬虫以及用户都可以正常检索并访问你的网站。
* SEO Utils
* Skew Protection


## Robots

### 为什么使用 Nuxt Robots

通过 ``robots.txt``、``元标签``以及``X-Robots-Tag`` 请求头，管控搜索引擎与网络 AI 爬虫对你的 Nuxt 网站的抓取行为。``Nuxt Robots`` 插件配置简洁，并内置符合行业最佳实践的默认设置。

该模块的核心功能如下：

* 使用 robots.txt 文件，告诉机器人那些可被抓取
* 使用 <meta name="robots" content="index"> 、X-Robots-Tag HTTP 响应头，告知[搜索引擎爬虫](https://developers.google.com/search/docs/crawling-indexing/googlebot?hl=zh-cn)可将你网站中的哪些内容展现在搜索结果里。


## OG Image

在 Web 开发和 SEO 领域，**OG:Image** 是 **Open Graph Protocol（开放图谱协议）** 中最重要的一个元标记（Meta Tag）。

简单来说，它的作用是：**当有人把你的网页链接分享到社交媒体（如微信、Telegram、Discord、X/Twitter、Facebook）或即时通讯工具时，指定哪张图片作为预览大图显示。**

### 1. 核心作用：网页的“封面图”
如果没有设置 `og:image`，社交平台会随机抓取你网页上的图片（甚至抓取 Logo 或广告图），或者干脆显示一个空白框，这会极大降低用户的点击欲望。

### 2. 代码实现
它位于 HTML 文件的 `<head>` 标签内，语法如下：

```html
<meta property="og:image" content="https://example.com/images/cover.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
```

### 3. 关键的技术规范
为了确保图片在所有平台上都能完美显示，你需要遵循以下标准：

* **尺寸建议：** 推荐使用 **1200 x 630 像素**。这个比例（约 1.91:1）在大多数平台上都能以高清大图的形式展现。
* **文件大小：** 尽量控制在 **5MB** 以内（有些平台限制更严，建议在 300KB - 1MB 之间以保证预览加载速度）。
* **路径要求：** 必须使用 **绝对路径**（即以 `https://` 开头的完整 URL），不能使用相对路径（如 `/img/cover.jpg`），因为社交平台的爬虫无法识别相对路径。

### 4. 为什么对你（开发者/SEO）很重要？
* **点击率 (CTR)：** 一张精美的预览图能显著提升链接的点击率。
* **品牌化：** 统一的预览风格可以强化品牌认知，尤其是对于内容类或电商类网站。
* **社交验证：** 专业的预览效果会让链接看起来更可信，而不是像垃圾邮件或钓鱼网站。

### 5. 如何测试？

你可以使用以下工具来查看你的 `og:image` 是否生效：

1.  **Facebook Sharing Debugger:** 官方工具，最权威。
2.  **Opengraph.xyz:** 一个非常直观的在线预览工具，可以同时查看在 X、Facebook、LinkedIn 等多个平台的显示效果。
3.  **微信/Telegram 互传：** 最简单的办法就是直接把链接发给朋友或自己的小号，看是否出现了图片。

> **小贴士：** 如果你修改了 `og:image` 但分享时还是显示旧图，这是因为社交平台有 **CDN 缓存**。你需要去对应的开发者后台（如 Facebook Debugger）点击“Scrape Again（重新抓取）”来刷新缓存。

## Link Checker

### 7 个链接检查项

* missing-hash (缺失哈希/锚点)
    * 逻辑：检查指向当前页面或其他页面特定位置的 内部链接 是否由于某些原因丢失了 # 及其后面的锚点。
    * 场景：如果你有一个链接原本应该是 example.com/about#team，但现在变成了 example.com/about，这会导致用户无法直接跳转到特定板块，影响体验。

* no-error-response (无错误响应)
    * 逻辑：对网站所有的内部链接发起请求，检查其 HTTP 状态码。
    * 关键点：它会标记出所有返回 4xx（如 404 Not Found 页面丢失）或 5xx（如 500 服务器内部错误）的链接。这是 SEO 优化的重中之重，因为死链会降低网站权重。

* no-baseless (无基础路径链接)
    * 逻辑：检查那些没有明确基准 URL 或路径格式错误的链接。
    * 场景：比如一个链接写成了 ``<a href="//">`` 或者路径格式不符合标准的相对/绝对路径规范，导致浏览器无法解析。

* no-javascript (无 JavaScript 链接)
    * 逻辑： 识别使用 javascript:void(0) 或类似的 JS 代码来执行跳转的链接。
    * SEO 原因： 搜索引擎爬虫（如 Googlebot）更喜欢标准的 href="url" 链接。虽然现在的爬虫能处理部分 JS，但使用标准的 HTML 链接对抓取和权重传递最稳健。

* trailing-slash (末尾斜杠)
    * 逻辑： 检查内部链接末尾是否统一包含或缺少 /。
    * 场景： example.com/page/ 和 example.com/page 在某些服务器配置下被视为两个不同的 URL。如果不统一，可能会导致内容重复或产生不必要的重定向。

* absolute-site-urls (绝对站点 URL)
    * 逻辑： 检测指向本站其他页面的链接是否使用了完整的 绝对路径（如 https://yoursite.com/page）而不是相对路径（如 /page）。
    * 用途： 根据配置需求，有些开发者希望在内部链接中全部使用相对路径以增强灵活性，或者在特定 SEO 策略中要求使用绝对路径。

* redirects (重定向)
    * 逻辑： 检查链接是否指向了一个会发生重定向（301 或 302）的地址。
    * SEO 原因： 链式重定向会增加页面加载延迟，并消耗爬虫的“抓取预算”。直接链接到最终的目标 URL 是性能最优解。


### 总结建议

* 高优先级： 先解决 no-error-response（死链）和 redirects（减少跳转损耗）。
* 规范化： 重点看 trailing-slash 和 absolute-site-urls，确保全站 URL 风格统一，防止搜索引擎抓取到重复内容。