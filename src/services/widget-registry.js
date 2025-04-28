// 组件注册服务，用于管理可用的组件
const WidgetRegistry = {
  // 保存所有已注册的组件
  _registry: new Map(),
  
  // 注册一个组件
  register(type, component) {
    if (!type || !component) {
      console.error('注册组件需要提供类型和组件');
      return;
    }
    
    this._registry.set(type, component);
    console.log(`组件 ${type} 已注册`);
  },
  
  // 获取一个组件
  get(type) {
    if (!this._registry.has(type)) {
      console.warn(`组件 ${type} 未注册`);
      return null;
    }
    
    return this._registry.get(type);
  },
  
  // 检查组件是否已注册
  has(type) {
    return this._registry.has(type);
  },
  
  // 获取所有已注册的组件类型
  getTypes() {
    return Array.from(this._registry.keys());
  }
};

export default WidgetRegistry; 