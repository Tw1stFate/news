/**
 * 布局工具类，用于处理布局的导入导出等公共操作
 * 
 * 这个工具类主要负责处理布局树的导入导出逻辑，包括：
 * 1. 清理布局数据中的冗余信息（如items属性）
 * 2. 导出布局为JSON文件
 * 3. 从JSON文件导入布局
 * 4. 验证布局结构的有效性
 * 5. 修复导入的布局树，确保与当前系统兼容
 */
export default class LayoutUtils {
  /**
   * 清理布局树中的widget配置，移除items属性
   * 这是为了确保导出的布局配置不包含动态数据，只保留必要的结构和配置信息
   * 
   * @param {Object} layoutTree 布局树对象
   * @returns {Object} 清理后的布局树
   */
  static cleanLayoutTree(layoutTree) {
    // 深拷贝布局树，避免修改原始数据
    const treeCopy = JSON.parse(JSON.stringify(layoutTree));
    
    // 递归清理函数
    const clean = (node) => {
      if (!node) {
        return;
      }
      
      // 如果节点有widget，清理其配置
      if (node.widget && node.widget.config) {
        // 确保不包含items属性
        if ('items' in node.widget.config) {
          delete node.widget.config.items;
        }
      }
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => clean(child));
      }
    };
    
    // 执行清理
    clean(treeCopy);
    
    return treeCopy;
  }
  
  /**
   * 导出布局配置到文件
   * 将布局树转换为JSON格式并创建下载链接供用户保存
   * 
   * @param {Object} layoutTree 布局树对象
   * @returns {Promise<boolean>} 是否成功导出
   */
  static exportLayoutToFile(layoutTree) {
    return new Promise((resolve) => {
      try {
        if (!layoutTree) {
          console.error('导出布局失败: 布局树为空');
          resolve(false);
          return;
        }
        
        // 清理布局树
        const cleanedTree = this.cleanLayoutTree(layoutTree);
        
        // 转换为JSON
        const layoutConfig = JSON.stringify(cleanedTree, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([layoutConfig], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.download = `news-portal-layout-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        
        // 释放URL
        URL.revokeObjectURL(url);
        
        resolve(true);
      } catch (error) {
        console.error('导出布局失败:', error);
        resolve(false);
      }
    });
  }
  
  /**
   * 验证导入的布局树是否有效
   * 检查布局树的基本结构和必要字段，确保能被系统正确解析
   * 
   * @param {Object} layoutTree 布局树对象
   * @returns {Object} 包含是否有效和错误信息的对象
   */
  static validateLayoutTree(layoutTree) {
    // 检查基本结构
    if (!layoutTree || typeof layoutTree !== 'object') {
      return { valid: false, error: '布局配置无效：不是有效的对象' };
    }
    
    // 检查是否有必要的字段
    if (!layoutTree.id) {
      return { valid: false, error: '布局配置无效：缺少ID字段' };
    }
    
    if (!layoutTree.type) {
      return { valid: false, error: '布局配置无效：缺少类型字段' };
    }
    
    // 检查children是否为数组
    if (!Array.isArray(layoutTree.children)) {
      return { valid: false, error: '布局配置无效：子节点不是数组' };
    }
    
    // 递归检查子节点
    const checkNode = (node, path = 'root') => {
      if (!node.id) {
        return { valid: false, error: `节点 ${path} 缺少ID字段` };
      }
      
      if (!node.type) {
        return { valid: false, error: `节点 ${path} 缺少类型字段` };
      }
      
      // 检查节点类型是否有效
      if (node.type !== 'container' && node.type !== 'row' && node.type !== 'column') {
        return { valid: false, error: `节点 ${path} 类型无效：${node.type}` };
      }
      
      // 递归检查子节点
      if (Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          const childResult = checkNode(node.children[i], `${path}.children[${i}]`);
          if (!childResult.valid) {
            return childResult;
          }
        }
      }
      
      return { valid: true };
    };
    
    // 对于根节点，我们执行更详细的验证
    return checkNode(layoutTree);
  }
  
  /**
   * 从文件导入布局配置
   * 读取上传的JSON文件，解析为布局树对象，并进行验证和预处理
   * 
   * @param {File} file 上传的JSON文件
   * @returns {Promise<Object>} 解析后的布局树对象
   */
  static importLayoutFromFile(file) {
    return new Promise((resolve, reject) => {
      // 验证文件类型
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        reject(new Error('只能导入JSON格式的文件'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          
          // 尝试解析JSON
          let layoutTree;
          try {
            layoutTree = JSON.parse(content);
          } catch (parseError) {
            reject(new Error('无法解析文件内容，不是有效的JSON格式'));
            return;
          }
          
          // 验证布局树
          const validation = this.validateLayoutTree(layoutTree);
          if (!validation.valid) {
            reject(new Error(validation.error));
            return;
          }
          
          // 处理导入的布局树，确保兼容性
          this.prepareImportedLayout(layoutTree);
          
          resolve(layoutTree);
        } catch (error) {
          console.error('导入布局失败:', error);
          reject(new Error('解析布局配置文件失败：' + (error.message || '未知错误')));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      // 读取文件内容
      reader.readAsText(file);
    });
  }
  
  /**
   * 处理导入的布局树，确保与当前系统兼容
   * 主要完成以下工作：
   * 1. 建立正确的父子节点关系
   * 2. 确保节点有children数组
   * 3. 清理widget配置中的items属性
   * 
   * @param {Object} layoutTree 导入的布局树
   * @returns {Object} 处理后的布局树
   */
  static prepareImportedLayout(layoutTree) {
    // 递归处理布局树中的每个节点
    const processNode = (node, parentId = null) => {
      if (!node) {
        return;
      }
      
      // 设置父节点ID（如果提供）
      if (parentId !== null) {
        node.parent = parentId;
      }
      
      // 确保节点有children数组
      if (!Array.isArray(node.children)) {
        node.children = [];
      }
      
      // 处理组件配置
      if (node.widget && node.widget.config) {
        // 确保不包含items属性
        if ('items' in node.widget.config) {
          delete node.widget.config.items;
        }
      }
      
      // 递归处理子节点，传递当前节点ID作为父ID
      node.children.forEach(child => processNode(child, node.id));
    };
    
    processNode(layoutTree);
    
    // 返回处理后的布局树
    return layoutTree;
  }
  
  /**
   * 修复布局树中节点的类型和样式设置
   * 确保导入的布局在当前系统中能正确显示
   * 主要检查和设置以下属性：
   * 1. 行节点的宽度
   * 2. 列节点的span和百分比宽度
   * 3. 列节点的高度
   * 
   * @param {Object} layoutTree 布局树对象
   * @returns {Object} 修复后的布局树
   */
  static fixLayoutNodeStyles(layoutTree) {
    // 深拷贝布局树，避免修改原始数据
    const treeCopy = JSON.parse(JSON.stringify(layoutTree));
    
    // 递归修复节点样式
    const fixNodeStyles = (node) => {
      if (!node) {
        return;
      }
      
      // 根据节点类型设置默认样式
      if (node.type === 'row') {
        // 行节点默认样式
        if (!node.width) {
          node.width = '100%';
        }
      } else if (node.type === 'column') {
        // 列节点默认样式
        if (!node.span && !node.percentWidth) {
          node.span = 10; // 默认占满宽度
          node.percentWidth = '100%';
        }
        
        // 如果只有percentWidth但没有span，根据百分比计算span
        if (node.percentWidth && !node.span) {
          const percentValue = parseFloat(node.percentWidth);
          if (!isNaN(percentValue)) {
            node.span = Math.round(percentValue / 10);
          }
        }
        
        // 确保高度设置
        if (!node.height) {
          node.height = '100%';
        }
      }
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => fixNodeStyles(child));
      }
    };
    
    // 执行修复
    fixNodeStyles(treeCopy);
    
    return treeCopy;
  }
} 