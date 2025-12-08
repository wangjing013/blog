# 共享组件

在一个实际业务场景中，购物组件在应用的有多个页面或组件中有使用到。

通常如下几种方式：

* 每个需要地方引入该组件
* 创建全局组件 createPortal + Hooks 
* 在全局引入，并结合 ``Context`` +`` Hooks`` 共享操作组件的方法


这里讲下第三种使用方式。

## 创建 Context

```ts
import { createContext } from 'react';

export const BuyPopupContext = createContext<PopupRefType | undefined>(undefined);
```

## 创建 Provider 

定义 Provider 组件目的，简化在页面使用，把对应操作 PurchasePopup 方法封装在内部。

```ts
import { useRef, type ReactElement } from 'react';
import { BuyPopupContext } from '@/contexts/BuyPopupContext';
import PurchasePopup from '../PurchasePopup';

export const BuyPopupProvider = ({ children }: { children: ReactElement }) => {
  const popupRef = useRef<PopupRefType>(null);
  const open = useCallback(() => {
    popupRef.current?.open();
  }, []);

  const close = useCallback(() => {
    popupRef.current?.close();
  },[]);

  return (
    <BuyPopupContext.Provider
      value={{
        open,
        close,
      }}
    >
      {children}
      <PurchasePopup ref={popupRef}></PurchasePopup>
    </BuyPopupContext.Provider>
  );
};
```

## 定义 Hooks 

在各个页面获取 BuyPopupContext 上下文。

```tsx
// hooks/useBuyPopup.tsx

import { useContext } from 'react'
import {
    BuyPopupContext
} from '@/contexts/BuyPopupContext'

export const useBuyPopup = ()=> {
    const context = useContext(BuyPopupContext)
    if(context === undefined) {
       throw new Error('useBuyPopup 必须在 BuyPopupProvider 内使用');
    }
    return context;
}
```

## 在入口文件 main.tsx 中引入

```tsx
import { BuyPopupProvider } from '@/components/BuyPopupProvider';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BuyPopupProvider>
      <RouterProvider router={router} />
    </BuyPopupProvider>
  </StrictMode>
);
```

## 使用

```tsx
// Home.tsx
import { useBuyPopup } from '@/hooks/useBuyPopup.tsx'
const context = useBuyPopup();

// context.open()
// context.close()
```


## 总结

该方案通过 ``Context`` + ``Provider`` + ``自定义 Hook 的方式``，将弹窗组件的控制逻辑进行统一管理，并配合 ``ref`` 暴露实例方法，实现了跨页面调用和全局 UI 统一控制。
