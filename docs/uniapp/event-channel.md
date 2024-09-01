# EventChannel

在本文中，我们将探讨如何在 uniapp 中利用 EventChannel 实现页面之间的高效通信。EventChannel 是 uniapp 提供的一种专门用于页面间通信的机制，特别适合在页面间传递数据或更新状态的场景。

## 实际业务场景

为了更好地理解 EventChannel 的应用，我们来看一个典型的业务场景：假设在一个电商应用中，有一个订单列表，其中某个订单的状态为“待付款”。用户点击该订单，进入订单详情页面。在订单详情页面，用户选择“取消订单”，操作成功后，该订单的状态变为“已取消”。

此时，我们面临一个问题：如何在订单详情页面取消订单后，自动更新订单列表页面中对应订单的状态，使其从“待付款”变为“已取消”。

一种简单直接的解决方案是在订单列表页面中使用 `onShow` 生命周期方法，在每次页面重新展示时调用接口重新获取订单列表。然而，这种方法存在以下缺点：

- **资源浪费**：用户每次切换页面都会触发加载操作，导致不必要的网络请求和资源浪费。
- **用户体验不佳**：如果用户在订单列表中点击的订单位于列表中间或底部，跳转回列表页面后，滚动位置可能会丢失，导致用户体验不佳。

为了解决这些问题，我们可以采用一种更加无缝和智能的方式，这正是 EventChannel 的用武之地。

EventChannel 可以在两个页面间建立通信通道，当订单详情页面的状态发生变化时，及时通知订单列表页面更新状态，无需额外的页面刷新或滚动位置丢失。此外，EventChannel 也不是唯一的选择。我们还可以通过全局状态管理（如 Paina）、EventBus 等方式来实现类似的效果。

在接下来的部分，我们将详细介绍如何使用 EventChannel 实现这一场景下的页面通信。

## 使用方法

### 在订单列表页面监听事件

```js
// order.vue
const orderList = ref([]);
uni.navigateTo({
  url: '/order-detail',
  events: {
    orderStatusChange({ orderId, status }) {
      // 从列单列表中查询对应项
      const index = orderList.value.findIndex((order) => order.id === orderId);
      if (index !== -1) {
        // 修改订单状态
        orderList.value[index].status = data.status;
        // 同样删除也可以
        //  orderList.value.splice(index, 1);
      }
    },
  },
});
```

在跳转到订单详情页面时，通过 `navigateTo` 方法传递 `events` 属性，用于监听订单状态变化事件。

### 在订单详情页面发送事件

```js
// order-detail.vue
const { proxy } = getCurrentInstance();
let eventChannel = null;
const handleCancel = () => {
  // 取消订单操作
  // ...
  // 执行通信
  eventChannel.emit('orderStatusChange', {
    orderId: '1234567',
    status: 'cancel',
  });
};
onLoad(() => {
  eventChannel = proxy.getOpenerEventChannel();
});
```

在订单详情页面中，通过 `getOpenerEventChannel` 方法获取到打开订单详情页面的 EventChannel 对象，并通过调用 `emit` 方法发送消息。

## EventChannel 是什么

事实上，·`EventChannel` 的内部实现可以看作是一个自定义事件类，通过事件的发布（emit）和订阅（on）机制，实现页面之间的数据通信。

下面就是具体实现。

