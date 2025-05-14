<template>
  <div class="layout-preview">
    <div v-if="layoutTree && layoutTree.children && layoutTree.children.length > 0" class="preview-content">
      <template v-for="node in layoutTree.children">
        <preview-node :key="node.id" :node="node" />
      </template>
    </div>
    <div v-else class="empty-layout">
      <el-empty description="布局为空，请在编辑器中添加布局和组件">
        <template #image>
          <i class="el-icon-s-grid" style="font-size: 60px; color: #909399;"></i>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script>
import WidgetRegistry from '@/services/widget-registry';

// 预览节点组件
const PreviewNode = {
  name: 'PreviewNode',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    // 根据组件类型获取对应的组件
    getWidgetComponent(type) {
      const component = WidgetRegistry.get(type);
      console.log(`获取组件 ${type}:`, component ? 'Success' : 'Not Found');
      return component;
    },
    
    // 检查节点是否为叶子节点（没有子节点）
    isLeafNode() {
      return !this.node.children || this.node.children.length === 0;
    }
  },
  render(h) {
    // 打印节点信息，帮助调试
    console.log('渲染节点:', JSON.stringify({
      id: this.node.id,
      type: this.node.type,
      hasWidget: !!this.node.widget,
      hasChildren: !!(this.node.children && this.node.children.length),
      widgetType: this.node.widget && this.node.widget.type
    }));
    
    // 如果节点有组件配置，优先渲染组件
    if (this.node.widget && this.node.widget.type) {
      try {
        const widgetComponent = this.getWidgetComponent(this.node.widget.type);
        if (!widgetComponent) {
          console.error('找不到组件类型:', this.node.widget.type);
          return h('div', { class: 'preview-widget error' }, `组件类型无效: ${this.node.widget.type}`);
        }
        
        return h('div', { class: 'preview-widget' }, [
          h(widgetComponent, {
            props: {
              config: this.node.widget.config || {},
              channelId: this.node.channelId || null
            },
            class: 'widget-component'
          })
        ]);
      } catch (e) {
        console.error('渲染组件错误:', e);
        return h('div', { class: 'preview-widget error' }, `渲染错误: ${e.message}`);
      }
    }
    
    // 无子节点的空容器
    if (!this.node.children || this.node.children.length === 0) {
      return h('div', { 
        class: ['preview-empty-node', `preview-${this.node.type}`]
      }, [
        h('div', { class: 'empty-placeholder' }, '空布局区域')
      ]);
    }
    
    // 渲染行布局
    if (this.node.type === 'row') {
      // 检查行中是否有列子节点
      const hasColumnChildren = this.node.children && this.node.children.some(child => child.type === 'column');
      
      return h('div', { 
        class: 'preview-row',
        style: this.node.height ? { height: this.node.height.match(/^\d+$/) ? `${this.node.height}px` : this.node.height } : {}
      }, [
        h('div', { 
          class: hasColumnChildren ? 'column-container' : 'row-content',
          style: hasColumnChildren ? {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            width: '100%'
          } : {}
        }, 
          this.node.children.map(child => 
            h('preview-node', {
              props: {
                node: child
              }
            })
          )
        )
      ]);
    }
    
    // 渲染列布局
    if (this.node.type === 'column') {
      const spanWidth = this.node.span ? `${this.node.span * 10}%` : '100%';
      
      return h('div', { 
        class: 'preview-column',
        style: {
          width: spanWidth,
          display: 'inline-block',
          verticalAlign: 'top',
          height: this.node.height ? (this.node.height.match(/^\d+$/) ? `${this.node.height}px` : this.node.height) : '100%'
        }
      }, [
        h('div', { class: 'column-content' }, 
          this.node.children.map(child => 
            h('preview-node', {
              props: {
                node: child
              }
            })
          )
        )
      ]);
    }
    
    // 默认渲染容器
    return h('div', { class: 'preview-container' }, 
      this.node.children.map(child => 
        h('preview-node', {
          props: {
            node: child
          }
        })
      )
    );
  }
};

export default {
  name: 'LayoutPreview',
  components: {
    PreviewNode
  },
  props: {
    layoutTree: {
      type: Object,
      required: true,
      default: () => ({ children: [] })
    }
  }
};
</script>

<style lang="scss" scoped>
.layout-preview {
  width: 100%;
  min-height: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
  
  .preview-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

::v-deep {
  .preview-row {
    width: 100%;
    margin-bottom: 20px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #f9f9f9;
    padding: 15px;
    box-sizing: border-box;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .row-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 20px;
    }
    
    .column-container {
      display: flex;
      flex-direction: row !important; 
      flex-wrap: nowrap !important;
      gap: 16px;
      width: 100%;
    }
  }
  
  .preview-column {
    padding: 0 5px;
    box-sizing: border-box;
    
    .column-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 20px;
      background-color: #fff;
      padding: 15px;
      border-radius: 4px;
    }
  }
  
  .preview-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .preview-widget {
    width: 100%;
    margin-bottom: 0;
    border-radius: 4px;
    overflow: hidden;
    
    .widget-component {
      width: 100%;
    }
  }
  
  .preview-empty-node {
    min-height: 80px;
    background-color: #f9f9f9;
    border-radius: 4px;
    border: 1px dashed #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .empty-placeholder {
      color: #909399;
      font-size: 14px;
      font-style: italic;
    }
  }
}

.empty-layout {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin: 20px 0;
}

.preview-widget.error {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 15px;
  text-align: center;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style> 