; NSIS 自定义安装向导脚本
; electron-builder 会自动调用以下预定义宏

; ============================================
; 初始化
; ============================================
!macro customInit
  InitPluginsDir
!macroend

; ============================================
; 欢迎页面
; ============================================
!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "欢迎使用 Zhike"
  !define MUI_WELCOMEPAGE_TEXT "本向导将引导您完成 Zhike 的安装。$\r$\n$\r$\n建议在继续之前关闭所有其他应用程序。单击“下一步”继续，或单击“取消”退出安装向导。"
  !insertmacro MUI_PAGE_WELCOME
!macroend

; ============================================
; 许可证页面配置 - 在 electron-builder 自动生成 licensePage 宏之前定义
; ============================================
!define MUI_LICENSEPAGE_TEXT_TOP "欢迎使用 Zhike，请先了解相关条款"
!define MUI_LICENSEPAGE_TEXT_BOTTOM "在安装 Zhike 之前，请阅读并确认以下协议。如果你接受协议中的条款，请勾选下方复选框并单击 [下一步] 继续安装。"
!define MUI_LICENSEPAGE_CHECKBOX
!define MUI_LICENSEPAGE_CHECKBOX_TEXT "我已经阅读并同意《用户协议》与《隐私政策》(&A)"

; ============================================
; 安装目录页面
; ============================================
!macro customDirectoryPage
  !define MUI_DIRECTORYPAGE_TEXT_TOP "选择安装位置。选择要将 Zhike 安装到的文件夹。"
  !define MUI_DIRECTORYPAGE_TEXT_DESTINATION "目标文件夹"
  !insertmacro MUI_PAGE_DIRECTORY
!macroend

; ============================================
; 安装进度页面
; ============================================
!macro customInstallPage
  !define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "正在安装"
  !define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "正在安装 Zhike，请稍候。"
  !define MUI_INSTFILESPAGE_ABORTHEADER_TEXT "安装已取消"
  !define MUI_INSTFILESPAGE_ABORTHEADER_SUBTEXT "安装向导已被中断。"
  !insertmacro MUI_PAGE_INSTFILES
!macroend

; ============================================
; 完成页面
; ============================================
!macro customFinishPage
  !define MUI_FINISHPAGE_TITLE "完成 Zhike 安装向导"
  !define MUI_FINISHPAGE_TEXT "Zhike 已安装到您的系统中。单击 [完成] 关闭此向导。"
  !define MUI_FINISHPAGE_RUN "$INSTDIR\\Zhike.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "运行 Zhike(&R)"
  !define MUI_FINISHPAGE_RUN_CHECKED
  !insertmacro MUI_PAGE_FINISH
!macroend

; ============================================
; 卸载页面
; ============================================
!macro customUnWelcomePage
  !define MUI_UNWELCOMEPAGE_TITLE "卸载 Zhike"
  !define MUI_UNWELCOMEPAGE_TEXT "本向导将引导您完成 Zhike 的卸载。单击“下一步”继续，或单击“取消”退出卸载向导。"
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

!macro customUnConfirmPage
  !insertmacro MUI_UNPAGE_CONFIRM
!macroend

!macro customUnInstFilesPage
  !insertmacro MUI_UNPAGE_INSTFILES
!macroend

!macro customUnFinishPage
  !insertmacro MUI_UNPAGE_FINISH
!macroend

; ============================================
; 自定义安装逻辑
; ============================================
!macro customInstall
  WriteRegStr HKCU "Software\\Zhike" "Version" "${VERSION}"
!macroend

; ============================================
; 自定义卸载逻辑
; ============================================
!macro customUnInstall
  DeleteRegKey HKCU "Software\\Zhike"
!macroend
