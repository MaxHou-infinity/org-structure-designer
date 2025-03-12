#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
import json
import numpy as np
from PIL import Image
import io
import base64
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'data'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx'}

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    """渲染主页"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """处理文件上传"""
    if 'file' not in request.files:
        return jsonify({'error': '没有文件部分'}), 400
    
    file = request.files['file']
    file_type = request.form.get('fileType')
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # 根据文件类型处理数据
            if file_type == 'employee':
                # 处理员工信息模板
                result = process_employee_file(file_path)
                return jsonify(result)
            elif file_type == 'organization':
                # 处理组织架构模板
                result = process_organization_file(file_path)
                return jsonify(result)
            else:
                return jsonify({'error': '未知的文件类型'}), 400
        except Exception as e:
            return jsonify({'error': f'处理文件时出错: {str(e)}'}), 500
    
    return jsonify({'error': '不允许的文件类型'}), 400

def process_employee_file(file_path):
    """处理员工信息模板文件"""
    try:
        df = pd.read_excel(file_path)
        
        # 检查必要的列是否存在
        required_columns = ['姓名', '工号', '职级', '一级部门', '二级部门', '三级部门', '四级部门', '五级部门', '六级部门']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return {'error': f'缺少必要的列: {", ".join(missing_columns)}'}
        
        # 检查工号是否有重复
        duplicate_ids = df[df.duplicated('工号')]['工号'].tolist()
        if duplicate_ids:
            return {'warning': f'发现重复的工号: {", ".join(map(str, duplicate_ids))}'}
        
        # 转换为JSON格式
        employees = []
        for _, row in df.iterrows():
            employee = {
                'name': row['姓名'],
                'id': row['工号'],
                'level': row['职级'],
                'departments': {
                    'level1': row['一级部门'] if pd.notna(row['一级部门']) else '',
                    'level2': row['二级部门'] if pd.notna(row['二级部门']) else '',
                    'level3': row['三级部门'] if pd.notna(row['三级部门']) else '',
                    'level4': row['四级部门'] if pd.notna(row['四级部门']) else '',
                    'level5': row['五级部门'] if pd.notna(row['五级部门']) else '',
                    'level6': row['六级部门'] if pd.notna(row['六级部门']) else ''
                }
            }
            employees.append(employee)
        
        return {'success': True, 'data': employees}
    
    except Exception as e:
        return {'error': f'处理员工信息文件时出错: {str(e)}'}

def process_organization_file(file_path):
    """处理组织架构模板文件"""
    try:
        df = pd.read_excel(file_path)
        
        # 检查必要的列是否存在
        required_columns = ['一级部门', '二级部门', '三级部门', '四级部门', '五级部门', '六级部门', 
                           '部门级别', '部门负责人工号', '部门负责人']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return {'error': f'缺少必要的列: {", ".join(missing_columns)}'}
        
        # 转换为JSON格式
        departments = []
        for _, row in df.iterrows():
            department = {
                'level1': row['一级部门'] if pd.notna(row['一级部门']) else '',
                'level2': row['二级部门'] if pd.notna(row['二级部门']) else '',
                'level3': row['三级部门'] if pd.notna(row['三级部门']) else '',
                'level4': row['四级部门'] if pd.notna(row['四级部门']) else '',
                'level5': row['五级部门'] if pd.notna(row['五级部门']) else '',
                'level6': row['六级部门'] if pd.notna(row['六级部门']) else '',
                'level': row['部门级别'] if pd.notna(row['部门级别']) else '',
                'leaderId': row['部门负责人工号'] if pd.notna(row['部门负责人工号']) else '',
                'leaderName': row['部门负责人'] if pd.notna(row['部门负责人']) else ''
            }
            departments.append(department)
        
        return {'success': True, 'data': departments}
    
    except Exception as e:
        return {'error': f'处理组织架构文件时出错: {str(e)}'}

@app.route('/export', methods=['POST'])
def export_data():
    """导出组织架构图和更新后的Excel文件"""
    try:
        data = request.json
        
        # 保存组织架构图
        if 'imageData' in data:
            image_data = data['imageData'].split(',')[1]
            image_bytes = base64.b64decode(image_data)
            
            # 生成唯一的文件名
            image_filename = f"org_structure_{uuid.uuid4().hex}.png"
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            
            # 保存图片
            with open(image_path, 'wb') as f:
                f.write(image_bytes)
            
            return jsonify({
                'success': True,
                'imagePath': image_filename
            })
        
        # 更新Excel文件
        elif 'organizationData' in data and 'employeeData' in data:
            org_data = data['organizationData']
            emp_data = data['employeeData']
            
            # 创建组织架构DataFrame
            org_rows = []
            for dept in org_data:
                org_rows.append({
                    '一级部门': dept.get('level1', ''),
                    '二级部门': dept.get('level2', ''),
                    '三级部门': dept.get('level3', ''),
                    '四级部门': dept.get('level4', ''),
                    '五级部门': dept.get('level5', ''),
                    '六级部门': dept.get('level6', ''),
                    '部门级别': dept.get('level', ''),
                    '部门负责人工号': dept.get('leaderId', ''),
                    '部门负责人': dept.get('leaderName', '')
                })
            
            org_df = pd.DataFrame(org_rows)
            
            # 创建员工信息DataFrame
            emp_rows = []
            for emp in emp_data:
                if not emp.get('isVirtual', False):  # 排除虚拟员工
                    emp_rows.append({
                        '姓名': emp.get('name', ''),
                        '工号': emp.get('id', ''),
                        '职级': emp.get('level', ''),
                        '一级部门': emp.get('departments', {}).get('level1', ''),
                        '二级部门': emp.get('departments', {}).get('level2', ''),
                        '三级部门': emp.get('departments', {}).get('level3', ''),
                        '四级部门': emp.get('departments', {}).get('level4', ''),
                        '五级部门': emp.get('departments', {}).get('level5', ''),
                        '六级部门': emp.get('departments', {}).get('level6', '')
                    })
            
            emp_df = pd.DataFrame(emp_rows)
            
            # 生成唯一的文件名
            excel_filename = f"org_structure_updated_{uuid.uuid4().hex}.xlsx"
            excel_path = os.path.join(app.config['UPLOAD_FOLDER'], excel_filename)
            
            # 创建Excel写入器
            with pd.ExcelWriter(excel_path) as writer:
                org_df.to_excel(writer, sheet_name='组织架构', index=False)
                emp_df.to_excel(writer, sheet_name='员工信息', index=False)
            
            return jsonify({
                'success': True,
                'excelPath': excel_filename
            })
        
        return jsonify({'error': '缺少必要的数据'}), 400
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'导出数据时出错: {str(e)}'}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """下载文件"""
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True) 