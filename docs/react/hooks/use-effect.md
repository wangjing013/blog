# useEffect

``useEffect`` 是一个特殊的钩子，它可以让你在 ``React 中执行副作用``。 它有点类似 ``componentDidMount`` 和 ``componentDidUpdate``。
但是它只会在组件更新和组件初始化时执行。 

## useEffect 与 Class 生命周期方法对比

| 特性 | Class 组件 | Function 组件 + useEffect |
|------|-----------|---------------------------|
| **生命周期方法** | 分离的：`componentDidMount`、`componentDidUpdate` | 统一的：`useEffect` |
| **执行时机** | Mount 和 Update 是分开处理的 | 每次 ``render`` 后都可能执行（取决于依赖项） |
| **依赖管理** | 手动比较 prevProps/prevState | 通过依赖数组自动管理 |
| **清理机制** | `componentWillUnmount` | `useEffect` 的 return 函数 |

