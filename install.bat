@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo        组织架构设计工具 - 安装程序
echo ===================================================
echo.

echo 正在检查 Python 环境...

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python 未安装，请先安装 Python 3.7 或更高版本
    echo 您可以从 https://www.python.org/downloads/ 下载安装
    echo 安装时请勾选"Add Python to PATH"选项。
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

python -c "import sys; sys.exit(0) if sys.version_info >= (3,7) else sys.exit(1)"
if %errorlevel% neq 0 (
    echo Python 版本过低，请安装 Python 3.7 或更高版本
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

echo 正在检查 pip...
python -m pip --version >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在安装 pip...
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python get-pip.py
    del get-pip.py
)

echo 正在创建虚拟环境...
python -m venv venv
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo 创建虚拟环境失败！
    echo 请确保您有权限在当前目录创建文件，并且已安装 venv 模块。
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

:: 安装依赖
echo.
echo 正在安装必要的依赖...
python -m pip install --upgrade pip
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
echo 使用说明：
echo 1. 双击 start.bat 启动应用
echo 2. 浏览器将自动打开应用页面
echo 3. 按照用户指南准备并导入数据
echo.
echo 如有问题，请参考用户指南或提交 Issue
echo.

echo.
echo 按任意键退出...
pause >nul 