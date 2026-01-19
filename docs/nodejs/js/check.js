const fs = require('fs');

// 先创建大文件模拟中耗时 I/O (~5-20ms 读时，取决于硬件)
const largeData = Buffer.alloc(1024 * 1024 * 10); // 10MB Buffer，写/读有真实延迟
fs.writeFileSync('large.txt', largeData);

console.log('启动事件循环');

fs.readFile(__filename, () => {  // 第一个 poll 回调
    const pollStart = Date.now();
    console.log('=== 第一个 poll 回调开始 ===', pollStart);
    
    setImmediate(() => {
        console.log('setImmediate 执行 (check 阶段)', Date.now() - pollStart, 'ms 后');
    });
    
    // 短耗时 I/O：读小文件 (~0.1ms)
    fs.readFile(__filename, () => {  // 第二个：用 __filename，快速
        console.log('短 I/O 回调 (下一 poll)', Date.now() - pollStart, 'ms 后');
    });
    
    // 中耗时 I/O：读大文件 (~5-20ms，线程池任务)
    fs.readFile('large.txt', () => {
        console.log('中 I/O 回调 (后续 poll)', Date.now() - pollStart, 'ms 后');
    });
    
    console.log('第一个 poll 回调结束', Date.now() - pollStart, 'ms 后');
});