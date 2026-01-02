# Zustand

``Zustand`` 是一款小巧、快速且可扩展的精简状态管理解决方案。它拥有基于 Hooks 的便捷 API，既不繁琐也不固执己见，同时又具备足够的约定俗成，既清晰明了又兼具 Flux 特性。

另外，Zustand 开发团队投入了大量时间来解决常见的陷阱，例如令人头疼的 ``zombie child problem`` 问题、``React 并发``问题以及``混合渲染器``之间的上下文丢失。
它可能是 React 领域中唯一一款能够完美解决所有这些问题的状态管理器。

## 使用

### 安装
```shell
npm install zustand
```

### 创建 store

```shell
import { create } from 'zustand'

const useBear = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}))
```

### 将 store 与组件进行绑定

#### 推荐写法 —— 精准订阅

```js
function BearCounter() {
  // 选择需要的 state 。
  // 当 state 中 bears 变化时，会自动触发视图层的更新。
  // 正常在 react 中触发视图的更新，通常通过 useState 定义 state,通过对应 set state 方法去更新数据，react 触发视图的更新。
  // 如何触发视图更新 ？ Zustand 内部实现订阅机制，通过 (state) => state.bears 选择器方式时，精确订阅了 bears 数据更新，当通过 setState 更新数据时 Zustand 通知依赖的组件，触发重新更新。
  const bears = useBear((state) => state.bears)
  return <h1>{bears}</h1>
}

function Controls() {
  const increasePopulation = useBear((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>增加</button>
}
```

#### 非 selector 写法 —— 订阅整个 store

```js
// 不推荐：订阅了全部 state
const { bears } = useBear();
```

使用这种方式，组件会在 store 任意属性（如 bears、fish 等）发生变化时都重新渲染，可能带来不必要的性能损耗。

#### 对比实战解读

下面通过一个简单的示例，理解一下：

```ts
import { create } from 'zustand';
type State = {
  name: string
  age: number
};

type Action = {
  setName: (name: string) => void;
  setAge: (age: number) => void;
};

export const useUserStore = create<State & Action>()(
  persist(
    (set) => ({
      name: '',
      age: 0,
      setName: (name: string)=> {
        set({
          name
        })
      },
       setAge: (age: number)=> {
        set({
          age
        })
      }
    })
  )
);
```

在组件中使用它，

* 方式一：未指定 selector（不推荐）

```ts
import { useUserStore } from '@/store/user';

function Name() {
  const { name } = useUserStore();
  console.log('render');
  return <>{name}</>;
}

function TestUpdate() {
  const setAge = useUserStore((state) => state.setAge);
  return (
    <>
      <Name></Name>
      <button onClick={() => setAge(20)}>更新年龄</button>;
    </>
  );
}

export default TestUpdate;
```

虽然 ``Name 组件`` 没有依赖 ``age state``，但当点击 ``更新年龄`` 时，发现 ``Name`` 组件会触发重新渲染。


* 使用 selector（推荐）


```ts
import { useUserStore } from '@/store/user';

function Name() {
  // 选择器方式
  const name = useUserStore((state)=> state.name);
  console.log('render');
  return <>{name}</>;
}

function TestUpdate() {
  const setAge = useUserStore((state) => state.setAge);
  return (
    <>
      <Name></Name>
      <button onClick={() => setAge(20)}>更新年龄</button>;
    </>
  );
}

export default TestUpdate;
```

此时点击``更新年龄``按钮，Name 组件不会重新渲染。只有 name 字段发生变化时 Name 组件才会自动刷新，这样能有效避免无意义的渲染，提高应用性能和响应速度。


## 总结

* 推荐使用 selector 按需订阅 store 字段，如：useUserStore(state => state.name)，保证只有相关字段变化时组件刷新。
* 不建议直接获取全部 state，如：useUserStore()，否则每次 store 任何变化都会造成渲染，影响性能。