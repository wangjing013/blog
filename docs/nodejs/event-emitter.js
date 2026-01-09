// const EventEmitter = require('node:events');

// class MyEmitter extends EventEmitter {
//   constructor() {
//     super();
//     this.emit('event');
//   }
// }

// const myEmitter = new MyEmitter();
// myEmitter.on('event', () => {
//   // 并不会被执行
//   console.log('an event occurred!');
// });


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
