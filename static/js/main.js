// 全局变量
let employeeData = [];
let organizationData = [];
let virtualEmployees = [];
let draggedElement = null;
let currentZoom = 1; // 初始缩放比例

// 缩放相关变量
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 1.5;

// 页面加载完成后初始化
$(document).ready(function() {
    // 绑定上传按钮事件
    $('#uploadEmployeeBtn').click(uploadEmployeeFile);
    $('#uploadOrgBtn').click(uploadOrgFile);
    
    // 绑定生成按钮事件
    $('#generateBtn').click(generateOrgChart);
    
    // 绑定导出按钮事件
    $('#exportBtn').click(exportOrgChart);
    $('#saveExcelBtn').click(saveExcelFile);
    
    // 绑定展开/折叠按钮事件
    $('#expandAllBtn').click(expandAllDepartments);
    $('#collapseAllBtn').click(collapseAllDepartments);
    
    // 绑定缩放按钮事件
    $('#zoomInBtn').click(zoomIn);
    $('#zoomOutBtn').click(zoomOut);
    $('#resetZoomBtn').click(resetZoom);
    
    // 初始化全局变量
    employeeData = [];
    organizationData = [];
    virtualEmployees = [];
    draggedElement = null;
    
    // 初始化自动滚动
    initAutoScroll();
});

/**
 * 上传员工信息文件
 */
