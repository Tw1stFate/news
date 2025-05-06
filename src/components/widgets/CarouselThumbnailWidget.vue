<template>
  <div class="carousel-widget" :style="{ height: `${config.height}px` }">
    <template v-if="config.items && config.items.length > 0">
      <div class="carousel-container">
        <el-carousel 
          :interval="config.interval" 
          :autoplay="config.autoplay"
          :height="`${config.height}px`"
          indicator-position="none"
          ref="carousel"
          @change="handleChange"
          arrow="never"
        >
          <el-carousel-item v-for="item in config.items" :key="item.id">
            <div class="carousel-item">
              <img :src="item.image" :alt="item.title" class="carousel-image">
            </div>
          </el-carousel-item>
        </el-carousel>

        <!-- 标题 -->
        <div v-if="config.showTitle" class="carousel-title">
          {{ currentItem.title }}
        </div>

        <!-- 缩略图导航 -->
        <div class="thumbnail-nav">
          <div class="nav-arrow prev" @click="prev">
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
          <div class="nav-arrow next" @click="next">
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
  name: 'CarouselThumbnailWidget',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        height: 240,
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
    },
    setActiveItem(index) {
      this.currentIndex = index;
      this.$refs.carousel.setActiveItem(index);
    },
    prev() {
      this.$refs.carousel.prev();
    },
    next() {
      this.$refs.carousel.next();
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

  .el-carousel {
    flex: 1;
    overflow: hidden;
  }
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

.carousel-title {
  position: absolute;
  left: 0;
  right: 120px;
  bottom: 0;
  color: #fff;
  padding: 12px 20px;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.thumbnail-nav {
  width: 120px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ebeef5;

  .nav-arrow {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #909399;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    
    &:hover {
      color: #409EFF;
      background: #f5f7fa;
    }
    
    &.next {
      border-top: 1px solid #ebeef5;
      border-bottom: none;
    }
  }

  .thumbnails-container {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .thumbnail {
    width: 100%;
    height: 80px;
    border: 2px solid transparent;
    border-radius: 2px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    
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
</style> 