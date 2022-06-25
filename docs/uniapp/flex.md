# Flex 布局

Flex 在移动端开发中使用最多布局方式和，基本上无需考虑其兼容性。 在编写页面的时，一个好的 CSS 工具可以提升开发效率。

通常使用第三方提供的 flex.css ，提供辅助类帮助快速构建用户界面。

```css

/* ========================================================================
   Component: Flex
 ========================================================================== */

 .flex { display: flex; }
 .flex-inline { display: inline-flex; }

 /*
  * Remove pseudo elements created by micro clearfix as precaution
  */

 .flex::before,
 .flex::after,
 .flex-inline::before,
 .flex-inline::after { display: none; }


 /* Alignment
  ========================================================================== */

 /*
  * Align items along the main axis of the current line of the flex container
  * Row: Horizontal
  */

 // Default
 .flex-left { justify-content: flex-start; }
 .flex-center { justify-content: center; }
 .flex-right { justify-content: flex-end; }
 .flex-between { justify-content: space-between; }
 .flex-around { justify-content: space-around; }


 /*
  * Align items in the cross axis of the current line of the flex container
  * Row: Vertical
  */

 // Default
 .flex-stretch { align-items: stretch; }
 .flex-top { align-items: flex-start; }
 .flex-middle { align-items: center; }
 .flex-bottom { align-items: flex-end; }


 /* Direction
  ========================================================================== */

 // Default
 .flex-row { flex-direction: row; }
 .flex-row-reverse { flex-direction: row-reverse; }
 .flex-column { flex-direction: column; }
 .flex-column-reverse { flex-direction: column-reverse; }


 /* Wrap
  ========================================================================== */

 // Default
 .flex-nowrap { flex-wrap: nowrap; }
 .flex-wrap { flex-wrap: wrap; }
 .flex-wrap-reverse { flex-wrap: wrap-reverse; }

 /*
  * Aligns items within the flex container when there is extra space in the cross-axis
  * Only works if there is more than one line of flex items
  */

 // Default
 .flex-wrap-stretch { align-content: stretch; }
 .flex-wrap-top { align-content: flex-start; }
 .flex-wrap-middle { align-content: center; }
 .flex-wrap-bottom { align-content: flex-end; }
 .flex-wrap-between { align-content: space-between; }
 .flex-wrap-around { align-content: space-around; }


 /* Item ordering
  ========================================================================== */

 /*
  * Default is 0
  */

 .flex-first { order: -1;}
 .flex-last { order: 99;}


 /* Item dimensions
  ========================================================================== */

 /*
  * Initial: 0 1 auto
  * Content dimensions, but shrinks
  */

 /*
  * No Flex: 0 0 auto
  * Content dimensions
  */

 .flex-none { flex: none; }

 /*
  * Relative Flex: 1 1 auto
  * Space is allocated considering content
  */

 .flex-auto { flex: auto; }

 /*
  * Absolute Flex: 1 1 0%
  * Space is allocated solely based on flex
  */

 .flex-1 { flex: 1; }

```

## 可视化 Flex 工具

[flexyboxes](https://the-echoplex.net/flexyboxes/)