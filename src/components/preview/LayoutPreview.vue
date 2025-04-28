<template>
  <div class="layout-preview">
    <div v-if="layout.rows && layout.rows.length > 0">
      <div v-for="row in layout.rows" :key="row.id" class="preview-row">
        <el-row :gutter="20">
          <el-col 
            v-for="column in row.columns" 
            :key="column.id"
            :span="column.span"
            class="preview-column"
          >
            <template v-if="column.widgets && column.widgets.length > 0">
              <div
                v-for="widget in column.widgets"
                :key="widget.id"
                class="widget-container"
              >
                <component
                  :is="getWidgetComponent(widget.type)"
                  :config="widget.config || {}"
                  class="widget"
                />
              </div>
            </template>
            <div v-else class="empty-column-hint">
              <i class="el-icon-plus"></i>
              <div>可在左侧添加组件</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div v-else class="empty-layout">
      <el-empty description="布局为空，请在左侧添加行和组件">
        <template #image>
          <i class="el-icon-s-grid" style="font-size: 60px; color: #909399;"></i>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script>
import WidgetRegistry from '@/services/widget-registry';
import HeadlineWidget from '@/components/widgets/HeadlineWidget.vue';
import NewsListWidget from '@/components/widgets/NewsListWidget.vue';
import ImageNewsWidget from '@/components/widgets/ImageNewsWidget.vue';
import CarouselWidget from '@/components/widgets/CarouselWidget.vue';
import HotNewsWidget from '@/components/widgets/HotNewsWidget.vue';

// 注册可用的组件
WidgetRegistry.register('headline', HeadlineWidget);
WidgetRegistry.register('news-list', NewsListWidget);
WidgetRegistry.register('image-news', ImageNewsWidget);
WidgetRegistry.register('carousel', CarouselWidget);
WidgetRegistry.register('hot-news', HotNewsWidget);

export default {
  name: 'LayoutPreview',
  props: {
    layout: {
      type: Object,
      required: true,
      default: () => ({ rows: [] })
    }
  },
  methods: {
    // 根据组件类型获取对应的组件
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    }
  }
};
</script>

<style scoped>
.layout-preview {
  width: 100%;
  min-height: 100%;
}

.preview-row {
  margin-bottom: 20px;
  width: 100%;
}

.preview-row .el-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.preview-column {
  min-height: 100px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.widget-container {
  margin-bottom: 15px;
  width: 100%;
}

.widget {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.empty-layout {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: #fff;
  border-radius: 4px;
}

.empty-column-hint {
  height: 120px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.empty-column-hint:hover {
  border-color: #409EFF;
  color: #409EFF;
  background-color: #ecf5ff;
}

.empty-column-hint i {
  font-size: 24px;
  margin-bottom: 8px;
}
</style> 