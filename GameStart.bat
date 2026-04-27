@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] 未检测到 Node.js。请先安装 Node.js ^(建议 18+^) 后重试。
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] 未检测到 npm。请确认 Node.js 已正确安装并加入 PATH。
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] 未检测到依赖，正在执行 npm install...
  npm install
  if errorlevel 1 (
    echo [ERROR] 依赖安装失败，请检查网络或 npm 配置后重试。
    pause
    exit /b 1
  )
)

echo [INFO] 正在构建并启动本地预览服务器，浏览器将打开「小游戏合集」主页。
echo [INFO] 请勿关闭本窗口；关闭后网页将无法继续加载游戏资源。
echo.

call npm run play
if errorlevel 1 (
  echo.
  echo [ERROR] 启动失败，请根据上方日志排查 ^(常见原因：端口 8000 被占用、构建失败^)。
  pause
  exit /b 1
)

pause
exit /b 0
