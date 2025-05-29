<template>
  <div class="carousel-widget">
    <div v-if="loading" class="loading-carousel">
      <el-skeleton animated :rows="1" style="height: 100%" />
    </div>
    <template v-else-if="items && items.length > 0">
      <el-carousel
        :interval="config.interval"
        :autoplay="config.autoplay"
        indicator-position="none"
        ref="carousel"
        @change="handleChange"
      >
        <el-carousel-item v-for="item in items" :key="item.id">
          <div class="carousel-item">
            <img :src="item.image" :alt="item.title" class="carousel-image" />
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 底部控制栏 -->
      <div class="carousel-controls">
        <!-- 指示器 -->
        <div class="carousel-indicators">
          <span
            v-for="(_, index) in items"
            :key="index"
            class="indicator"
            :class="{ active: currentIndex === index }"
            @click="setActiveItem(index, $event)"
          ></span>
        </div>

        <!-- 标题 -->
        <div v-if="config.showTitle" class="carousel-title">
          {{ currentItem.title }}
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
        <el-form-item label="轮播间隔">
          <el-input-number
            v-model="tempConfig.interval"
            :min="1000"
            :max="10000"
            :step="500"
          ></el-input-number>
          <span class="form-tip">毫秒</span>
        </el-form-item>

        <el-form-item label="自动播放">
          <el-switch v-model="tempConfig.autoplay"></el-switch>
        </el-form-item>

        <el-form-item label="显示标题">
          <el-switch v-model="tempConfig.showTitle"></el-switch>
        </el-form-item>

        <el-form-item label="栏目选择" prop="columnId" required>
          <el-select v-model="tempConfig.columnId" placeholder="选择栏目">
            <el-option
              v-for="column in columns"
              :key="column.id"
              :label="column.name"
              :value="column.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="最大条数">
          <el-input-number
            v-model="tempConfig.maxItems"
            :min="1"
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
import { mockNewsData } from "../services/mock";

export default {
  name: "CarouselWidget1",
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        autoplay: true,
        interval: 5000,
        showTitle: true,
        columnId: "",
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
      formRules: {
        columnId: [
          { required: true, message: '请选择栏目', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    ...mapState("column", ["columns"]),

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
    // 确保有栏目数据
    if (this.columns.length === 0) {
      this.$store.dispatch("column/fetchColumns");
    }

    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // 如果columnId为空，使用mock数据
        if (!this.config.columnId) {
          // 使用简化后的mock数据
          this.items = mockNewsData.slice(0, this.config.maxItems || 5);
        } else {
          // 从API获取轮播数据
          this.items = await api.getNewsByColumn(
            this.config.columnId,
            this.config.maxItems || 5
          );
        }
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
    setActiveItem(index, event) {
      // 阻止事件冒泡，避免引起其他不必要的行为
      if (event) event.preventDefault();
      this.currentIndex = index;
      this.$refs.carousel.setActiveItem(index);
    },
    // 显示设置对话框的方法
    showSettingDialog(callback) {
      // 保存回调函数
      this.configCallback = callback;

      // 复制当前配置到临时配置对象
      this.tempConfig = JSON.parse(JSON.stringify(this.config));

      // 显示配置对话框
      this.configDialogVisible = true;
    },
    // 保存配置
    saveConfig() {
      // 如果有回调函数，则调用它并传递新配置
      if (typeof this.configCallback === "function") {
        this.configCallback(this.tempConfig);
      }

      // 关闭对话框
      this.configDialogVisible = false;
    },
    // 校验并保存配置
    validateAndSaveConfig() {
      this.$refs.configForm.validate((valid) => {
        if (valid) {
          this.saveConfig();
        } else {
          return false;
        }
      });
    },
    // 对话框关闭处理
    handleDialogClosed() {
      console.log("handleDialogClosed");
      // 清空临时配置和回调
      this.tempConfig = {};
      this.configCallback = null;
      // 重置表单验证
      if (this.$refs.configForm) {
        this.$refs.configForm.resetFields();
      }
    },
    
    // 校验组件配置 (供外部调用)
    validateConfig(config) {
      // 校验结果
      const result = {
        valid: true,
        message: ""
      };
      
      // 只检查columnId是否已选择
      if (!config.columnId) {
        result.valid = false;
        result.message = "请选择栏目";
      }
      
      return result;
    }
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

.carousel-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  z-index: 10;
}

.carousel-indicators {
  display: flex;
  align-items: center;
  gap: 8px;

  .indicator {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: #fff;
      width: 24px;
      border-radius: 4px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
  }
}

.carousel-title {
  flex: 1;
  color: #fff;
  font-size: 14px;
  margin-left: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-carousel {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.loading-carousel {
  height: 100%;
  padding: 10px;
  background-color: #f5f7fa;
}

:deep(.el-carousel__container) {
  height: 100%;
}

:deep(.el-carousel__indicators) {
  display: none;
}

.form-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
