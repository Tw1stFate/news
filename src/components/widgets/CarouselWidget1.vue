<template>
  <div class="carousel-widget" :style="{ height: `${config.height}px` }">
    <div v-if="loading" class="loading-carousel">
      <el-skeleton animated :rows="1" style="height: 100%" />
    </div>
    <template v-else-if="items && items.length > 0">
      <el-carousel 
        :interval="config.interval" 
        :autoplay="config.autoplay"
        :height="`${config.height}px`"
        indicator-position="none"
        ref="carousel"
        @change="handleChange"
      >
        <el-carousel-item v-for="item in items" :key="item.id">
          <div class="carousel-item">
            <img :src="item.image" :alt="item.title" class="carousel-image">
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 底部控制栏 -->
      <div class="carousel-controls">
        <!-- 指示器 -->
        <div class="carousel-indicators">
          <span
            v-for="(_, index) in items"
            :key="index"
            class="indicator"
            :class="{ active: currentIndex === index }"
            @click="setActiveItem(index, $event)"
          ></span>
        </div>

        <!-- 标题 -->
        <div v-if="config.showTitle" class="carousel-title">
          {{ currentItem.title }}
        </div>
      </div>
    </template>
    
    <div v-else class="empty-carousel">
      <el-empty description="暂无轮播数据"></el-empty>
    </div>
    
    <!-- 组件配置对话框 -->
    <el-dialog
      title="轮播组件配置"
      :visible.sync="configDialogVisible"
      width="500px"
      append-to-body
      @closed="handleDialogClosed">
      <el-form :model="tempConfig" label-width="100px" size="small">
        <el-form-item label="轮播高度">
          <el-input-number v-model="tempConfig.height" :min="150" :max="600" :step="10"></el-input-number>
          <span class="form-tip">像素 (px)</span>
        </el-form-item>
        
        <el-form-item label="轮播间隔">
          <el-input-number v-model="tempConfig.interval" :min="1000" :max="10000" :step="500"></el-input-number>
          <span class="form-tip">毫秒</span>
        </el-form-item>
        
        <el-form-item label="自动播放">
          <el-switch v-model="tempConfig.autoplay"></el-switch>
        </el-form-item>
        
        <el-form-item label="显示标题">
          <el-switch v-model="tempConfig.showTitle"></el-switch>
        </el-form-item>
        
        <el-form-item label="内容分类">
          <el-select v-model="tempConfig.categoryId" placeholder="选择内容分类">
            <el-option label="头条新闻" value="headlines"></el-option>
            <el-option label="热点要闻" value="trending"></el-option>
            <el-option label="社会新闻" value="social"></el-option>
            <el-option label="国际新闻" value="international"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="最大条数">
          <el-input-number v-model="tempConfig.maxItems" :min="1" :max="10" :step="1"></el-input-number>
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
  name: 'CarouselWidget1',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        height: 300,
        autoplay: true,
        interval: 5000,
        showTitle: true,
        categoryId: 'headlines',
        maxItems: 5
      })
    }
  },
  data() {
    return {
      currentIndex: 0,
      loading: true,
      items: [],
      configDialogVisible: false,
      tempConfig: {}
    }
  },
  computed: {
    currentItem() {
      return this.items[this.currentIndex] || {};
    }
  },
  watch: {
    // 当配置变化时，重新获取数据
    config: {
      handler() {
        this.fetchData();
      },
      deep: true
    }
  },
  created() {
    console.log('=======CarouselWidget1 created');
    this.fetchData();
  },
  beforeDestroy() {
    // Component cleanup
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // 从API获取轮播数据
        this.items = await api.getNewsByCategory(
          this.config.categoryId || 'headlines',
          this.config.maxItems || 5
        );
      } catch (error) {
        console.error('获取轮播数据失败:', error);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    handleChange(index) {
      this.currentIndex = index;
    },
    setActiveItem(index, event) {
      // 阻止事件冒泡，避免引起其他不必要的行为
      if (event) event.preventDefault();
      this.currentIndex = index;
      this.$refs.carousel.setActiveItem(index);
    },
    // 显示设置对话框的方法
    showSettingDialog() {
      // 复制当前配置到临时配置对象
      this.tempConfig = JSON.parse(JSON.stringify(this.config));
      // 显示配置对话框
      this.configDialogVisible = true;
    },
    // 保存配置
    saveConfig() {
      // 触发配置更新事件
      this.$root.$emit('widget-config-updated', 'carousel-1', this.tempConfig);
      // 关闭对话框
      this.configDialogVisible = false;
    },
    // 对话框关闭处理
    handleDialogClosed() {
      // 清空临时配置
      this.tempConfig = {};
    }
  },
};
</script>

<style lang="scss" scoped>
.carousel-widget {
  width: 100%;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  z-index: 10;
}

.carousel-indicators {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .indicator {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
      background: #fff;
      width: 24px;
      border-radius: 4px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
  }
}

.carousel-title {
  flex: 1;
  color: #fff;
  font-size: 14px;
  margin-left: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-carousel {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.loading-carousel {
  height: 100%;
  padding: 10px;
  background-color: #f5f7fa;
}

:deep(.el-carousel__container) {
  height: 100%;
}

:deep(.el-carousel__indicators) {
  display: none;
}

.form-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style> 