function uploadEmployeeFile() {
    const fileInput = $('#employeeFile')[0];
    
    if (fileInput.files.length === 0) {
        showError('请选择员工信息文件');
        return;
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', 'employee');
    
    // 显示加载提示
    showLoading('正在上传员工信息文件...');
    
    $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            if (response.error) {
                showError(response.error);
                return;
            }
            
            // 保存员工数据
            employeeData = response.data;
            
            // 显示成功消息
            showSuccess('员工信息文件上传成功');
            
            // 如果组织架构数据也已上传，启用生成按钮
            if (organizationData.length > 0) {
                $('#generateBtn').prop('disabled', false);
            }
        },
        error: function(xhr, status, error) {
            showError('上传失败: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

/**
 * 上传组织架构文件
 */
function uploadOrgFile() {
    const fileInput = $('#organizationFile')[0];
    
    if (fileInput.files.length === 0) {
        showError('请选择组织架构文件');
        return;
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', 'organization');
    
    // 显示加载提示
    showLoading('正在上传组织架构文件...');
    
    $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            if (response.error) {
                showError(response.error);
                return;
            }
            
            // 保存组织架构数据
            organizationData = response.data;
            
            // 显示成功消息
            showSuccess('组织架构文件上传成功');
            
            // 如果员工数据也已上传，启用生成按钮
            if (employeeData.length > 0) {
                $('#generateBtn').prop('disabled', false);
            }
        },
        error: function(xhr, status, error) {
            showError('上传失败: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

/**
 * 显示加载提示
 */
function showLoading(message) {
    // 创建加载提示元素
    const loadingElement = $('<div class="loading-overlay"><div class="loading-spinner"></div><div class="loading-message">' + message + '</div></div>');
    $('body').append(loadingElement);
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
    $('.loading-overlay').remove();
}

/**
 * 显示成功消息
 */
function showSuccess(message) {
    const alertElement = $('<div class="alert alert-success alert-dismissible fade show" role="alert">' +
        message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
        '</div>');
    
    // 添加到页面顶部
    $('header').after(alertElement);
    
    // 3秒后自动关闭
    setTimeout(() => {
        alertElement.alert('close');
    }, 3000);
}

/**
 * 显示错误消息
 */
function showError(message) {
    const alertElement = $('<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
        message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
        '</div>');
    
    // 添加到页面顶部
    $('header').after(alertElement);
    
    // 5秒后自动关闭
    setTimeout(() => {
        alertElement.alert('close');
    }, 5000);
}

/**
 * 导出组织架构图
 */
function exportOrgChart() {
    // 显示加载提示
    showLoading('正在导出组织架构图...');
    
    try {
        // 使用html2canvas捕获组织架构图
        html2canvas(document.getElementById('orgChart'), {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // 转换为图片数据
            const imageData = canvas.toDataURL('image/png');
            
            // 发送到服务器保存
            $.ajax({
                url: '/export',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    imageData: imageData,
                    organizationData: organizationData,
                    employeeData: [...employeeData, ...virtualEmployees.filter(ve => ve.isVirtual)]
                }),
                success: function(response) {
                    if (response.error) {
                        showError(response.error);
                        return;
                    }
                    
                    // 创建下载链接
                    const downloadLink = $('<a></a>')
                        .attr('href', '/download/' + response.imagePath)
                        .attr('download', '组织架构图.png')
                        .hide();
                    
                    $('body').append(downloadLink);
                    downloadLink[0].click();
                    downloadLink.remove();
                    
                    showSuccess('组织架构图导出成功');
                },
                error: function(xhr, status, error) {
                    showError('导出失败: ' + error);
                },
                complete: function() {
                    hideLoading();
                }
            });
        }).catch(error => {
            console.error('导出图片失败:', error);
            showError('导出图片失败: ' + error.message);
            hideLoading();
        });
    } catch (error) {
        console.error('导出过程出错:', error);
        showError('导出过程出错: ' + error.message);
        hideLoading();
    }
}

/**
 * 保存Excel文件
 */
function saveExcelFile() {
    // 显示加载提示
    showLoading('正在保存Excel文件...');
    
    // 发送到服务器保存
    $.ajax({
        url: '/export',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            organizationData: organizationData,
            employeeData: [...employeeData, ...virtualEmployees.filter(ve => ve.isVirtual)]
        }),
        success: function(response) {
            if (response.error) {
                showError(response.error);
                return;
            }
            
            // 创建下载链接
            const downloadLink = $('<a></a>')
                .attr('href', '/download/' + response.excelPath)
                .attr('download', '组织架构数据.xlsx')
                .hide();
            
            $('body').append(downloadLink);
            downloadLink[0].click();
            downloadLink.remove();
            
            showSuccess('Excel文件保存成功');
        },
        error: function(xhr, status, error) {
            showError('保存失败: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * 获取部门信息
 */
function getDepartmentInfo(level1, level2, level3, level4, level5, level6) {
    // 构建部门路径匹配条件
    const matchConditions = {};
    
    if (level1) matchConditions.level1 = level1;
    if (level2) matchConditions.level2 = level2;
    if (level3) matchConditions.level3 = level3;
    if (level4) matchConditions.level4 = level4;
    if (level5) matchConditions.level5 = level5;
    if (level6) matchConditions.level6 = level6;
    
    // 查找匹配的部门
    const dept = organizationData.find(d => {
        let match = true;
        
        for (const key in matchConditions) {
            if (d[key] !== matchConditions[key]) {
                match = false;
                break;
            }
        }
        
        return match;
    });
    
    return dept || { leaderId: '', leaderName: '' };
}

/**
 * 添加员工到部门
 */
function addEmployeesToDepartment(deptElement, level1, level2 = null, level3 = null) {
    // 创建员工容器 - 无论是否有员工都创建容器
    const employeesContainer = $('<div class="employees-container"></div>');
    
    // 查找属于该部门的员工
    const deptEmployees = employeeData.filter(emp => {
        // 修复员工部门归属逻辑
        const empDepts = emp.departments;
        
        if (level3) {
            // 如果是三级部门，检查员工是否属于该部门
            return empDepts.level1 === level1 && 
                   empDepts.level2 === level2 && 
                   empDepts.level3 === level3;
        } else if (level2) {
            // 如果是二级部门，检查员工是否属于该部门
            return empDepts.level1 === level1 && 
                   empDepts.level2 === level2 && 
                   !empDepts.level3;
        } else {
            // 如果是一级部门，检查员工是否属于该部门
            return empDepts.level1 === level1 && 
                   !empDepts.level2;
        }
    });
    
    // 添加员工元素
    deptEmployees.forEach(emp => {
        const employeeElement = $('<div class="employee" draggable="true"></div>');
        employeeElement.attr('data-id', emp.id);
        employeeElement.attr('data-name', emp.name);
        employeeElement.attr('data-level', emp.level);
        
        // 设置员工背景颜色
        const bgColor = getLevelColor(emp.level);
        employeeElement.css('background-color', bgColor);
        
        // 添加员工信息
        employeeElement.html('<div class="employee-name">' + emp.name + '</div>' +
                           '<div class="employee-level">' + emp.level + '</div>');
        
        // 添加到容器
        employeesContainer.append(employeeElement);
    });
    
    // 无论是否有员工都添加容器，确保可以拖拽到空部门
    deptElement.append(employeesContainer);
}

/**
 * 获取职级对应的颜色
 */
function getLevelColor(level) {
    const levelColors = {
        'L0': '#FF9999',
        'L1.1': '#FFCC99',
        'L1.2': '#FFFF99',
        'L2.1': '#CCFF99',
        'L2.2': '#99FF99',
        'L3.1': '#99FFCC',
        'E3.1': '#99CCFF',
        'L3.2': '#9999FF',
        'E3.2': '#CC99FF',
        'L4.1': '#FF99CC',
        'E4.1': '#FF99FF',
        'L4.2': '#CCCCCC',
        'L5': '#999999'
    };
    
    return levelColors[level] || '#CCCCCC';
}

/**
 * 生成组织架构图
 */
function generateOrgChart() {
    // 清空现有内容
    $('#orgChart').empty();
    
    // 添加加载动画
    $('#orgChart').html('<div class="loading-spinner"></div>');
    
    // 构建组织架构树
    setTimeout(() => {
        // 创建组织架构树的根元素
        const tree = $('<div class="org-tree"></div>');
        
        // 构建多级部门结构
        buildDepartmentStructure(tree);
        
        // 渲染组织架构树
        $('#orgChart').empty().append(tree);
        
        // 启用导出按钮
        $('#exportBtn').prop('disabled', false);
        $('#saveExcelBtn').prop('disabled', false);
        
        // 绑定部门展开/折叠事件
        $('.department-toggle').click(toggleDepartment);
        
        // 绑定部门名称双击编辑事件
        $('.department-name').dblclick(editDepartmentName);
        
        // 绑定员工右键菜单事件
        $('.employee').on('contextmenu', showEmployeeContextMenu);
        
        // 初始化拖拽功能
        initDragAndDrop();
        
        // 绘制连接线
        setTimeout(drawConnections, 100);
        
        // 显示成功消息
        showSuccess('组织架构图已生成');
    }, 500);
}

/**
 * 构建部门结构
 */
function buildDepartmentStructure(tree) {
    // 处理一级部门
    const level1Departments = [...new Set(organizationData.map(dept => dept.level1).filter(Boolean))];
    const level1Container = $('<div class="org-level" data-level="1"></div>');
    const level1DeptContainer = $('<div class="level-departments"></div>');
    
    level1Departments.forEach(level1Name => {
        // 创建一级部门元素
        const deptElement = createDepartmentElement(level1Name, 1);
        
        // 查找该部门的负责人
        const deptInfo = organizationData.find(d => d.level1 === level1Name && !d.level2);
        if (deptInfo) {
            const leaderElement = $('<div class="department-leader" data-leader-id="' + (deptInfo.leaderId || '') + '">负责人: ' + (deptInfo.leaderName || '未指定') + '</div>');
            deptElement.append(leaderElement);
            
            // 绑定点击事件
            leaderElement.click(function() {
                editDepartmentLeader($(this), deptElement);
            });
        } else {
            const leaderElement = $('<div class="department-leader" data-leader-id="">负责人: 未指定</div>');
            deptElement.append(leaderElement);
            
            // 绑定点击事件
            leaderElement.click(function() {
                editDepartmentLeader($(this), deptElement);
            });
        }
        
        // 添加员工
        addEmployeesToDepartment(deptElement, level1Name);
        
        level1DeptContainer.append(deptElement);
    });
    
    level1Container.append(level1DeptContainer);
    tree.append(level1Container);
    
    // 处理二级部门
    const level2Container = $('<div class="org-level" data-level="2"></div>');
    const level2DeptContainer = $('<div class="level-departments"></div>');
    
    level1Departments.forEach(level1Name => {
        const level2Departments = [...new Set(organizationData
            .filter(dept => dept.level1 === level1Name)
            .map(dept => dept.level2)
            .filter(Boolean))];
        
        level2Departments.forEach(level2Name => {
            const deptElement = createDepartmentElement(level2Name, 2);
            deptElement.attr('data-parent', level1Name);
            deptElement.addClass('connector');
            
            // 查找该部门的负责人
            const deptInfo = organizationData.find(d => 
                d.level1 === level1Name && d.level2 === level2Name && !d.level3);
            if (deptInfo) {
                const leaderElement = $('<div class="department-leader" data-leader-id="' + (deptInfo.leaderId || '') + '">负责人: ' + (deptInfo.leaderName || '未指定') + '</div>');
                deptElement.append(leaderElement);
                
                // 绑定点击事件
                leaderElement.click(function() {
                    editDepartmentLeader($(this), deptElement);
                });
            } else {
                const leaderElement = $('<div class="department-leader" data-leader-id="">负责人: 未指定</div>');
                deptElement.append(leaderElement);
                
                // 绑定点击事件
                leaderElement.click(function() {
                    editDepartmentLeader($(this), deptElement);
                });
            }
            
            // 添加员工
            addEmployeesToDepartment(deptElement, level1Name, level2Name);
            
            level2DeptContainer.append(deptElement);
        });
    });
    
    level2Container.append(level2DeptContainer);
    tree.append(level2Container);
    
    // 处理三级部门
    const level3Container = $('<div class="org-level" data-level="3"></div>');
    const level3DeptContainer = $('<div class="level-departments"></div>');
    
    organizationData.forEach(org => {
        if (org.level2 && org.level3) {
            // 检查是否已添加该部门
            if (!level3DeptContainer.find(`.department[data-name="${org.level3}"][data-parent="${org.level2}"]`).length) {
                const deptElement = createDepartmentElement(org.level3, 3);
                deptElement.attr('data-parent', org.level2);
                deptElement.addClass('connector');
                
                // 添加负责人
                const leaderElement = $('<div class="department-leader" data-leader-id="' + (org.leaderId || '') + '">负责人: ' + (org.leaderName || '未指定') + '</div>');
                deptElement.append(leaderElement);
                
                // 绑定点击事件
                leaderElement.click(function() {
                    editDepartmentLeader($(this), deptElement);
                });
                
                // 添加员工
                addEmployeesToDepartment(deptElement, org.level1, org.level2, org.level3);
                
                level3DeptContainer.append(deptElement);
            }
        }
    });
    
    level3Container.append(level3DeptContainer);
    tree.append(level3Container);
}

/**
 * 创建部门元素
 */
function createDepartmentElement(name, level) {
    const department = $('<div class="department level-' + level + '" data-level="' + level + '"></div>');
    department.attr('data-name', name);
    
    const header = $('<div class="department-header"></div>');
    const nameElement = $('<div class="department-name">' + name + '</div>');
    
    // 添加折叠按钮
    const toggleElement = $('<div class="department-toggle"><i class="fa fa-chevron-down"></i></div>');
    
    header.append(nameElement);
    header.append(toggleElement);
    
    department.append(header);
    
    // 创建子部门容器
    const childrenContainer = $('<div class="department-children"></div>');
    department.append(childrenContainer);
    
    return department;
}

/**
 * 绘制部门之间的连接线
 */
function drawConnections() {
    // 清除现有连接线
    $('.horizontal-connector').remove();
    
    // 为每个层级绘制连接线
    for (let level = 2; level <= 3; level++) {
        const departments = $(`.org-level[data-level="${level}"] .department`);
        
        // 按父部门分组
        const parentGroups = {};
        departments.each(function() {
            const parent = $(this).data('parent');
            if (!parentGroups[parent]) {
                parentGroups[parent] = [];
            }
            parentGroups[parent].push($(this));
        });
        
        // 为每组添加水平连接线
        for (const parent in parentGroups) {
            if (parentGroups[parent].length > 1) {
                const firstDept = parentGroups[parent][0];
                const lastDept = parentGroups[parent][parentGroups[parent].length - 1];
                
                const firstLeft = firstDept.offset().left;
                const lastRight = lastDept.offset().left + lastDept.outerWidth();
                const width = lastRight - firstLeft;
                
                const connector = $('<div class="horizontal-connector"></div>');
                connector.css({
                    left: firstLeft + 'px',
                    width: width + 'px'
                });
                
                firstDept.parent().append(connector);
            }
        }
    }
}

/**
 * 切换部门展开/折叠状态
 */
function toggleDepartment(e) {
    e.stopPropagation();
    
    const toggle = $(this);
    const department = toggle.closest('.department');
    const deptName = department.data('name');
    const deptLevel = department.data('level');
    
    // 查找子部门
    const childDepts = $(`.department[data-parent="${deptName}"]`).closest('.org-level');
    
    if (toggle.find('i').hasClass('fa-chevron-down')) {
        // 折叠
        toggle.find('i').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        childDepts.slideUp(300);
    } else {
        // 展开
        toggle.find('i').removeClass('fa-chevron-right').addClass('fa-chevron-down');
        childDepts.slideDown(300);
    }
    
    // 重新绘制连接线
    setTimeout(drawConnections, 350);
}

/**
 * 检查是否可以放置
 */
function canDrop(dragged, target) {
    const $dragged = $(dragged);
    const $target = $(target);
    
    // 如果拖拽的是部门
    if ($dragged.hasClass('department')) {
        // 部门只能放置在其他部门的子部门容器中
        if ($target.hasClass('department-children') || $target.hasClass('department-children-wrapper')) {
            // 检查是否是自己的子容器或祖先容器
            const draggedPath = getDepartmentPath($dragged);
            const targetDept = $target.closest('.department');
            const targetPath = getDepartmentPath(targetDept);
            
            // 不能放置在自己的子容器中
            for (let i = 0; i < draggedPath.length; i++) {
                if (i < targetPath.length && draggedPath[i].name === targetPath[i].name) {
                    continue;
                }
                return i >= targetPath.length;
            }
            
            return true;
        }
        return false;
    }
    
    // 如果拖拽的是员工
    if ($dragged.hasClass('employee')) {
        // 员工可以放置在部门的员工容器中
        if ($target.hasClass('employees-container')) {
            // 虚拟员工可以放置在任何部门
            if ($dragged.hasClass('virtual')) {
                return true;
            }
            
            // 真实员工可以放置在任何部门（修改：允许跨部门拖拽）
            return true;
        }
        return false;
    }
    
    return false;
}

/**
 * 处理放置逻辑
 */
function processDrop(dragged, target) {
    const $dragged = $(dragged);
    const $target = $(target);
    
    // 如果拖拽的是部门
    if ($dragged.hasClass('department')) {
        // 获取目标部门
        const targetDept = $target.closest('.department');
        const targetLevel = parseInt(targetDept.data('level'));
        
        // 获取拖拽的部门
        const draggedLevel = parseInt($dragged.data('level'));
        
        // 如果目标部门级别 + 1 不等于拖拽部门级别，需要调整
        if (targetLevel + 1 !== draggedLevel) {
            // 更新部门级别
            updateDepartmentLevel($dragged, targetLevel + 1);
        }
        
        // 移动部门到目标容器
        if ($target.hasClass('department-children-wrapper')) {
            $target.append($dragged);
        } else {
            // 如果目标是department-children，需要找到或创建wrapper
            let wrapper = $target.find('> .department-children-wrapper');
            if (wrapper.length === 0) {
                wrapper = $('<div class="department-children-wrapper"></div>');
                $target.append(wrapper);
            }
            wrapper.append($dragged);
        }
        
        // 更新组织架构数据
        updateDepartmentParent($dragged, targetDept);
    }
    
    // 如果拖拽的是员工
    if ($dragged.hasClass('employee')) {
        // 获取目标部门
        const targetDept = $target.closest('.department');
        
        // 如果是虚拟员工
        if ($dragged.hasClass('virtual')) {
            // 更新虚拟员工部门
            updateVirtualEmployeeDepartment($dragged, targetDept);
        } else {
            // 真实员工 - 更新员工部门隶属关系
            updateEmployeeDepartment($dragged, targetDept);
        }
        
        // 移动员工到目标容器
        $target.append($dragged);
    }
}

/**
 * 更新员工部门隶属关系
 */
function updateEmployeeDepartment(employeeElement, department) {
    const employeeId = employeeElement.data('id');
    const employeeName = employeeElement.data('name');
    const path = getDepartmentPath(department);
    
    // 查找员工数据
    const employee = employeeData.find(emp => emp.id === employeeId);
    
    if (employee) {
        // 保存旧部门路径用于日志
        const oldDeptPath = [
            employee.departments.level1,
            employee.departments.level2,
            employee.departments.level3,
            employee.departments.level4,
            employee.departments.level5,
            employee.departments.level6
        ].filter(Boolean).join(' > ');
        
        // 清除旧部门
        employee.departments = {
            level1: '',
            level2: '',
            level3: '',
            level4: '',
            level5: '',
            level6: ''
        };
        
        // 设置新部门
        for (let i = 0; i < path.length; i++) {
            const pathItem = path[i];
            employee.departments['level' + pathItem.level] = pathItem.name;
        }
        
        // 构建新部门路径用于日志
        const newDeptPath = [
            employee.departments.level1,
            employee.departments.level2,
            employee.departments.level3,
            employee.departments.level4,
            employee.departments.level5,
            employee.departments.level6
        ].filter(Boolean).join(' > ');
        
        // 显示成功消息
        showSuccess(`已将员工 "${employeeName}" 从 "${oldDeptPath}" 移动到 "${newDeptPath}"`);
    }
}

/**
 * 处理回收站拖拽经过
 */
function handleTrashDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

/**
 * 处理回收站拖拽进入
 */
function handleTrashDragEnter(e) {
    // 只有虚拟员工可以删除
    if (draggedElement && $(draggedElement).hasClass('employee') && $(draggedElement).hasClass('virtual')) {
        $('#trashZone').addClass('active');
    }
}

/**
 * 处理回收站拖拽离开
 */
function handleTrashDragLeave(e) {
    $('#trashZone').removeClass('active');
}

/**
 * 处理回收站放置
 */
function handleTrashDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // 移除拖拽样式
    $('#trashZone').removeClass('active');
    
    // 只有虚拟员工可以删除
    if (draggedElement && $(draggedElement).hasClass('employee') && $(draggedElement).hasClass('virtual')) {
        const employeeId = $(draggedElement).data('id');
        
        // 从虚拟员工列表中移除
        virtualEmployees = virtualEmployees.filter(emp => emp.id !== employeeId);
        
        // 移除元素
        $(draggedElement).remove();
        
        showSuccess('已删除虚拟员工');
    }
    
    return false;
}

/**
 * 初始化拖拽功能
 */
function initDragAndDrop() {
    // 员工拖拽
    $('.employee').each(function() {
        this.setAttribute('draggable', 'true');
        this.addEventListener('dragstart', handleDragStart);
        this.addEventListener('dragend', handleDragEnd);
    });
    
    // 部门容器接收拖拽
    $('.employees-container').each(function() {
        this.addEventListener('dragover', handleDragOver);
        this.addEventListener('dragenter', handleDragEnter);
        this.addEventListener('dragleave', handleDragLeave);
        this.addEventListener('drop', handleDrop);
    });
    
    // 移除回收站，不再需要
    $('#trashZone').remove();
}

/**
 * 处理拖拽开始
 */
function handleDragStart(e) {
    draggedElement = this;
    
    // 设置拖拽数据
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    
    // 添加拖拽样式
    setTimeout(() => {
        $(this).addClass('dragging');
    }, 0);
    
    // 如果是虚拟员工，显示回收站
    if ($(this).hasClass('virtual')) {
        $('#trashZone').fadeIn(300);
    }
}

/**
 * 处理拖拽结束
 */
function handleDragEnd(e) {
    // 移除拖拽样式
    $(this).removeClass('dragging');
    
    // 移除所有拖拽相关样式
    $('.drag-over').removeClass('drag-over');
    $('#trashZone').removeClass('active');
    
    // 如果是虚拟员工，隐藏回收站
    if ($(this).hasClass('virtual')) {
        $('#trashZone').fadeOut(300);
    }
    
    draggedElement = null;
}

/**
 * 处理拖拽经过
 */
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

/**
 * 处理拖拽进入
 */
function handleDragEnter(e) {
    $(this).addClass('drag-over');
}

/**
 * 处理拖拽离开
 */
function handleDragLeave(e) {
    $(this).removeClass('drag-over');
}

/**
 * 处理放置
 */
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // 移除拖拽样式
    $(this).removeClass('drag-over');
    
    // 如果没有拖拽元素，直接返回
    if (!draggedElement) {
        return false;
    }
    
    // 获取目标部门
    const targetContainer = $(this);
    const targetDept = targetContainer.closest('.department');
    
    // 获取部门信息
    const deptLevel = parseInt(targetDept.data('level'));
    const deptName = targetDept.data('name');
    
    // 获取部门路径
    const deptPath = getDepartmentPath(targetDept);
    
    // 获取员工信息
    const employeeElement = $(draggedElement);
    const employeeId = employeeElement.data('id');
    const employeeName = employeeElement.data('name');
    
    // 检查是否是虚拟员工
    const isVirtual = employeeElement.hasClass('virtual');
    
    // 更新员工部门
    if (isVirtual) {
        // 更新虚拟员工
        updateVirtualEmployeeDepartment(employeeElement, deptPath);
    } else {
        // 更新真实员工
        updateEmployeeDepartment(employeeId, deptPath);
    }
    
    // 移动员工元素
    targetContainer.append(draggedElement);
    
    // 显示成功消息
    showSuccess(`已将${isVirtual ? '虚拟' : ''}员工 "${employeeName}" 移动到 "${deptName}" 部门`);
    
    return false;
}

/**
 * 获取部门路径
 */
function getDepartmentPath(department) {
    const path = [];
    
    // 获取当前部门级别和名称
    const level = parseInt(department.data('level'));
    const name = department.data('name');
    
    // 根据级别设置路径
    switch (level) {
        case 1:
            path.push({ level: 1, name: name });
            break;
        case 2:
            path.push({ level: 1, name: department.data('parent') });
            path.push({ level: 2, name: name });
            break;
        case 3:
            // 获取二级部门
            const level2Dept = $(`.department[data-level="2"][data-name="${department.data('parent')}"]`);
            path.push({ level: 1, name: level2Dept.data('parent') });
            path.push({ level: 2, name: department.data('parent') });
            path.push({ level: 3, name: name });
            break;
    }
    
    return path;
}

/**
 * 更新员工部门
 */
function updateEmployeeDepartment(employeeId, deptPath) {
    // 查找员工数据
    const employee = employeeData.find(emp => emp.id === employeeId);
    
    if (employee) {
        // 保存旧部门路径用于日志
        const oldDeptPath = [
            employee.departments.level1,
            employee.departments.level2,
            employee.departments.level3
        ].filter(Boolean).join(' > ');
        
        // 清除旧部门
        employee.departments = {
            level1: '',
            level2: '',
            level3: '',
            level4: '',
            level5: '',
            level6: ''
        };
        
        // 设置新部门
        for (const item of deptPath) {
            employee.departments['level' + item.level] = item.name;
        }
    }
}

/**
 * 更新虚拟员工部门
 */
function updateVirtualEmployeeDepartment(employeeElement, deptPath) {
    const employeeId = employeeElement.data('id');
    
    // 查找虚拟员工数据
    const employee = virtualEmployees.find(emp => emp.id === employeeId);
    
    if (employee) {
        // 清除旧部门
        employee.departments = {
            level1: '',
            level2: '',
            level3: '',
            level4: '',
            level5: '',
            level6: ''
        };
        
        // 设置新部门
        for (const item of deptPath) {
            employee.departments['level' + item.level] = item.name;
        }
    }
}

/**
 * 更新部门级别
 */
function updateDepartmentLevel(department, newLevel) {
    const oldLevel = parseInt(department.data('level'));
    const deptName = department.data('name');
    
    // 更新部门元素级别
    department.removeClass('level-' + oldLevel);
    department.addClass('level-' + newLevel);
    department.attr('data-level', newLevel);
    
    // 更新组织架构数据
    // 这里需要根据实际情况调整，可能需要更复杂的逻辑
}

/**
 * 更新部门父级
 */
function updateDepartmentParent(department, parentDept) {
    const deptName = department.data('name');
    const deptLevel = parseInt(department.data('level'));
    const parentName = parentDept.data('name');
    const parentLevel = parseInt(parentDept.data('level'));
    
    // 更新部门元素父级
    department.attr('data-parent', parentName);
    
    // 更新组织架构数据
    // 这里需要根据实际情况调整，可能需要更复杂的逻辑
}

/**
 * 编辑部门名称
 */
function editDepartmentName(e) {
    e.stopPropagation();
    
    const nameElement = $(this);
    const department = nameElement.closest('.department');
    const oldName = nameElement.text();
    
    // 创建输入框
    const input = $('<input type="text" class="edit-name-input" value="' + oldName + '">');
    nameElement.html(input);
    
    // 聚焦输入框
    input.focus();
    
    // 处理失去焦点事件
    input.blur(function() {
        const newName = $(this).val().trim();
        
        if (newName && newName !== oldName) {
            // 更新部门名称
            nameElement.text(newName);
            department.attr('data-name', newName);
            
            // 更新组织架构数据
            updateDepartmentName(department, oldName, newName);
            
            showSuccess('部门名称已更新');
        } else {
            // 恢复原名称
            nameElement.text(oldName);
        }
    });
    
    // 处理回车键
    input.keypress(function(e) {
        if (e.which === 13) {
            $(this).blur();
        }
    });
}

/**
 * 更新部门名称
 */
function updateDepartmentName(department, oldName, newName) {
    // 获取部门级别
    const level = parseInt(department.data('level'));
    
    // 获取部门路径
    const deptPath = getDepartmentPath(department);
    
    // 更新组织架构数据
    organizationData.forEach(dept => {
        // 根据级别更新部门名称
        if (level === 1 && dept.level1 === oldName) {
            dept.level1 = newName;
        } else if (level === 2 && dept.level1 === deptPath[0].name && dept.level2 === oldName) {
            dept.level2 = newName;
        } else if (level === 3 && dept.level1 === deptPath[0].name && dept.level2 === deptPath[1].name && dept.level3 === oldName) {
            dept.level3 = newName;
        }
    });
    
    // 更新员工数据
    employeeData.forEach(emp => {
        // 根据级别更新员工所属部门
        if (level === 1 && emp.departments.level1 === oldName) {
            emp.departments.level1 = newName;
        } else if (level === 2 && emp.departments.level1 === deptPath[0].name && emp.departments.level2 === oldName) {
            emp.departments.level2 = newName;
        } else if (level === 3 && emp.departments.level1 === deptPath[0].name && emp.departments.level2 === deptPath[1].name && emp.departments.level3 === oldName) {
            emp.departments.level3 = newName;
        }
    });
    
    // 更新虚拟员工数据
    virtualEmployees.forEach(emp => {
        // 根据级别更新虚拟员工所属部门
        if (level === 1 && emp.departments.level1 === oldName) {
            emp.departments.level1 = newName;
        } else if (level === 2 && emp.departments.level1 === deptPath[0].name && emp.departments.level2 === oldName) {
            emp.departments.level2 = newName;
        } else if (level === 3 && emp.departments.level1 === deptPath[0].name && emp.departments.level2 === deptPath[1].name && emp.departments.level3 === oldName) {
            emp.departments.level3 = newName;
        }
    });
    
    // 更新子部门的父部门引用
    if (level < 3) {
        $(`.department[data-parent="${oldName}"]`).attr('data-parent', newName);
    }
}

/**
 * 编辑部门负责人
 */
function editDepartmentLeader(leaderElement, department) {
    // 获取部门信息
    const deptLevel = department.data('level');
    const deptName = department.data('name');
    
    // 获取部门路径
    const deptPath = getDepartmentPath(department);
    
    // 显示员工搜索模态框
    const modal = $('#employeeSearchModal');
    modal.modal('show');
    
    // 清空搜索结果
    $('#employeeSearchResults').empty();
    
    // 清空搜索框
    $('#employeeSearchInput').val('');
    
    // 绑定搜索事件
    $('#employeeSearchInput').off('input').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        
        // 清空搜索结果
        $('#employeeSearchResults').empty();
        
        if (searchTerm.length < 1) return;
        
        // 搜索员工
        const results = employeeData.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.id.toString().includes(searchTerm)
        ).slice(0, 10);
        
        // 显示搜索结果
        results.forEach(emp => {
            const resultItem = $('<button type="button" class="list-group-item list-group-item-action"></button>');
            resultItem.text(emp.name + ' (' + emp.id + ')');
            resultItem.data('id', emp.id);
            resultItem.data('name', emp.name);
            
            // 点击选择员工
            resultItem.click(function() {
                const leaderId = $(this).data('id');
                const leaderName = $(this).data('name');
                
                // 更新部门负责人
                leaderElement.text('负责人: ' + leaderName);
                leaderElement.attr('data-leader-id', leaderId);
                
                // 更新组织架构数据
                updateDepartmentLeader(deptPath, leaderId, leaderName);
                
                // 关闭模态框
                modal.modal('hide');
                
                showSuccess('部门负责人已更新');
            });
            
            $('#employeeSearchResults').append(resultItem);
        });
    });
}

/**
 * 更新部门负责人
 */
function updateDepartmentLeader(deptPath, leaderId, leaderName) {
    // 构建部门路径匹配条件
    const matchConditions = {};
    
    for (let i = 0; i < deptPath.length; i++) {
        const pathItem = deptPath[i];
        matchConditions['level' + pathItem.level] = pathItem.name;
    }
    
    // 更新组织架构数据中的当前部门
    organizationData.forEach(dept => {
        let match = true;
        
        // 检查是否完全匹配当前部门路径（所有级别都必须匹配）
        for (const key in matchConditions) {
            if (dept[key] !== matchConditions[key]) {
                match = false;
                break;
            }
        }
        
        // 确保没有更深层级的部门（例如，如果当前是二级部门，确保没有三级部门）
        const currentLevel = deptPath[deptPath.length - 1].level;
        for (let i = currentLevel + 1; i <= 6; i++) {
            if (dept['level' + i]) {
                match = false;
                break;
            }
        }
        
        if (match) {
            dept.leaderId = leaderId;
            dept.leaderName = leaderName;
        }
    });
}

/**
 * 显示员工右键菜单
 */
function showEmployeeContextMenu(e) {
    e.preventDefault();
    
    const employee = $(this);
    const employeeId = employee.data('id');
    const employeeName = employee.data('name');
    const employeeLevel = employee.data('level');
    const isVirtual = employee.hasClass('virtual');
    
    // 创建右键菜单
    const contextMenu = $('<div class="context-menu"></div>');
    
    // 添加菜单项
    if (isVirtual) {
        // 虚拟员工菜单项
        const deleteVirtualItem = $('<div class="context-menu-item">删除虚拟员工</div>');
        
        // 绑定删除虚拟员工事件
        deleteVirtualItem.click(function() {
            // 从虚拟员工列表中移除
            virtualEmployees = virtualEmployees.filter(emp => emp.id !== employeeId);
            
            // 移除元素
            employee.remove();
            
            // 显示成功消息
            showSuccess('已删除虚拟员工: ' + employeeName);
            
            // 关闭菜单
            contextMenu.remove();
        });
        
        contextMenu.append(deleteVirtualItem);
    } else {
        // 真实员工菜单项
        const createVirtualItem = $('<div class="context-menu-item">创建虚拟员工</div>');
        
        // 绑定创建虚拟员工事件
        createVirtualItem.click(function() {
            // 创建虚拟员工
            createVirtualEmployee(employeeId, employeeName, employeeLevel, employee);
            
            // 关闭菜单
            contextMenu.remove();
        });
        
        contextMenu.append(createVirtualItem);
    }
    
    // 设置菜单位置
    contextMenu.css({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
    });
    
    // 添加菜单到页面
    $('body').append(contextMenu);
    
    // 点击其他地方关闭菜单
    $(document).one('click', function() {
        contextMenu.remove();
    });
    
    return false;
}

/**
 * 创建虚拟员工
 */
function createVirtualEmployee(originalId, name, level, originalElement) {
    // 生成唯一ID
    const virtualId = 'v_' + originalId + '_' + Date.now();
    
    // 获取原员工所在部门
    const department = originalElement.closest('.department');
    const deptPath = getDepartmentPath(department);
    
    // 创建虚拟员工数据
    const virtualEmployee = {
        id: virtualId,
        name: name,
        level: level,
        isVirtual: true,
        originalId: originalId,
        departments: {}
    };
    
    // 设置部门
    for (const item of deptPath) {
        virtualEmployee.departments['level' + item.level] = item.name;
    }
    
    // 添加到虚拟员工列表
    virtualEmployees.push(virtualEmployee);
    
    // 创建虚拟员工元素
    const employeeElement = $('<div class="employee virtual" draggable="true"></div>');
    employeeElement.attr('data-id', virtualId);
    employeeElement.attr('data-name', name);
    employeeElement.attr('data-level', level);
    
    // 设置员工背景颜色
    const bgColor = getLevelColor(level);
    employeeElement.css('background-color', bgColor);
    
    // 添加员工信息
    employeeElement.html('<div class="employee-name">' + name + '</div>' +
                       '<div class="employee-level">' + level + '</div>');
    
    // 添加到原员工所在的容器
    originalElement.parent().append(employeeElement);
    
    // 绑定拖拽事件
    employeeElement[0].addEventListener('dragstart', handleDragStart);
    employeeElement[0].addEventListener('dragend', handleDragEnd);
    
    // 绑定右键菜单事件
    employeeElement.on('contextmenu', showEmployeeContextMenu);
    
    // 显示成功消息
    showSuccess('已创建虚拟员工: ' + name);
}

/**
 * 展开所有部门
 */
function expandAllDepartments() {
    $('.department-toggle').each(function() {
        const toggle = $(this);
        const icon = toggle.find('i');
        
        if (icon.hasClass('fa-chevron-right')) {
            icon.removeClass('fa-chevron-right').addClass('fa-chevron-down');
        }
    });
    
    $('.org-level').slideDown(300);
    
    // 重新绘制连接线
    setTimeout(drawConnections, 350);
    
    showSuccess('已展开所有部门');
}

/**
 * 折叠所有部门
 */
function collapseAllDepartments() {
    // 从最高层级开始折叠
    for (let level = 1; level <= 2; level++) {
        $(`.org-level[data-level="${level}"] .department-toggle`).each(function() {
            const toggle = $(this);
            const icon = toggle.find('i');
            
            if (icon.hasClass('fa-chevron-down')) {
                icon.removeClass('fa-chevron-down').addClass('fa-chevron-right');
            }
        });
        
        // 折叠下一级
        if (level < 3) {
            $(`.org-level[data-level="${level+1}"]`).slideUp(300);
        }
    }
    
    // 重新绘制连接线
    setTimeout(drawConnections, 350);
    
    showSuccess('已折叠所有部门');
}

/**
 * 放大组织架构图
 */
function zoomIn() {
    if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        applyZoom();
    }
}

/**
 * 缩小组织架构图
 */
function zoomOut() {
    if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        applyZoom();
    }
}

