<template>
  <div class="news-list-widget">
    <div class="widget-header">
      <div class="title-area">
        <div class="category-indicator"></div>
        <h3 class="category-title">{{ config.title || "党建引领" }}</h3>
      </div>
      <div class="more-link" @click="handleMoreClick">
        更多 <i class="el-icon-arrow-right"></i>
      </div>
    </div>

    <div v-if="loading" class="loading-list">
      <div class="simple-loading">加载中...</div>
    </div>

    <div class="news-list" v-else-if="newsItems && newsItems.length > 0">
      <div
        v-for="(item, index) in displayItems"
        :key="index"
        class="news-item"
        @click="handleItemClick(item)"
      >
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
            :min="1"
            :max="20"
            :step="1"
          ></el-input-number>
          <span class="form-tip">条新闻</span>
        </el-form-item>

        <el-form-item label="显示日期">
          <el-switch v-model="tempConfig.showDate"></el-switch>
        </el-form-item>

        <el-form-item label="底部分页">
          <el-switch v-model="tempConfig.showPagination"></el-switch>
        </el-form-item>

        <el-form-item label="每页显示">
          <el-input-number
            v-model="tempConfig.pageSize"
            :min="5"
            :max="20"
            :step="5"
            :disabled="!tempConfig.showPagination"
          ></el-input-number>
          <span class="form-tip">条/页</span>
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
  name: "NewsListWidget1",
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: "党建引领",
        count: 6,
        showDate: true,
        categoryId: "",
        maxItems: 6,
      }),
    },
  },
  data() {
    return {
      // 添加requiresConfig属性，表示该组件需要配置
      requiresConfig: true,
      loading: true,
      newsItems: [],
      total: 0,
      currentPage: 1,
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
      return this.newsItems.slice(0, this.config.count || 6);
    },
  },
  watch: {
    currentPage() {
      this.fetchNews();
    },
    config: {
      handler() {
        this.fetchNews();
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
        // 从API获取新闻列表数据
        const result = await api.getNewsByColumn(
          this.config.categoryId || "domestic",
          this.config.maxItems || 6
        );

        this.newsItems = result;
      } catch (error) {
        console.error("获取新闻数据失败:", error);
        this.newsItems = [];
      } finally {
        this.loading = false;
      }
    },

    handleItemClick(item) {
      if (item.link) {
        window.open(item.link, "_blank");
      }
    },
    handleMoreClick() {
      this.$emit("more-click", this.config.categoryId || "domestic");
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
.news-list-widget {
  width: 100%;
  height: 100%;
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
      color: #409eff;
    }

    i {
      margin-left: 4px;
      font-size: 12px;
    }
  }
}

.loading-list {
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
      color: #409eff;
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