```js
type NavigateToOptionEvents = Record<string, (...args: any[]) => void>

interface EventChannelListener {
  type: 'on' | 'once'
  fn: (...args: any[]) => void
}

export class EventChannel {
  id?: number
  private listener: Record<string, EventChannelListener[]>
  private emitCache: {
    args: any[]
    eventName: string
  }[]
  constructor(id?: number, events?: NavigateToOptionEvents) {
    this.id = id
    this.listener = {}
    this.emitCache = []
    if (events) {
      Object.keys(events).forEach((name) => {
        this.on(name, events[name])
      })
    }
  }

  emit(eventName: string, ...args: any[]) {
    const fns = this.listener[eventName]
    if (!fns) {
      return this.emitCache.push({
        eventName,
        args,
      })
    }
    fns.forEach((opt) => {
      opt.fn.apply(opt.fn, args)
    })
    this.listener[eventName] = fns.filter((opt) => opt.type !== 'once')
  }

  on(eventName: string, fn: EventChannelListener['fn']) {
    this._addListener(eventName, 'on', fn)
    this._clearCache(eventName)
  }

  once(eventName: string, fn: EventChannelListener['fn']) {
    this._addListener(eventName, 'once', fn)
    this._clearCache(eventName)
  }

  off(eventName: string, fn: EventChannelListener['fn']) {
    const fns = this.listener[eventName]
    if (!fns) {
      return
    }
    if (fn) {
      for (let i = 0; i < fns.length; ) {
        if (fns[i].fn === fn) {
          fns.splice(i, 1)
          i--
        }
        i++
      }
    } else {
      delete this.listener[eventName]
    }
  }

  _clearCache(eventName?: string) {
    for (let index = 0; index < this.emitCache.length; index++) {
      const cache = this.emitCache[index]
      const _name = eventName
        ? cache.eventName === eventName
          ? eventName
          : null
        : cache.eventName
      if (!_name) continue
      const location = this.emit.apply(this, [_name, ...cache.args])
      if (typeof location === 'number') {
        this.emitCache.pop()
        continue
      }
      this.emitCache.splice(index, 1)
      index--
    }
  }

  _addListener(
    eventName: string,
    type: EventChannelListener['type'],
    fn: EventChannelListener['fn']
  ) {
    ;(this.listener[eventName] || (this.listener[eventName] = [])).push({
      fn,
      type,
    })
  }
}
```

在了解 `EventChannel` 实现之后，接下来看下两个页面是如何共享 `EventChannel` 实例的。

## 两个页面是如何共享 EventChannel 实例的

页面之间之所以能够实现通信，关键在于它们共享同一个 `EventChannel` 实例。同时，新页面能够通过调用 `getOpenerEventChannel` 方法获取到这个共享的实例。

要深入理解这一机制，我们需要了解 `uni.navigateTo` 方法和 `getOpenerEventChannel` 方法各自的工作原理。

接下来看下内部实现：

```js
function navigateTo({
  url,
  path,
  query,
  events,
  aniType,
  aniDuration,
}: NavigateToOptions): Promise<void | { eventChannel: EventChannel }> {
  // 创建 eventChannel
  const eventChannel = new EventChannel(getWebviewId() + 1, events);
  return new Promise((resolve) => {
    showWebview(
      registerPage({ url, path, query, openType: 'navigateTo', eventChannel }),
      aniType,
      aniDuration,
      () => {
        resolve({ eventChannel });
      }
    );
    setStatusBarStyle();
  });
}
```

上面看到把 `eventChannel` 传递给了 `registerPage` 方法。

```js
// registerPage 方法
export function registerPage({
  url,
  path,
  query,
  openType,
  webview,
  nvuePageVm,
  eventChannel,
}: RegisterPageOptions) {
  if (!webview) {
    webview = createWebview({ path, routeOptions, query })
  } else {
    webview = plus.webview.getWebviewById(webview.id)
    ;(webview as any).nvue = routeOptions.meta.isNVue
  }
  initWebview(webview, path, query, routeOptions.meta)

  const pageInstance = initPageInternalInstance(
    // ...,
    eventChannel,
  )
  createVuePage(id, route, query, pageInstance, initPageOptions(routeOptions))
  return webview
}
```

在 registerPage 中主要做了几件事：

- 创建 webview 实例
- 初始化 webview
- 初始化页面内部实例
- 创建 vue 页面

```js
export function initPageInternalInstance(
  openType: UniApp.OpenType,
  url: string,
  pageQuery: Record<string, any>,
  meta: UniApp.PageRouteMeta,
  eventChannel?: EventChannel,
  themeMode?: UniApp.ThemeMode
): Page.PageInstance['$page'] {
  const { id, route } = meta
  return {
    id: id!,
    route: route,
    fullPath: url,
    options: pageQuery,
    meta,
    openType,
    eventChannel,
    statusBarStyle: titleColor === '#ffffff' ? 'light' : 'dark',
  }
}
```

这方法并没有做太多逻辑处理。 只要记住 `eventChannel` 放入内部实例中，接着往下看 `createVuePage`

