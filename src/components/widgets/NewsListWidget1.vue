<template>
  <div class="news-list-widget" :style="{ height: `${config.height}px` }">
    <div class="widget-header">
      <div class="title-area">
        <div class="category-indicator"></div>
        <h3 class="category-title">{{ config.title || '党建引领' }}</h3>
      </div>
      <div class="more-link" @click="handleMoreClick">
        更多 <i class="el-icon-arrow-right"></i>
      </div>
    </div>
    
    <div class="news-list" v-if="config.items && config.items.length > 0">
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
  </div>
</template>

<script>
export default {
  name: 'NewsListWidget1',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        height: 400,
        title: '党建引领',
        count: 6,
        showDate: true,
        items: []
      })
    }
  },
  computed: {
    displayItems() {
      return this.config.items.slice(0, this.config.count || 6);
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
    }
  }
};
</script>

<style lang="scss" scoped>
.news-list-widget {
  width: 100%;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 45px;
  border-bottom: 1px solid #f0f2f5;
  background-color: #fafbfc;
  
  .title-area {
    display: flex;
    align-items: center;
    
    .category-indicator {
      width: 4px;
      height: 18px;
      background-color: #722ed1;
      margin-right: 10px;
      border-radius: 2px;
    }
    
    .category-title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }
  
  .more-link {
    font-size: 13px;
    color: #909399;
    cursor: pointer;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #409EFF;
    }
    
    i {
      margin-left: 4px;
      font-size: 12px;
    }
  }
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
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 36px;
  border-bottom: 1px dashed #ebeef5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    .item-title {
      color: #409EFF;
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
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .item-date {
      font-size: 12px;
      color: #909399;
      margin-left: 16px;
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