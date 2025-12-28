# axios

* 哪些错误会进入请求拦截器
    * 请求配置错误（例如，配置无效）
* 哪些错误会进入响应拦截器
    * 网络错误：onerror
    * 超时错误：ontimeout
    * HTTP 状态码错误（默认情况下，状态码在 200-299 范围之外的响应会被视为错误）： 
        * !response.status || !validateStatus || validateStatus(response.status)
    * 取消请求错误（例如，使用取消令牌取消请求）- onabort

``axios`` 中比如网络错误，对应 ``code`` 是 'ERR_NETWORK' 是标准化的错误吗？

