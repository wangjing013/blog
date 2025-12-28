# Promise

## 1. 术语

* ``promise`` 是一个带有 then 方法的对象或函数，其行为符合本规范。
* ``thenable`` 是指定义了 then 方法的对象或函数。
* ``value`` 是任何合法的 ``JavaScript`` 值（包括未定义、thenable 或 Promise）。
* ``exception`` 是一个使用 ``throw`` 语句抛出的值。
* ``reason`` 是一个值，它表明 promise 被拒绝的原因。

## 2. 要求

### 2.1 Promise 状态

* padding
    * 当为这种状态时，状态可以流转为 ``fulfilled`` 或 ``rejected`` 。
* fulfilled
    * 不能流转为其它状态
    * 必须有一个值，且该值不得更改。
* rejected
    * 不能流转为其它状态
    * 必须有一个原因，且该值不得更改。

> Here, “must not change” means immutable identity (i.e. ===), but does not imply deep immutability.

这里，“不可更改” ， 表示当前 ``promise`` 它的 ``state`` 和 ``result/reason`` 就固定了，之后再调用 ``resolve/reject``（或抛错）都不能把它改成别的状态/别的结果。

* “引用不会更改”：更像是 ``===`` 层面的承诺——同一个 ``promise`` 一旦确定了最终值``（result）``，规范要求这件事不能再被替换成另一个最终值/原因。
* 不是深度不可变：如果最终值本身是个对象，比如 ``resolve(obj)``，规范并不保证 ``obj`` 的内部字段不会变。换句话说，``obj`` 仍然可能被别的代码修改。

### 2.2 then 方法

一个 ``promise`` 必须提供一个 ``then`` 方法，以获取其当前或最终的值或原因。

``then`` 方法接收两个参数：

> promise.then(onFulfilled, onRejected)

* 2.2.1 ``onFulfilled`` 和 ``onRejected`` 两者是可选
    * 2.2.1.1 如果 onFulfilled 不是一个函数, 将被忽略.
    * 2.2.1.2 如果 onRejected 不是一个函数, 将被忽略.

* 2.2.2 如果 ``onFulfilled`` 是一个函数
    * 2.2.2.1 onFulfilled 是在 promise 状态为 fulfilled 之后调用的，且 ``promise`` 返回结果值是作为 ``onFulfilled`` 第一个参数。
    * 2.2.2.2 onFulfilled 只有在 promise 状态 fulfilled 后才会被调用。
    * 2.2.2.3 onFulfilled 最多只会被调用一次。

* 2.2.3 如果 ``onRejected`` 是一个函数
    * 2.2.3.1 onRejected 只会在 promise 状态为 rejected 之后才会被调用，且 ``promise`` 返回结果值是作为 ``onFulfilled`` 第一个参数。
    * 2.2.3.2 onRejected 只有在 promise 状态 rejected 后才会被调用。
    * 2.2.3.3 onRejected 最多只会被调用一次。

* 2.2.4 ``onFulfilled`` / ``onRejected`` 不能在“当前这段用户代码还没跑完”时就立刻调用；必须等到调用栈里只剩“平台代码”（也就是事件循环/任务调度那边）之后，再异步地调用回调。

* 2.2.5 ``onFulfilled`` 和 ``onRejected`` 必须作为函数调用（即没有 this 值）。也就是而不是作为某个对象的方法调用，也不是用 ``call/apply/bind`` 人为塞一个 ``this``。

* 2.2.6 ``then`` 可能在同一个 promise 上多次被调用。
    * 如果 promise 是 fulfilled 状态，所有的 onFulfilled 函数按调用 then 的顺序执行。
    * 如果 promise 是 rejected 状态，所有的 onRejected 函数按调用 then 的顺序执行。

* 2.2.7 ``then`` 必须返回一个新的 promise
    >  promise2 = promise1.then(onFulfilled, onRejected);
    * 2.2.7.1 如果 ``onFulfilled`` 或 ``onRejected`` 返回一个值 x，则运行 Promise 解决过程 [[Resolve]](promise2, x)[2.3]。
    * 2.2.7.2 如果 ``onFulfilled`` 或 ``onRejected`` 中的任何一个抛出异常 e，那么 promise2 状态为 rejected 且错误原因为 e。
    * 2.2.7.3 如果 ``onFulfilled`` 不是一个函数且 promise1 是状态为 fulfilled, promise2 状态也必须是 fulfilled 并且接收值与 promise1 一样. 
    * 2,2,7.4 如果 ``onRejected`` 不是一个函数 function 且 promise1 状态为 rejected, promise2 状态也必须是 rejected ，且与 promise1 错误原因一致。

### 2.3 Promise 解析过程

``promise`` 解析过程是一种抽象操作，其输入为一个 ``promise`` 和一个 ``value``，我们将其表示为[Resolve](promise, x)。如果 ``x`` 是一个 ``thenable`` 对象，那么在假设 ``x`` 的行为至少在某种程度上类似于 ``promise 规范`` 的前提下，该过程会尝试让 ``promise`` 采用 ``x`` 的状态。否则，它会用值 ``x`` 来作为 ``promise`` 成功的值。

这种对 ``thenable`` 对象的处理方式使得各种 ``Promise`` 实现能够相互协作，只要它们暴露了符合 ``Promises/A +`` 规范的 ``then`` 方法。这也让 ``Promises/A+`` 实现能够 “吸收” 那些具有合理 ``then ``方法的非合规实现。

要运行 [[Resolve]](promise, x)，请执行以下步骤：

* 2.3.1 如果 ``promise`` 和 ``x`` 指向的是同一个对象，则以 TypeError 作为原因拒绝 ``promise``。
* 2.3.2 如果 ``x`` 是一个 promise， 采用 x 对应的状态：
    * 2.3.2.1 如果 x 处于 pending，那么 promise 必须保持 pending 状态，直到 x 被 fulfilled 或 rejected。
    * 2.3.2.2 如果当 x 状态为 fulfilled 时，以相同的值实现 promise。
    * 2.3.2.3 如果当 x 被拒绝时，以相同的原因拒绝 promise。
* 2.3.3 否则，如果 x 是一个对象或函数
    * 2.3.3.1 将 then 设置为 x.then。[3.5]
    * 2.3.3.2 如果获取属性 x.then 的结果是抛出异常 e，则以 e 为原因拒绝承诺。
    * 2.3.3.3 如果 then 是一个函数，就以 x 作为 this，第一个参数为 resolvePromise，第二个参数为 rejectPromise 来调用它，其中：
        1. 如果 resolvePromise 被调用并传入值 y，则运行 [[Resolve]](promise, y)。
        2. 如果 rejectPromise 被调用并传入原因 r，则以 r 拒绝 promise。
        3. 如果同时调用了 resolvePromise 和 rejectPromise，或对同一参数进行了多次调用，第一次调用优先，后续调用将被忽略。
        4. 如果调用 then 时抛出异常 e
            1. 如果 resolvePromise 或 rejectPromise 已被调用，则忽略该异常。
            2. 否则，以 e 作为原因拒绝 promise。
    * 2.3.3.4 如果 then 不是一个函数，则用 x 来实现 promise。
* 2.3.4 如果 x 不是一个对象或函数，x 作为 promise 成功的值。

## 规范

* https://promisesaplus.com/