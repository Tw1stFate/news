<template>
  <div class="news-list-widget" :style="{ height: `${config.height}px` }">
    <div class="widget-header">
      <div class="title-area">
        <h3 class="category-title" ref="categoryTitle">{{ config.title || '双轻业务' }}</h3>
      </div>
      <div class="more-link" @click="handleMoreClick">
        更多
      </div>
    </div>
    
    <!-- 标题下方的指示器 -->
    <div class="title-indicator">
      <div class="indicator-active" :style="{ width: `${indicatorWidth}px`, left: `${indicatorLeft}px` }"></div>
    </div>
    
    <div class="widget-content" v-if="config.items && config.items.length > 0">
      <!-- 左侧大图 -->
      <div class="feature-image" @click="handleItemClick(config.items[0])">
        <img :src="config.items[0].image || config.items[0].thumbnail" :alt="config.items[0].title">
      </div>
      
      <!-- 右侧列表 -->
      <div class="news-list">
        <div v-for="(item, index) in displayItems" :key="index" class="news-item" @click="handleItemClick(item)">
          <div class="item-title" :title="item.title">{{ item.title }}</div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-list">
      <el-empty description="暂无数据" :image-size="80"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsListWidget3',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        height: 400,
        title: '双轻业务',
        count: 4,
        items: []
      })
    }
  },
  data() {
    return {
      indicatorWidth: 0,
      indicatorLeft: 16
    };
  },
  computed: {
    displayItems() {
      return this.config.items.slice(0, this.config.count || 4);
    }
  },
  methods: {
    handleItemClick(item) {
      if (item.link) {
        window.open(item.link, '_blank');
      }
    },
    handleMoreClick() {
      this.$emit('more-click', this.config.category || 'default');
    },
    updateIndicatorWidth() {
      this.$nextTick(() => {
        const categoryTitle = this.$refs.categoryTitle;
        if (categoryTitle) {
          // 获取标题文字的宽度
          this.indicatorWidth = categoryTitle.offsetWidth;
          // 获取标题距离左侧的距离
          const rect = categoryTitle.getBoundingClientRect();
          const parentRect = this.$el.getBoundingClientRect();
          this.indicatorLeft = rect.left - parentRect.left;
        }
      });
    }
  },
  mounted() {
    this.updateIndicatorWidth();
    // 监听窗口大小变化，更新指示器宽度
    window.addEventListener('resize', this.updateIndicatorWidth);
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.updateIndicatorWidth);
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
  padding: 0 16px;
  height: 40px;
  border-bottom: none;
  background-color: #fff;
  
  .title-area {
    display: flex;
    align-items: center;
    padding-left: 0;
    
    .category-title {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .more-link {
    font-size: 14px;
    color: #666;
    cursor: pointer;
    
    &:hover {
      color: #820014;
    }
  }
}

/* 标题下方的指示器 */
.title-indicator {
  height: 4px;
  background-color: #e5e5e5;
  width: 100%;
  margin: 0 0 10px 0;
  position: relative;
  
  .indicator-active {
    position: absolute;
    top: 0;
    height: 100%;
    background-color: #820014;
  }
}

.widget-content {
  flex: 1;
  display: flex;
  padding: 16px;
  overflow: hidden;
}

.feature-image {
  width: 200px;
  height: 160px;
  flex-shrink: 0;
  overflow: hidden;
  background-color: #000;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

.news-list {
  flex: 1;
  margin-left: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
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
  padding: 6px 0;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  
  &:hover {
    .item-title {
      color: #820014;
    }
  }
  
  .item-title {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
    padding-left: 10px;
    
    &::before {
      content: "";
      display: block;
      width: 4px;
      height: 4px;
      background-color: #666;
      border-radius: 50%;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
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