/**
 * 重置缩放
 */
function resetZoom() {
    currentZoom = 1;
    applyZoom();
}

/**
 * 应用缩放
 */
function applyZoom() {
    $('.org-tree').css('transform', `scale(${currentZoom})`);
    $('.org-tree').css('transform-origin', 'top center');
    
    // 重新绘制连接线
    setTimeout(drawConnections, 100);
}

/**
 * 初始化自动滚动功能
 */
function initAutoScroll() {
    let scrollInterval;
    const scrollSpeed = 10;
    const scrollThreshold = 50; // 距离边缘多少像素开始滚动
    
    // 监听拖拽事件
    $(document).on('dragover', function(e) {
        if (draggedElement) {
            const container = $('.org-chart-container');
            const containerRect = container[0].getBoundingClientRect();
            
            // 计算鼠标位置相对于容器的位置
            const mouseY = e.clientY;
            const mouseX = e.clientX;
            
            // 清除之前的滚动间隔
            clearInterval(scrollInterval);
            
            // 检查是否需要垂直滚动
            if (mouseY < containerRect.top + scrollThreshold) {
                // 向上滚动
                scrollInterval = setInterval(() => {
                    container.scrollTop(container.scrollTop() - scrollSpeed);
                }, 50);
            } else if (mouseY > containerRect.bottom - scrollThreshold) {
                // 向下滚动
                scrollInterval = setInterval(() => {
                    container.scrollTop(container.scrollTop() + scrollSpeed);
                }, 50);
            }
            // 检查是否需要水平滚动
            else if (mouseX < containerRect.left + scrollThreshold) {
                // 向左滚动
                scrollInterval = setInterval(() => {
                    container.scrollLeft(container.scrollLeft() - scrollSpeed);
                }, 50);
            } else if (mouseX > containerRect.right - scrollThreshold) {
                // 向右滚动
                scrollInterval = setInterval(() => {
                    container.scrollLeft(container.scrollLeft() + scrollSpeed);
                }, 50);
            }
        }
    });
    
    // 拖拽结束时停止滚动
    $(document).on('dragend drop', function() {
        clearInterval(scrollInterval);
    });
}

// 添加窗口调整事件，确保连接线正确绘制
$(window).on('resize', debounce(function() {
    if ($('#orgChart .org-tree').length > 0) {
        drawConnections();
    }
}, 200)); 