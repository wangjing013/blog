# Hook 的规则

Hook 是使用 JavaScript 函数定义的。但它们代表了一种特殊类型的可重用UI逻辑，对调用它们的位置有限制。

* 只能顶层调用 Hook
* 只能 React 函数中调用 Hook 

## 只能在顶层调用 Hook

在 React 中，以 use 开头命名的函数就叫 Hooks。

不要在循环，条件，嵌套函数 或 try/catch/finally 块中调用 Hooks。相反，你应该在 ``React`` 函数顶层使用 ``Hooks``，且是在返回语句之前调用。

```js 
function MyComponent({ shouldRender }) {
  // 错误：Hook 在 early return 之后调用
  if (!shouldRender) {
    return null; // early return
  }
  
  const [state, setState] = useState(0); // 🔴 违反规则
}
```

你只能在 ``React`` 渲染函数组件中调用它们：

* 在函数组件的顶层调用
* 在定义 Hook 函数中顶层调用

```js
function Counter() {
  const [count, setCount] = useState(0);
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
}
```

## 总结

* 在 React 中以 use 开头命名的函数就叫 hook
* hook 只能在 函数组件以及自定义 hook 的顶层调用它们。