# useMemo

``useMemo`` 是 ``React`` 中的一个 ``Hook`` 函数，用于 ``记忆（memoize）`` 函数的计算结果。当依赖项数组中的值没有发生变化时，在后续重新渲染中它会直接返回上一次缓存的结果，避免重复计算，从而提升性能。其作用类似于 ``Vue`` 中的 ``computed``。

> 当我们使用 ``React Compiler`` 时，系统会自动对值和函数进行 ``memoized`` 处理。这样可以减少手动调用 ``useCallback`` 的需要。






