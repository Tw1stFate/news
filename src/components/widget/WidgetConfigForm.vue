<template>
  <div class="widget-config-form">
    <el-form :model="form" :rules="rules" ref="form" label-width="100px">
      <el-form-item label="样式名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入样式名称"></el-input>
      </el-form-item>

      <el-form-item label="样式描述" prop="description">
        <el-input
          type="textarea"
          v-model="form.description"
          :rows="3"
          placeholder="请输入样式描述">
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="$emit('cancel')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'WidgetConfigForm',
  props: {
    widget: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入样式名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入样式描述', trigger: 'blur' }
        ]
      }
    };
  },
  watch: {
    widget: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = {
            id: val.id,
            name: val.name,
            description: val.description,
            type: val.type,
            config: val.config || {}
          };
        }
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('save', this.form);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.widget-config-form {
  padding: 20px;
}
</style> 