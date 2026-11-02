---
version: alpha
name: Stay Key
description: 本地密码库的侧栏界面。中性灰承担表面和文字，青绿色只用于主要操作。
colors:
  background: "#ffffff"
  background-dark: "#0a0a0a"
  foreground: "#0a0a0a"
  foreground-dark: "#fafafa"
  card: "#ffffff"
  card-dark: "#171717"
  card-foreground: "#0a0a0a"
  card-foreground-dark: "#fafafa"
  popover: "#ffffff"
  popover-dark: "#171717"
  popover-foreground: "#0a0a0a"
  popover-foreground-dark: "#fafafa"
  primary: "#1aabb8"
  primary-dark: "#28d2e5"
  primary-ink: "#0b6f79"
  primary-ink-dark: "#28d2e5"
  band: "#f6f6f6"
  band-dark: "#151515"
  segment-thumb: "#ffffff"
  segment-thumb-dark: "#3a3a3a"
  primary-foreground: "#171717"
  primary-foreground-dark: "#171717"
  secondary: "#f5f5f5"
  secondary-dark: "#262626"
  secondary-foreground: "#171717"
  secondary-foreground-dark: "#fafafa"
  muted: "#f5f5f5"
  muted-dark: "#262626"
  muted-foreground: "#6e6e6e"
  muted-foreground-dark: "#a1a1a1"
  accent: "#f5f5f5"
  accent-dark: "#262626"
  accent-foreground: "#171717"
  accent-foreground-dark: "#fafafa"
  destructive: "#e7000b"
  destructive-dark: "#ff6467"
  border: "#e5e5e5"
  border-dark: "#ffffff1a"
  input: "#8a8a8a"
  input-dark: "#6f6f6f"
  ring: "#0e7683"
  ring-dark: "#28d2e5"
  chart-1: "#d4d4d4"
  chart-1-dark: "#d4d4d4"
  chart-2: "#737373"
  chart-2-dark: "#737373"
  chart-3: "#525252"
  chart-3-dark: "#525252"
  chart-4: "#404040"
  chart-4-dark: "#404040"
  chart-5: "#262626"
  chart-5-dark: "#262626"
  sidebar: "#fafafa"
  sidebar-dark: "#171717"
  sidebar-foreground: "#0a0a0a"
  sidebar-foreground-dark: "#fafafa"
  sidebar-primary: "#1aabb8"
  sidebar-primary-dark: "#28d2e5"
  sidebar-primary-foreground: "#171717"
  sidebar-primary-foreground-dark: "#171717"
  sidebar-accent: "#f5f5f5"
  sidebar-accent-dark: "#262626"
  sidebar-accent-foreground: "#171717"
  sidebar-accent-foreground-dark: "#fafafa"
  sidebar-border: "#e5e5e5"
  sidebar-border-dark: "#ffffff1a"
  sidebar-ring: "#a1a1a1"
  sidebar-ring-dark: "#737373"
typography:
  body-md:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5rem
  body-sm:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  label-md:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.25rem
  caption:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1rem
  label-sm:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1rem
  card-title:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.375rem
  button-sm:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: 0.8rem
    fontWeight: 500
rounded:
  sm: 0.375rem
  md: 0.5rem
  lg: 0.625rem
  xl: 0.875rem
  "2xl": 1.125rem
  "3xl": 1.375rem
  "4xl": 1.625rem
spacing:
  "0.5": 0.125rem
  "1": 0.25rem
  "1.5": 0.375rem
  "2": 0.5rem
  "2.5": 0.625rem
  "3": 0.75rem
  "4": 1rem
  "8": 2rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 2rem
    padding: 0.625rem
  button-primary-hover:
    backgroundColor: "#1aabb8cc"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 2rem
    padding: 0.625rem
  button-secondary-hover:
    backgroundColor: "#e7e7e7"
    textColor: "{colors.secondary-foreground}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 2rem
    padding: 0.625rem
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 2rem
    padding: 0.625rem
  button-destructive:
    backgroundColor: "#e7000b1a"
    textColor: "{colors.destructive}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 2rem
    padding: 0.625rem
  button-link:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
  input:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: 2rem
    padding: 0.625rem
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.4xl}"
    height: 1.25rem
    padding: 0.5rem
  alert:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 0.625rem
  alert-destructive:
    backgroundColor: "{colors.card}"
    textColor: "{colors.destructive}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 0.625rem
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: 1rem
  checkbox:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: 0.25rem
    height: 1rem
    width: 1rem
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: 0.25rem
    height: 1rem
    width: 1rem
  tooltip:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: 0.75rem
