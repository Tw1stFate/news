<template>
  <div class="widget-settings">
    <el-form :model="formData" label-width="120px" size="small">
      <!-- 通用设置 -->
      <el-divider content-position="left">通用设置</el-divider>
      
      <!-- 高度设置 -->
      <el-form-item label="组件高度">
        <el-input-number 
          v-model="formData.height" 
          :min="100" 
          :max="800" 
          :step="10"
          style="width: 180px;">
        </el-input-number>
        <span class="unit">px</span>
      </el-form-item>
      
      <!-- 标题设置 (如果有) -->
      <el-form-item v-if="hasTitle" label="组件标题">
        <el-input v-model="formData.title" style="width: 300px;"></el-input>
      </el-form-item>
      
      <!-- 数据源设置 -->
      <el-divider content-position="left">数据源设置</el-divider>
      
      <el-form-item label="关联栏目">
        <el-select 
          v-model="formData.categoryId" 
          placeholder="请选择关联栏目"
          style="width: 300px;">
          <el-option
            v-for="channel in channels"
            :key="channel.id"
            :label="channel.name"
            :value="channel.id">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="最大显示数量">
        <el-input-number 
          v-model="formData.maxItems" 
          :min="1" 
          :max="20" 
          :step="1"
          style="width: 180px;">
        </el-input-number>
        <span class="unit">条</span>
      </el-form-item>
      
      <!-- 轮播图特有设置 -->
      <template v-if="isCarousel">
        <el-divider content-position="left">轮播设置</el-divider>
        
        <el-form-item label="自动播放">
          <el-switch v-model="formData.autoplay"></el-switch>
        </el-form-item>
        
        <el-form-item label="切换时间间隔" v-if="formData.autoplay">
          <el-input-number 
            v-model="formData.interval" 
            :min="1000" 
            :max="10000" 
            :step="500"
            style="width: 180px;">
          </el-input-number>
          <span class="unit">毫秒</span>
        </el-form-item>
        
        <el-form-item label="显示标题">
          <el-switch v-model="formData.showTitle"></el-switch>
        </el-form-item>
      </template>
      
      <!-- 列表特有设置 -->
      <template v-if="isList">
        <el-divider content-position="left">列表设置</el-divider>
        
        <el-form-item label="显示日期">
          <el-switch v-model="formData.showDate"></el-switch>
        </el-form-item>
        
        <el-form-item label="显示图片" v-if="hasImageOption">
          <el-switch v-model="formData.showImage"></el-switch>
        </el-form-item>
        
        <el-form-item label="列表项数量">
          <el-input-number 
            v-model="formData.count" 
            :min="1" 
            :max="20" 
            :step="1"
            style="width: 180px;">
          </el-input-number>
          <span class="unit">条</span>
        </el-form-item>
      </template>
      
      <!-- 排行榜特有设置 -->
      <template v-if="isRanking">
        <el-divider content-position="left">排行设置</el-divider>
        
        <el-form-item label="显示序号">
          <el-switch v-model="formData.showNumber"></el-switch>
        </el-form-item>
        
        <el-form-item label="统计周期">
          <el-select v-model="formData.period" style="width: 180px;">
            <el-option label="今日" value="day"></el-option>
            <el-option label="本周" value="week"></el-option>
            <el-option label="本月" value="month"></el-option>
          </el-select>
        </el-form-item>
      </template>
      
      <!-- 导航栏特有设置 -->
      <template v-if="isNavBar">
        <el-divider content-position="left">导航设置</el-divider>
        
        <el-form-item label="Logo URL">
          <el-input v-model="formData.logoUrl" style="width: 300px;"></el-input>
        </el-form-item>
        
        <el-form-item label="显示搜索框">
          <el-switch v-model="formData.showSearch"></el-switch>
        </el-form-item>
        
        <el-divider content-position="left">菜单项</el-divider>
        
        <div v-for="(item, index) in formData.menuItems" :key="index" class="menu-item-form">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item :label="'菜单 ' + (index + 1)" label-width="80px">
                <el-input v-model="item.label" placeholder="菜单名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label-width="0">
                <el-input v-model="item.url" placeholder="链接地址" v-if="!item.dropdown"></el-input>
                <el-select v-model="item.target" v-if="!item.dropdown" style="width: 120px; margin-left: 10px;">
                  <el-option label="新窗口" value="_blank"></el-option>
                  <el-option label="当前窗口" value="_self"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-checkbox v-model="item.dropdown" style="margin-top: 10px;">下拉菜单</el-checkbox>
            </el-col>
            <el-col :span="2">
              <el-button 
                type="danger" 
                icon="el-icon-delete" 
                circle 
                size="mini" 
                @click="removeMenuItem(index)"
                style="margin-top: 5px;">
              </el-button>
            </el-col>
          </el-row>
        </div>
        
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="addMenuItem">添加菜单项</el-button>
        </el-form-item>
      </template>
      
      <!-- 图片走廊特有设置 -->
      <template v-if="isGallery">
        <el-divider content-position="left">图片走廊设置</el-divider>
        
        <el-form-item label="布局方式">
          <el-select v-model="formData.layout" style="width: 180px;">
            <el-option label="网格布局" value="grid"></el-option>
            <el-option label="瀑布流" value="waterfall"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'WidgetSettings',
  props: {
    widget: {
      type: Object,
      required: true
    },
    channels: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: JSON.parse(JSON.stringify(this.widget.config || {}))
    }
  },
  computed: {
    widgetType() {
      return this.widget.type || '';
    },
    
    isCarousel() {
      return this.widgetType.startsWith('carousel-');
    },
    
    isList() {
      return this.widgetType.startsWith('news-list') || this.widgetType === 'headline';
    },
    
    isRanking() {
      return this.widgetType === 'hot-news';
    },
    
    isNavBar() {
      return this.widgetType === 'nav-bar';
    },
    
    isGallery() {
      return this.widgetType === 'image-news';
    },
    
    hasTitle() {
      return this.isList || this.isGallery;
    },
    
    hasImageOption() {
      // 只有某些列表组件有显示图片选项
      return this.widgetType === 'news-list';
    }
  },
  watch: {
    formData: {
      handler(val) {
        this.$emit('save', val);
      },
      deep: true
    },
    
    widget: {
      handler(val) {
        this.formData = JSON.parse(JSON.stringify(val.config || {}));
      },
      deep: true
    }
  },
  methods: {
    addMenuItem() {
      if (!this.formData.menuItems) {
        this.formData.menuItems = [];
      }
      
      this.formData.menuItems.push({
        label: '新菜单项',
        url: '#',
        target: '_self',
        active: false,
        dropdown: false
      });
    },
    
    removeMenuItem(index) {
      this.formData.menuItems.splice(index, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
.widget-settings {
  padding: 10px;
  
  .el-divider {
    margin: 15px 0;
  }
  
  .unit {
    margin-left: 8px;
    color: #606266;
  }
  
  .menu-item-form {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }
}
</style> 