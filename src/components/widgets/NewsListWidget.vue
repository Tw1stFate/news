<template>
  <div class="news-list-widget">
    <h3 class="widget-title">{{ config.title }}</h3>
    <div v-if="loading" class="loading">
      <el-skeleton :rows="config.maxItems" animated />
    </div>
    <div v-else class="news-list">
      <el-empty v-if="newsList.length === 0" description="暂无新闻" />
      <el-card v-for="news in newsList" :key="news.id" class="news-item" shadow="hover">
        <div class="news-content">
          <div v-if="config.showImage" class="news-image">
            <img :src="news.image" :alt="news.title">
          </div>
          <div class="news-info">
            <h4 class="news-title">{{ news.title }}</h4>
            <div class="news-date">{{ news.date }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'NewsListWidget',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: '新闻列表',
        showImage: true,
        maxItems: 5,
        category: 'general'
      })
    }
  },
  data() {
    return {
      loading: true,
      newsList: []
    };
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
  },
  methods: {
    async fetchNews() {
      this.loading = true;
      try {
        this.newsList = await api.getNewsByCategory(
          this.config.category,
          this.config.maxItems
        );
      } catch (error) {
        console.error('获取新闻失败:', error);
        this.newsList = [];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.news-list-widget {
  padding: 10px;
}

.widget-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.news-item {
  margin-bottom: 8px;
}

.news-content {
  display: flex;
  align-items: center;
}

.news-image {
  width: 80px;
  height: 60px;
  margin-right: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-info {
  flex: 1;
  min-width: 0;
}

.news-title {
  margin: 0 0 5px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-date {
  font-size: 12px;
  color: #909399;
}

.loading {
  padding: 10px 0;
}
</style> 