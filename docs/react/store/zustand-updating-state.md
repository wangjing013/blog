# 更新 state 的方式

## 扁平化更新

使用 ``Zustand`` 更新状态还是很简单的。调用提供 ``set`` 并传入新的 state，它会与 ``store`` 中存在的 ``state`` 进行浅合并。

```js
import { create } from 'zustand'

type State = {
  firstName: string
  lastName: string
}

type Action = {
  updateFirstName: (firstName: State['firstName']) => void
  updateLastName: (lastName: State['lastName']) => void
}

const usePersonStore = create<State & Action>((set) => ({
  firstName: '',
  lastName: '',
  updateFirstName: (firstName) => set(() => ({ firstName: firstName })),
  updateLastName: (lastName) => set(() => ({ lastName: lastName })),
}))

function App() {
  const firstName = usePersonStore((state) => state.firstName)
  const updateFirstName = usePersonStore((state) => state.updateFirstName)

  return (
    <main>
      <label>
        First name
        <input
          onChange={(e) => updateFirstName(e.currentTarget.value)}
          value={firstName}
        />
      </label>
      <p>
        Hello, <strong>{firstName}!</strong>
      </p>
    </main>
  )
}
```

## 嵌套对象更新

如果有一个像这样嵌套的 state 对象：

```js
type State = {
  deep: {
    nested: {
      obj: { count: number }
    }
  }
}
```

### 常规方式

类似 React 或 Redux，常规做法就是复制状态对象的每个层级。

```js
  normalInc: () =>
    set((state) => ({
      deep: {
        ...state.deep,
        nested: {
          ...state.deep.nested,
          obj: {
            ...state.deep.nested.obj,
            count: state.deep.nested.obj.count + 1
          }
        }
      }
    }))
```

这种实现方式非常繁琐且不友好。每次仅仅是更新一处深层嵌套的数据，都需要手动复制和展开每一级对象。 如果数据结构进一步复杂，代码冗余和出错率也会急剧上升。

这是传统 ``Redux``、``React immutable`` 风格中的「痛点」之一。


### 使用 Immer

很多人使用 ``Immer`` 去更新嵌套对象的值。无论何时需要更新嵌套状态，例如在 ``React``、``Redux`` 以及 ``Zustand`` 中，都可以使用 ``Immer``！

可以使用 Immer 简化对嵌套对象状态的更新，前面案例使用 ``immer`` 实现如下：

```js
  immerInc: () =>
    set(produce((state: State) => { ++state.deep.nested.obj.count })),
```

## 总结

* 直接使用 set 方法即可，简单、直接、易维护。
* 强烈建议配合 immer 使用。借助 immer，你可以用可变风格（如直接修改 state 的嵌套属性）来简化代码，极大减少冗余与出错风险。
