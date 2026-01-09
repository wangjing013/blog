# Event loop

事件循环使得 `Node.js` 能够执行非阻塞 `I/O` 操作——尽管默认情况下只使用单个 `JavaScript` 线程 - 尽可能将操作交给内核去处理。

由于大多数现代内核都是多线程的，它们可以处理在后台执行的多项操作。当其中一个任务完成，内核告诉 `Node.js`，以便将适当的回调添加到轮询队列中，最终被执行。

## Event Loop 详解

当 Node.js 启动时，它将初始化 `event loop`，并处理提供的输入脚本，这可能会进行 async API 调用、定时器编排或调用 `process.nextTick`，然后开始处理事件循环。

## 事件循环的六个阶段

Node.js 的事件循环包含以下六个阶段：

1. **Timers（定时器阶段）**
   - 执行 `setTimeout()` 和 `setInterval()` 的回调
   - 由底层维护，不一定在预设时间后立即执行

2. **Pending Callbacks（待定回调阶段）**
   - 执行延迟到下一个循环迭代的 I/O 回调
   - 包括某些错误操作的回调

3. **Idle, Prepare（闲置，准备阶段）**
   - 仅内部使用，用于准备事件循环

4. **Poll（轮询阶段）**
   - 执行大部分 I/O 回调
   - 如果没有定时器，会在此阶段阻塞等待新的事件

5. **Check（检查阶段）**
   - 执行 `setImmediate()` 的回调

6. **Close Callbacks（关闭回调阶段）**
   - 执行 `socket.on('close', ...)` 等关闭回调


每个阶段都包含一个 FIFO 队列来执行回调。 虽然每个阶段都有其独特之处，通常，当事件循环进入特定阶段时，它会执行该阶段特有的任何操作，然后执行该阶段队列中的回调函数，直到队列中的回调函数全部执行完毕或已执行的回调函数数量达到最大值。当队列执行完或达到回调限制时，事件循环将进入下一个阶段，依此类推。

> “回调函数数量达到最大值”：通常是指在事件循环的每个阶段中，为了防止某个阶段的回调函数过多导致其他阶段饥饿，而设定的执行上限。

这样机制确保了：

1. 公平性 - 防止某个阶段独占CPU时间
2. 响应性 - 让其他阶段的回调有机会执行
3. 稳定性 - 避免长时间阻塞

由于这些操作中的任何一个都可能调度更多操作，并且在轮询阶段处理的新事件由内核排队，因此在处理轮询事件时可以排队轮询事件。因此，长时间运行的回调可能使轮询阶段的运行时间远超 ``timers`` 设置的阈值。

这个机制的工作原理是：

1. 递归调度 - 轮询阶段的回调可能触发新的I/O操作
2. 内核排队 - 新事件被内核加入轮询队列
3. 阶段延长 - 长时间运行的回调使轮询阶段远超定时器阈值


## 阶段详解

### timers

定时器指定的是回调函数可以执行的阈值，而不是用户希望执行的确切时间。定时器回调函数会在指定时间过后尽快执行；但是，操作系统调度或其他回调函数的运行可能会延迟它们的执行。

例如，假设你设置了一个超时时间，在 ``100毫秒``的阈值后执行，然后你的脚本开始异步读取一个文件，这需要 ``95`` 毫秒：

```js
const fs = require('node:fs');
function someAsyncOperation(callback) {
  // 假设这个操作需要 95ms 才能完成
  fs.readFile('/path/to/file', callback);
}
const timeoutScheduled = Date.now();
setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;
  console.log(`${delay}ms`);
}, 100);

someAsyncOperation(() => {
  const startCallback = Date.now();
  // 做一些需要 10 毫秒的事情
  while (Date.now() - startCallback < 10) {
    // ...
  }
});
```

当事件循环进入 ``poll 阶段``，``poll 阶段`` 包含一个空队列(``fs.readFile()`` 还没有完成)， 因此，它将等待，直到距离最快计时器的阈值到达还剩下的毫秒数为止。在等待期间，95 毫秒过去了，``fs.readFile()`` 完成文件读取后，其需要 ``10毫秒`` 完成的回调函数会被添加到轮询队列并执行。

当 ``poll阶段``回调队列函数执行完成后。因此，事件循环会发现最早计时器的阈值已达到，然后回到 ``timers`` 阶段来执行计时器的回调函数。在这个例子中，定时器回调函数实际执行时间为 ``105ms``。


