# useRef

``useRef`` 是一个 ``React`` 勾子函数，它提供了一种创建可变的引用的方法，该引用在组件重新渲染时值不会丢失。 另外，
当我们更改引用的值时，不会触发组件的重新渲染。

为什么不会触发重新渲染 ？因为 ``ref`` 是一个普通的 ``JavaScript`` 对象，所以 ``React`` 并不知道它什么时候被修改了。

``ref`` 非常适合存储那些不需要触发视图更新的内容。例如：定义器ID、DOM 节点以及播放器实例等。

## 使用

### ref 引用一个值

```js 
function handleStartClick() {
  const intervalId = setInterval(() => {
  }, 1000);
  intervalRef.current = intervalId;
}
```

在之后，从 ``ref`` 中读取 ``interval ID``，便可清除这个 ``interval``：

```js
function handleStopClick() {
  const intervalId = intervalRef.current;
  clearInterval(intervalId);
}
```

通过使用 ``ref`` 后，你应该知道：

* 存储的信息在下一次重新渲染时，依然是存在的。（不像普通的变量， 下次渲染会丢失）。
* 更改值并不会触发重新渲染。（不像 state 会触发视图更新）

### 避免重复创建 ref 的内容

> React 会保存 ``ref`` 初始值，并在后续的渲染中忽略它。 

上述是官方的描述，怎么理解？通过案例来理解一下。

```js
import { useRef, useState } from 'react';

class VideoPlayer {
  id: number;

  constructor() {
    console.log('VideoPlayer');
    this.id = Date.now();
  }
}

function Video() {
  const playerRef = useRef(new VideoPlayer());
  const [count, setCount] = useState<number>(0);
  const handleClick = () => {
    // 触发更新
    setCount(count + 1);
    // 输出实例ID
    console.log(playerRef.current.id);
  };

  return (
    <>
      <div>{count}</div>
      <button onClick={handleClick}>触发渲染</button>
    </>
  );
}

export default Video;
```

当我们每次点击时，页面会被重新渲染。虽然每次渲染多会重新实例化，但会发现实例ID永远是相同的。

```js
1765503378413
VideoPlayer

1765503378413
VideoPlayer
```

说明 ``ref`` 保存值为初始化时提供的值。 上面代码有优化空间，避免重复创建实例。

```js
function Video() {
  const playerRef = useRef<VideoPlayer>(null);

  // 通常情况下，在渲染过程中写入或读取 ref.current 是不允许的。然而，在这种情况下是可以的，因为结果总是一样的，而且条件只在初始化时执行，所以是完全可预测的
  if (playerRef.current === null) {
    playerRef.current = new VideoPlayer();
  }

  const [count, setCount] = useState<number>(0);
  const handleClick = () => {
    setCount(count + 1);
    console.log(playerRef.current?.id);
  };

  return (
    <>
      <div>{count}</div>
      <button onClick={handleClick}>加</button>
    </>
  );
}
```

### 自定义组件上使用 ref 

```js
function MyInput({ ref }: { ref: RefObject<HTMLInputElement | null> }) {
  return <input ref={ref}></input>;
}


function Home(){
    const ref = useRef(null)
    return <MyInput ref={ref}></MyInput>
}
```

## 总结

* useRef 适合存储那些不需要参与页面渲染的内容
* useRef 返回对象只包含一个 current 属性
* ref 值的更改并不回触发重新渲染








