<template>
  <div class="hot-news-widget">
    <h3 class="widget-title">
      {{ config.title }}
      <span class="period-tag">{{ periodText }}</span>
    </h3>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="config.maxItems" animated />
    </div>
    <div v-else class="hot-news-list">
      <el-empty v-if="hotNews.length === 0" description="暂无热门新闻" />
      <div v-for="(news, index) in hotNews" :key="news.id" class="hot-news-item">
        <div class="ranking" :class="isTopThree(index) ? 'top-' + (index + 1) : ''">
          {{ index + 1 }}
        </div>
        <div class="news-content">
          <div class="news-title">{{ news.title }}</div>
          <div class="news-meta">
            <span class="news-date">{{ news.date }}</span>
            <span class="news-views">{{ news.views }} 浏览</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 组件配置对话框 -->
    <el-dialog
      title="热门新闻组件配置"
      :visible.sync="configDialogVisible"
      width="500px"
      @closed="handleDialogClosed">
      <el-form :model="tempConfig" label-width="120px" size="small">
        <el-form-item label="标题">
          <el-input v-model="tempConfig.title" placeholder="请输入栏目标题"></el-input>
        </el-form-item>
        
        <el-form-item label="时间周期">
          <el-select v-model="tempConfig.period" placeholder="选择时间周期">
            <el-option label="今日" value="day"></el-option>
            <el-option label="本周" value="week"></el-option>
            <el-option label="本月" value="month"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="显示数量">
          <el-input-number v-model="tempConfig.maxItems" :min="5" :max="20" :step="1"></el-input-number>
        </el-form-item>
        
        <el-form-item label="内容分类">
          <el-select v-model="tempConfig.categoryId" placeholder="选择内容分类">
            <el-option label="热门新闻" value="hot"></el-option>
            <el-option label="国内新闻" value="domestic"></el-option>
            <el-option label="国际新闻" value="international"></el-option>
          </el-select>
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
  name: 'HotNewsWidget',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: '热门新闻',
        maxItems: 10,
        period: 'day',
        categoryId: 'hot'
      }),
      widgetId: {
        type: String,
        default: ''
      }
    }
  },
  data() {
    return {
      loading: true,
      hotNews: [],
      configDialogVisible: false,
      tempConfig: {}
    };
  },
  computed: {
    // 将时间周期转换为显示文本
    periodText() {
      const periodMap = {
        day: '今日',
        week: '本周',
        month: '本月'
      };
      return periodMap[this.config.period] || '今日';
    }
  },
  watch: {
    // 当配置变化时，重新获取数据
    config: {
      handler() {
        this.fetchHotNews();
      },
      deep: true
    }
  },
  created() {
    this.fetchHotNews();
    // 监听组件配置请求事件
    this.$root.$on('widget-config-requested', this.handleConfigRequest);
  },
  beforeDestroy() {
    // 移除事件监听
    this.$root.$off('widget-config-requested', this.handleConfigRequest);
  },
  methods: {
    async fetchHotNews() {
      this.loading = true;
      try {
        // 使用配置中的categoryId和maxItems
        this.hotNews = await api.getNewsByCategory(
          this.config.categoryId || 'hot', 
          this.config.maxItems || 10
        );
      } catch (error) {
        console.error('获取热门新闻失败:', error);
        this.hotNews = [];
      } finally {
        this.loading = false;
      }
    },
    
    // 判断是否是前三名
    isTopThree(index) {
      return index < 3;
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

<style scoped>
.hot-news-widget {
  padding: 10px;
}

.widget-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-tag {
  font-size: 12px;
  padding: 2px 6px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  margin-left: 8px;
}

.hot-news-list {
  display: flex;
  flex-direction: column;
}

.hot-news-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.hot-news-item:last-child {
  border-bottom: none;
}

.ranking {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ebeef5;
  color: #606266;
  border-radius: 4px;
  margin-right: 12px;
  font-weight: bold;
  font-size: 12px;
}

.top-1 {
  background-color: #f56c6c;
  color: white;
}

.top-2 {
  background-color: #e6a23c;
  color: white;
}

.top-3 {
  background-color: #409eff;
  color: white;
}

.news-content {
  flex: 1;
  min-width: 0;
}

.news-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-meta {
  display: flex;
  font-size: 12px;
  color: #909399;
}

.news-date {
  margin-right: 10px;
}

.loading {
  padding: 10px 0;
}
</style> 