### pending Callbacks

此阶段一些执行系统操作相关的回调，如：TCP 类型错误。 例如，如果一个 TCP 套接字在尝试连接时收到 ``ECONNREFUSED``（连接被拒绝），一些类 ``Unix`` 系统会等待一段时间再报告该错误。这会被排入队列，在挂起回调阶段执行。

假设：你调度了一个 setTimeout 定时器，执行阈值为100ms（即延迟100ms后执行），然后你的脚本开始异步读取一个文件，这个过程花费 200ms：

```js
// 演示阶段延长导致定时器延迟的例子
const fs = require('fs');

console.log('脚本开始，时间:', Date.now());

// 设置100ms定时器
setTimeout(() => {
    console.log('100ms定时器执行，实际时间:', Date.now());
}, 100);

// 模拟耗时的轮询阶段操作
fs.readFile(__filename, () => {
    console.log('轮询回调开始，时间:', Date.now());
    
    // 模拟200ms的耗时操作
    const start = Date.now();
    while (Date.now() - start < 200) {
        // 阻塞200ms
    }
    
    console.log('轮询回调结束，时间:', Date.now());
});

console.log('脚本结束，时间:', Date.now());
```


### poll

poll 阶段主要做两个功能：

1. 计算它应该阻塞和轮询 I/O 多长时间，然后
2. 处理 poll 队列中的事件。

当事件循环进入 ``poll阶段`` 并且当前事件循环内没有定时器(timers)调度，将会有一两件事发生：

* 如果 ``poll`` 队列不是空的，事件循环将遍历 ``poll`` 回调队列，同步执行这些回调，直到队列被耗尽为止，或者达到了依赖系统的硬限制。
* 如果 ``poll`` 队列是空的， 将会有一两件事发生
  * 如果有 ``setImmediate()`` 调度的回调，``poll`` 阶段将结束并且将进入到 ``check`` 阶段去执行调度的回调函数。
  * 如果没有 ``setImmediate()`` 调度的回调，``poll`` 阶段将等待新回调加入队列，然后立即执行它们。

一旦 ``poll`` 队列为空，事件循环就会检查那些时间阈值已达到的定时器。如果有一个或多个定时器已准备就绪，事件循环会进入下一个事件循环的定时器阶段，以执行这些定时器的回调函数。

> 为什么这个阶段会考虑定时器调度？ Node.js事件循环的设计正是为了平衡I/O等待与整体响应性：poll阶段如果“无定时器调度”（no timers），它会大胆阻塞等待新事件（incoming connection等），确保高效处理外部I/O；但如果有 timers 等着（下一个循环的setTimeout等），poll就“知趣”地缩短阻塞（~1ms），快速让出控制权，避免自己“卡住”整个循环，导致timers/check等阶段延迟。这就像一个聪明的调度员：低负载时多等会儿，高优先任务时别拖后腿。

### Check

这个阶段允许事件循环在 ``poll`` 阶段执行完成后，去执行 ``setImmediate`` 的回调函数。如果 ``poll`` 阶段空闲且有``setImmediate`` 回调加入到队列中，这事件循环可能直接跳过等待直接进入到 ``check`` 阶段。

``setImmediate()`` 实际上是一个特殊 ``timer``，它运行在事件循环一个特定的阶段。它利用 ``libuv API`` 在 ``poll`` 阶段完成之后去调用执行 ``setImmediate`` 的回调函数。

通常，随着代码的运行，事件循环进入到 ``poll`` 阶段，它将等待传入连接或请求等等。但是，如果使用 ``setImmediate()`` 安排了回调，并且 ``poll`` 阶段变为空闲状态，则它将结束并继续到 ``check`` 阶段，而不是等待轮询事件。


