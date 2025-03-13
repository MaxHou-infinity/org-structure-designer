#!/bin/bash

# 组织架构设计工具安装脚本

echo "==================================================="
echo "        组织架构设计工具 - 安装程序"
echo "==================================================="
echo

echo "正在检查 Python 环境..."

# 检查 Python 是否已安装
if ! command -v python3 &> /dev/null; then
    echo "Python 未安装，请先安装 Python 3.7 或更高版本"
    echo "您可以从 https://www.python.org/downloads/ 下载安装"
    echo "或使用系统包管理器安装"
    exit 1
fi

# 检查 Python 版本
python3 -c "import sys; sys.exit(0) if sys.version_info >= (3,7) else sys.exit(1)"
if [ $? -ne 0 ]; then
    echo "Python 版本过低，请安装 Python 3.7 或更高版本"
    exit 1
fi

# 检查 pip
echo "正在检查 pip..."
if ! command -v pip3 &> /dev/null; then
    echo "正在安装 pip..."
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py --user
    rm get-pip.py
fi

# 创建虚拟环境
echo "正在创建虚拟环境..."
python3 -m venv venv

# 激活虚拟环境
echo "正在激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "正在安装依赖..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# 创建必要的目录
echo "正在检查目录结构..."
mkdir -p static/css
mkdir -p static/js
mkdir -p static/img
mkdir -p templates
mkdir -p data

# 设置权限
chmod +x start.sh

# 安装完成
echo
echo "==================================================="
echo "        安装完成！"
echo "==================================================="
echo
echo "使用说明："
echo "1. 运行 ./start.sh 启动应用"
echo "2. 浏览器将自动打开应用页面"
echo "3. 按照用户指南准备并导入数据"
echo
echo "如有问题，请参考用户指南或提交 Issue"
echo

# 显示Python和pip版本
echo "检测到的pip版本:"
pip3 --version
echo

# 更新pip
echo "更新pip..."
pip3 install --upgrade pip

# 检查安装是否成功
if [ $? -eq 0 ]; then
    echo "依赖项安装成功！"
else
    echo "依赖项安装失败，请检查错误信息并重试。"
    exit 1
fi

# 设置启动脚本权限
echo "设置启动脚本权限..."
chmod +x start.sh

echo
echo "====================================================="
echo "安装完成！您现在可以通过以下命令启动应用："
echo "  ./start.sh"
echo
echo "或者直接运行："
echo "  python3 run.py"
echo "=====================================================" 