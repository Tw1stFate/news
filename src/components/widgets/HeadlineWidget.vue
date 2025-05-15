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
    }
  },
  data() {
    return {
      loading: true,
      headline: null
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