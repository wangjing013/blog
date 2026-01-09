// // 演示阶段延长导致定时器延迟的例子
// const fs = require('fs');

// console.log('脚本开始，时间:', Date.now());

// // 设置100ms定时器
// setTimeout(() => {
//     console.log('100ms定时器执行，实际时间:', Date.now());
// }, 100);


// // 模拟耗时的轮询阶段操作
// fs.readFile(__filename, () => {
//     console.log('轮询回调开始，时间:', Date.now());
//     // 模拟200ms的耗时操作
//     const start = Date.now();
//     while (Date.now() - start < 200) {
//         // 阻塞200ms
//     }
    
//     console.log('轮询回调结束，时间:', Date.now());
// });

// console.log('脚本结束，时间:', Date.now());




const fs = require('node:fs');
const timeoutScheduled = Date.now();
setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;
  console.log(`${delay}ms`);
}, 100);

fs.readFile(__filename, () => {
    const start = Date.now();
    while (Date.now() - start <= 105) {
        // 阻塞 105
    }
    console.log('轮询回调结束，时间:', Date.now());
});