; NSIS 自定义安装向导脚本
; 实现类似截图中的多页面安装向导效果

; ============================================
; 自定义页面宏定义
; ============================================

!macro customInit
  InitPluginsDir
!macroend

; ============================================
; 安装页面顺序配置
; ============================================

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to Zhike"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of Zhike. It is recommended that you close all other applications before continuing. Click Next to continue, or Cancel to exit the setup wizard."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customLicensePage
  !define MUI_LICENSEPAGE_TEXT_TOP "Welcome to Zhike. Please review the license terms before installing."
  !define MUI_LICENSEPAGE_TEXT_BOTTOM "Please click Agree to continue installation. If you do not agree to the above terms, click Cancel to exit."
  !define MUI_LICENSEPAGE_BUTTON "I Agree(&A)"
  !insertmacro MUI_PAGE_LICENSE "build\license.txt"
!macroend

!macro customDirectoryPage
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Choose Install Location. Select the folder where Zhike will be installed."
  !define MUI_DIRECTORYPAGE_TEXT_DESTINATION "Destination Folder"
  !insertmacro MUI_PAGE_DIRECTORY
!macroend

!macro customInstallPage
  !define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Installing"
  !define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "Zhike is being installed. Please wait."
  !define MUI_INSTFILESPAGE_ABORTHEADER_TEXT "Installation Cancelled"
  !define MUI_INSTFILESPAGE_ABORTHEADER_SUBTEXT "The setup wizard was interrupted."
  !insertmacro MUI_PAGE_INSTFILES
!macroend

!macro customFinishPage
  !define MUI_FINISHPAGE_TITLE "Completing Zhike Setup Wizard"
  !define MUI_FINISHPAGE_TEXT "Zhike has been installed on your system. Click [Finish] to close this wizard."
  !define MUI_FINISHPAGE_RUN "$INSTDIR\Zhike.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Run Zhike(&R)"
  !define MUI_FINISHPAGE_RUN_CHECKED
  !insertmacro MUI_PAGE_FINISH
!macroend

; ============================================
; 卸载页面配置
; ============================================

!macro customUnWelcomePage
  !define MUI_UNWELCOMEPAGE_TITLE "Uninstall Zhike"
  !define MUI_UNWELCOMEPAGE_TEXT "This wizard will guide you through the uninstallation of Zhike. Click Next to continue, or Cancel to exit the uninstall wizard."
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
  WriteRegStr HKCU "Software\Zhike" "Version" "${VERSION}"
  WriteRegStr HKCU "Software\Zhike" "InstallPath" "$INSTDIR"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Zhike"
!macroend
