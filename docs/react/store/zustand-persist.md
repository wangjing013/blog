# 持久化

在 ``Zustand`` 中，使用 ``persist`` 中间件去持久化 ``store`` 数据。

## 引用

```js
const nextStateCreatorFn = persist(stateCreatorFn, persistOptions)
```

### 参数

* stateCreatorFn: 一个接受 ``set`` 函数、``get`` 函数和 ``store`` 函数作为参数的函数。通常，你将返回一个对象，对象中包含想对外暴露的 ``state`` 和 ``action``。
* persistOptions: 定义持久化的选项
    * name：必填，用于指定 ``store`` 保存在  ``storage`` 中的 ``key`` 名。
    * storage：可选，默认为 ``createJSONStorage(() => localStorage)``。
    * partialize：可选，部分持久化，用于指定想保存的 state 值。
    * onRehydrateStorage：可选，允许在状态恢复前后进行自定义逻辑的函数。
    * version：可选，指定持久话数据的版本，当版本不匹配时，不会被使用。
    * migrate：可选，当版本不匹配时用于迁移持久化状态的函数。
    * merge：可选，自定义持久化数据与当前 state 的合并策略。默认是浅合并。
    * skipHydration：可选，默认为 ``false``，如果为 ``true``，  ``persist`` 中间件将不会在初始化时自动恢复 ``state``。在这种情况下，请手动使用 ``rehydrate`` 函数。
这对于服务端渲染的应用时非常有用。

### 返回

``persist`` 返回一个 state 创建者函数。

## 使用

### 持久化 state 

在这篇文章中，我们将使用 vanilla store 和 persist 中间件，创建一个简单的位置跟踪器。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)
```

下一步，我们将跟踪 div 内部的鼠标移动，并使用新位置更新存储。

```ts
const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})
```

我们希望通过将 div 元素（代表点）移动到新的坐标来反映屏幕上的位置更新。

```ts
const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())
positionStore.subscribe(render)
```

这是完整的代码。

```ts
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

下面是，html 代码：

```ts
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```


### 持久化部分数据

有时不希望把整个 store 中持久化到 localStorage 中时，这个功能就非常有用。

```js
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = {
  context: {
    position: { x: number; y: number }
  }
}

type PositionStoreActions = {
  actions: {
    setPosition: (
      nextPosition: PositionStoreState['context']['position'],
    ) => void
  }
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      context: {
        position: { x: 0, y: 0 },
      },
      actions: {
        setPosition: (position) => set({ context: { position } }),
      },
    }),
    {
      name: 'position-storage',
      partialize: (state) => ({ context: state.context }),
    },
  ),
)
```