# 什么是 BEM（一句话）

BEM 是一种 CSS 命名方法论，用于把 UI 拆成独立、可复用的「块（Block）」，块的组成部分称为「元素（Element）」，通过「修饰符（Modifier）」改变块或元素的表现或状态。核心目标是：**可读、可维护、低耦合、避免样式冲突**。

# 命名语法

* Block：`block`
* Element：`block__element`（双下划线）
* Modifier：`block--modifier` 或 `block__element--modifier`（双连字符）

示例：

```html
<div class="card card--featured">
  <h3 class="card__title">标题</h3>
  <p class="card__desc card__desc--muted">描述</p>
</div>
```

# 基本原则（要点）

1. **块（Block）是独立的**：代表一个功能模块或逻辑区域，能单独存在。
2. **元素（Element）依属于块**：表示块的组成部分，命名必须以 `block__` 为前缀。元素不能独立于块存在（语义上）。
3. **修饰符（Modifier）用于状态或变体**：不用于嵌套层级，而用于改变外观/行为（例如大小、颜色、状态）。
4. **命名看语义，不看 DOM 层级**：元素可以不一定是直接子节点，也可以深层嵌套。
5. **不允许链式 Element**：不要写 `block__element__subelement`，如果需要表达子元素还是用 `block__subelement` 或考虑创建新 Block。
6. **避免依赖上下文选择器**：尽量使用类选择器而非后代选择器（如 `.block .element`），这减少耦合和复杂度。

# Modifier 的两种风格

* 布尔/状态型：`block--disabled`、`block__btn--active`
* 值型：`block--size-large` 或 `block--size_lg`（团队约定）

# 代码实例（HTML + CSS）

```html
<div class="nav">
  <ul class="nav__list">
    <li class="nav__item nav__item--active">
      <a class="nav__link" href="#">首页</a>
    </li>
  </ul>
</div>
```

```css
.nav { /* Block 基本样式 */ }
.nav__list { /* Element */ list-style: none; }
.nav__item { display: inline-block; }
.nav__item--active .nav__link { font-weight: bold; }
```

# SCSS（更可维护的写法）

```scss
.nav {
  // block 的样式
  &__list { ... }
  &__item { ... }

  &--compact { // modifier
    &__item { padding: 8px; } // 注意：这里是语法糖，但推荐直接写 .nav--compact .nav__item
  }
}
```

> 提示：在 Sass 中写 `&__element` 很方便，但在大型项目里要小心生成的选择器复杂度。

# 优势（为什么用 BEM）

* 避免命名冲突，易于复用组件
* 可读性高：类名表达语义和层次
* 有利于 CSS 的低耦合、模块化和按需复用
* 团队协作更容易（统一规范）

# 常见误区 / 错误写法

* 错误：`block__elem__sub`（链式 element）
* 错误：依赖 DOM 层级写样式 `.block > .header`（耦合结构）
* 错误：把修饰符当成元素写：`block--header`（如果 header 是元素，应为 `block__header`）
* 忌用过长、含糊的类名（例如 `.page-header-large-red`）

# BEM 与 React / 现代工具协作建议

* **组件作为 Block**：每个 React 组件对应一个 Block 类前缀。

  ```jsx
  function Card({ featured }) {
    return <div className={`card ${featured ? 'card--featured' : ''}`}>...</div>;
  }
  ```
* **CSS Modules**：可用 `styles['card__title']` 映射，但注意可读性。很多人会把 Block 名做为 module scope（例如 `Card.module.css`），然后仅导出本地类名，避免全局命名冲突。
* **Tailwind/Utility-first**：BEM 与工具类可混用：结构类用 BEM，视觉细节用 utility classes。
* **组件库 / 复合组件**：如果元素复杂并且可能独立复用，可以把复杂 element 抽成独立 Block（或子 Block）。

# 什么时候不用 BEM 或考虑替代方案

* 小型项目或原型：直接 utility classes（Tailwind）更快速。
* 大型组件库：结合 CSS-in-JS（Styled Components）或 CSS Modules 可以减少手写前缀，但仍可在类名中保留 BEM 思想（语义化）。

# 可扩展模式与进阶技巧

1. **混合（Mix）**：当一个元素同时属于多个 Block 时可做 mix：`<div class="button card__action"></div>`。
2. **主题（Theming）**：使用修饰符表示主题：`button--dark`。
3. **状态（State）**：状态类（如 `is-open`, `is-loading`）有团队约定，有些团队偏好 `is-*` 前缀以表明是 JS 状态：`is-open` vs `block__item--open`。
4. **可访问性（A11y）**：类名与 aria/state 分离，尽量通过 JS 控制 `aria-*`，类名只负责样式。
5. **命名短语**：尽量用短词，如 `nav__item` 而不是 `navigation__single-item`。

# 选择器优先级与性能

* 优先使用类选择器（`.block__elem--mod`），避免过度依赖层级选择器（`.block .header .title`）。
* 类选择器的性能足够好，重点是可维护性与可读性。

# 样式组织（推荐）

* 每个 Block 一个文件（`card.css` / `Card.module.css` / `card.scss`）
* 文件内顺序：base -> elements -> modifiers -> state
* 使用 lint（stylelint）+ 命名规则插件强制团队约定

# 常见团队约定（可选）

* 修饰符用 `--`，但值型修饰符用 `--size-lg` 或 `--lg`（约定一致即可）
* 状态类用 `is-*`（或 `has-*`）来标识 JS 控制的状态
* 所有 Block 名称一律小写、短横线分隔单词（`user-card`）

# 实战示例：你的页面（简化）

你之前的 `home` 结构可按 BEM 写成：

```html
<div class="home">
  <header class="home__header">
    <nav class="home__nav">...</nav>
  </header>

  <div class="home__body">
    <div class="home__toolbar">
      <div class="home__toolbar-left">...</div>
      <div class="home__toolbar-right">...</div>
    </div>

    <div class="home__content">
      <div class="home__loading">...</div>
      <div class="home__list">...</div>
    </div>
  </div>
</div>
```

# 总结

* BEM 是以**语义**为中心的命名法，**不依赖 DOM 层级**，便于维护与复用。
* 严格使用 `block__element--modifier` 格式，避免 `__` 链式写法。
* 在 React、CSS Modules、Tailwind 等现代技术栈中，BEM 思想依然有很高价值：保持清晰边界、低耦合、易读。
* 能独立就是 ``Block``，不独立就是 ``Element``，有变化才 ``Modifier``。