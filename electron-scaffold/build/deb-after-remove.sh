#!/bin/bash
# deb 包卸载后脚本
# 清理桌面快捷方式和配置

set -e

APP_NAME="zhike"
APP_DISPLAY_NAME="Zhike"

# 删除 .desktop 文件
if [ -f /usr/share/applications/${APP_NAME}.desktop ]; then
    rm -f /usr/share/applications/${APP_NAME}.desktop
fi

# 更新桌面数据库
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications || true
fi

# 删除用户配置（可选，保留用户数据）
# rm -rf ~/.config/${APP_NAME}

echo "${APP_DISPLAY_NAME} has been removed."