```js
const fs = require('fs');

// 模拟 poll 阶段：读文件（快速完成，poll 空闲）
fs.readFile(__filename, () => {
  console.log('poll 结束（空闲）');
  
  // 在 poll 回调中调度
  setImmediate(() => { console.log('check: immediate 执行！'); });
  
  // 假设无其他 I/O，poll 空闲 → 直接 check
});
````

## setImmediate() vs setTimeout()

``setImmediate()`` 和 ``setTimeout()`` 很像，但它们的行为方式会因被调用的时间不同而有所差异。

* ``setImmediate()``: 旨在当前 ``poll`` 阶段完成后执行一个脚本。
* ``setTimeout()``: 在至少经过指定毫秒数（ms）的最小阈值后，调度一个脚本运行。


## process.nextTick

``process.nextTick()`` 在事件循环的阶段上并没有体现出来，尽管它是异步 API 的一部分。 这是因为 ``process.nextTick()`` 从技术角度而言，不属于 ``event loop`` 的一部分。

相反，无论事件循环当前处于哪个阶段，``nextTickQueue`` 都会在当前操作完成后被处理。 在这里，操作被定义为从底层 ``C/C++`` 处理器进行的转换，以及处理需要执行的 ``JavaScript``。

``process.nextTick`` 会在事件循环“继续前”被优先执行，而不是等待下一个阶段。 这可能会造成一些糟糕的情况，因为它允许你通过进行递归的 ``process.nextTick ()`` 调用使 I/O “饥饿”，这会阻止事件循环进入轮询阶段。

## process.nextTick() vs setImmediate()

* process.nextTick(): 在同一个的阶段被执行。
* setImmediate(): 在下一个 Event Loop 执行之前执行。

本质上，这两个名称应该互换。``process.nextTick ()`` 比 ``setImmediate ()`` 触发得更即时。但这是历史的产物，不太可能改变。 做出这种转变会导致 ``npm ``上很大比例的包无法正常运行。

> 我们建议开发人员在所有情况下都使用 setImmediate ()，因为它更容易理解。


## 为什么使用 process.nextTick ()？

有两个主要原因：

* 允许用户在事件循环继续之前处理错误、清理任何不再需要的资源，或者在必要时重新尝试该请求。
* 有时需要让某个回调在调用栈已经完全展开（清空）之后、但事件循环继续之前执行。

来看一个例子：

```js
const server = net.createServer();
server.on('connection', conn => {});
server.listen(8080);
// 异步
server.on('listening', () => {});
```

假设 ``listen()`` 是在事件循环的开始处运行的，listening 回调被放在了 ``setImmediate ()`` 中。 在使用 ``listen`` 时，除非传入 ``hostname`` ，否则将立即绑定到端口。 这句话隐藏了如下含义。

* 无 hostname 时：立即绑定

默认情况下（或 ``hostname`` 省略/为``null``），服务器会绑定到所有接口（``0.0.0.0`` 或 ``::``），这使用底层系统调用（如 ``bind()``）同步完成，几乎无延迟。
``listen()`` 调用立即返回，绑定成功后，``listening`` 事件（或提供的 ``callback``）通过 ``setImmediate()`` 异步调度执行（在当前事件循环的 ``check`` 阶段），但实际绑定已完成。

* 有 ``hostname`` 时：异步 DNS 解析 + 绑定
   * 如果传入 ``hostname``（如 'example.com' 或 'localhost'），``Node.js`` 不会立即绑定
      * 先调用 ``dns.lookup()``（或类似）进行异步 DNS 解析，将 ``hostname`` 转换为 ``IP` 地址。
      * DNS 解析是异步的（通过 ``libuv`` 线程池），耗时取决于:
         * 缓存命中
         * 网络延迟
         * 错误情况
   * 解析成功后，才执行实际的 ``bind()`` 到该 IP。
   * 整个过程异步，``listening`` 事件（callback）在绑定完成后发出，也通过类似 ``setImmediate`` 调度。


另外一个案例是扩展 ``EventEmitter`` 并且在构造函数中 emitting 一个事件：

```js
const EventEmitter = require('node:events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // 不能在这里立即抛出事件，在执行这里时，并没有完成绑定 event 事件的操作。
    this.emit('event');
  }
}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  // 并不会被执行
  console.log('触发一个事件');
});
```

因此，在构造函数内部，你可以使用 ``process.nextTick ()`` 来设置一个回调，以便在构造函数完成后触发事件，这样就能得到预期的结果：

```js
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {
  constructor() {
    super();
    process.nextTick(() => {
      this.emit('event');
    });
  }
}
const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('触发一个事件');
});
```

上述代码执行流程伪代码：

```js
new MyEmitter();  // nextTick 推入队列，但不执行
myEmitter.on('event', listener);  // 同步注册到 _events

// 同步结束 → nextTick 阶段（非事件循环阶段）
executeNextTickQueue();  // 执行 emit → 调用 listener → console.log
```










