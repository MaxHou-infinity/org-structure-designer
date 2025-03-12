#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
环境检查脚本
用于检查用户的系统环境是否满足运行组织架构设计工具的要求
"""

import sys
import platform
import subprocess
import os
import webbrowser
from importlib import util

def print_header(message):
    """打印带有格式的标题"""
    print("\n" + "=" * 60)
    print(f" {message}")
    print("=" * 60)

def print_status(message, status, success=True):
    """打印状态信息"""
    status_symbol = "✓" if success else "✗"
    status_color = "\033[92m" if success else "\033[91m"  # 绿色或红色
    reset_color = "\033[0m"
    
    # Windows命令行不支持ANSI颜色代码，所以在Windows上不使用颜色
    if platform.system() == "Windows":
        print(f"{message}: {status_symbol} {status}")
    else:
        print(f"{message}: {status_color}{status_symbol} {status}{reset_color}")

def check_python_version():
    """检查Python版本"""
    print_header("检查Python版本")
    
    current_version = sys.version_info
    required_version = (3, 6, 0)
    
    version_str = f"{current_version.major}.{current_version.minor}.{current_version.micro}"
    required_str = f"{required_version[0]}.{required_version[1]}.{required_version[2]}"
    
    if current_version >= required_version:
        print_status("Python版本", f"{version_str} (满足要求 >= {required_str})", True)
        return True
    else:
        print_status("Python版本", f"{version_str} (不满足要求 >= {required_str})", False)
        return False

def check_pip():
    """检查pip是否可用"""
    print_header("检查pip")
    
    try:
        # 使用subprocess运行pip --version命令
        if platform.system() == "Windows":
            result = subprocess.run(["pip", "--version"], capture_output=True, text=True, check=False)
        else:
            result = subprocess.run(["pip3", "--version"], capture_output=True, text=True, check=False)
        
        if result.returncode == 0:
            print_status("pip可用性", "可用", True)
            return True
        else:
            print_status("pip可用性", "不可用", False)
            return False
    except Exception as e:
        print_status("pip可用性", f"检查失败: {str(e)}", False)
        return False

def check_required_packages():
    """检查必需的Python包"""
    print_header("检查必需的Python包")
    
    required_packages = {
        "flask": "2.0.1",
        "pandas": "1.3.3",
        "openpyxl": "3.0.9",
        "pillow": "8.3.2",
        "numpy": "1.21.2",
        "flask-cors": "3.0.10",
        "werkzeug": "2.0.1"
    }
    
    all_packages_available = True
    
    for package, required_version in required_packages.items():
        package_spec = util.find_spec(package.replace("-", "_"))
        
        if package_spec is not None:
            try:
                # 尝试导入包并获取版本
                if package == "flask-cors":
                    module = __import__("flask_cors")
                else:
                    module = __import__(package)
                
                if hasattr(module, "__version__"):
                    version = module.__version__
                    if version >= required_version:
                        print_status(f"包 {package}", f"{version} (满足要求 >= {required_version})", True)
                    else:
                        print_status(f"包 {package}", f"{version} (不满足要求 >= {required_version})", False)
                        all_packages_available = False
                else:
                    print_status(f"包 {package}", "已安装，但无法确定版本", True)
            except Exception as e:
                print_status(f"包 {package}", f"检查失败: {str(e)}", False)
                all_packages_available = False
        else:
            print_status(f"包 {package}", "未安装", False)
            all_packages_available = False
    
    return all_packages_available

def check_browser():
    """检查是否有可用的浏览器"""
    print_header("检查浏览器")
    
    try:
        # 检查webbrowser模块是否可以找到浏览器
        browser = webbrowser.get()
        print_status("浏览器可用性", "可用", True)
        return True
    except Exception as e:
        print_status("浏览器可用性", f"不可用: {str(e)}", False)
        return False

def check_file_permissions():
    """检查文件权限"""
    print_header("检查文件权限")
    
    # 检查当前目录是否可写
    current_dir = os.getcwd()
    data_dir = os.path.join(current_dir, "data")
    
    # 检查当前目录是否可写
    if os.access(current_dir, os.W_OK):
        print_status("当前目录写入权限", "可写", True)
        current_dir_writable = True
    else:
        print_status("当前目录写入权限", "不可写", False)
        current_dir_writable = False
    
    # 检查data目录是否存在，如果不存在则尝试创建
    if os.path.exists(data_dir):
        if os.access(data_dir, os.W_OK):
            print_status("data目录写入权限", "可写", True)
            data_dir_writable = True
        else:
            print_status("data目录写入权限", "不可写", False)
            data_dir_writable = False
    else:
        try:
            os.makedirs(data_dir, exist_ok=True)
            print_status("data目录", "已创建", True)
            data_dir_writable = True
        except Exception as e:
            print_status("data目录创建", f"失败: {str(e)}", False)
            data_dir_writable = False
    
    return current_dir_writable and data_dir_writable

def main():
    """主函数"""
    print("\n组织架构设计工具 - 环境检查\n")
    
    # 检查各项要求
    python_ok = check_python_version()
    pip_ok = check_pip()
    packages_ok = check_required_packages()
    browser_ok = check_browser()
    permissions_ok = check_file_permissions()
    
    # 总结
    print_header("检查结果")
    
    all_ok = python_ok and pip_ok and packages_ok and browser_ok and permissions_ok
    
    if all_ok:
        print("恭喜！您的系统满足运行组织架构设计工具的所有要求。")
        print("\n您可以通过以下方式启动应用：")
        if platform.system() == "Windows":
            print("  - 双击运行 start.bat 文件")
        else:
            print("  - 在终端中执行 ./start.sh 命令")
        print("  - 或者直接运行 python run.py 命令")
    else:
        print("您的系统不满足运行组织架构设计工具的所有要求。请解决上述问题后再尝试运行应用。")
        
        if not python_ok:
            print("\n- 请安装Python 3.6或更高版本：https://www.python.org/downloads/")
        
        if not pip_ok:
            print("\n- 请安装pip：")
            print("  Windows: https://pip.pypa.io/en/stable/installation/")
            print("  Mac/Linux: 通常随Python一起安装，或使用包管理器安装")
        
        if not packages_ok:
            print("\n- 请安装所需的Python包：")
            print("  pip install -r requirements.txt")
        
        if not browser_ok:
            print("\n- 请安装现代浏览器，如Chrome、Firefox或Edge")
        
        if not permissions_ok:
            print("\n- 请确保您有足够的权限访问和写入应用目录")
            print("  可能需要以管理员/超级用户身份运行应用")

if __name__ == "__main__":
    main() 