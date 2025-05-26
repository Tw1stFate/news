<template>
  <div class="quick-layout-form">
    <div class="form-row">
      <div class="form-group">
        <div class="label-wrapper">
          <label>行数:</label>
        </div>
        <div class="input-wrapper">
          <el-input-number
            v-model="config.rows"
            :min="1"
            :max="5"
            size="small"
          ></el-input-number>
        </div>
      </div>
      <div class="form-group">
        <div class="label-wrapper">
          <el-tooltip
            content="留空表示高度自适应内容，直接输入数值如200即可，单位默认为px"
            placement="top"
          >
            <i class="el-icon-question"></i>
          </el-tooltip>
          <label>行高:</label>
        </div>
        <div class="input-wrapper">
          <el-input
            v-model="config.height"
            size="small"
            style="width: 100%"
            placeholder="默认自适应, 可输入自定义高度"
          >
            <template slot="suffix">px</template>
          </el-input>
        </div>
      </div>
      <div class="form-group">
        <div class="label-wrapper">
          <label>列配置:</label>
        </div>
        <div class="input-wrapper">
          <el-select
            v-model="config.columnPreset"
            size="small"
            style="width: 100%"
            @change="handlePresetChange"
          >
            <el-option label="不分列" value="none"></el-option>
            <el-option label="等宽两列 (1:1)" value="1:1"></el-option>
            <el-option label="等宽三列 (1:1:1)" value="1:1:1"></el-option>
            <el-option label="三列 (1:2:1)" value="1:2:1"></el-option>
            <el-option label="两列 (1:2)" value="1:2"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </div>
      </div>
    </div>

    <div
      class="form-group"
      v-if="config.columnPreset === 'custom'"
      style="margin-top: 10px"
    >
      <div class="label-wrapper">
        <label>自定义:</label>
      </div>
      <div class="input-wrapper">
        <el-input
          v-model="config.customRatio"
          size="small"
          placeholder="例如: 1:2:1"
          @change="handleCustomRatioChange"
        ></el-input>
        <div class="form-tip">使用冒号分隔不同列的宽度比例</div>
      </div>
    </div>

    <div class="form-actions">
      <el-button size="small" @click="resetConfig">重置</el-button>
      <el-button type="primary" size="small" @click="addRows">添加行</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuickLayoutForm",
  props: {
    defaultConfig: {
      type: Object,
      default: () => ({
        rows: 1,
        columnPreset: "none",
        customRatio: "1:2:1",
        height: "",
        columnWidths: [],
      }),
    },
  },
  data() {
    return {
      config: {
        rows: 1,
        columnPreset: "none",
        customRatio: "1:2:1",
        height: "",
        columnWidths: [],
      },
    };
  },
  created() {
    // 初始化配置，合并默认值
    this.config = { ...this.defaultConfig };
    // 确保列宽度已经计算
    this.handlePresetChange(this.config.columnPreset);
  },
  methods: {
    resetConfig() {
      this.config = {
        rows: 1,
        columnPreset: "none",
        customRatio: "1:2:1",
        height: "",
        columnWidths: [],
      };
      this.$emit("update:config", this.config);
    },
    handlePresetChange(preset) {
      if (preset === "custom") {
        // 使用自定义比例
        this.calculateColumnWidths(this.config.customRatio);
      } else if (preset === "none") {
        // 不分列
        this.config.columnWidths = [];
      } else {
        // 使用预设比例
        this.calculateColumnWidths(preset);
      }
      this.$emit("update:config", this.config);
    },
    handleCustomRatioChange() {
      // 当自定义比例变化时重新计算宽度
      this.calculateColumnWidths(this.config.customRatio);
      this.$emit("update:config", this.config);
    },
    calculateColumnWidths(ratioString) {
      if (!ratioString || ratioString === "none") {
        this.config.columnWidths = [];
        return;
      }

      // 解析比例
      const ratios = ratioString.split(":").map((r) => parseInt(r.trim()) || 1);
      const total = ratios.reduce((sum, r) => sum + r, 0);
      const widths = [];

      // 计算百分比宽度
      let sum = 0;
      for (let i = 0; i < ratios.length - 1; i++) {
        const width = parseFloat(((ratios[i] / total) * 100).toFixed(2));
        widths.push(width);
        sum += width;
      }

      // 最后一列计算，避免小数误差
      widths.push(parseFloat((100 - sum).toFixed(2)));
      this.config.columnWidths = widths;
    },
    addRows() {
      // 触发添加行事件
      this.$emit("add-rows", { ...this.config });
    },
  },
};
</script>

<style lang="scss" scoped>
.quick-layout-form {
  padding: 0;

  .form-row {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 15px;
    gap: 20px;

    .form-group {
      flex: 1;
      min-width: 180px;
      max-width: calc(33.33% - 14px);

      @media (max-width: 768px) {
        min-width: 100%;
        max-width: 100%;
      }
    }

    @media (max-width: 600px) {
      flex-direction: column;
      gap: 15px;
    }
  }

  .form-group {
    display: flex;
    align-items: center;
    margin-bottom: 0;

    .label-wrapper {
      min-width: 55px;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-right: 10px;

      label {
        font-weight: 500;
        color: #606266;
        font-size: 13px;
        white-space: nowrap;
      }

      .el-icon-question {
        color: #909399;
        cursor: help;
        font-size: 14px;
        margin-right: 2px;

        &:hover {
          color: #409eff;
        }
      }
    }

    .input-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;

      .form-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }

      .el-input-number,
      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
  }
}
</style>
