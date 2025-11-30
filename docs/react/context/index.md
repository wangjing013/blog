# 组件通信之 Context

通常传递数据和方法是通过 prop 方式，当层级较深或多个不相关组件需要共享时会出现 prop drilling，这时可以使用 Context 来避免逐层传递。

> Prop drilling（props 钻取） 是指在组件树中，为了将数据从顶层组件传递到一个深层嵌套的子组件，不得不经过多个中间组件，而这些中间组件本身并不需要这些数据，只是扮演了传递的角色。这会导致代码变得冗长、难以维护，并增加了中间组件的复杂性。

## 使用

### 定义一个 Context

```jsx
// src/contexts/ContainerContext.tsx
import { createContext } from 'react';

export type RemarkInfo = {
  ctrAlias: string;
  ctrRemark: string;
};

export interface ContainerContextType {
  updateCtrRemark?: (info: RemarkInfo) => void;
}
export const ContainerContext = createContext<ContainerContextType | undefined>(undefined);
```

### 提供 Context

```jsx
import { ContainerContext } from '@/contexts/ContainerContext';

// 通过 useCallback 避免渲染的时候，重复生成 updateCtrRemark 函数引用，避免不必要消耗。
const updateCtrRemark: ContainerContextType['updateCtrRemark'] = useCallback(
    (info: RemarkInfo) => {
        setList(
            produce((draft) => {
                const item = draft.find((item) => item.ctrAlias === info.ctrAlias);
                if (item) {
                    item.ctrRemark = info.ctrRemark;
                }
            })
        );
    },
    []
);

<ContainerContext.Provider
    value={{
        updateCtrRemark,
    }}
>
    <UpdateRemark />
</ContainerContext.Provider>
```

### 消费 Context

```js
import { useContext } from 'react';
import { ContainerContext } from '@/contexts/ContainerContext';
const  context = useContext(ContainerContext);
// 然后可以在组件中，调用 Provider 中提供方法。

const update = ()=> {
    context?.updateCtrRemark?.({
        ctrAlias: '',
        ctrRemark: ''
    })
}
```

## 总结

``React Context`` 是处理组件间深层数据共享的优雅解决方案，避免了 ``Prop Drilling`` 的繁琐。以下是其核心要点罗列：

* 定义 Context：使用 ``createContext`` 创建上下文对象，并定义类型（如 ``ContainerContextType``），初始值为 ``undefined`` 以便消费者检查。
* 提供值：在 ``Provider`` 中注入数据或方法（如 ``updateCtrRemark``），结合 ``useCallback`` 优化性能，避免不必要的子组件重渲染。
* 消费值：在子组件中使用 ``useContext`` 获取上下文，并通过可选链 ?. 安全调用方法。这种模式适用于中等规模的状态共享（如表单更新或主题切换），但对于复杂全局状态，建议结合 ``Zustand`` 等库。实践时注意类型安全和错误处理（如自定义 Hook 验证 ``Provider`` 存在），以提升代码的可维护性。