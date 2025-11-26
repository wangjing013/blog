# 常见问题


## 1. Input 绑定值的时候，不要给传入 ``undefined`` 或 ``null`` 值，否则被认为是不可控，也就是不受 ``react`` 控制。

```js
function InputWrap(){
    const [data, setData] = useState<{
        name: string;
    }>();

    const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        setData({
            name: event.target.value,
        });
    };

    return (
        <>
            <input value={data?.name} onChange={onChange}></input>
            <button
                onClick={() => {
                    // bad:
                    //当 data 设置为 undefined 时，此时 data?.name 变 undefined 了
                    //此时 input 变为不可控，input 内容就不会被清空
                    // setData(undefined);

                    // good:
                    setData({
                        name: ""
                    });
                }}
            >
                清空
            </button>
        </>
    );
}
```

## 2.  如何更新列表中的数据

### 2.1 通过 map 方式

```ts
function Home() {
    const [list, setList] = useState<ContainerInfo[]>([]);
    // 1. 通过 map 方式
    // 1.1 map 会返回一个新的数据
    // 1.2 通过 setList 更新 list 值，从而触发页面更新
    const updateCtrRemark: ContainerContextType['updateCtrRemark'] = (info) => {
        setList((prevList) =>
            prevList.map((item) => {
                if (item.ctrAlias === info.ctrAlias) {
                return {
                    ...item,
                    ctrRemark: info.ctrRemark,
                };
                }
                return item;
            })
        );
    };

    // 2. 错误做法
    // 2.1 首先数据是被更改了
    // 2.2 在进行 setList 时，更改后 list 与 更改之前是同一个引用，对于 react 而言并不认为有变动，导致视图不会更新
    const updateCtrRemark: ContainerContextType['updateCtrRemark'] = (info) => {
        const item = list.find((item)=> item.ctrAlias === info.ctrAlias);
        if (item) {
            item.ctrRemark = info.ctrRemark;
        }
        setList(list);
    };
}
```

### 2.2 Immer
#### 2.1 安装 Immer
```cmd
npm i immer
```
#### 2.2 使用
```ts
 import {produce } from 'immer'

 setList(
    produce((draft) => {
        const item = draft.find((item) => item.ctrAlias === info.ctrAlias);
        if (item) {
            item.ctrRemark = info.ctrRemark;
        }
    })
);
```

通过 ``immer`` 简化数据更新逻辑，使用起来心智更低。 更加聚焦业务逻辑处理非框架层面。

#### 2.3 原理

* Immer 用 ``Proxy`` 包装原状态，创建一个“草稿”对象（draft）。``Proxy`` 的 ``get`` 和 ``set`` 陷阱（trap）会拦截所有对 ``draft`` 的访问和修改。
* produce 函数执行完后，``Immer`` 用记录的修改创建一个新对象（浅拷贝 + 精确更新），返回它。原状态保持不变。



