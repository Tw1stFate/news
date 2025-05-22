<template>
  <div class="headline-widget">
    <div v-if="loading" class="loading-headline">
      <el-skeleton animated :rows="1" />
    </div>
    <h2 v-else-if="headline" :class="['headline', config.styleType]">
      <a :href="headline.link || '#'">{{ headline.title }}</a>
    </h2>
    <div v-else class="empty-headline">
      <el-empty description="暂无头条新闻" :image-size="60"></el-empty>
    </div>
    
    <!-- 组件配置对话框 -->
    <el-dialog
      title="头条新闻组件配置"
      :visible.sync="configDialogVisible"
      width="500px"
      @closed="handleDialogClosed">
      <el-form :model="tempConfig" label-width="120px" size="small">
        <el-form-item label="样式类型">
          <el-select v-model="tempConfig.styleType" placeholder="选择样式类型">
            <el-option label="默认样式" value="default"></el-option>
            <el-option label="主题色" value="primary"></el-option>
            <el-option label="成功色" value="success"></el-option>
            <el-option label="警告色" value="warning"></el-option>
            <el-option label="危险色" value="danger"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容分类">
          <el-select v-model="tempConfig.categoryId" placeholder="选择内容分类">
            <el-option label="头条新闻" value="headlines"></el-option>
            <el-option label="要闻" value="important"></el-option>
            <el-option label="公告" value="announcements"></el-option>
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
  name: 'HeadlineWidget',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        styleType: 'default',
        categoryId: 'headlines',
        maxItems: 1
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
      headline: null,
      configDialogVisible: false,
      tempConfig: {}
    };
  },
  watch: {
    // 当配置变化时，重新获取数据
    config: {
      handler() {
        this.fetchHeadline();
      },
      deep: true
    }
  },
  created() {
    this.fetchHeadline();
    // 监听组件配置请求事件
    this.$root.$on('widget-config-requested', this.handleConfigRequest);
  },
  beforeDestroy() {
    // 移除事件监听
    this.$root.$off('widget-config-requested', this.handleConfigRequest);
  },
  methods: {
    async fetchHeadline() {
      this.loading = true;
      try {
        // 从API获取头条新闻（仅取第一条）
        const headlines = await api.getNewsByCategory(
          this.config.categoryId || 'headlines',
          1
        );
        this.headline = headlines && headlines.length > 0 ? headlines[0] : null;
      } catch (error) {
        console.error('获取头条新闻失败:', error);
        this.headline = null;
      } finally {
        this.loading = false;
      }
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
.headline-widget {
  padding: 10px 0;
  width: 100%;
}

.loading-headline {
  width: 100%;
  padding: 10px;
}

.empty-headline {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.headline {
  margin: 0;
  padding: 0;
  font-size: 24px;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
}

.headline a {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
}

.default {
  color: #303133;
}

.primary {
  color: #409EFF;
}

.success {
  color: #67C23A;
}

.warning {
  color: #E6A23C;
}

.danger {
  color: #F56C6C;
}
</style>