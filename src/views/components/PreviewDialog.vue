<template>
  <el-dialog
    title="布局预览效果"
    :visible.sync="visible"
    width="90%"
    class="preview-dialog"
    :fullscreen="true"
    :before-close="handleClose">
    <div class="preview-toolbar">
      <div class="preview-info">
        <i class="el-icon-info"></i>
        <span>此预览展示了布局的最终效果，包括所有添加的组件和栏目内容</span>
      </div>
      <el-button type="primary" size="small" @click="handleClose">返回编辑</el-button>
    </div>
    <layout-preview :layout-tree="layoutTree" />
  </el-dialog>
</template>

<script>
import LayoutPreview from '@/components/preview/LayoutPreview.vue';

export default {
  name: 'PreviewDialog',
  components: {
    LayoutPreview
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    layoutTree: {
      type: Object,
      default: null
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style lang="scss" scoped>
.preview-dialog {
  ::v-deep .el-dialog__body {
    padding: 0;
    
    .layout-preview {
      border-radius: 0;
      box-shadow: none;
      margin-top: 20px;
    }
  }
  
  ::v-deep .el-dialog__header {
    background-color: #409EFF;
    padding: 15px 20px;
    
    .el-dialog__title {
      color: white;
      font-size: 18px;
    }
    
    .el-dialog__headerbtn {
      top: 15px;
      
      .el-dialog__close {
        color: white;
      }
    }
  }
  
  .preview-toolbar {
    padding: 15px 20px;
    background-color: #ecf5ff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .preview-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #409EFF;
      
      i {
        font-size: 18px;
      }
    }
  }
}
</style> 