```js
function createFactory(component: VuePageAsyncComponent | VuePageComponent) {
  return () => {
    if (isVuePageAsyncComponent(component)) {
      return component().then((component) => setupPage(component))
    }
    return setupPage(component)
  }
}
export const pagesMap = new Map<string, ReturnType<typeof createFactory>>()

export function definePage(
  pagePath: string,
  asyncComponent: VuePageAsyncComponent | VuePageComponent
) {
  pagesMap.set(pagePath, once(createFactory(asyncComponent)))
}

export function createVuePage(
  __pageId: number,
  __pagePath: string,
  __pageQuery: Record<string, any>,
  __pageInstance: Page.PageInstance['$page'],
  pageOptions: PageNodeOptions
) {
  const pageNode = createPageNode(__pageId, pageOptions, true)
  // 获取 Vue 根应用
  const app = getVueApp()
  // 根据路径获取页面组件
  const component = pagesMap.get(__pagePath)!()
  // 页面挂载
  const mountPage = (component: VuePageComponent) =>
    app.mountPage(
      component,
      extend(
        {
          __pageId,
          __pagePath,
          __pageQuery,
          __pageInstance,
        },
        __pageQuery
      ),
      pageNode
    )
  if (isPromise(component)) {
    return component.then((component) => mountPage(component))
  }
  return mountPage(component)
}

const mountPage = (
  pageComponent: VuePageComponent,
  pageProps: Record<string, any>,
  pageContainer: UniNode
) => {
  const vnode = createVNode(pageComponent, pageProps)
  // store app context on the root VNode.
  // this will be set on the root instance on initial mount.
  vnode.appContext = appContext
  ;(vnode as any).__page_container__ = pageContainer
  render(vnode, pageContainer as unknown as Element)
  const publicThis = vnode.component!.proxy!
  ;(publicThis as any).__page_container__ = pageContainer
  return publicThis
}
```

在上述代码中，`__pageInstance` 被作为 `pageProps` 传递给 `mountPage` 方法。当执行 `mountPage` 后，`pageProps` 会被添加到组件的上下文 `context` 对象中 `attrs` 属性中。

在前面的代码中，虽然没有直接看到对 `eventChannel` 对象的使用，但它主要用于参数传递。回顾前面提到的使用方法部分，我们注意到在页面中通过 `proxy.getOpenerEventChannel()` 来获取 `eventChannel` 实例，也就是说，`getOpenerEventChannel` 是在页面实例上添加的。那么，它是何时被添加到实例上的呢? `setupPage` 中。

`setupPage` 方法代码如下：

```js
export function setupPage(component: VuePageComponent) {
  const oldSetup = component.setup
  component.setup = (props, ctx) => {
    const {
      attrs: { __pageId, __pagePath, /*__pageQuery,*/ __pageInstance },
    } = ctx
    const instance = getCurrentInstance()!
    const pageVm = instance.proxy!
    initPageVm(pageVm, __pageInstance as Page.PageInstance['$page'])
    if (pageVm.$page.openType !== 'openDialogPage') {
      addCurrentPage(
        initScope(
          __pageId as number,
          pageVm,
          __pageInstance as Page.PageInstance['$page']
        )
      )
    }
    if (oldSetup) {
      return oldSetup(props, ctx)
    }
  }
  return component
}

export function initScope(
  pageId: number,
  vm: ComponentPublicInstance,
  pageInstance: Page.PageInstance['$page']
) {
  //
  vm.getOpenerEventChannel = () => {
    if (!pageInstance.eventChannel) {
      pageInstance.eventChannel = new EventChannel(pageId)
    }
    return pageInstance.eventChannel as EventChannel
  }
  return vm
}
```

`setupPage` 通过重写组件的 `setup` 函数，同时保留组件的默认 `setup` 功能，这正是面向切面编程的一个典型示例。

在 `initScope` 方法中，`getOpenerEventChannel` 被添加到了 `vm` 实例对象上，这正是我们能够通过 `proxy` 访问到 `getOpenerEventChannel` 的原因

至此，我们已经基本掌握了 EventChannel 在页面间通信的使用方法及其实现原理。
