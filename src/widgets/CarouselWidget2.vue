<template>
  <div class="carousel-widget">
    <div v-if="loading" class="loading-carousel">
      <div class="simple-loading">加载中...</div>
    </div>
    <template v-else-if="items && items.length > 0">
      <div class="carousel-container">
        <div class="main-content">
          <div class="carousel-main">
            <el-carousel
              :interval="config.interval * 1000"
              :autoplay="config.autoplay"
              indicator-position="none"
              ref="carousel"
              @change="handleChange"
              arrow="always"
              :pause-on-hover="true"
            >
              <el-carousel-item v-for="item in items" :key="item.id">
                <div class="carousel-item">
                  <img
                    :src="item.image"
                    :alt="item.title"
                    class="carousel-image"
                  />
                  <div v-if="config.showTitle" class="carousel-title">
                    {{ item.title }}
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>

        <!-- 缩略图导航 -->
        <div class="thumbnail-nav">
          <div
            class="nav-arrow prev"
            @click="prev"
            :class="{ disabled: currentIndex === 0 }"
          >
            <i class="el-icon-arrow-up"></i>
          </div>
          <div class="thumbnails-container">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="thumbnail"
              :class="{ active: currentIndex === index }"
              @click="setActiveItem(index)"
            >
              <img :src="item.thumbnail || item.image" :alt="item.title" />
            </div>
          </div>
          <div
            class="nav-arrow next"
            @click="next"
            :class="{ disabled: currentIndex === items.length - 1 }"
          >
            <i class="el-icon-arrow-down"></i>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-carousel">
      <el-empty description="暂无轮播数据"></el-empty>
    </div>

    <!-- 组件配置对话框 -->
    <el-dialog
      title="轮播组件配置"
      :visible.sync="configDialogVisible"
      width="500px"
      append-to-body
      @closed="handleDialogClosed"
    >
      <el-form 
        :model="tempConfig" 
        label-width="100px" 
        size="small"
        ref="configForm"
        :rules="formRules"
      >
        <el-form-item label="自动播放">
          <el-switch v-model="tempConfig.autoplay"></el-switch>
        </el-form-item>

        <el-form-item label="轮播间隔" v-if="tempConfig.autoplay">
          <el-input-number
            v-model="tempConfig.interval"
            :min="1"
            :max="20"
            :step="1"
          ></el-input-number>
          <span class="form-tip">秒</span>
        </el-form-item>

        <el-form-item label="显示标题">
          <el-switch v-model="tempConfig.showTitle"></el-switch>
        </el-form-item>

        <el-form-item label="栏目" prop="categoryId" required>
          <el-select v-model="tempConfig.categoryId" placeholder="选择栏目">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="最大图片数量">
          <el-input-number
            v-model="tempConfig.maxItems"
            :min="2"
            :max="10"
            :step="1"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="validateAndSaveConfig">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from "../services/api";
import { mapState } from "vuex";

export default {
  name: "CarouselWidget2",
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        autoplay: true,
        interval: 5,
        showTitle: true,
        categoryId: "",
        maxItems: 5,
      }),
    },
  },
  data() {
    return {
      // 添加requiresConfig属性，表示该组件需要配置
      requiresConfig: true,
      currentIndex: 0,
      loading: true,
      items: [],
      configDialogVisible: false,
      tempConfig: {},
      configCallback: null,
      // 添加表单验证规则
      formRules: {
        categoryId: [
          { required: true, message: '请选择栏目', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    ...mapState("column", ["columns"]),
    
    categories() {
      return this.columns || [];
    },
    
    currentItem() {
      return this.items[this.currentIndex] || {};
    },
  },
  watch: {
    // 当配置变化时，重新获取数据
    config: {
      handler() {
        this.fetchData();
      },
      deep: true,
    },
  },
  created() {
    this.fetchData();
  },
  beforeDestroy() {
    // Component cleanup
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // 从API获取轮播数据
        this.items = await api.getNewsByColumn(
          this.config.categoryId || "headlines",
          this.config.maxItems || 5
        );
      } catch (error) {
        console.error("获取轮播数据失败:", error);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
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
      const container = this.$el.querySelector(".thumbnails-container");
      const activeThumb = container.children[this.currentIndex];
      if (activeThumb) {
        const containerRect = container.getBoundingClientRect();
        const thumbRect = activeThumb.getBoundingClientRect();

        // 检查缩略图是否在可视区域内
        if (
          thumbRect.top < containerRect.top ||
          thumbRect.bottom > containerRect.bottom
        ) {
          // 使用自定义滚动而不是scrollIntoView，避免触发页面滚动
          if (thumbRect.top < containerRect.top) {
            // 向上滚动
            container.scrollTop += thumbRect.top - containerRect.top - 8;
          } else {
            // 向下滚动
            container.scrollTop += thumbRect.bottom - containerRect.bottom + 8;
          }
        }
      }
    },
    showSettingDialog(callback) {
      this.configCallback = callback;
      this.configDialogVisible = true;
      this.tempConfig = JSON.parse(JSON.stringify(this.config));
    },
    handleDialogClosed() {
      this.configDialogVisible = false;
      this.configCallback = null;
      // 重置表单验证
      if (this.$refs.configForm) {
        this.$refs.configForm.resetFields();
      }
    },
    validateAndSaveConfig() {
      this.$refs.configForm.validate((valid) => {
        if (valid) {
          this.saveConfig();
        } else {
          console.error("表单验证失败");
        }
      });
    },
    saveConfig() {
      // 如果有回调函数，则调用它并传递新配置
      if (typeof this.configCallback === "function") {
        this.configCallback(this.tempConfig);
      }
      this.configDialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.carousel-widget {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.loading-carousel {
  height: 100%;
  padding: 10px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.simple-loading {
  font-size: 14px;
  color: #909399;
}

.carousel-container {
  display: flex;
  height: 100%;
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
      color: #409eff;
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
    
    // 不显示滚动条
    &::-webkit-scrollbar {
      display: none;
    }

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
    margin-bottom: 8px; // 替代gap属性
    
    &:last-child {
      margin-bottom: 0; // 最后一个元素不需要底部边距
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover {
      border-color: #c0c4cc;
    }

    &.active {
      border-color: #409eff;
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
