<template>
  <div class="layout-editor">
    <el-header height="60px" class="editor-header">
      <div class="header-controls">
        <div class="left-area">
          <h2>新闻门户布局编辑器</h2>
        </div>
        <div class="right-area">
          <el-button-group class="action-group">
            <el-button type="primary" icon="el-icon-check" @click="saveLayout" :loading="saving">保存</el-button>
            <el-button type="success" icon="el-icon-view" @click="showPreview">预览</el-button>
          </el-button-group>
          
          <el-button-group class="action-group">
            <el-button type="info" icon="el-icon-download" @click="exportLayout">导出</el-button>
            <el-button type="info" icon="el-icon-upload2" @click="openImportDialog">导入</el-button>
            <el-button type="warning" icon="el-icon-question" @click="handleExport('help')">帮助</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="resetLayout">重置</el-button>
          </el-button-group>
        </div>
      </div>
    </el-header>

    <div class="editor-main">
      <div class="editor-content">
        <!-- 初始空布局状态 -->
        <div v-if="!rootNode" class="empty-layout">
          <el-empty description="布局为空，点击下方的按钮开始设计">
            <template #image>
              <i class="el-icon-s-grid"></i>
            </template>
            <el-button type="primary" @click="createRootNode">创建布局</el-button>
          </el-empty>
        </div>

        <!-- 布局树结构显示 -->
        <template v-else>
          <div class="layout-root">
            <h3 class="layout-title">布局结构</h3>
            <div class="layout-container">
              <!-- 使用v-for遍历根节点下的所有布局 -->
              <div v-for="node in rootNode.children" :key="node.id">
                <layout-node 
                  :node="node" 
                  :depth="0"
                  @add-row="handleAddRow"
                  @add-column="handleAddColumn"
                  @delete-node="handleDeleteNode"
                  @select-widget="handleSelectWidget" />
            </div>

              <!-- 初始化后添加行布局按钮 -->
              <div class="add-layout-controls">
                <el-button type="primary" icon="el-icon-plus" @click="addRootRow">添加行布局</el-button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 组件选择对话框 -->
    <el-dialog
      title="选择栏目样式"
      :visible.sync="widgetDialogVisible"
      width="80%"
      :before-close="handleCloseWidgetDialog">
      <div class="widget-selection">
        <div class="widget-group" v-for="(group, groupName) in groupedWidgets" :key="groupName">
          <h3 class="group-title">{{ groupName }}</h3>
          <el-row :gutter="20">
            <el-col :span="12" v-for="widget in group" :key="widget.id">
              <el-card 
                class="widget-card" 
                :class="{ 'is-selected': selectedWidgetId === widget.id }"
                @click.native="selectWidget(widget)">
                <div class="preview-area">
                      <component 
                        :is="getWidgetComponent(widget.type)"
                    :config="widget.config"
                    class="preview-component" />
                    </div>
                <div class="widget-info text-center">
                  <h4>{{ widget.name }}</h4>
                  </div>
              </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      <div slot="footer" class="dialog-footer">
        <div class="channel-selection" v-if="selectedWidgetId">
          <span>关联栏目：</span>
          <el-select v-model="selectedChannelId" placeholder="请选择栏目">
            <el-option
              v-for="channel in channels"
              :key="channel.id"
              :label="channel.name"
              :value="channel.id">
            </el-option>
          </el-select>
        </div>
        <el-button @click="handleCloseWidgetDialog">取消</el-button>
        <el-button type="primary" @click="confirmWidgetSelection" :disabled="!selectedWidgetId">确定</el-button>
      </div>
    </el-dialog>

    <!-- 布局属性设置对话框 -->
    <el-dialog
      :title="newLayoutType === 'row' ? '添加行布局' : '添加列布局'"
      :visible.sync="layoutPropsDialogVisible"
      width="30%">
      <el-form :model="newLayoutProps" label-width="100px">
        <el-form-item label="布局比例" prop="ratios">
          <el-input v-model="newLayoutProps.ratios" :placeholder="newLayoutType === 'row' ? '可选，例如: 1:1 或 1:2:1' : '例如: 1:1 或 2:3:1'">
            <template slot="append">
              <el-tooltip :content="newLayoutType === 'row' ? '用冒号分隔各行的高度比例，如1:1表示两个等高行，1:2:1表示三行(25%,50%,25%)' : '用冒号分隔各列的宽度比例，如1:1表示两个等宽列，2:5:3表示三列(20%,50%,30%)'" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
          </el-input>
          <div class="form-item-tip">
            <span v-if="newLayoutType === 'row'">留空表示添加单个行，输入比例如1:1将创建多个行</span>
            <span v-else>输入比例如1:1将创建两个等宽列，1:2表示宽度比为1:2的两列</span>
        </div>
        </el-form-item>
        <el-form-item label="高度" prop="height">
          <el-input v-model="newLayoutProps.height" placeholder="可选，如200px">
            <template slot="append">px</template>
          </el-input>
          <div class="form-item-tip">
            <span v-if="newLayoutType === 'row'">留空表示高度自适应内容</span>
            <span v-else>留空表示高度占满父容器</span>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="layoutPropsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddLayout">确认</el-button>
      </span>
    </el-dialog>

    <!-- 布局预览对话框 -->
    <el-dialog
      title="布局预览效果"
      :visible.sync="previewDialogVisible"
      width="90%"
      class="preview-dialog"
      :fullscreen="true"
      :before-close="hidePreview">
      <div class="preview-toolbar">
        <div class="preview-info">
          <i class="el-icon-info"></i>
          <span>此预览展示了布局的最终效果，包括所有添加的组件和栏目内容</span>
        </div>
        <el-button type="primary" size="small" @click="hidePreview">返回编辑</el-button>
      </div>
      <layout-preview :layout-tree="previewLayoutTree" />
    </el-dialog>

    <!-- 导入布局对话框 -->
    <el-dialog
      title="导入布局配置"
      :visible.sync="importDialogVisible"
      :width="dialogWidth"
      :close-on-click-modal="false"
      :close-on-press-escape="!importing"
      @closed="handleImportDialogClosed"
      custom-class="import-layout-dialog">
      <div class="import-dialog-content">
        <el-upload
          class="layout-uploader"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          :file-list="importFileList"
          :disabled="importing"
          ref="importUpload">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将布局配置文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">只能上传JSON文件，且布局结构必须符合要求</div>
        </el-upload>
        <div class="import-tips" v-if="importFile">
          <el-alert
            title="导入操作将覆盖当前布局"
            type="warning"
            :closable="false"
            show-icon>
            <p>请确保已备份当前布局，导入操作不可撤销。</p>
          </el-alert>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelImport" :disabled="importing">取消</el-button>
        <el-button type="primary" @click="importLayout" :disabled="!importFile || importing" :loading="importing">
          导入
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import WidgetRegistry from '@/services/widget-registry';
import api from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import LayoutPreview from '@/components/preview/LayoutPreview.vue';
import LayoutUtils from '@/utils/layout-utils';

