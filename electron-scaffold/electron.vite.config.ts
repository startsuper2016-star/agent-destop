import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

/**
 * Electron Vite 配置文件
 * 分别构建三个进程：主进程(main)、预加载脚本(preload)、渲染进程(renderer)
 */
export default defineConfig({
  // 主进程(Node.js)配置
  main: {},
  // 预加载脚本配置
  preload: {},
  // 渲染进程(React前端)配置
  renderer: {
    resolve: {
      alias: {
        // 路径别名：@renderer 指向 src/renderer/src，方便导入组件
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]  // 使用 React 插件处理 JSX
  }
})