---

# Stay Key

## Overview

Stay Key 给同一个人用：在这台电脑上保存账号、密码和其他机密，并在需要时生成随机密码。界面是浏览器扩展的侧栏，一次只处理一条记录或一个操作。

性格安静、中性、密度偏紧。表面和文字用中性灰，青绿色只留给主要操作。圆角小，控件高 2rem，侧栏内边距 1rem。深色值挂在 `html[data-theme="dark"]` 上；设置里可以切浅色、深色、跟随系统。

## Colors

颜色写在 `src/index.css`，用 HEX。带透明度的深色边框和输入框边线用八位 HEX。下面的对比按这些 HEX 用相对亮度公式算出，不是整页符合性结论。正文目标是 4.5:1，大字是 3:1。同一屏只有一个 primary 操作。成功和警告没有颜色角色，提示靠图标和文案。

- **background** (#ffffff): 页面底。侧栏正文放在这层上面。
- **foreground** (#0a0a0a): 正文和标题。在 background 上约 19.80:1。
- **card** (#ffffff): 卡片和默认提示的表面。浅色下与页面同色，靠细环分开。
- **card-foreground** (#0a0a0a): 卡片上的文字。
- **band** (#f6f6f6): 当前站点条的底，比页面低半档。深色 #151515。
- **popover** (#ffffff): 下拉菜单和选择浮层。
- **popover-foreground** (#0a0a0a): 浮层上的文字。
- **primary** (#1aabb8): 主要操作、选中的复选框和开关。浅色下与 primary-foreground 约 6.46:1。
- **primary-ink** (#0b6f79): 青绿用来写字时用这一支，例如 link。白底约 5.4:1。primary 本身不足 4.5:1，不用来写字。深色为 #28d2e5。
- **primary-foreground** (#171717): primary 表面上的文字和图标。深色 primary 上约 9.77:1。primary 降到 80% 后，叠在白色上约 7.93:1，叠在深色页面上约 6.42:1。
- **secondary** (#f5f5f5): 次要按钮和安静的表面。
- **secondary-foreground** (#171717): 次要表面上的文字。在 secondary 上约 16.44:1。
- **segment-thumb** (#ffffff): 分段控件的选中块。深色 #3a3a3a。
- **muted** (#f5f5f5): 标签页轨道和卡片页脚这类安静区域。
- **muted-foreground** (#6e6e6e): 次要文字和占位符。在 background 上约 5.10:1，在 muted 上约 4.80:1。旧值 #737373 在 muted 上只有约 4.35:1，所以当时的规范不许把它放在 muted 底上；现在说明块可以用了。
- **accent** (#f5f5f5): 菜单和列表行的悬停、选中。
- **accent-foreground** (#171717): accent 行上的文字。
- **destructive** (#e7000b): 删除和校验错误，必须同时有文字或图标。实色在 background 上约 4.77:1。按钮用的 10% 底约 4.01:1，悬停 20% 底约 3.31:1，都低于正文 4.5:1。
- **border** (#e5e5e5): 区域之间的分隔。在 background 上约 1.26:1，只作边界，不当文字。
- **input** (#8a8a8a): 输入框、选择框和复选框的边线。字段边线要 3:1，在 background 上约 3.45:1。旧值 #e5e5e5 约 1.26:1，只够当分隔线。
- **ring** (#0e7683): 焦点环的颜色，青绿压深一档。在 background 上约 5.4:1，环是实色 2px，不再叠透明度。
- **chart-1** (#d4d4d4): 图表系列里最浅的一档。在 background 上约 1.48:1，不能单独当系列标记。
- **chart-2** (#737373): 图表系列的第二档。
- **chart-3** (#525252): 图表系列的第三档。
- **chart-4** (#404040): 图表系列的第四档。
- **chart-5** (#262626): 图表系列里最深的一档。在 background 上约 15.13:1，在深色页面上约 1.31:1。
- **sidebar** (#fafafa): 预留的侧栏分区底。当前侧栏页面没有使用这组变量。
- **sidebar-foreground** (#0a0a0a): 预留侧栏分区上的文字。在 sidebar 上约 18.97:1。
- **sidebar-primary** (#1aabb8): 预留侧栏分区里的主要操作，与 primary 同色。
- **sidebar-primary-foreground** (#171717): 预留侧栏主要操作上的文字。
- **sidebar-accent** (#f5f5f5): 预留侧栏分区里的悬停行。
- **sidebar-accent-foreground** (#171717): 预留侧栏悬停行上的文字。
- **sidebar-border** (#e5e5e5): 预留侧栏分区的分隔线。
- **sidebar-ring** (#a1a1a1): 预留侧栏分区的焦点色。

名称以 `-dark` 结尾的是同一角色在 `:root[data-theme="dark"]`（也就是 `html[data-theme="dark"]`）下的颜色，不用 `.dark` 类。深色页面是 #0a0a0a，卡片和浮层是 #171717，次级表面是 #262626。primary 改为 #28d2e5，destructive 改为 #ff6467。border 是 #ffffff1a，也就是 10% 白；input 是 #6f6f6f，压在 #0a0a0a 上约 3.9:1。图表五档在两种模式下相同。深色 destructive 在深色页面上约 6.85:1；按钮静止态用 20% 底，约 5.31:1，悬停 30% 底约 4.35:1。深色 muted-foreground 在深色页面上约 7.66:1，在深色 muted 上约 5.86:1。

## Typography

全文用 Geist Variable。正文 400，按钮、标签、卡片标题和徽章 500。没有单独的展示字号。侧栏标题是 `h1`。Tailwind 预检把标题重置为继承字号和字重，所以它现在是 1rem、400，颜色是 foreground。页面上还没有单独的标题字号。

- **body-md:** Geist Variable, 400, 1rem。窄宽度下的输入框使用这一档。
- **body-sm:** Geist Variable, 400, 0.875rem。卡片说明、提示正文和标签页内容使用这一档。
- **label-md:** Geist Variable, 500, 0.875rem。默认按钮、标签和标签页触发器使用这一档。
- **caption:** Geist Variable, 400, 0.75rem。工具提示使用这一档。
- **label-sm:** Geist Variable, 500, 0.75rem。徽章和菜单分组标题使用这一档。
- **card-title:** Geist Variable, 500, 1rem，行高 1.375rem。
- **button-sm:** Geist Variable, 500, 0.8rem。这是小按钮的字号，不在上面的整数档上。

宽度达到 48rem 时，输入框和多行输入从 body-md 改为 body-sm。侧栏通常窄于 48rem，所以里面的输入框保持 1rem。

## Layout

侧栏是单列。`main` 的内边距是 16px，长度与间距 4 相同。相关控件用 1.5（0.375rem），菜单内边距用 1（0.25rem），区块和卡片用 4（1rem）。小卡片用 3（0.75rem）。默认控件高 2rem，也就是间距 8。

间距键是 Tailwind 的步进，每步 0.25rem。375px 和 1280px 都不加第二列：宽屏只是同一列留在左侧，内容不拉成仪表盘。

## Elevation & Depth

卡片靠 1px 的 foreground 10% 环，不用阴影。当前站点条用 band，不用卡片环和阴影。默认标签页的当前项用 shadow-sm。下拉菜单和选择浮层用 shadow-md，再加同一条细环，叠在 z-index 50。工具提示没有阴影，用 foreground 填充、background 文字，也在 z-index 50。分段控件的选中块靠 segment-thumb 的表面明度区分，不靠阴影堆叠。

- **shadow-sm:** 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)。用于当前标签。
- **shadow-md:** 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)。用于菜单和选择浮层。

按钮按下时下移 1px，不改阴影。禁用是 50% 透明度。深色里用表面明度和半透明白边分开层次，不靠更重的阴影。

## Shapes

基准圆角是 0.625rem，也就是 lg。sm、md、xl、2xl、3xl、4xl 分别是基准的 0.6、0.8、1.4、1.8、2.2、2.6 倍。按钮、输入框、提示和菜单用 lg。按钮的 xs、sm、默认和 lg 都用这一档，不随尺寸改圆角。卡片用 xl。徽章用 4xl。标签页触发器用 md。

复选框是 4px，不在这条刻度上，只用于这个控件。开关是胶囊形。线型标签页没有圆角。

## Components

组件读上面的颜色角色。primary 按钮是主操作。secondary 是更轻的操作。outline 用 background 填充和 border 边线。ghost 默认透明，悬停用 muted。link 只用 primary-ink 文字和下划线。

- **Buttons:** primary 填充 primary，文字 primary-foreground，悬停把 primary 降到 80%（#1aabb8cc）。secondary 悬停在浅色是 #e7e7e7，在深色是 #2f2f2f，由 secondary 与 foreground 在 OKLCH 里按 5% 混合得到。destructive 用 destructive 的 10% 作为底、destructive 作为字。默认高 2rem，左右内边距 0.625rem，圆角 lg。xs、sm、lg 的高度是 1.5rem、1.75rem、2.25rem，圆角仍是 lg。图标按钮是正方形，默认边长 2rem。
- **Inputs:** 浅色填充透明，文字 foreground，边线 input，占位符 muted-foreground。圆角 lg，高 2rem，左右内边距 0.625rem。焦点环是实色 2px、不渐入，画在边线内侧。无效时边线和焦点环改用 destructive。深色填充是 input 的 30%。
- **分段控件:** 轨道用 secondary，选中块用 segment-thumb。
- **主密码:** 六个分开的输入框，焦点环逐格绘制，不把整组画成一圈。
- **Badge:** 默认用 primary 和 primary-foreground，高 1.25rem，圆角 4xl，字号 label-sm。
- **Alert:** 默认用 card。destructive 变体仍用 card 作底，标题和说明改用 destructive，并配图标或句子。
- **Card:** 表面 card，文字 card-foreground，圆角 xl，内边距 1rem。小卡片内边距 0.75rem。标题用 card-title，说明用 body-sm 和 muted-foreground。
- **Checkbox:** 边长 1rem，圆角 4px，未选中边线 input。选中后填充 primary，勾用 primary-foreground。
- **Tooltip:** 填充 foreground，文字 background，字号 caption，圆角 md。

## Do's and Don'ts

- 主要操作只用 primary。同一屏只放一个 primary 按钮。
- 表面、正文和分隔用中性灰。品牌色只保留 primary 这一支青绿色。
- 主题色写 HEX。深色边框和输入框边线保留八位 HEX，不要改回 OKLCH。
- destructive 必须配文字或图标。不要只靠红色表示删除或错误。
- 说明块上的次要文字用 muted-foreground，浅色这对现在约 4.80:1。
- 不要把 input、ring、muted-foreground、primary-ink 改回旧值。改回去会重新跌破边线 3:1 或正文 4.5:1。
- 不要把 destructive 的 10% 或 20% 浅色底当成已经达到正文对比。它们约 4.01:1 和 3.31:1。
- 成功和警告继续用图标和文案。出现需要上色的状态之前，不要新增 success 或 warning。
- 图表灰阶不随主题变化。不要把 chart 色当正文，也不要只靠这五档区分系列。
- 圆角走 rounded 刻度。复选框的 4px 不要推广到按钮和输入框。
- 深色值只在 `html[data-theme="dark"]` 时生效。设置里可以切浅色、深色、跟随系统。不要使用 `.dark` 类。
- 这些约束还待产品确认。
