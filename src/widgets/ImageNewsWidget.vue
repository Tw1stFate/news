<template>
  <div class="image-news-widget">
    <h3 class="widget-title">{{ config.title }}</h3>
    <div v-if="loading" class="loading">
      <div class="simple-loading">加载中...</div>
    </div>
    <div
      v-else-if="newsItems && newsItems.length > 0"
      class="image-news-content"
      :class="positionClass"
    >
      <div class="news-image">
        <img :src="newsItems[0].image" :alt="newsItems[0].title" />
      </div>
      <div class="news-details">
        <h4 class="news-title">{{ newsItems[0].title }}</h4>
        <p v-if="config.description" class="news-summary">
          {{ newsItems[0].summary }}
        </p>
        <div class="news-date">{{ newsItems[0].date }}</div>
      </div>
    </div>
    <el-empty v-else description="暂无新闻" />

    <!-- 配置对话框 -->
    <el-dialog
      title="图文新闻组件配置"
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
          <el-input v-model="tempConfig.title"></el-input>
        </el-form-item>

        <el-form-item label="图片位置">
          <el-select v-model="tempConfig.imagePosition">
            <el-option label="左侧" value="left"></el-option>
            <el-option label="右侧" value="right"></el-option>
            <el-option label="顶部" value="top"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="显示描述">
          <el-switch v-model="tempConfig.description"></el-switch>
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
  name: "ImageNewsWidget",
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: "图文新闻",
        imagePosition: "left",
        description: true,
        categoryId: "",
        maxItems: 1,
      }),
    },
  },
  data() {
    return {
      // 添加requiresConfig属性，表示该组件需要配置
      requiresConfig: true,
      loading: true,
      newsItems: null,
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
    
    // 根据图片位置设置不同的 CSS 类
    positionClass() {
      return `image-${this.config.imagePosition}`;
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
        // 从API获取图片新闻数据
        const newsList = await api.getNewsByColumn(
          this.config.categoryId || "lifestyle",
          this.config.maxItems || 6
        );
        this.newsItems = newsList.filter((item) => item.image);
      } catch (error) {
        console.error("获取图片新闻数据失败:", error);
        this.newsItems = [];
      } finally {
        this.loading = false;
      }
    },

    // 新增：显示设置对话框的方法
    showSettingDialog(callback) {
      this.configCallback = callback;
      this.configDialogVisible = true;
      this.tempConfig = JSON.parse(JSON.stringify(this.config));
    },

    // 对话框关闭处理
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
          console.error("表单验证失败");
        }
      });
    },

    // 保存配置
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
</style>
