#!/bin/bash
# deb 包安装后脚本
# 创建桌面快捷方式和图标

set -e

APP_NAME="zhike"
APP_DISPLAY_NAME="Zhike"
INSTALL_DIR="/usr/share/${APP_NAME}"

# 创建 .desktop 文件
cat > /usr/share/applications/${APP_NAME}.desktop << EOF
[Desktop Entry]
Name=${APP_DISPLAY_NAME}
Comment=Skill Management and Agent Desktop Application
Exec=${INSTALL_DIR}/${APP_NAME} %U
Icon=${APP_NAME}
Type=Application
Categories=Utility;Productivity;
StartupNotify=true
StartupWMClass=Zhike
MimeType=x-scheme-handler/zhike;
EOF

# 更新桌面数据库
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications || true
fi

# 注册 MIME 类型
if command -v xdg-mime >/dev/null 2>&1; then
    xdg-mime default ${APP_NAME}.desktop x-scheme-handler/zhike || true
fi

echo "${APP_DISPLAY_NAME} has been installed successfully."
echo "You can find it in your applications menu."
