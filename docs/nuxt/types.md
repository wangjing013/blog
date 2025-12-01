# Type

## 1. Props 定义几种方式

### 1.1 运行时声明

当使用 ``script setup`` 时，``defineProps()`` 宏函数支持从它的参数中推导类型：

```ts
const props = defineProps({
  foo: { type: String, required: true },
  bar: Number
})

props.foo // string
props.bar // number | undefined
```

这种被称为 ``运行时声明``。因为传递给 ``defineProps()`` 的参数会作为运行时的 ``props`` 选项使用。

另外，还可以通过``泛型参数``来定义 ``props`` 的类型通常更直接。

### 1.2 基于泛型类型的声明

```ts
const props = defineProps<{
  foo: string
  bar?: number
}>()
```

编译器会尽可能地尝试根据类型参数推导出等价的运行时选项。在这种场景下，编译出的运行时与第一个是完全一致的。 基于``类型的声明``或者``运行时声明``可以择一使用，但是不能同时使用。

当使用基于类型的声明时，并且想要给可选 prop 提供默认值，可以使用 ``withDefaults`` 编译器宏。


#### 通过 withDefaults 指定默认值

```ts
const props = withDefaults(
  defineProps<{
    foo: string
    bar?: number 
  }>(),
  {
    bar: 1,
  }
)
```


## 2. Emits 标注类型

### 2.1 基于运行时

```ts
const emit = defineEmits(['change', 'update'])
```

### 2.2 基于类型

```ts
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

// 或 3.3+: 可选的、更简洁的语法
const emit = defineEmits<{
  change: [id: number] // 这里就是一个元组，意味着可以指定多个值。
  update: [value: string]
}>()

// 多个返回值时
const emit = defineEmits<{
  change: [id: number, id1: number] 
  update: [value: string]
}>()
```

根据实际情况来选择，推荐使用基于类型方式，更加直观。

## 3. ref 标注类型

### 3.1 根据初始值推导类型

```ts
const year = ref(2020) // number
```

### 3.2 显示的指定类型

```ts
const year: Ref<string | number> = ref('2020')
```

### 3.3 指定泛型类型的声明

```ts
const year = ref<string | number>('2020')
```

如果通过泛型参数但没有给出初始值，那么最后得到的就将是一个包含 undefined 的联合类型

```ts
const n = ref<number>() // 推导得到的类型：Ref<number | undefined>
```

## 4. reactive 标注类型

### 4.1 根据值推导

```ts
const book = reactive({ title: 'Vue 3' }) // 推导出类型 { title: string }
```

### 4.2 显示标记返回值类型

```ts
interface Book {
  title: string
  year?: number
}
const book: Book = reactive({ title: 'Vue 3' })
```

## 5. computed 标注类型

### 5.1 根据值推导

```ts
const double = computed(() => count.value * 2) // 推导出类型： ComputedRef<number>
```

### 5.2 通过泛型参数

```ts
const double = computed<number>(() => {})
```