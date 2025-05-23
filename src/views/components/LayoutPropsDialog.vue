<template>
  <el-dialog
    :title="layoutType === 'row' ? '添加行布局' : '添加列布局'"
    :visible.sync="visible"
    width="30%">
    <el-form :model="layoutProps" label-width="100px">
      <el-form-item label="布局比例" prop="ratios">
        <el-input v-model="layoutProps.ratios" :placeholder="layoutType === 'row' ? '可选，例如: 1:1 或 1:2:1' : '例如: 1:1 或 2:3:1'">
          <template slot="append">
            <el-tooltip :content="layoutType === 'row' ? '用冒号分隔各行的高度比例，如1:1表示两个等高行，1:2:1表示三行(25%,50%,25%)' : '用冒号分隔各列的宽度比例，如1:1表示两个等宽列，2:5:3表示三列(20%,50%,30%)'" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </template>
        </el-input>
        <div class="form-item-tip">
          <span v-if="layoutType === 'row'">留空表示添加单个行，输入比例如1:1将创建多个行</span>
          <span v-else>输入比例如1:1将创建两个等宽列，1:2表示宽度比为1:2的两列</span>
        </div>
      </el-form-item>
      <el-form-item label="高度" prop="height">
        <el-input v-model="layoutProps.height" placeholder="可选，如200px">
          <template slot="append">px</template>
        </el-input>
        <div class="form-item-tip">
          <span v-if="layoutType === 'row'">留空表示高度自适应内容</span>
          <span v-else>留空表示高度占满父容器</span>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'LayoutPropsDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    layoutType: {
      type: String,
      default: 'row',
      validator: value => ['row', 'column'].includes(value)
    },
    parentId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      layoutProps: {
        ratios: '',
        height: ''
      }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        // 对话框打开时重置表单
        this.resetForm();
      }
    },
    layoutType(val) {
      // 根据布局类型设置默认值
      this.setDefaultValues();
    }
  },
  methods: {
    resetForm() {
      this.setDefaultValues();
    },
    setDefaultValues() {
      // 为不同布局类型设置合适的默认值
      if (this.layoutType === 'row') {
        this.layoutProps = {
          ratios: '', // 行布局默认不设置比例
          height: ''
        };
      } else {
        this.layoutProps = {
          ratios: '1:1', // 默认等宽两列
          height: ''
        };
      }
    },
    handleCancel() {
      this.$emit('update:visible', false);
    },
    handleConfirm() {
      this.$emit('confirm', {
        layoutType: this.layoutType,
        parentId: this.parentId,
        props: { ...this.layoutProps }
      });
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style lang="scss" scoped>
.form-item-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style> 