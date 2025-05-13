<template>
  <div class="carousel-widget">
    <template v-if="config.items && config.items.length > 0">
      <div class="carousel-container">
        <div class="main-content">
          <div class="carousel-main">
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
                  <div v-if="config.showTitle" class="carousel-title">{{ item.title }}</div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>

        <!-- 缩略图导航 -->
        <div class="thumbnail-nav">
          <div class="nav-arrow prev" @click="prev" :class="{ disabled: currentIndex === 0 }">
            <i class="el-icon-arrow-up"></i>
          </div>
          <div class="thumbnails-container">
            <div v-for="(item, index) in config.items"
                 :key="index"
                 class="thumbnail"
                 :class="{ active: currentIndex === index }"
                 @click="setActiveItem(index)">
              <img :src="item.thumbnail || item.image" :alt="item.title">
            </div>
          </div>
          <div class="nav-arrow next" @click="next" :class="{ disabled: currentIndex === config.items.length - 1 }">
            <i class="el-icon-arrow-down"></i>
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
  name: 'CarouselWidget2',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        height: 360,
        autoplay: false,
        interval: 0,
        items: [],
        showTitle: true
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
      this.$nextTick(() => {
        this.scrollToActiveThumbnail();
      });
    },
    setActiveItem(index) {
      this.currentIndex = index;
      this.$refs.carousel.setActiveItem(index);
      this.$nextTick(() => {
        this.scrollToActiveThumbnail();
      });
    },
    prev() {
      this.$refs.carousel.prev();
    },
    next() {
      this.$refs.carousel.next();
    },
    scrollToActiveThumbnail() {
      const container = this.$el.querySelector('.thumbnails-container');
      const activeThumb = container.children[this.currentIndex];
      if (activeThumb) {
        const containerRect = container.getBoundingClientRect();
        const thumbRect = activeThumb.getBoundingClientRect();
        
        // 检查缩略图是否在可视区域内
        if (thumbRect.top < containerRect.top || thumbRect.bottom > containerRect.bottom) {
          // 使用自定义滚动而不是scrollIntoView，避免触发页面滚动
          if (thumbRect.top < containerRect.top) {
            // 向上滚动
            container.scrollTop += (thumbRect.top - containerRect.top - 8);
          } else {
            // 向下滚动
            container.scrollTop += (thumbRect.bottom - containerRect.bottom + 8);
          }
        }
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
  height: v-bind('`${config.height}px`');
}

.carousel-container {
  height: 100%;
  display: flex;
  background: #fff;
}

.main-content {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  .carousel-main {
    flex: 1;
    min-height: 0;
    position: relative;
    height: calc(100% - 40px);

    :deep(.el-carousel),
    :deep(.el-carousel--horizontal) {
      height: 100% !important;
    }

    :deep(.el-carousel__container) {
      height: 100% !important;
    }
  }

  .carousel-title {
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    background: #f5f7fa;
    color: #303133;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-top: 1px solid #ebeef5;
    flex-shrink: 0;
  }
}

.carousel-item {
  width: 100%;
  height: 100%;
  position: relative;

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .carousel-title {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    color: #fff;
    font-size: 14px;
    background: rgba(0, 0, 0, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.thumbnail-nav {
  width: 120px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ebeef5;
  flex-shrink: 0;
  height: 100%;

  .nav-arrow {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #909399;
    background: #fff;
    flex-shrink: 0;
    
    i {
      font-size: 20px;
    }
    
    &:hover {
      color: #409EFF;
      background: #f5f7fa;
    }
    
    &.prev {
      border-bottom: 1px solid #ebeef5;
    }
    
    &.next {
      border-top: 1px solid #ebeef5;
    }

    &.disabled {
      color: #c0c4cc;
      cursor: not-allowed;
      
      &:hover {
        color: #c0c4cc;
        background: #fff;
      }
    }
  }

  .thumbnails-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;

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

  .thumbnail {
    width: 104px;
    height: 70px;
    border: 2px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    &:hover {
      border-color: #c0c4cc;
    }
    
    &.active {
      border-color: #409EFF;
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