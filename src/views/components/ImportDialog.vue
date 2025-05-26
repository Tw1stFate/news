<template>
  <el-dialog
    title="导入布局配置"
    :visible.sync="visible"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :close-on-press-escape="!importing"
    @closed="handleClosed"
    custom-class="import-layout-dialog"
  >
    <div class="import-dialog-content">
      <el-upload
        class="layout-uploader"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        :file-list="fileList"
        :disabled="importing"
        ref="importUpload"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将布局配置文件拖到此处，或<em>点击上传</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          只能上传JSON文件，且布局结构必须符合要求
        </div>
      </el-upload>
      <div class="import-tips" v-if="file">
        <el-alert
          title="导入操作将覆盖当前布局"
          type="warning"
          :closable="false"
          show-icon
        >
          <p>请确保已备份当前布局，导入操作不可撤销。</p>
        </el-alert>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel" :disabled="importing">取消</el-button>
      <el-button
        type="primary"
        @click="handleImport"
        :disabled="!file || importing"
        :loading="importing"
      >
        导入
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "ImportDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      file: null,
      fileList: [],
      importing: false,
      dialogWidth: "40%",
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetState();
        this.setDialogWidth();
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.setDialogWidth);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setDialogWidth);
  },
  methods: {
    resetState() {
      this.importing = false;
      this.file = null;
      this.fileList = [];

      // 手动触发文件上传组件重置
      this.$nextTick(() => {
        const uploadRef = this.$refs.importUpload;
        if (uploadRef && typeof uploadRef.clearFiles === "function") {
          uploadRef.clearFiles();
        }
      });
    },
    handleFileChange(file, fileList) {
      console.log("文件变更:", file, fileList);

      // 检查文件类型
      const isJson =
        file.raw.type === "application/json" || file.raw.name.endsWith(".json");
      if (!isJson) {
        this.$message.error("只能上传JSON格式的文件!");
        // 清空文件列表
        this.$refs.importUpload.clearFiles();
        this.file = null;
        this.fileList = [];
        return;
      }

      // 更新文件状态
      this.file = file.raw;
      this.fileList = [file];
    },
    handleCancel() {
      if (this.importing) return;
      this.$emit("update:visible", false);
    },
    handleClosed() {
      this.resetState();
    },
    handleImport() {
      if (!this.file) {
        this.$message.warning("请先选择布局配置文件");
        return;
      }

      this.importing = true;
      this.$emit("import", this.file);
    },
    setDialogWidth() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        this.dialogWidth = "90%";
      } else if (screenWidth < 1200) {
        this.dialogWidth = "60%";
      } else {
        this.dialogWidth = "40%";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.import-dialog-content {
  padding: 0;

  .layout-uploader {
    text-align: center;

    ::v-deep .el-upload__tip {
      margin-top: 10px;
      font-size: 13px;
      color: #909399;
    }

    ::v-deep .el-upload-dragger {
      width: 100%;
      height: 160px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      i {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .el-upload__text {
        font-size: 16px;
        line-height: 1.4;
        padding: 0 15px;
        text-align: center;
        word-break: break-word;

        em {
          color: #409eff;
          font-style: normal;
        }
      }
    }
  }

  .import-tips {
    margin-top: 15px;

    p {
      margin: 5px 0 0;
      font-size: 12px;
    }
  }
}

::v-deep .import-layout-dialog {
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;

  .el-dialog__header {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 15px;
    border-top: 1px solid #ebeef5;
  }

  .el-upload-dragger {
    border-radius: 6px;
  }
}

// 文件上传组件样式
::v-deep .el-upload {
  width: 100%;

  .el-upload-dragger {
    width: 100% !important;
  }
}
</style>
