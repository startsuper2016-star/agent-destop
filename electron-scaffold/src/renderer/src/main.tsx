import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * 渲染进程入口文件
 * 作用：挂载 React 应用到 DOM，启动前端界面
 * 注意：此文件运行在 Chromium 渲染进程中，无法直接访问 Node.js API
 * 如需与主进程通信，请使用 window.electron 或 window.api(在预加载脚本中暴露)
 */

// 获取 root 容器并创建 React 根节点
// '!' 是非空断言，告诉 TypeScript 该元素一定存在
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* StrictMode 用于检测潜在问题(仅在开发模式下生效) */}
    <App />
  </React.StrictMode>
)
