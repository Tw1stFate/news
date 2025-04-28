<template>
  <el-dialog 
    :title="'组件配置 - ' + getWidgetName(widget?.type)"
    :visible.sync="dialogVisible"
    width="500px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    
    <div v-if="widget">
      <div class="widget-description">
        <i :class="getWidgetIcon(widget.type)"></i>
        <span>{{ getWidgetDescription(widget.type) }}</span>
      </div>
      
      <el-form :model="formData" label-width="100px">
        <!-- 大标题组件配置 -->
        <template v-if="widget.type === 'headline'">
          <el-form-item label="标题">
            <el-input v-model="formData.title"></el-input>
          </el-form-item>
          <el-form-item label="链接">
            <el-input v-model="formData.link" placeholder="可选链接地址"></el-input>
          </el-form-item>
          <el-form-item label="样式类型">
            <el-select v-model="formData.styleType" placeholder="选择样式类型">
              <el-option label="默认" value="default"></el-option>
              <el-option label="主要" value="primary"></el-option>
              <el-option label="成功" value="success"></el-option>
              <el-option label="警告" value="warning"></el-option>
              <el-option label="危险" value="danger"></el-option>
            </el-select>
          </el-form-item>
        </template>
        
        <!-- 新闻列表组件配置 -->
        <template v-if="widget.type === 'news-list'">
          <el-form-item label="标题">
            <el-input v-model="formData.title"></el-input>
          </el-form-item>
          <el-form-item label="显示图片">
            <el-switch v-model="formData.showImage"></el-switch>
          </el-form-item>
          <el-form-item label="最大条目数">
            <el-input-number v-model="formData.maxItems" :min="1" :max="20"></el-input-number>
          </el-form-item>
          <el-form-item label="新闻分类">
            <el-select v-model="formData.category" placeholder="选择新闻分类">
              <el-option label="综合" value="general"></el-option>
              <el-option label="科技" value="technology"></el-option>
              <el-option label="娱乐" value="entertainment"></el-option>
              <el-option label="体育" value="sports"></el-option>
            </el-select>
          </el-form-item>
        </template>
        
        <!-- 图文新闻组件配置 -->
        <template v-if="widget.type === 'image-news'">
          <el-form-item label="标题">
            <el-input v-model="formData.title"></el-input>
          </el-form-item>
          <el-form-item label="图片位置">
            <el-radio-group v-model="formData.imagePosition">
              <el-radio label="left">左侧</el-radio>
              <el-radio label="right">右侧</el-radio>
              <el-radio label="top">顶部</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="显示描述">
            <el-switch v-model="formData.description"></el-switch>
          </el-form-item>
          <el-form-item label="新闻分类">
            <el-select v-model="formData.category" placeholder="选择新闻分类">
              <el-option label="综合" value="general"></el-option>
              <el-option label="科技" value="technology"></el-option>
              <el-option label="娱乐" value="entertainment"></el-option>
              <el-option label="体育" value="sports"></el-option>
            </el-select>
          </el-form-item>
        </template>
        
        <!-- 轮播图组件配置 -->
        <template v-if="widget.type === 'carousel'">
          <el-form-item label="自动播放">
            <el-switch v-model="formData.autoplay"></el-switch>
          </el-form-item>
          <el-form-item label="播放间隔(ms)" v-if="formData.autoplay">
            <el-input-number v-model="formData.interval" :min="1000" :max="10000" :step="500"></el-input-number>
          </el-form-item>
          
          <el-divider content-position="left">轮播项目</el-divider>
          
          <div v-for="(item, index) in formData.items" :key="index" class="carousel-item">
            <el-row :gutter="10">
              <el-col :span="20">
                <el-form-item :label="'标题 ' + (index + 1)">
                  <el-input v-model="item.title"></el-input>
                </el-form-item>
                <el-form-item label="图片地址">
                  <el-input v-model="item.image"></el-input>
                </el-form-item>
                <el-form-item label="链接">
                  <el-input v-model="item.link"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="4" class="delete-btn-col">
                <el-button 
                  type="danger" 
                  icon="el-icon-delete" 
                  circle
                  @click="removeCarouselItem(index)"
                ></el-button>
              </el-col>
            </el-row>
            <el-divider v-if="index < formData.items.length - 1"></el-divider>
          </div>
          
          <el-button type="primary" icon="el-icon-plus" @click="addCarouselItem">添加轮播项</el-button>
        </template>
        
        <!-- 热门新闻组件配置 -->
        <template v-if="widget.type === 'hot-news'">
          <el-form-item label="标题">
            <el-input v-model="formData.title"></el-input>
          </el-form-item>
          <el-form-item label="最大条目数">
            <el-input-number v-model="formData.maxItems" :min="1" :max="20"></el-input-number>
          </el-form-item>
          <el-form-item label="时间周期">
            <el-select v-model="formData.period" placeholder="选择时间周期">
              <el-option label="今日" value="day"></el-option>
              <el-option label="本周" value="week"></el-option>
              <el-option label="本月" value="month"></el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>
    </div>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveConfig">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'WidgetConfigDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    widget: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      formData: {},
      widgetTypes: {
        'headline': {
          name: '大标题',
          icon: 'el-icon-document',
          description: '用于显示页面或栏目的标题，可设置样式和链接'
        },
        'news-list': {
          name: '新闻列表',
          icon: 'el-icon-document-copy',
          description: '显示多条新闻的列表，可配置分类和显示数量'
        },
        'image-news': {
          name: '图文新闻',
          icon: 'el-icon-picture',
          description: '图文混排的新闻展示，可设置图片位置和描述显示'
        },
        'carousel': {
          name: '轮播图',
          icon: 'el-icon-picture-outline-round',
          description: '轮播展示多张图片，可配置自动播放和间隔时间'
        },
        'hot-news': {
          name: '热门新闻',
          icon: 'el-icon-star-on',
          description: '排行形式展示热门新闻，可设置时间周期和显示数量'
        }
      }
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit('update:visible', val);
    },
    widget: {
      handler(newWidget) {
        if (newWidget && newWidget.config) {
          // 复制配置对象，避免直接修改原对象
          this.formData = JSON.parse(JSON.stringify(newWidget.config));
          
          // 对于轮播图，确保 items 是数组
          if (newWidget.type === 'carousel' && !Array.isArray(this.formData.items)) {
            this.formData.items = [];
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    
    saveConfig() {
      this.$emit('save', this.formData);
      this.dialogVisible = false;
    },
    
    // 获取组件名称
    getWidgetName(type) {
      return type ? (this.widgetTypes[type]?.name || type) : '未知组件';
    },
    
    // 获取组件图标
    getWidgetIcon(type) {
      return type ? (this.widgetTypes[type]?.icon || 'el-icon-setting') : 'el-icon-setting';
    },
    
    // 获取组件描述
    getWidgetDescription(type) {
      return type ? (this.widgetTypes[type]?.description || '组件配置') : '组件配置';
    },
    
    // 轮播图项目相关方法
    addCarouselItem() {
      if (!Array.isArray(this.formData.items)) {
        this.formData.items = [];
      }
      
      this.formData.items.push({
        id: Date.now(),
        title: `新轮播项 ${this.formData.items.length + 1}`,
        image: 'https://picsum.photos/800/400?random=' + Date.now(),
        link: '#'
      });
    },
    
    removeCarouselItem(index) {
      this.formData.items.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.widget-description {
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-left: 4px solid #409EFF;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
}

.widget-description i {
  font-size: 18px;
  margin-right: 10px;
  color: #409EFF;
}

.carousel-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.delete-btn-col {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 