<template>
  <div class="image-news-widget">
    <h3 class="widget-title">{{ config.title }}</h3>
    <div v-if="loading" class="loading">
      <el-skeleton animated>
        <template slot="template">
          <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
          <el-skeleton-item variant="p" style="width: 50%" />
          <el-skeleton-item variant="text" style="width: 100%" />
          <el-skeleton-item variant="text" style="width: 100%" />
        </template>
      </el-skeleton>
    </div>
    <div v-else-if="news" class="image-news-content" :class="positionClass">
      <div class="news-image">
        <img :src="news.image" :alt="news.title">
      </div>
      <div class="news-details">
        <h4 class="news-title">{{ news.title }}</h4>
        <p v-if="config.description" class="news-summary">{{ news.summary }}</p>
        <div class="news-date">{{ news.date }}</div>
      </div>
    </div>
    <el-empty v-else description="暂无新闻" />
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ImageNewsWidget',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: '图文新闻',
        imagePosition: 'left',
        description: true,
        categoryId: 'lifestyle',
        maxItems: 1
      })
    }
  },
  data() {
    return {
      loading: true,
      news: null
    };
  },
  computed: {
    // 根据图片位置设置不同的 CSS 类
    positionClass() {
      return `image-${this.config.imagePosition}`;
    }
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
        const newsList = await api.getNewsByCategory(
          this.config.categoryId || 'lifestyle',
          1
        );
        this.news = newsList.length > 0 ? newsList[0] : null;
      } catch (error) {
        console.error('获取新闻失败:', error);
        this.news = null;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.image-news-widget {
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

.image-news-content {
  display: flex;
}

/* 图片在左 */
.image-left {
  flex-direction: row;
}

/* 图片在右 */
.image-right {
  flex-direction: row-reverse;
}

/* 图片在上 */
.image-top {
  flex-direction: column;
}

.news-image {
  overflow: hidden;
  border-radius: 4px;
}

.image-left .news-image,
.image-right .news-image {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
  margin: 0 15px;
}

.image-top .news-image {
  width: 100%;
  height: 200px;
  margin-bottom: 15px;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-image img:hover {
  transform: scale(1.05);
}

.news-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-title {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.news-summary {
  margin: 0 0 10px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.news-date {
  margin-top: auto;
  font-size: 12px;
  color: #909399;
}

.loading {
  padding: 20px 0;
}
</style> 