# Props

``Props`` 是用于组件间传递数据的机制。它们是组件的输入，可以通过组件的属性进行设置。

## 基本用法

### 传递 Props 

```jsx 
function Avatar() {
  return (
    <img className="avatar" src="avatarURL" width={100} height={100} />
  )
}
```

现在，希望让 ``Avatar`` 组件更加通用，可以通过 ``props`` 传递 ``src``、``width`` 和 ``height``：

```jsx 
function Avatar(props) {
  return (
    <img 
      className="avatar" 
      src={props.src} 
      width={props.width} 
      height={props.height} 
    />
  )
}
```
然后，可以像这样使用 ``Avatar`` 组件并传递不同的属性值：

```jsx
<Avatar src="avatarURL1" width={100} height={100} />
<Avatar src="avatarURL2" width={150} height={150} />
```

### 访问 Props 

上述例子中，直接通过 ``props`` 对象访问传递的属性值。可以使用点语法访问特定的属性，例如 ``props.src``、``props.width`` 和 ``props.height``。

实际上，可以通过解构赋值来简化对 ``props`` 的访问：

```jsx
function Avatar({ src, width, height }) {
    return (
        <img 
            className="avatar" 
            src={src} 
            width={width} 
            height={height} 
        />
    )
}
```

### 为 Props 指定默认值

有时，某些属性可能是可选的。可以通过为组件定义默认属性值来处理这种情况：

```jsx
function Avatar({ src, width = 100, height = 100 }) {
    return (
        <img 
            className="avatar" 
            src={src} 
            width={width} 
            height={height} 
        />
    )
}
``` 

这样可以简化组件的使用，如果没有传递 ``width`` 和 ``height``，它们将默认为 ``100``。

### 在 JSX 中使用展开运算符，简化 Props 传递

当有多个属性需要传递给组件时，可以使用展开运算符（``...``）来简化代码：

```jsx
const avatarProps = {
  src: "avatarURL",
  width: 100,
  height: 100
}

function Profile({ src, width, height }) {
  return (
    <Avatar src={src} width={width} height={height} />
  )
}

<Profile {...avatarProps} />

// 同样，Avatar 组件也可以直接使用展开运算符：
function Profile(props) {
  return (
    <Avatar {...props} />
  )
}
``` 

把 ``avatarProps`` 对象中的所有属性展开并传递给 ``Avatar`` 组件。


### Props 传递 JSX 元素

通常，在编写 ``HTML`` 结构时，元素之间存在嵌套关系。

```HTML
<div class="card">
  <div class="profile">
    <img class="avatar" src="avatarURL" width="100" height="100" />
  </div>
</div>
```

在 ``React`` 中，可以通过 ``props`` 传递嵌套的 ``JSX`` 元素，来实现类似的嵌套结构： 

```jsx  

function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  )
}


function Profile(props) {
  return (
    <div className="user-profile">
      <Avatar {...props} />
    </div>
  )
}

```
然后，可以像这样使用 ``Card`` 组件，并将 ``Profile`` 组件作为子元素传递：

```jsx
<Card>
  <Profile src="avatarURL" width={100} height={100} />
</Card>   
```

## 小结

* ``Props`` 是组件间传递数据的机制，通过组件的属性进行设置。
* 可以通过 ``props`` 对象访问传递的属性值，或者使用解构赋值简化访问。
* 可以为组件定义默认属性值，以处理可选属性。
* 使用展开运算符（``...``）可以简化多个属性的传递。
* 可以通过 ``props`` 传递嵌套的 ``JSX`` 元素，实现复杂的组件结构。