// 布局节点组件
const LayoutNode = {
  name: 'LayoutNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    isRoot: {
      type: Boolean,
      default: false
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isHovered: false,
      // 如果是叶子节点，强制显示
      forceVisible: !this.node.children || this.node.children.length === 0
    };
  },
  computed: {
    isLeafNode() {
      return !this.node.children || this.node.children.length === 0;
    },
    nodeTypeLabel() {
      return this.node.type === 'row' ? '行布局' : '列布局';
    },
    shouldShowContent() {
      // 如果是叶子节点或者有组件，始终显示内容
      return this.isLeafNode || this.node.widget;
    },
    layoutInfoText() {
      const { type, span, height, percentWidth } = this.node;
      if (type === 'row') {
        let info = '宽度: 100%';
        if (height) {
          info += `, 高度: ${height}`;
        }
        return info;
      } else if (type === 'column') {
        let info = percentWidth ? `宽度: ${percentWidth}` : `宽度: ${span || 1}/10`;
        if (height) {
          info += `, 高度: ${height}`;
        }
        return info;
      }
      return '';
    }
  },
  methods: {
    handleMouseEnter() {
      this.isHovered = true;
    },
    handleMouseLeave() {
      this.isHovered = false;
    },
    addRow() {
      this.$emit('add-row', this.node.id);
    },
    addColumn() {
      this.$emit('add-column', this.node.id);
    },
    deleteNode() {
      this.$emit('delete-node', this.node.id);
    },
    selectWidget() {
      this.$emit('select-widget', this.node.id);
    },
    showLayoutInfo() {
      const { type, span, height, percentWidth } = this.node;
      let message = '';
      
      if (type === 'row') {
        message = `行布局: 宽度占满(100%)${height ? `，高度: ${height}` : '，高度自适应'}`;
      } else if (type === 'column') {
        const widthText = percentWidth || `${Math.round((span || 1) * 10)}%`;
        message = `列布局: 宽度 ${widthText}${height ? `，高度: ${height}` : '，高度占满'}`;
      }
      
      this.$root.$message.info(message);
    },
    // 获取组件实例
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    }
  },
  render(h) {
    // 创建子节点
    const renderChildren = () => {
      if (!this.node.children || this.node.children.length === 0) {
        return h('div', { class: 'empty-container' }, [
          h('span', {}, this.node.type === 'row' ? '可添加行或列布局' : '可添加行布局')
        ]);
      }
      
      // 确定子节点类型
      const hasColumnChildren = this.node.children.some(child => child.type === 'column');
      
      // 布局容器类
      const containerClass = hasColumnChildren && this.node.type === 'row' 
        ? 'column-container' // 如果行布局中有列节点，使用列容器样式
        : (this.node.type === 'row' ? 'row-container' : 'column-container');
        
      return h('div', { 
        class: containerClass,
        style: {
          display: 'flex', 
          // 如果是行布局中的列子节点，强制横向排列
          flexDirection: (this.node.type === 'row' && hasColumnChildren) ? 'row' : (this.node.type === 'row' ? 'column' : 'row'),
          flexWrap: 'nowrap',
          width: '100%',
          gap: '16px',
          overflow: 'hidden' // 防止溢出
        }
      }, 
        this.node.children.map(child => 
          h('layout-node', {
            props: {
              node: child,
              depth: this.depth + 12
            },
            style: child.type === 'column' ? {
              flex: child.percentWidth ? `0 0 ${child.percentWidth}` : `${child.span} 0 0`,
              width: child.percentWidth || `${child.span * 10}%`,
              minWidth: child.percentWidth || `${child.span * 10}%`
            } : {},
            on: {
              'add-row': parentId => this.$emit('add-row', parentId),
              'add-column': parentId => this.$emit('add-column', parentId),
              'delete-node': nodeId => this.$emit('delete-node', nodeId),
              'select-widget': nodeId => this.$emit('select-widget', nodeId)
            }
          })
        )
      );
    };

    // 叶子节点的内容
    const renderLeafContent = () => {
      console.log('渲染叶子节点:', this.node.id, '有组件?', !!this.node.widget);
      
      if (this.node.widget) {
        return h('div', { class: 'node-widget' }, [
          h('div', { class: 'widget-info' }, [
            h('span', { class: 'widget-name' }, `组件: ${this.node.widget.name}`),
            h('span', { class: 'channel-name' }, `栏目: ${this.node.channelName || '未设置'}`)
          ]),
          h('div', { class: 'widget-preview' }, [
            // 渲染实际组件
            h(this.getWidgetComponent(this.node.widget.type), {
              props: {
                config: this.node.widget.config || {},
                channelId: this.node.channelId
              },
              class: 'preview-component'
            })
          ])
        ]);
      } else {
        return h('div', { 
          class: 'empty-node',
          on: {
            click: this.selectWidget
          }
        }, [
          h('i', { class: 'el-icon-plus' }),
          h('span', {}, '添加组件')
        ]);
      }
    };

    // 创建节点的操作按钮
    const renderNodeControls = () => {
      const buttons = [];
      
      // 添加布局按钮（对所有节点都显示）
      if (this.node.type === 'row') {
        // 行布局中可以添加行和列
        buttons.push(
          h('el-button', {
            props: { 
              type: 'primary',
              size: 'mini',
              icon: 'el-icon-s-unfold'
            },
            on: { click: this.addRow }
          }, '添加行'),
          h('el-button', {
            props: { 
              type: 'primary',
              size: 'mini',
              icon: 'el-icon-s-fold'
            },
            on: { click: this.addColumn }
          }, '添加列')
        );
      } else if (this.node.type === 'column') {
        // 列布局中只能添加行
        buttons.push(
          h('el-button', {
            props: { 
              type: 'primary',
              size: 'mini',
              icon: 'el-icon-s-unfold'
            },
            on: { click: this.addRow }
          }, '添加行')
        );
      }
      
      // 不是根节点时才显示删除按钮
      if (!this.isRoot) {
        buttons.push(
          h('el-button', {
            props: { 
              type: 'danger',
              size: 'mini',
              icon: 'el-icon-delete'
            },
            on: { click: this.deleteNode }
          })
        );
      }
      
      return h('div', { 
        class: 'node-controls',
        style: {
          display: this.isHovered ? 'flex' : 'none'
        }
      }, buttons);
    };

    // 创建节点样式对象
    const nodeStyle = {};
    
    // 设置高度
    if (this.node.height) {
      nodeStyle.height = this.node.height.match(/^\d+$/) 
        ? `${this.node.height}px` 
        : this.node.height;
    }
    
    // 设置宽度
    if (this.node.width) {
      nodeStyle.width = this.node.width;
    }
    
    // 列节点宽度样式
    if (this.node.type === 'column') {
      if (this.node.percentWidth) {
        // 使用精确的百分比宽度
        nodeStyle.width = this.node.percentWidth;
        nodeStyle.flex = `0 0 ${this.node.percentWidth}`;
      } else if (this.node.span) {
        // 向后兼容，为老数据使用span
        nodeStyle.flex = `${this.node.span} 0 0%`;
        nodeStyle.width = `${this.node.span * 10}%`;
      }
      // 防止列被挤压
      nodeStyle.flexShrink = "0";
    }

    // 行节点高度比例（如果设置了flexRatio）
    if (this.node.type === 'row' && this.node.flexRatio) {
      nodeStyle.flex = `${this.node.flexRatio} 0 auto`;
    }

    // 创建布局节点
    return h('div', { 
      class: [
        'layout-node', 
        `node-${this.node.type}`, 
        `depth-${this.depth}`, 
        { 
          'is-hovered': this.isHovered,
          'is-leaf': this.isLeafNode,
          'has-widget': !!this.node.widget
        }
      ],
      style: {
        ...nodeStyle,
        // 添加一些额外的样式确保显示
        position: 'relative',
        display: 'block'
      },
      on: {
        mouseenter: this.handleMouseEnter,
        mouseleave: this.handleMouseLeave
      }
    }, [
      h('div', { class: 'node-header' }, [
        h('div', { class: 'node-title' }, [
          h('i', { 
            class: this.node.type === 'row' 
              ? 'el-icon-s-unfold' 
              : 'el-icon-s-grid'
          }),
          h('span', { 
            class: this.node.type === 'row' ? 'row-label' : 'column-label',
            on: { click: this.showLayoutInfo }
          }, this.nodeTypeLabel),
          this.layoutInfoText 
            ? h('span', { 
                class: 'layout-info',
                on: { click: this.showLayoutInfo }
              }, `(${this.layoutInfoText})`) 
            : null
        ]),
        renderNodeControls()
      ]),
      h('div', { 
        class: 'node-content',
        style: {
          // 关键修改：强制组件内容区域始终显示
          display: 'block !important',
          visibility: 'visible !important',
          opacity: 1
        }
      }, [
        this.isLeafNode ? renderLeafContent() : renderChildren()
      ])
    ]);
  }
};

