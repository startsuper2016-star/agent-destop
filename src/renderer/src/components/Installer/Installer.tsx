import { useState, useEffect, useCallback } from 'react'
import './Installer.css'

type Page = 'welcome' | 'license' | 'path' | 'installing' | 'finish'

export default function Installer() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome')
  const [agreed, setAgreed] = useState(false)
  const [installPath, setInstallPath] = useState('C:\\Program Files (x86)\\easyclaw')
  const [progress, setProgress] = useState(0)
  const [runAfterInstall, setRunAfterInstall] = useState(true)

  // 模拟安装进度
  useEffect(() => {
    if (currentPage === 'installing') {
      setProgress(0)
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            setTimeout(() => setCurrentPage('finish'), 300)
            return 100
          }
          // 随机增量，模拟真实安装
          const increment = Math.random() * 8 + 2
          return Math.min(prev + increment, 100)
        })
      }, 200)
      return () => clearInterval(timer)
    }
    return undefined
  }, [currentPage])

  const handleNext = useCallback(() => {
    const pageOrder: Page[] = ['welcome', 'license', 'path', 'installing', 'finish']
    const currentIndex = pageOrder.indexOf(currentPage)
    if (currentIndex < pageOrder.length - 1) {
      setCurrentPage(pageOrder[currentIndex + 1])
    }
  }, [currentPage])

  const handleBack = useCallback(() => {
    const pageOrder: Page[] = ['welcome', 'license', 'path', 'installing', 'finish']
    const currentIndex = pageOrder.indexOf(currentPage)
    if (currentIndex > 0) {
      setCurrentPage(pageOrder[currentIndex - 1])
    }
  }, [currentPage])

  const handleInstall = useCallback(() => {
    setCurrentPage('installing')
  }, [])

  const handleFinish = useCallback(() => {
    window.close()
  }, [])

  const handleCancel = useCallback(() => {
    if (confirm('确定要取消安装吗？')) {
      window.close()
    }
  }, [])

  const handleBrowse = useCallback(() => {
    // 模拟浏览文件夹
    const paths = [
      'C:\\Program Files\\easyclaw',
      'D:\\easyclaw',
      'C:\\Users\\Admin\\AppData\\Local\\easyclaw',
    ]
    const randomPath = paths[Math.floor(Math.random() * paths.length)]
    setInstallPath(randomPath)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return (
          <div className="page-content">
            <div className="top-right-logo">🦞</div>
            <div className="page-title">欢迎使用 EasyClawCN</div>
            <div className="page-subtitle">
              本向导将指导您完成 EasyClawCN 的安装过程。<br />
              建议您在继续之前关闭其他所有应用程序。<br />
              单击“下一步”继续，或单击“取消”退出安装向导。
            </div>
          </div>
        )

      case 'license':
        return (
          <div className="page-content">
            <div className="top-right-logo">🦞</div>
            <div className="page-title">欢迎使用 EasyClawCN，请先了解相关条款</div>
            <div className="page-subtitle">
              在开始安装之前，请阅读并确认以下协议，以便我们为您提供更好的服务。
            </div>
            <div className="license-box">
              <p>1. 最终用户许可协议（EULA），完整内容请访问：</p>
              <p>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  https://www.easyclaw.cn/privacy/easyclaw-license-cn.html
                </a>
              </p>
              <p>2. 隐私政策，完整内容请访问：</p>
              <p>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  https://www.easyclaw.cn/privacy/easyclaw-dl-privacy.html
                </a>
              </p>
              <p>请在继续安装前查阅以上文件。</p>
            </div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="agree">我已经阅读并同意《用户协议》与《隐私政策》</label>
            </div>
          </div>
        )

      case 'path':
        return (
          <div className="page-content">
            <div className="top-right-logo">🦞</div>
            <div className="page-title">选定安装位置</div>
            <div className="page-subtitle">
              选定 EasyClawCN 要安装的文件夹。
            </div>
            <div style={{ marginTop: 20, fontSize: 13, lineHeight: 1.6 }}>
              Setup 将安装 EasyClawCN 在下列文件夹。要安装到不同文件夹，单击 [浏览(B)...]
              并选择其他的文件夹。单击 [安装(I)] 开始安装进程。
            </div>
            <div className="path-section">
              <div className="path-label">目标文件夹</div>
              <div className="path-input-row">
                <input
                  type="text"
                  className="path-input"
                  value={installPath}
                  onChange={(e) => setInstallPath(e.target.value)}
                />
                <button className="browse-btn" onClick={handleBrowse}>
                  浏览(<span className="shortcut">B</span>)...
                </button>
              </div>
              <div className="space-info">
                <div><span className="label">所需空间：</span>784.1 MB</div>
                <div><span className="label">可用空间：</span>300.2 GB</div>
              </div>
            </div>
          </div>
        )

      case 'installing':
        return (
          <div className="page-content">
            <div className="top-right-logo">🦞</div>
            <div className="page-title">正在安装</div>
            <div className="page-subtitle">
              EasyClawCN 正在安装，请等候。
            </div>
            <div className="progress-section">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-text">
                {progress < 100 ? `正在安装... ${Math.floor(progress)}%` : '安装完成！'}
              </div>
            </div>
          </div>
        )

      case 'finish':
        return (
          <div className="page-content">
            <div className="page-title">正在完成 EasyClawCN 安装向导</div>
            <div className="page-subtitle" style={{ marginTop: 20 }}>
              EasyClawCN 已安装在你的系统。<br />
              单击 [完成(F)] 关闭此向导。
            </div>
            <div className="finish-content">
              <div className="checkbox-row" style={{ marginTop: 40 }}>
                <input
                  type="checkbox"
                  id="run"
                  checked={runAfterInstall}
                  onChange={(e) => setRunAfterInstall(e.target.checked)}
                />
                <label htmlFor="run">运行 EasyClawCN(<span className="shortcut">R</span>)</label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderButtons = () => {
    switch (currentPage) {
      case 'welcome':
        return (
          <>
            <div className="version-info">EasyClawCN 1.3.40</div>
            <button className="btn" onClick={handleCancel}>取消(<span className="shortcut">C</span>)</button>
            <button className="btn primary" onClick={handleNext}>
              下一步(<span className="shortcut">N</span>) &gt;
            </button>
          </>
        )
      case 'license':
        return (
          <>
            <div className="version-info">EasyClawCN 1.3.40</div>
            <button className="btn" onClick={handleCancel}>取消(<span className="shortcut">C</span>)</button>
            <button className="btn" onClick={handleBack}>
              &lt; 上一步(<span className="shortcut">P</span>)
            </button>
            <button
              className="btn primary"
              onClick={handleNext}
              disabled={!agreed}
            >
              下一步(<span className="shortcut">N</span>) &gt;
            </button>
          </>
        )
      case 'path':
        return (
          <>
            <div className="version-info">EasyClawCN 1.3.40</div>
            <button className="btn" onClick={handleCancel}>取消(<span className="shortcut">C</span>)</button>
            <button className="btn" onClick={handleBack}>
              &lt; 上一步(<span className="shortcut">P</span>)
            </button>
            <button className="btn primary" onClick={handleInstall}>
              安装(<span className="shortcut">I</span>)
            </button>
          </>
        )
      case 'installing':
        return (
          <>
            <div className="version-info">EasyClawCN 1.3.40</div>
            <button className="btn" disabled>
              &lt; 上一步(<span className="shortcut">P</span>)
            </button>
            <button className="btn" disabled>
              下一步(<span className="shortcut">N</span>) &gt;
            </button>
            <button className="btn" onClick={handleCancel}>取消(<span className="shortcut">C</span>)</button>
          </>
        )
      case 'finish':
        return (
          <>
            <div className="version-info">EasyClawCN 1.3.40</div>
            <button className="btn" onClick={handleBack}>
              &lt; 上一步(<span className="shortcut">P</span>)
            </button>
            <button className="btn primary" onClick={handleFinish}>
              完成(<span className="shortcut">F</span>)
            </button>
            <button className="btn" onClick={handleCancel}>取消(<span className="shortcut">C</span>)</button>
          </>
        )
    }
  }

  return (
    <div className="installer-window">
      {/* 标题栏 */}
      <div className="title-bar">
        <div className="title-left">
          <div className="title-icon">🦞</div>
          <span className="title-text">EasyClawCN 安装</span>
        </div>
        <div className="title-buttons">
          <button className="title-btn">−</button>
          <button className="title-btn">□</button>
          <button className="title-btn close">×</button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="main-content">
        {/* 左侧边栏 - 只在部分页面显示 */}
        {(currentPage === 'welcome' || currentPage === 'finish') && (
          <div className="left-sidebar">
            <div className="logo-container">
              <div className="logo-icon">🦞</div>
              <div className="logo-text">
                Easy<span>Claw</span> cn
              </div>
            </div>
          </div>
        )}

        {/* 右侧内容 */}
        <div className="right-content" style={{
          width: (currentPage === 'welcome' || currentPage === 'finish') ? undefined : '100%'
        }}>
          {renderPage()}
        </div>
      </div>

      {/* 底部按钮栏 */}
      <div className="bottom-bar">
        {renderButtons()}
      </div>
    </div>
  )
}
