@echo off
echo ===================================================
echo        组织架构设计工具 - 安装程序
echo ===================================================
echo.

:: 检查 Python 是否已安装
echo 正在检查 Python 安装...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python 未安装！请先安装 Python 3.7 或更高版本。
    echo 您可以从 https://www.python.org/downloads/ 下载 Python。
    echo 安装时请勾选"Add Python to PATH"选项。
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

:: 检查 Python 版本
for /f "tokens=2" %%a in ('python --version 2^>^&1') do set PYTHON_VERSION=%%a
echo 检测到 Python 版本: %PYTHON_VERSION%

:: 创建虚拟环境
echo.
echo 正在创建虚拟环境...
python -m venv venv
if %errorlevel% neq 0 (
    echo 创建虚拟环境失败！
    echo 请确保您有权限在当前目录创建文件，并且已安装 venv 模块。
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

:: 激活虚拟环境
echo 正在激活虚拟环境...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo 激活虚拟环境失败！
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

:: 安装依赖
echo.
echo 正在安装必要的依赖...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo 安装依赖失败！
    echo 请检查您的网络连接，或尝试手动安装依赖。
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

:: 创建数据目录
echo.
echo 正在创建数据目录...
if not exist data mkdir data

:: 创建示例目录
if not exist examples mkdir examples

:: 安装完成
echo.
echo ===================================================
echo        安装完成！
echo ===================================================
echo.
echo 您现在可以运行 start.bat 启动应用。
echo.
echo 按任意键退出...
pause >nul 