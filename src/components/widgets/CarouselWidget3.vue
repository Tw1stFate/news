<template>
  <div class="carousel-widget" :style="{ height: `${config.height}px` }">
    <template v-if="config.items && config.items.length > 0">
      <div class="carousel-container">
        <!-- 左侧图片区域 -->
        <div class="image-area">
          <el-carousel 
            :interval="config.interval" 
            :autoplay="config.autoplay"
            :height="`${config.height}px`"
            indicator-position="none"
            ref="carousel"
            @change="handleChange"
            arrow="always"
            :pause-on-hover="true"
          >
            <el-carousel-item v-for="item in config.items" :key="item.id">
              <div class="carousel-item">
                <img :src="item.image" :alt="item.title" class="carousel-image">
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 右侧标题列表 -->
        <div class="title-list">
          <div class="list-header">
            <h3>最新动态</h3>
          </div>
          <div class="list-container">
            <div 
              v-for="(item, index) in config.items" 
              :key="index"
              class="title-item"
              :class="{ active: currentIndex === index }"
              @click="setActiveItem(index)"
              @mouseenter="mouseEnterHandler(index, $event)"
            >
              <div class="title-content">
                <span class="title-text">{{ item.title }}</span>
                <span class="title-date" v-if="item.date">{{ item.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="empty-carousel">
      <el-empty description="请在配置中添加轮播项"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarouselWidget3',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        height: 360,
        autoplay: true,
        interval: 5000,
        items: [],
        showDate: true
      })
    }
  },
  data() {
    return {
      currentIndex: 0
    }
  },
  computed: {
    currentItem() {
      return this.config.items[this.currentIndex] || {};
    }
  },
  methods: {
    handleChange(index) {
      this.currentIndex = index;
    },
    setActiveItem(index) {
      this.currentIndex = index;
      this.$refs.carousel.setActiveItem(index);
    },
    mouseEnterHandler(index, event) {
      // 悬停在标题上时自动切换到对应的图片
      if (this.currentIndex !== index) {
        // 阻止事件冒泡，避免引起其他不必要的行为
        if (event) event.preventDefault();
        this.setActiveItem(index);
      }
    }
  }
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

.carousel-container {
  height: 100%;
  display: flex;
  background: #fff;
}

.image-area {
  flex: 3;
  min-width: 0;
  position: relative;
  
  :deep(.el-carousel),
  :deep(.el-carousel__container) {
    height: 100% !important;
  }
}

.carousel-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-list {
  flex: 2;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ebeef5;
  background: #fff;
  max-width: 320px;
  
  .list-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f5f7fa;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }
  
  .list-container {
    flex: 1;
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
  
  .title-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f5f7fa;
    transition: all 0.3s;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.active {
      background: #f0f7ff;
      border-left: 3px solid #409EFF;
      color: #409EFF;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: -7px;
        top: 50%;
        transform: translateY(-50%);
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid #409EFF;
      }
    }
    
    .title-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .title-text {
      font-size: 14px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .title-date {
      font-size: 12px;
      color: #909399;
    }
  }
}

.empty-carousel {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

:deep(.el-carousel__container) {
  height: 100%;
}

:deep(.el-carousel__indicators) {
  display: none;
}

// 自定义轮播箭头样式
:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.4);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

:deep(.el-carousel__arrow--left) {
  left: 15px;
}

:deep(.el-carousel__arrow--right) {
  right: 15px;
}
</style> 