export default {
  name: 'LayoutEditor',
  components: {
    LayoutNode,
    LayoutPreview
  },
  data() {
    return {
      rootNode: null,
      saving: false,
      widgetDialogVisible: false,
      selectedNodeId: null,
      selectedWidgetId: null,
      selectedChannelId: null,
      layoutPropsDialogVisible: false,
      newLayoutType: 'row',
      newLayoutParentId: null,
      newLayoutProps: {
        ratios: '',
        height: ''
      },
      previewDialogVisible: false,
      previewLayoutTree: null,
      importDialogVisible: false,
      importFile: null,
      importFileList: [],
      importing: false,
      dialogWidth: '40%'  // 默认对话框宽度
    };
  },
  computed: {
    ...mapState('widget', ['widgets']),
    ...mapState('channel', ['channels']),
    ...mapState('layout', ['layoutTree']),
    
    // 按类型分组的组件
    groupedWidgets() {
      const groups = {};
      
      // 轮播图组件
      const carouselWidgets = this.widgets.filter(w => w.type.startsWith('carousel-'));
      if (carouselWidgets.length) {
        groups['轮播图'] = carouselWidgets;
      }
      
      // 新闻列表组件
      const newsListWidgets = this.widgets.filter(w => w.type.startsWith('news-list'));
      if (newsListWidgets.length) {
        groups['新闻列表'] = newsListWidgets;
      }
      
      // 图片新闻组件
      const imageNewsWidgets = this.widgets.filter(w => w.type === 'image-news');
      if (imageNewsWidgets.length) {
        groups['图片新闻'] = imageNewsWidgets;
      }
      
      // 排行榜组件
      const hotNewsWidgets = this.widgets.filter(w => w.type === 'hot-news');
      if (hotNewsWidgets.length) {
        groups['排行榜'] = hotNewsWidgets;
      }
      
      // 其他组件
      const otherTypes = ['carousel-', 'news-list', 'image-news', 'hot-news'];
      const otherWidgets = this.widgets.filter(w => 
        !otherTypes.some(type => w.type === type || w.type.startsWith(type))
      );
      if (otherWidgets.length) {
        groups['其他组件'] = otherWidgets;
      }
      
      return groups;
    }
  },
  methods: {
    ...mapActions('widget', ['fetchWidgets']),
    ...mapActions('channel', ['fetchChannels']),
    ...mapActions('layout', ['saveLayoutTree', 'loadLayoutTree']),
    
    // 创建根节点
    createRootNode() {
      // 使用UUID创建唯一ID
      const containerId = uuidv4();
      const rowId = uuidv4();
      
      this.rootNode = {
        id: containerId,
        type: 'container', // 根节点作为容器
        children: [] // 初始化空的children数组
      };
      
      // 添加一个行布局作为首个子节点
      this.rootNode.children.push({
        id: rowId,
        type: 'row', // 确保是行布局
        height: '', // 可设置高度
        width: '100%', // 明确设置宽度为100%
        parent: containerId, // 设置父节点
        children: []
      });
      
      // 保存到vuex
      this.saveLayoutTree(this.rootNode);
    },
    
    // 在根节点下添加行
    addRootRow() {
      if (this.rootNode) {
        if (!this.rootNode.children) {
          this.rootNode.children = [];
        }
        
        // 直接创建一个新的行布局并添加到根容器下
        const newRow = {
          id: uuidv4(),
          type: 'row',
          height: '', // 高度自适应
          width: '100%', // 宽度占满
          parent: this.rootNode.id,
          children: []
        };
        
        this.rootNode.children.push(newRow);
        this.saveLayoutTree(this.rootNode); // 保存修改后的布局
        this.$message.success('已添加新行布局');
      }
    },
    
    // 添加行节点到指定父节点
    handleAddRow(parentId) {
      this.showLayoutPropsDialog('row', parentId);
    },
    
    // 添加列节点到指定父节点
    handleAddColumn(parentId) {
      this.showLayoutPropsDialog('column', parentId);
    },
    
    // 删除节点
    handleDeleteNode(nodeId) {
      const deleteNode = (node, id) => {
        if (!node || !node.children) return false;
        
        const index = node.children.findIndex(child => child.id === id);
        if (index >= 0) {
          node.children.splice(index, 1);
          return true;
        }
        
        for (let i = 0; i < node.children.length; i++) {
          if (deleteNode(node.children[i], id)) {
            return true;
          }
        }
        
        return false;
      };
      
      deleteNode(this.rootNode, nodeId);
      this.saveLayoutTree(this.rootNode); // 保存修改后的布局
    },
    
    // 处理节点选择组件
    handleSelectWidget(nodeId) {
      this.selectedNodeId = nodeId;
      this.selectedWidgetId = null;
      this.selectedChannelId = null;
      this.widgetDialogVisible = true;
    },
    
    // 关闭组件选择对话框
    handleCloseWidgetDialog() {
      this.widgetDialogVisible = false;
      this.selectedWidgetId = null;
      this.selectedChannelId = null;
    },
    
    // 选择组件
    selectWidget(widget) {
      this.selectedWidgetId = widget.id;
    },
    
    // 确认组件选择
    confirmWidgetSelection() {
      if (!this.selectedNodeId || !this.selectedWidgetId) {
        return;
      }
      
      // 先关闭对话框，避免UI阻塞
      this.widgetDialogVisible = false;
      
      // 使用Vue.set确保响应式更新
      const node = this.findNodeById(this.rootNode, this.selectedNodeId);
      if (node) {
        const widget = this.widgets.find(w => w.id === this.selectedWidgetId);
        if (!widget) {
          this.$message.error('选择的组件无效');
          return;
        }
        
        // 验证组件类型是否可用
        const component = WidgetRegistry.get(widget.type);
        if (!component) {
          this.$message.error(`组件类型 "${widget.type}" 未注册，无法使用`);
          return;
        }
        
        const channel = this.channels.find(c => c.id === this.selectedChannelId);
        
        // 深拷贝组件对象
        const widgetCopy = JSON.parse(JSON.stringify(widget));
        
        // 确保config中不包含items属性
        if (widgetCopy.config && 'items' in widgetCopy.config) {
          console.log('移除组件配置中的items属性:', widgetCopy.config.items);
          delete widgetCopy.config.items;
        }
        
        console.log('保存组件数据(已清理items):', widgetCopy);
        
        // 使用Vue的响应式更新机制
        this.$set(node, 'widget', widgetCopy);
        this.$set(node, 'channelId', this.selectedChannelId);
        this.$set(node, 'channelName', channel ? channel.name : '');
        this.$set(node, 'hasWidget', true);  // 明确标记有组件
        
        // 创建新的根节点引用来触发完整更新
        const newRootNode = JSON.parse(JSON.stringify(this.rootNode));
        
        // 更新本地状态
        this.rootNode = null; // 先设为null强制刷新
        this.$nextTick(() => {
          this.rootNode = newRootNode;
          
          // 保存到vuex
          console.log('保存到布局树:', newRootNode);
          this.saveLayoutTree(newRootNode);
          
          // 显示成功消息
          this.$message.success('组件关联成功');
        });
      }
    },
    
    // 通过ID查找节点
    findNodeById(node, id) {
      if (!node) return null;
      if (node.id === id) return node;
      
      if (node.children) {
        for (const child of node.children) {
          const found = this.findNodeById(child, id);
          if (found) return found;
        }
      }
      
      return null;
    },
    
    // 获取组件
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    
    // 保存布局
    async saveLayout() {
      this.saving = true;
      try {
        await api.saveLayout({ layoutTree: this.rootNode });
        this.saveLayoutTree(this.rootNode); // 保存到vuex
        this.$message.success('布局保存成功');
      } catch (error) {
        this.$message.error('保存失败: ' + error.message);
      } finally {
        this.saving = false;
      }
    },
    
    // 重置布局
    resetLayout() {
      this.$confirm('确定要重置布局吗？所有未保存的布局更改将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.rootNode = null;
        this.saveLayoutTree(null); // 清空vuex中的布局
        this.$message.success('布局已重置');
      }).catch(() => {});
    },
    
    // 处理导出相关操作
    handleExport(command) {
      if (command === 'export') {
        this.exportLayout();
      } else if (command === 'import') {
        this.openImportDialog();
      } else if (command === 'help') {
        this.$alert(
          `<p>布局编辑器使用说明：</p>
          <ol>
            <li>点击<b>创建布局</b>按钮初始化一个行布局</li>
            <li>通过<b>添加行布局</b>按钮可以添加更多行</li>
            <li>在行布局中可以添加<b>行布局</b>或<b>列布局</b></li>
            <li>添加列布局时可以设置宽度比例(如5:5表示等宽两列)</li>
            <li>任何布局都可以设置高度(如200px)</li>
            <li>在叶子节点可以<b>选择组件</b>并关联新闻栏目</li>
            <li>完成后点击<b>保存布局</b>保存您的设计</li>
            <li>可以使用<b>导出</b>功能将布局保存为JSON文件</li>
            <li>使用<b>导入</b>功能可以加载已保存的布局配置</li>
          </ol>`,
          '使用帮助',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '知道了'
          }
        );
      }
    },
    
    // 导出布局配置
    async exportLayout() {
      try {
        // 使用工具类导出布局
        const success = await LayoutUtils.exportLayoutToFile(this.rootNode);
        
        if (success) {
          this.$message.success('布局配置已导出');
        } else {
          this.$message.error('导出失败');
        }
      } catch (error) {
        this.$message.error('导出失败: ' + error.message);
      }
    },
    
    // 打开导入对话框
    openImportDialog() {
      this.importDialogVisible = true;
      // 先重置状态，防止之前的状态残留
      setTimeout(() => {
        this.resetImportState();
      }, 100);
    },
    
    // 重置导入状态
    resetImportState() {
      // 确保清除所有导入相关状态
      this.importing = false;
      this.importFile = null;
      
      // 清空文件列表
      this.importFileList = [];
      
      // 手动触发文件上传组件重置
      this.$nextTick(() => {
        const uploadRef = this.$refs.importUpload;
        if (uploadRef && typeof uploadRef.clearFiles === 'function') {
          uploadRef.clearFiles();
        }
      });
    },
    
    // 取消导入
    cancelImport() {
      if (this.importing) return;
      this.importDialogVisible = false;
    },
    
    // 处理导入对话框关闭事件
    handleImportDialogClosed() {
      // 确保对话框关闭后重置状态
      this.resetImportState();
    },
    
    // 导入布局
    async importLayout() {
      console.log('执行导入', this.importFile, this.importFileList);
      
      if (!this.importFile) {
        this.$message.warning('请先选择布局配置文件');
        return;
      }
      
      // 设置导入中状态
      this.importing = true;
      
      // 创建加载提示
      const loadingInstance = this.$loading({
        lock: true,
        text: '正在解析布局文件...',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.7)'
      });
      
      try {
        // 使用工具类导入布局
        let layoutTree = await LayoutUtils.importLayoutFromFile(this.importFile);
        
        // 更新加载提示
        loadingInstance.text = '验证布局数据...';
        
        // 确认导入操作
        try {
          await this.$confirm('导入将覆盖当前布局，确定要继续吗？', '确认导入', {
            confirmButtonText: '确定导入',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal: false,
            closeOnPressEscape: false
          });
        } catch (e) {
          // 用户取消导入
          console.log('用户取消导入');
          loadingInstance.close();
          this.importing = false;
          return;
        }
        
        // 使用工具类修复布局样式
        layoutTree = LayoutUtils.fixLayoutNodeStyles(layoutTree);
        
        // 更新加载提示
        loadingInstance.text = '正在应用布局...';
        
        // 确保所有节点的widget和channelId属性正确设置
        this.repairImportedLayout(layoutTree);
        
        // 使用nextTick和setTimeout确保UI完全更新
        this.$nextTick(() => {
          setTimeout(() => {
            try {
              // 更新布局树
              this.rootNode = null; // 先设置为null触发完整重绘
              
              this.$nextTick(() => {
                this.rootNode = layoutTree;
                
                // 保存到vuex
                this.saveLayoutTree(layoutTree);
                
                // 关闭加载提示
                loadingInstance.close();
                
                this.$message.success('布局导入成功');
                this.importDialogVisible = false;
                
                // 导入成功后重置状态
                this.resetImportState();
              });
            } catch (error) {
              console.error('应用布局错误:', error);
              loadingInstance.close();
              this.$message.error('应用布局失败: ' + error.message);
              this.importing = false;
            }
          }, 300); // 短暂延迟确保DOM已更新
        });
      } catch (error) {
        // 关闭加载提示
        loadingInstance.close();
        
        console.error('导入布局失败:', error);
        this.$message.error({
          message: error.message || '导入失败',
          duration: 5000,
          showClose: true
        });
        
        // 重置状态
        this.importing = false;
      }
    },
    
    // 修复导入的布局树，确保所有节点的属性正确设置
    repairImportedLayout(node) {
      if (!node) return;
      
      // 对导入的布局进行处理，确保节点与现有组件和栏目匹配
      if (node.widget) {
        // 检查widget是否存在于当前系统
        const existingWidget = this.widgets.find(w => 
          w.type === node.widget.type || 
          w.id === node.widget.id
        );
        
        if (!existingWidget) {
          // 组件不存在，清除widget属性
          console.warn(`导入的布局包含未知组件类型: ${node.widget.type}，已清除`);
          delete node.widget;
          delete node.channelId;
          delete node.channelName;
          delete node.hasWidget;
        } else {
          // 确保widget引用最新的组件定义
          node.widget = JSON.parse(JSON.stringify(existingWidget));
          
          // 检查关联的栏目是否存在
          if (node.channelId) {
            const existingChannel = this.channels.find(c => c.id === node.channelId);
            if (!existingChannel) {
              // 栏目不存在，清除channelId但保留组件
              console.warn(`导入的布局关联了未知栏目ID: ${node.channelId}，已清除`);
              delete node.channelId;
              delete node.channelName;
            } else {
              // 更新栏目名称，确保与当前系统匹配
              node.channelName = existingChannel.name;
            }
          }
          
          // 确保widget配置不包含items属性
          if (node.widget.config && 'items' in node.widget.config) {
            delete node.widget.config.items;
          }
        }
        
        // 确保设置了hasWidget标记
        if (node.widget) {
          node.hasWidget = true;
        }
      }
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => this.repairImportedLayout(child));
      }
    },
    
    // 处理文件选择变化
    handleFileChange(file, fileList) {
      console.log('文件变更:', file, fileList);
      
      // 检查文件类型
      const isJson = file.raw.type === 'application/json' || file.raw.name.endsWith('.json');
      if (!isJson) {
        this.$message.error('只能上传JSON格式的文件!');
        // 清空文件列表
        this.$refs.importUpload.clearFiles();
        this.importFile = null;
        this.importFileList = [];
        return;
      }
      
      // 更新文件状态
      this.importFile = file.raw;
      this.importFileList = [file];
    },
    
    // 新增：显示布局属性设置对话框
    showLayoutPropsDialog(layoutType, parentId) {
      this.layoutPropsDialogVisible = true;
      this.newLayoutType = layoutType;
      this.newLayoutParentId = parentId;
      
      // 为不同布局类型设置合适的默认值
      if (layoutType === 'row') {
        this.newLayoutProps = {
          ratios: '', // 行布局默认不设置比例
          height: ''
        };
      } else {
        this.newLayoutProps = {
          ratios: '1:1', // 默认等宽两列
          height: ''
        };
      }
    },
    
    // 新增：确认添加布局
    confirmAddLayout() {
      const { ratios, height } = this.newLayoutProps;
      const layoutType = this.newLayoutType;
      const parentId = this.newLayoutParentId;
      
      if (parentId === null) {
        // 添加到根节点
        // 创建行布局
        this.rootNode.children.push({
          id: uuidv4(),
          type: 'row',
          height,
          width: '100%', // 确保宽度占满
          parent: this.rootNode.id,
          children: []
        });
      } else if (layoutType === 'row') {
        // 添加行布局
        const parent = this.findNodeById(this.rootNode, parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          
          // 检查是否设置了比例
          if (ratios && ratios.includes(':')) {
            // 解析行布局比例
            const ratioArray = ratios.split(':').map(r => parseInt(r.trim()));
            const totalRatio = ratioArray.reduce((sum, r) => sum + r, 0);
            
            // 创建多行
            for (let i = 0; i < ratioArray.length; i++) {
              const ratio = ratioArray[i];
              parent.children.push({
                id: uuidv4(),
                type: 'row',
                height: height || '', // 如果设置了高度则使用，否则为空
                width: '100%', // 确保宽度占满
                flexRatio: Math.round((ratio / totalRatio) * 10), // 存储flex比例用于垂直分配
                parent: parentId,
                children: []
              });
            }
          } else {
            // 无比例，添加单行
            parent.children.push({
              id: uuidv4(),
              type: 'row',
              height,
              width: '100%', // 确保宽度占满
              parent: parentId,
              children: []
            });
          }
        }
      } else if (layoutType === 'column') {
        // 添加列布局
        const parent = this.findNodeById(this.rootNode, parentId);
        if (parent && parent.type === 'row') {
          if (!parent.children) {
            parent.children = [];
          }
          
          // 确保有比例设置
          if (ratios && ratios.includes(':')) {
            // 解析列布局比例
            const ratioArray = ratios.split(':').map(r => parseInt(r.trim()) || 1); // 默认使用1，防止无效输入
            const totalRatio = ratioArray.reduce((sum, r) => sum + r, 0);
            
            // 创建多列
            for (let i = 0; i < ratioArray.length; i++) {
              const ratio = ratioArray[i];
              // 计算百分比比例，然后转换为0-10的span值
              // 例如: 1:1:1 => 33.33% => span约为3.33，四舍五入为3
              const percent = (ratio / totalRatio) * 100;
              const span = Math.round((ratio / totalRatio) * 10);
              
              parent.children.push({
                id: uuidv4(),
                type: 'column',
                span, // 宽度比例
                percentWidth: `${percent.toFixed(2)}%`, // 存储精确的百分比，便于展示
                height: height || '100%', // 如果未设置高度，则占满父容器高度
                parent: parentId,
                children: []
              });
            }
            
            // 校正span总和为10
            this.adjustColumnSpans(parent.children);
          } else {
            // 无比例设置，默认添加一个全宽的列
            parent.children.push({
              id: uuidv4(),
              type: 'column',
              span: 10, // 满宽度
              percentWidth: '100%',
              height: height || '100%',
              parent: parentId,
              children: []
            });
          }
        }
      }
      
      this.saveLayoutTree(this.rootNode);
      this.layoutPropsDialogVisible = false;
    },
    
    // 新增：关闭布局属性设置对话框
    handleCloseLayoutPropsDialog() {
      this.layoutPropsDialogVisible = false;
    },
    
    // 新增：处理布局类型变化
    handleLayoutTypeChange() {
      // 这里可以根据布局类型变化进行相应的处理
    },

    // 显示布局预览
    showPreview() {
      if (!this.rootNode || !this.rootNode.children || !this.rootNode.children.length) {
        this.$message.warning('布局为空，请先创建布局');
        return;
      }
      
      // 检查布局中是否有组件
      const hasWidgets = this.checkForWidgets(this.rootNode);
      console.log('准备预览，布局中包含组件:', hasWidgets);
      console.log('预览布局树:', JSON.stringify(this.rootNode, null, 2));
      
      this.previewLayoutTree = JSON.parse(JSON.stringify(this.rootNode));
      this.previewDialogVisible = true;
    },

    // 检查节点及其子节点中是否有组件
    checkForWidgets(node) {
      if (!node) return false;
      
      // 当前节点有组件
      if (node.widget) {
        console.log('找到组件:', node.widget.name, node.widget.type);
        return true;
      }
      
      // 递归检查子节点
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (this.checkForWidgets(child)) {
            return true;
          }
        }
      }
      
      return false;
    },

    // 隐藏布局预览
    hidePreview() {
      this.previewDialogVisible = false;
    },

    // 校正列宽度，确保总和为10
    adjustColumnSpans(columns) {
      // 只处理列节点
      const columnNodes = columns.filter(node => node.type === 'column');
      if (columnNodes.length === 0) return;
      
      // 计算当前span总和
      const totalSpan = columnNodes.reduce((sum, col) => sum + (col.span || 0), 0);
      
      // 如果总和不是10，进行校正
      if (totalSpan !== 10) {
        // 计算校正因子
        const factor = 10 / totalSpan;
        
        // 记录累计校正结果
        let assignedSpan = 0;
        
        // 为每列分配校正后的span值
        for (let i = 0; i < columnNodes.length - 1; i++) {
          const rawSpan = columnNodes[i].span * factor;
          const newSpan = Math.round(rawSpan);
          columnNodes[i].span = newSpan;
          assignedSpan += newSpan;
        }
        
        // 最后一列应该是10减去前面所有列的span总和
        columnNodes[columnNodes.length - 1].span = 10 - assignedSpan;
      }
    },

    // 遍历树并标记有组件的节点
    markNodesWithComponents(node) {
      if (!node) return;
      
      // 检查当前节点是否有组件
      if (node.widget) {
        console.log(`节点 ${node.id} 有组件: ${node.widget.name}`);
        node.hasWidget = true;
      }
      
      // 递归检查子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => this.markNodesWithComponents(child));
      }
    },

    // 设置对话框宽度
    setDialogWidth() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        this.dialogWidth = '90%';
      } else if (screenWidth < 1200) {
        this.dialogWidth = '60%';
      } else {
        this.dialogWidth = '40%';
      }
    }
  },
  watch: {
    // 监听vuex中的布局树变化
    layoutTree: {
      handler(newVal) {
        if (newVal && (!this.rootNode || JSON.stringify(newVal) !== JSON.stringify(this.rootNode))) {
          console.log('检测到vuex中的布局树变化，正在更新...');
          // 深拷贝以确保不共享引用
          this.rootNode = JSON.parse(JSON.stringify(newVal));
          
          // 检查是否有组件的叶子节点
          this.markNodesWithComponents(this.rootNode);
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // 加载组件和栏目数据
    this.fetchWidgets();
    this.fetchChannels();
    
    // 尝试从vuex加载已保存的布局
    this.loadLayoutTree().then(layoutTree => {
      if (layoutTree) {
        this.rootNode = layoutTree;
      }
    });
  },
  mounted() {
    // 根据屏幕宽度设置对话框宽度
    this.setDialogWidth();
    // 监听窗口大小变化
    window.addEventListener('resize', this.setDialogWidth);
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.setDialogWidth);
  }
};
</script>

<style lang="scss" scoped>
.layout-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;

  .editor-header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
    padding: 0;

    .header-controls {
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;

      .left-area {
        flex-shrink: 0;
        margin-right: 10px;
        
        h2 {
          margin: 0;
          font-size: 18px;
          color: #303133;
          font-weight: 500;
          white-space: nowrap;
        }
      }

      .right-area {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: nowrap;
        overflow-x: auto;
        max-width: calc(100% - 250px);
        justify-content: flex-end;
        
        .el-button {
          padding: 9px 12px;
        }
        
        .el-button [class^="el-icon-"] + span {
          margin-left: 5px;
        }
        
        .action-group {
          flex-shrink: 0;
          
          .el-button span {
            @media (max-width: 768px) {
              display: none;
            }
          }
        }
      }
    }
  }

  .editor-main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
    width: 100%;

    .editor-content {
      flex: 1;
      overflow-y: auto;
      background-color: #fff;
      border-radius: 0;
      box-shadow: none;
      padding: 24px;
    }
  }

  .empty-layout {
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;

    .el-icon-s-grid {
      font-size: 60px;
      color: #909399;
    }
  }
  
  .layout-root {
    background-color: #fcfcfc;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    
    .layout-title {
      margin: 0 0 24px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;
      font-size: 18px;
      color: #303133;
    }

    .layout-container {
      .add-layout-controls {
        margin-top: 24px;
        padding: 16px;
        background-color: #f9fafc;
        border-radius: 8px;
        text-align: center;
        border: 1px dashed #dcdfe6;
        
        .el-button {
          padding: 12px 24px;
        }
      }
    }
  }
}

