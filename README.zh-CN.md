# Stay Key

[English](README.md) | 简体中文

Stay Key 是一个本地优先的 Chrome 密码库，运行在浏览器侧边栏中，站点账号和密码只保存在本机——没有账号体系，没有云同步，也没有遥测。

扩展界面目前为简体中文。

## 功能

- **侧边栏保险库**——点击工具栏图标或按 `Ctrl+Shift+Y`（macOS 为 `Command+Shift+Y`）在页面旁打开保险库。
- **当前站点**——读取当前标签页的主机名，列出匹配的条目（含父域和子域匹配）。本站还没有条目时，可以直接新建并预填当前站点。
- **模糊搜索**——按站点、账号或标签搜索，结果按站点排序。
- **条目管理**——新建、编辑、删除条目，字段包括站点、账号、密码和标签。
- **列表打码**——列表中的账号会部分打码，密码不会在列表中渲染。
- **一键复制**——复制任意条目的账号或密码。默认 30 秒后清除剪贴板（可选 15、30、60 秒），仅当复制的内容仍在剪贴板时才清除。
- **两种解锁方式**——6 位数字主密码，或设置时自己编写的提示问题与答案。通过答案找回后需要设置新的主密码。
- **失败冷却**——主密码或提示问题答案各自连续失败 5 次后，冷却 30 分钟。
- **自动锁定**——空闲 1、2、5、15 或 30 分钟后自动锁定（默认 2 分钟）；系统锁屏会立即清除解锁会话。
- **主题**——浅色、深色或跟随系统。

首次启动时，Stay Key 会引导你设置 6 位数字主密码和提示问题，然后在本机创建加密保险库。

## 安全模型

Stay Key 的目标是足够小、便于审查，并让机密不经过网络。它不是硬件级密码管理器的替代品，下面的限制也是设计的一部分。

### 加密

- 保险库是 `chrome.storage.local` 中的一条 `stay-key.vault` 记录。条目数据经过加密；盐、提示问题、失败计数和设置与密文存放在同一条记录中。
- 随机生成的 AES-256-GCM 数据加密密钥（DEK）用于加密条目数据。
- DEK 会被包装两份，分别对应两条解锁路径：
  - 由 6 位数字主密码经 PBKDF2-SHA-256（600,000 次迭代、16 字节随机盐）派生的密钥加密密钥（KEK）包装；
  - 由提示问题答案以同样方式派生、使用独立随机盐的 KEK 包装。
- 每次 AES-GCM 加密使用随机 12 字节 IV。
- manifest 不申请 host 权限，扩展也不加载远程代码。

### 解锁会话

- 解锁成功后，DEK 的原始字节保存在 `chrome.storage.session` 中；Chrome 将其保存在内存里，并在浏览器关闭时清除。
- 手动锁定、空闲超时、系统锁屏都会清除该会话。
- Service worker 通过周期性闹钟检查空闲时间（Chrome 允许时为 30 秒一次），因此即使侧边栏收起，计时仍会继续。

### 限制

- **6 位数字主密码的熵很低。** 只有 10^6 种可能。PBKDF2 的 600,000 次迭代提高了单次猜测成本，但拿到 Chrome 配置目录的攻击者仍可离线暴力破解主密码。请把提示问题答案当作第二把钥匙，并使用真正有熵的答案。
- **不防本机失陷。** 恶意软件、能访问浏览器配置的恶意扩展，或任何使用已解锁会话的人，都可以读取保险库。
- **剪贴板清除是尽力而为。** 其他剪贴板工具可能先一步拿到内容，Chrome 在某些情况下也会阻止剪贴板访问。
- **未经过独立审计。** Stay Key 是个人项目，请先阅读源码，再决定是否存放重要账号。
- **暂无备份。** 卸载扩展会删除其本地存储，目前也没有导入或导出功能。

## 本地开发

### 环境要求

- Node.js 22.12 或更新版本
- pnpm 12.15.0（见 `packageManager`）
- Google Chrome 114 或更新版本（Side Panel API）

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

加载扩展：

1. 打开 `chrome://extensions`。
2. 开启**开发者模式**。
3. 点击**加载已解压的扩展程序**，选择 `dist/` 目录。
4. 点击 Stay Key 工具栏图标，或按 `Ctrl+Shift+Y`（macOS 为 `Command+Shift+Y`）。

CRXJS 会通过 Vite 开发服务器提供侧边栏页面，并在编辑时重新构建扩展。修改 manifest 或 background 后，请在 `chrome://extensions` 中重新加载扩展。

### 构建

```bash
pnpm build
```

生产构建输出到 `dist/`，`vite-plugin-zip-pack` 还会生成 `release/stay-key-<version>.zip`。

## 脚本

| 脚本 | 说明 |
| --- | --- |
| `pnpm dev` | 以开发模式启动 Vite 和 CRXJS |
| `pnpm build` | 用 `tsc -b` 做类型检查，构建到 `dist/`，并打包到 `release/` |
| `pnpm lint` | 对 `src/` 运行 `oxlint` 和 `oxfmt --check` |
| `pnpm lint:fix` | 对 `src/` 执行 `oxlint --fix` 和 `oxfmt --write` |
| `pnpm fmt` | 用 `oxfmt` 格式化 `src/` |
| `pnpm fmt:check` | 检查 `src/` 的格式 |

## 目录结构

```text
.
├── manifest.config.ts    Manifest V3 定义
├── public/               扩展图标
├── src/
│   ├── background/       Service worker：空闲锁定与系统锁屏处理
│   ├── sidepanel/        React 侧边栏（页面、组件、hooks）
│   ├── shared/           加密、保险库、存储、会话、搜索、剪贴板
│   ├── components/ui/    UI 基础组件
│   ├── lib/              小型共享工具
│   ├── index.css         Tailwind CSS 入口
│   └── main.tsx          侧边栏入口
└── docs/                 工程与 agent 文档
```

`@/` 在 TypeScript 和 Vite 配置中指向 `src/`。

## 权限

| 权限 | 用途 |
| --- | --- |
| `sidePanel` | 在 Chrome 侧边栏中渲染保险库 |
| `storage` | 在 `storage.local` 保存加密保险库，在 `storage.session` 保存解锁会话 |
| `alarms` | 让 service worker 通过周期性闹钟检查空闲锁定 |
| `tabs` | 读取当前标签页的主机名，用于当前站点视图 |
| `idle` | 系统锁屏时清除解锁会话 |

扩展不申请 `host_permissions`，不包含 content script，也不加载远程代码。

## 尚未实现

- 浏览器自动填充
- 云端或跨设备同步
- 导入与导出
- 密码生成
- 简体中文之外的界面语言

## 贡献

- 在 [GitHub Issues](https://github.com/chunyangqiao/stay-key/issues) 报告问题或提出需求。
- 提交前运行 `pnpm fmt` 和 `pnpm lint`。
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/)。
- 行为变化时同步更新两份 README。
- 仓库约定见 [AGENTS.md](AGENTS.md) 和 [docs/engineering/coding-conventions.md](docs/engineering/coding-conventions.md)。

## 许可证

MIT，许可证声明见 `package.json`。
