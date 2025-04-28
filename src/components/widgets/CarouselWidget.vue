<template>
  <div class="carousel-widget">
    <el-carousel 
      v-if="config.items && config.items.length > 0"
      :interval="config.interval" 
      :autoplay="config.autoplay"
      indicator-position="outside"
      height="400px"
    >
      <el-carousel-item v-for="item in config.items" :key="item.id">
        <div class="carousel-item">
          <img :src="item.image" :alt="item.title" class="carousel-image">
          <div class="carousel-caption">
            <h3 class="caption-title">{{ item.title }}</h3>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    
    <div v-else class="empty-carousel">
      <el-empty description="请在配置中添加轮播项"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarouselWidget',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        autoplay: true,
        interval: 3000,
        items: []
      })
    }
  }
};
</script>

<style scoped>
.carousel-widget {
  width: 100%;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  padding: 20px;
  box-sizing: border-box;
}

.caption-title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.empty-carousel {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}
</style> 