::v-deep .layout-node {
  position: relative;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  margin: 0;
  transition: all 0.3s;
  background-color: #fff;
  box-sizing: border-box; // 确保盒模型计算包含边框和内边距
  overflow: hidden; // 防止子元素溢出
  
  // 确保高度可以生效
  &[style*="height"] {
    display: flex;
    flex-direction: column;
    
    .node-content {
      flex: 1;
      overflow: auto;
    }
  }
  
  &.is-hovered {
    border-color: #409EFF;
    background-color: #ecf5ff;
  }

  // 不同深度层级颜色区分
  &.depth-0 {
    background-color: #f6f8fc;
  }
  
  &.depth-1 {
    background-color: #edf2fa;
  }
  
  &.depth-2 {
    background-color: #e4ecf7;
  }
  
  &.depth-3 {
    background-color: #dbe6f4;
  }
  
  &.node-row {
    border-left: 4px solid #67c23a;
    width: 100%; // 行布局宽度占满
    background-color: rgba(103, 194, 58, 0.05);
    
    &.is-hovered {
      background-color: rgba(103, 194, 58, 0.1);
      border-color: #67c23a;
    }
  }
  
  &.node-column {
    border-left: 4px solid #409eff;
    height: 100%; // 列布局高度占满
    background-color: rgba(64, 158, 255, 0.05);
    
    &.is-hovered {
      background-color: rgba(64, 158, 255, 0.1);
      border-color: #409eff;
    }
  }
  
  &.node-container {
    border: none;
    background-color: transparent;
  }
  
  .node-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px dashed #ebeef5;
    
    .node-title {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      i {
        margin-right: 8px;
        font-size: 16px;
      }
      
      .row-label {
        font-weight: 500;
        color: #67c23a;
      }
      
      .column-label {
        font-weight: 500;
        color: #409eff;
      }
      
      .layout-info {
        font-size: 12px;
        color: #909399;
        margin-left: 8px;
        font-weight: normal;
        
        &:hover {
          color: #606266;
        }
      }
      
      &:hover {
        opacity: 0.8;
      }
    }
    
    .node-controls {
      display: flex;
      gap: 8px;
    }
  }
  
  .node-content {
    padding: 8px;
    min-height: 80px;
    display: block !important; /* 确保节点内容始终显示 */
    opacity: 1 !important; /* 强制显示内容 */
    visibility: visible !important; /* 保证可见性 */
    
    
    .empty-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100px;
      border: 2px dashed #e4e7ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      background-color: #f9f9f9;

      &:hover {
        background-color: #ecf5ff;
        border-color: #409EFF;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      i {
        font-size: 28px;
        margin-bottom: 10px;
        color: #409EFF;
      }
      
      span {
        color: #606266;
        font-weight: 500;
      }
    }
    
    .node-widget {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      padding: 16px;
      margin: 0;
      background-color: #f5f7fa;
      border-radius: 8px;

      .widget-info {
        display: flex !important;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .widget-name {
          font-weight: 500;
        }
        
        .channel-name {
          color: #909399;
        }
      }
      
      .widget-preview {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        min-height: 100px;
        background-color: #fff;
        border-radius: 4px;
        overflow: hidden;
        
        .preview-component {
          width: 100%;
          height: 100%;
          display: block !important;
        }
      }
    }
  }
  
  // 行容器样式
  .row-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 60px;
    width: 100%; // 确保宽度占满
    padding: 0; // 移除默认内边距
    margin: 0; // 确保没有外边距
    
    & > .layout-node {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  // 列容器样式 - 行中的列容器
  .column-container {
    display: flex !important; // 强制使用flex
    flex-direction: row !important; // 强制横向排列
    flex-wrap: nowrap !important; // 禁止换行
    gap: 16px;
    width: 100%;
    min-height: 60px;
    padding: 0; 
    margin: 0;
    align-items: stretch; // 让所有列高度一致
    
    & > .layout-node {
      min-width: 50px; // 减小最小宽度
      flex-grow: 0 !important; // 禁止自动增长
      flex-shrink: 0 !important; // 禁止自动缩小
      margin: 0 !important; // 强制移除所有外边距
      padding: 0 !important; // 强制移除内边距
      height: auto !important; // 让高度自适应
      display: block !important; // 使用块级显示
      float: none !important; // 禁止浮动
    }
  }
}

