<template>
  <div class="headline-widget">
    <h2 :class="['headline', config.styleType]">
      <a :href="config.link">{{ config.title }}</a>
    </h2>
  </div>
</template>

<script>
export default {
  name: 'HeadlineWidget',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: '新闻标题',
        link: '#',
        styleType: 'default'
      })
    }
  }
};
</script>

<style scoped>
.headline-widget {
  padding: 10px 0;
  width: 100%;
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