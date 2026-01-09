console.log("main");

const promise = new Promise((resolve)=> {
    console.log("promise");
    resolve();
}).then(()=> {
    console.log("then");
});

const start = Date.now();

setTimeout(()=> {
    console.log(Date.now() - start);
    console.log("timer");
}, 100)


setImmediate(()=> {
    console.log("Immediate");
});

// 加入到 tick 队列，在下一次事件循环之前会执行完成。
process.nextTick(()=> {
    console.log("nextTick");
});



/**
 * main
 * promise
 * then
 * nextTick
 * Immediate
 * timer
 */