# Controller：表现层的守门员

如果把整个后端系统比作一家餐厅，**Controller 就是前台服务员**。

## 1. Controller 的核心定位
Controller 是系统的**单一入口点**。它的本质作用是：**接收请求，转发任务，返回响应。** 它不应该包含复杂的业务逻辑，而应该像一个指挥官一样，调度其他组件来完成工作。

## 2. Controller 的主要职责
一个合格的 Controller 应该只做以下 **5 件事**：

1.  **路由映射（Routing）**：决定哪个 URL（如 `/api/login`）由哪个方法来处理。
2.  **参数接收与解析（Data Binding）**：把前端传来的 JSON、URL 参数或表单数据，自动变成 Java 对象。
3.  **数据校验（Validation）**：检查前端传来的数据合法性（如：手机号格式对不对、密码是否为空）。
4.  **调用业务层（Service Orchestration）**：把解析好的数据交给对应的 Service 处理。
5.  **封装返回结果（Response Packaging）**：把 Service 返回的结果包装成统一的格式（如 `Result<VO>`），并设置正确的 HTTP 状态码。

## 3. 核心注解详解
在 Spring Boot 中，我们通过一系列注解来赋予一个类“控制器”的能力：

* **`@RestController`**：
    这是 `@Controller` 和 `@ResponseBody` 的结合体。它告诉 Spring：这个类里的所有方法返回的数据都会直接写入 HTTP 响应体（通常是 JSON），而不是去寻找一个 HTML 页面。
* **`@RequestMapping` / `@PostMapping` / `@GetMapping`**：
    定义接口的访问路径和请求方式（GET, POST, PUT, DELETE）。
* **参数绑定注解**：
    * `@RequestBody`：用于接收 POST 请求里的 **JSON** 数据。
    * `@RequestParam`：用于接收 URL 后面的 **查询参数**（如 `?id=1`）。
    * `@PathVariable`：用于接收 **路径变量**（如 `/user/{id}`）。

## 4. 你的代码架构中的 Controller 示例
结合你之前提到的 VO 和 DTO，一个标准的 Controller 方法通常长这样：

```java
@RestController
@RequestMapping("/api/account")
public class ApiAccountController {

    @Autowired
    private ApiAccountService accountService;

    @PostMapping("/create")
    // 1. 参数校验（通过 @Valid）
    public CommonResult<Long> createAccount(@Valid @RequestBody ApiAccountSaveReqVO saveReqVO) {
        // 2. 调用 Service 层处理核心业务
        Long id = accountService.createAccount(saveReqVO);
        // 3. 返回统一格式的 VO
        return CommonResult.success(id);
    }
}
```

## 5. Controller 的设计原则（避坑指南）

### 保持“瘦”控制器（Lean Controller）
**永远不要在 Controller 里写业务逻辑。**
* **坏习惯**：在 Controller 里写 SQL 拼接、复杂的 `if-else` 计算。
* **好习惯**：Controller 只负责“校验参数”和“转发”，所有的逻辑都应该沉淀到 **Service**。

### 统一异常处理
你不需要在每个 Controller 方法里写 `try-catch`。Spring Boot 推荐使用 `@RestControllerAdvice` 做全局异常拦截，Controller 只需要大胆地调用 Service，出错了会有全局管家去处理。

### 明确的职责边界
* **Controller**：处理 HTTP 协议相关（Header, Cookie, 状态码, JSON 解析）。
* **Service**：处理纯粹的业务逻辑（计算、事务、跨表操作）。

## 6. 总结：数据流转全貌

现在，我们可以把整个流程串起来了：

1.  **用户**：点击按钮发送请求。
2.  **Controller**：接待用户，检查用户填的表单（**VO**）对不对，然后把表单传给 Service。
3.  **Service**：思考如何处理，需要数据时调用 **Mapper (DAL)**。
4.  **Mapper (DAL)**：去数据库查出 **DO (Entity)** 返回给 Service。
5.  **Service**：处理完逻辑，把结果转成 **VO** 返回给 Controller。
6.  **Controller**：把 **VO** 封装进一个“成功”的盒子里，递还给用户。
