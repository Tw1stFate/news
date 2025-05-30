<template>
  <div class="carousel-widget">
    <div v-if="loading" class="loading-carousel">
      <div class="simple-loading">加载中...</div>
    </div>
    <template v-else-if="items && items.length > 0">
      <div class="carousel-container">
        <!-- 左侧图片区域 -->
        <div class="image-area">
          <el-carousel
            :interval="config.interval"
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
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 右侧标题列表 -->
        <div class="title-list">
          <div class="list-header">
            <h3>最新动态</h3>
          </div>
          <div class="list-container">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="title-item"
              :class="{ active: currentIndex === index }"
              @click="setActiveItem(index)"
              @mouseenter="mouseEnterHandler(index, $event)"
            >
              <div class="title-content">
                <span class="title-text">{{ item.title }}</span>
                <span class="title-date" v-if="item.date && config.showDate">{{
                  item.date
                }}</span>
              </div>
            </div>
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
            :min="1000"
            :max="10000"
            :step="500"
          ></el-input-number>
          <span class="form-tip">毫秒</span>
        </el-form-item>

        <el-form-item label="显示日期">
          <el-switch v-model="tempConfig.showDate"></el-switch>
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
  name: "CarouselWidget3",
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        autoplay: true,
        interval: 5000,
        showDate: true,
        categoryId: "",
        maxItems: 5,
      }),
    },
  },
  data() {
    return {
      requiresConfig: true,
      currentIndex: 0,
      loading: true,
      items: [],
      configDialogVisible: false,
      tempConfig: {},
      configCallback: null,
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
    },
    setActiveItem(index) {
      this.currentIndex = index;
      this.$refs.carousel.setActiveItem(index);
    },
    mouseEnterHandler(index, event) {
      // 悬停在标题上时自动切换到对应的图片
      if (this.currentIndex !== index) {
        // 阻止事件冒泡，避免引起其他不必要的行为
        if (event) event.preventDefault();
        this.setActiveItem(index);
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
  height: 100%;
  display: flex;
  background: #fff;
}

.image-area {
  flex: 3;
  min-width: 0;
  position: relative;

  :deep(.el-carousel),
  :deep(.el-carousel__container) {
    height: 100% !important;
  }
}

.carousel-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-list {
  flex: 2;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ebeef5;
  background: #fff;
  max-width: 320px;

  .list-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f5f7fa;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }

  .list-container {
    flex: 1;
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

  .title-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f5f7fa;
    transition: all 0.3s;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #f0f7ff;
      border-left: 3px solid #409eff;
      color: #409eff;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        left: -7px;
        top: 50%;
        transform: translateY(-50%);
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid #409eff;
      }
    }

    .title-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .title-text {
      font-size: 14px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .title-date {
      font-size: 12px;
      color: #909399;
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