// 组件选择对话框样式
.widget-selection {
  max-height: 60vh;
  overflow-y: auto;
  
  .widget-group {
    margin-bottom: 24px;
    
    .group-title {
      margin-top: 0;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
    }
    
    .widget-card {
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.3s;
      
      &.is-selected {
        border-color: #409EFF;
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .preview-area {
        height: 160px;
        overflow: hidden;
        background-color: #f5f7fa;
        border-radius: 4px;
        position: relative;
        
        .preview-component {
          transform: scale(0.8);
          transform-origin: top left;
        }
      }
      
      .widget-info {
        margin-top: 12px;
        
        h4 {
          margin: 0;
          font-size: 14px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .channel-selection {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.text-center {
  text-align: center;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-style: italic;
  border: 1px dashed #dcdfe6;
  margin: 0; // 移除外边距
  padding: 0; // 移除内边距
}

// 布局预览对话框样式
.preview-dialog {
  ::v-deep .el-dialog__body {
    padding: 0;
    
    .layout-preview {
      border-radius: 0;
      box-shadow: none;
      margin-top: 20px;
    }
  }
  
  ::v-deep .el-dialog__header {
    background-color: #409EFF;
    padding: 15px 20px;
    
    .el-dialog__title {
      color: white;
      font-size: 18px;
    }
    
    .el-dialog__headerbtn {
      top: 15px;
      
      .el-dialog__close {
        color: white;
      }
    }
  }
  
  .preview-toolbar {
    padding: 15px 20px;
    background-color: #ecf5ff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .preview-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #409EFF;
      
      i {
        font-size: 18px;
      }
    }
  }
}

.import-dialog-content {
  padding: 0;
  
  .layout-uploader {
    text-align: center;
    
    .el-upload__tip {
      margin-top: 10px;
      font-size: 13px;
      color: #909399;
    }
    
    .el-upload-dragger {
      width: 100%;
      height: 160px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      
      i {
        font-size: 48px;
        margin-bottom: 10px;
      }
      
      .el-upload__text {
        font-size: 16px;
        line-height: 1.4;
        padding: 0 15px;
        text-align: center;
        word-break: break-word;
        
        em {
          color: #409EFF;
          font-style: normal;
        }
      }
    }
  }
  
  .import-tips {
    margin-top: 15px;
    
    p {
      margin: 5px 0 0;
      font-size: 12px;
    }
  }
}

::v-deep .import-layout-dialog {
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  
  .el-dialog__header {
    padding: 15px 20px;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .el-dialog__body {
    padding: 20px;
  }
  
  .el-dialog__footer {
    padding: 10px 20px 15px;
    border-top: 1px solid #EBEEF5;
  }
  
  .el-upload-dragger {
    border-radius: 6px;
  }
}

// 文件上传组件样式
::v-deep .el-upload {
  width: 100%;
  
  .el-upload-dragger {
    width: 100% !important;
  }
}
</style>

<style lang="scss">
/* 响应式布局样式 - 全局作用域 */
@media screen and (max-width: 768px) {
  .import-layout-dialog {
    margin-top: 5vh !important;
    max-width: 95% !important;
    
    .el-dialog__header {
      padding: 12px 15px !important;
      
      .el-dialog__title {
        font-size: 16px !important;
      }
    }
    
    .el-dialog__body {
      padding: 15px !important;
      max-height: 60vh !important;
      overflow-y: auto !important;
    }
    
    .el-dialog__footer {
      padding: 8px 15px 12px !important;
      display: flex !important;
      justify-content: flex-end !important;
      
      .el-button {
        padding: 8px 12px !important;
        font-size: 13px !important;
      }
    }
  }
  
  .import-dialog-content {
    .layout-uploader {
      .el-upload-dragger {
        height: 140px !important;
        
        i {
          font-size: 36px !important;
          margin-bottom: 8px !important;
        }
        
        .el-upload__text {
          font-size: 14px !important;
        }
      }
      
      .el-upload__tip {
        font-size: 12px !important;
        margin-top: 8px !important;
      }
    }
    
    .import-tips {
      margin-top: 12px !important;
      
      .el-alert {
        padding: 8px 12px !important;
        
        .el-alert__title {
          font-size: 13px !important;
        }
        
        p {
          font-size: 12px !important;
          margin-top: 4px !important;
        }
      }
    }
  }
}
</style> 