<template>
  <div class="news-list-widget" :style="{ height: `${config.height}px` }">
    <div class="widget-header">
      <div class="title-area">
        <h3 class="category-title">{{ config.title || '行务要闻' }}</h3>
      </div>
      <div class="more-link" @click="handleMoreClick">
        更多 <i class="el-icon-arrow-right"></i>
      </div>
    </div>
    
    <div v-if="loading" class="loading-list">
      <el-skeleton :rows="config.maxItems || 7" animated />
    </div>
    
    <div class="news-list" v-else-if="newsItems && newsItems.length > 0">
      <div v-for="(item, index) in displayItems" :key="index" class="news-item" @click="handleItemClick(item)">
        <div class="bullet-point">
          <span class="bullet"></span>
        </div>
        <div class="item-content">
          <span class="item-title" :title="item.title">{{ item.title }}</span>
          <span class="item-date" v-if="config.showDate">{{ item.date }}</span>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-list">
      <el-empty description="暂无数据" :image-size="80"></el-empty>
    </div>

    <!-- 组件配置对话框 -->
    <el-dialog
      title="红标题+时间列表组件配置"
      :visible.sync="configDialogVisible"
      width="500px"
      @closed="handleDialogClosed">
      <el-form :model="tempConfig" label-width="120px" size="small">
        <el-form-item label="组件高度">
          <el-input-number v-model="tempConfig.height" :min="200" :max="600" :step="10"></el-input-number>
          <span class="form-tip">像素 (px)</span>
        </el-form-item>
        
        <el-form-item label="标题">
          <el-input v-model="tempConfig.title" placeholder="请输入栏目标题"></el-input>
        </el-form-item>
        
        <el-form-item label="显示数量">
          <el-input-number v-model="tempConfig.count" :min="1" :max="20" :step="1"></el-input-number>
        </el-form-item>
        
        <el-form-item label="显示日期">
          <el-switch v-model="tempConfig.showDate"></el-switch>
        </el-form-item>
        
        <el-form-item label="内容分类">
          <el-select v-model="tempConfig.categoryId" placeholder="选择内容分类">
            <el-option label="国内新闻" value="domestic"></el-option>
            <el-option label="国际新闻" value="international"></el-option>
            <el-option label="财经新闻" value="finance"></el-option>
            <el-option label="科技新闻" value="technology"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="最大获取数量">
          <el-input-number v-model="tempConfig.maxItems" :min="5" :max="20" :step="1"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'NewsListWidget2',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        height: 330,
        title: '行务要闻',
        count: 7,
        showDate: true,
        categoryId: 'domestic',
        maxItems: 7
      })
    },
    widgetId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      newsItems: [],
      configDialogVisible: false,
      tempConfig: {}
    };
  },
  computed: {
    displayItems() {
      return this.newsItems.slice(0, this.config.count || 7);
    }
  },
  watch: {
    // 当配置变化时，重新获取数据
    config: {
      handler() {
        this.fetchNews();
      },
      deep: true
    }
  },
  created() {
    this.fetchNews();
    // 监听组件配置请求事件
    this.$root.$on('widget-config-requested', this.handleConfigRequest);
  },
  beforeDestroy() {
    // 移除事件监听
    this.$root.$off('widget-config-requested', this.handleConfigRequest);
  },
  methods: {
    async fetchNews() {
      this.loading = true;
      try {
        // 从API获取新闻数据
        this.newsItems = await api.getNewsByCategory(
          this.config.categoryId || 'domestic',
          this.config.maxItems || 7
        );
      } catch (error) {
        console.error('获取新闻列表失败:', error);
        this.newsItems = [];
      } finally {
        this.loading = false;
      }
    },
    handleItemClick(item) {
      if (item.link) {
        window.open(item.link, '_blank');
      }
    },
    handleMoreClick() {
      this.$emit('more-click', this.config.categoryId || 'domestic');
    },
    handleConfigRequest(widget) {
      if (widget && widget.id === this.widgetId) {
        this.configDialogVisible = true;
        this.tempConfig = JSON.parse(JSON.stringify(this.config));
      }
    },
    handleDialogClosed() {
      this.tempConfig = {};
    },
    saveConfig() {
      // 向父组件传递配置更新消息
      this.$root.$emit('widget-config-updated', {
        widgetId: this.widgetId,
        config: this.tempConfig
      });
      this.configDialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.news-list-widget {
  width: 100%;
  border-radius: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: none;
  border: 1px solid #e5e5e5;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  height: 40px;
  border-bottom: 1px solid #e5e5e5;
  background-color: #fff;
  
  .title-area {
    display: flex;
    align-items: center;
    height: 100%;
    background-color: #c00;
    padding: 0 16px;
    min-width: 120px;
    
    .category-title {
      margin: 0;
      font-size: 15px;
      font-weight: bold;
      color: #fff;
    }
  }
  
  .more-link {
    font-size: 12px;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0 16px;
    
    &:hover {
      color: #c00;
    }
    
    i {
      margin-left: 4px;
      font-size: 12px;
    }
  }
}

.loading-list {
  flex: 1;
  padding: 12px 16px;
}

.news-list {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.news-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 36px;
  border-bottom: 1px dashed #ebeef5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    .item-title {
      color: #c00;
    }
  }
  
  .bullet-point {
    display: flex;
    align-items: center;
    margin-right: 10px;
    width: 16px;
    justify-content: center;
    
    .bullet {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #909399;
    }
  }
  
  .item-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    
    .item-title {
      flex: 1;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 16px;
    }
    
    .item-date {
      font-size: 13px;
      color: #666;
      text-align: right;
      width: 90px;
      flex-shrink: 0;
    }
  }
}

.empty-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 