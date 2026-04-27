# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Typecheck and build for production
npm run start        # Preview production build

# Platform-specific builds
npm run build:win    # Build Windows installer (.exe)
npm run build:mac    # Build macOS installer (.dmg)
npm run build:linux  # Build Linux packages (AppImage, deb)

# Code quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run typecheck    # Run TypeScript checks for both main and renderer
```

## Architecture

Electron scaffold using **electron-vite** with React. Multi-process structure:

```
src/
├── main/        # Main process (Node.js) - window management, IPC handlers, native APIs
├── preload/     # Preload scripts - secure bridge between main and renderer
└── renderer/    # Renderer process (React) - UI code
```

### IPC Communication

| Direction | Method |
|-----------|--------|
| Main → Renderer | `mainWindow.webContents.send(channel, data)` |
| Renderer → Main (async) | `window.electron.ipcRenderer.invoke(channel)` |
| Renderer → Main (fire-and-forget) | `window.electron.ipcRenderer.send(channel)` |

**Adding new IPC API**: 1) Handler in `src/main/index.ts` → 2) Expose in `src/preload/index.ts` → 3) Type in `src/preload/index.d.ts`

### Key Files

- `electron.vite.config.ts` - Separate Vite builds for main/preload/renderer
- `electron-builder.yml` - Cross-platform packaging config
- `build/entitlements.mac.plist` - macOS sandbox entitlements

### Path Alias

`@renderer/*` → `src/renderer/src/*`

## Build Notes

- Output: `out/` directory
- Windows: needs `build/icon.ico`
- macOS: needs `build/icon.icns`
- `resources/` unpacked from ASAR

## 安全规则

- 禁止读取/修改 `.env` 文件
- 禁止读取含 "secret"、"key"、"token"、"password" 的文件
- 禁止将敏感信息 commit 到 git
- 发现硬编码凭据时标记，不使用

## 编码准则

### 1. 先思考再编码

- 明确陈述假设，不确定就问
- 多种理解时呈现选项，不静默选择
- 有更简单方案就说明，必要时反驳
- 不清楚就停止，指出困惑点

### 2. 简洁优先

- 最小代码解决问题，无推测性功能
- 单次使用代码不加抽象
- 未请求的"灵活性"不加
- 不为不可能场景写错误处理
- 200行能50行就重写

### 3. 精准修改

- 只改必须改的，只清理自己造成的
- 不"改进"相邻代码/注释/格式
- 不重构未损坏的代码
- 匹配现有风格
- 发现无关死代码就提及，不删除
- 改动造成的孤立代码要删除

### 4. 目标驱动

- 定义成功标准，循环验证
- "添加验证" → 写测试覆盖无效输入 → 通过
- "修复bug" → 写复现测试 → 通过
- "重构X" → 测试前后都通过
- 多步骤任务：陈述计划，每步设验证点