<template>
  <div class="news-list-widget">
    <div class="widget-header">
      <div class="title-area">
        <h3 class="category-title" ref="categoryTitle">
          {{ config.title || "双轻业务" }}
        </h3>
      </div>
      <div class="more-link" @click="handleMoreClick">更多</div>
    </div>

    <!-- 标题下方的指示器 -->
    <div class="title-indicator">
      <div
        class="indicator-active"
        :style="{ width: `${indicatorWidth}px`, left: `${indicatorLeft}px` }"
      ></div>
    </div>

    <div v-if="loading" class="loading-content">
      <div class="simple-loading">加载中...</div>
    </div>

    <div class="widget-content" v-else-if="newsItems && newsItems.length > 0">
      <!-- 左侧大图 -->
      <div class="feature-image" @click="handleItemClick(newsItems[0])">
        <img
          :src="newsItems[0].image || newsItems[0].thumbnail"
          :alt="newsItems[0].title"
        />
      </div>

      <!-- 右侧列表 -->
      <div class="news-list">
        <div
          v-for="(item, index) in displayItems"
          :key="index"
          class="news-item"
          @click="handleItemClick(item)"
        >
          <div class="item-title" :title="item.title">{{ item.title }}</div>
        </div>
      </div>
    </div>

    <div v-else class="empty-list">
      <el-empty description="暂无数据" :image-size="80"></el-empty>
    </div>

    <!-- 组件配置对话框 -->
    <el-dialog
      title="新闻列表组件配置"
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
        <el-form-item label="标题">
          <el-input
            v-model="tempConfig.title"
            placeholder="请输入标题"
          ></el-input>
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

        <el-form-item label="显示数量">
          <el-input-number
            v-model="tempConfig.count"
            :min="4"
            :max="10"
            :step="1"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="最大获取数量">
          <el-input-number
            v-model="tempConfig.maxItems"
            :min="4"
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
  name: "NewsListWidget3",
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: "双轻业务",
        count: 4,
        categoryId: "",
        maxItems: 4,
      }),
    },
  },
  data() {
    return {
      // 添加requiresConfig属性，表示该组件需要配置
      requiresConfig: true,
      indicatorWidth: 0,
      indicatorLeft: 16,
      loading: true,
      newsItems: [],
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
    
    displayItems() {
      return this.newsItems.slice(0, this.config.count || 4);
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
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // 从API获取新闻列表数据
        this.newsItems = await api.getNewsByColumn(
          this.config.categoryId || "finance",
          this.config.maxItems || 4
        );
      } catch (error) {
        console.error("获取新闻数据失败:", error);
        this.newsItems = [];
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.updateIndicatorWidth();
        });
      }
    },
    handleItemClick(item) {
      if (item.link) {
        window.open(item.link, "_blank");
      }
    },
    handleMoreClick() {
      this.$emit("more-click", this.config.categoryId || "finance");
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
    },
    showSettingDialog(callback) {
      this.configCallback = callback;
      this.configDialogVisible = true;
      this.tempConfig = JSON.parse(JSON.stringify(this.config));
    },
    handleDialogClosed() {
      this.tempConfig = {};
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
  mounted() {
    this.updateIndicatorWidth();
    // 监听窗口大小变化，更新指示器宽度
    window.addEventListener("resize", this.updateIndicatorWidth);
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener("resize", this.updateIndicatorWidth);
    this.$root.$off("widget-config-requested", this.handleConfigRequest);
  },
};
</script>

<style lang="scss" scoped>
.news-list-widget {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-content {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.simple-loading {
  font-size: 14px;
  color: #909399;
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
  padding: 16px;
  display: flex;
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
