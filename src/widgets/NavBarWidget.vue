<template>
  <div class="nav-bar-widget">
    <div class="nav-container">
      <!-- 左侧Logo区域 -->
      <div class="logo-area">
        <img src="../assets/logo.png" alt="Logo" class="logo-image" />
      </div>

      <!-- 中间导航菜单 -->
      <div class="menu-area">
        <div class="main-menu">
          <div
            v-for="(item, index) in mainMenuItems"
            :key="index"
            :class="[
              'menu-item',
              { active: item.active, 'dropdown-item': item.dropdown },
            ]"
            @click="handleMainMenuClick(item, $event)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <!-- 右侧搜索框 -->
      <div class="search-area">
        <el-input
          placeholder="请输入关键字搜索..."
          prefix-icon="el-icon-search"
          v-model="searchKeyword"
          @keyup.enter.native="handleSearch"
          @focus="showSearchDialog"
          readonly
          size="small"
          class="search-input"
        >
        </el-input>
      </div>
    </div>

    <!-- 分行下拉菜单 -->
    <transition name="dropdown">
      <div class="branch-dropdown" v-if="showBranchMenu">
        <div class="branch-dropdown-container">
          <div v-if="loading" class="branch-loading">
            <i class="el-icon-loading"></i> 正在加载分行数据...
          </div>
          <div v-else>
            <div class="branch-list">
              <div
                v-for="(branch, index) in branchList"
                :key="index"
                class="branch-item"
                @click="handleBranchClick(branch)"
              >
                {{ branch.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 搜索弹窗 -->
    <search-dialog :visible.sync="searchDialogVisible" />

    <!-- 配置对话框 -->
    <el-dialog
      title="导航栏组件配置"
      :visible.sync="configDialogVisible"
      width="400px"
      append-to-body
      @closed="handleDialogClosed"
    >
      <el-form :model="tempConfig" label-width="100px" size="small">
        <el-form-item label="显示搜索框">
          <el-switch v-model="tempConfig.showSearch"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from "../services/api";
import SearchDialog from "./SearchDialog.vue";

export default {
  name: "NavBarWidget",
  components: {
    SearchDialog,
  },
  props: {
    config: {
      type: Object,
      default: () => ({
        showSearch: true
      }),
    },
  },
  data() {
    return {
      // 添加requiresConfig属性，表示该组件需要配置
      requiresConfig: true,
      searchKeyword: "",
      showBranchMenu: false,
      branchList: [],
      loading: false,
      mainMenuItems: [
        {
          label: "集团门户",
          url: "https://www.example.com/group",
          target: "_blank",
          active: false,
        },
        { label: "总行门户", url: "/", target: "_self", active: true },
        { label: "分行门户", dropdown: true, active: false },
        {
          label: "广议",
          url: "https://www.example.com/guangyi",
          target: "_blank",
          active: false,
        },
        {
          label: "采购公告",
          url: "https://www.example.com/procurement",
          target: "_blank",
          active: false,
        },
      ],
      searchDialogVisible: false,
      configDialogVisible: false,
      tempConfig: {},
      configCallback: null,
    };
  },
  created() {
    // 预加载分行数据
    this.loadBranchData();

    // 添加点击外部关闭菜单
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeDestroy() {
    // 清理事件监听器
    document.removeEventListener("click", this.handleOutsideClick);
  },
  methods: {
    // 配置对话框方法
    showSettingDialog(callback) {
      this.configCallback = callback;
      this.configDialogVisible = true;
      this.tempConfig = JSON.parse(JSON.stringify(this.config));
    },

    handleDialogClosed() {
      this.configDialogVisible = false;
      this.configCallback = null;
    },

    saveConfig() {
      // 如果有回调函数，则调用它并传递新配置
      if (typeof this.configCallback === "function") {
        this.configCallback(this.tempConfig);
      }
      this.configDialogVisible = false;
    },

    handleMainMenuClick(item, event) {
      if (item.dropdown) {
        this.showBranchMenu = !this.showBranchMenu;
        // 阻止事件传播，避免点击后立即关闭菜单
        event.stopPropagation();
      } else if (item.url) {
        if (item.target === "_blank") {
          window.open(item.url, "_blank");
        } else {
          window.location.href = item.url;
        }
      }
    },
    handleBranchClick(branch) {
      // 跳转到分行页面或触发其他操作
      console.log("分行点击:", branch);
      this.showBranchMenu = false;
    },
    handleSearch() {
      this.showSearchDialog();
    },
    showSearchDialog() {
      this.searchDialogVisible = true;
    },
    handleOutsideClick(event) {
      // 如果点击的不是本组件内的元素，关闭下拉菜单
      if (this.showBranchMenu && !this.$el.contains(event.target)) {
        this.showBranchMenu = false;
      }
    },
    async loadBranchData() {
      // 预加载分行数据，但不显示
      this.loading = true;
      try {
        this.branchList = await api.getBranchList();
      } catch (error) {
        console.error("加载分行数据失败:", error);
        this.branchList = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-bar-widget {
  position: relative;
  min-height: 60px;
  border-bottom: none;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .logo-area {
    flex: 0 0 auto;
    margin-right: 20px;

    .logo-image {
      max-height: 40px;
      max-width: 80px;
    }
  }

  .menu-area {
    flex: 1;

    .main-menu {
      display: flex;
      align-items: center;

      .menu-item {
        padding: 0 20px;
        height: 60px;
        line-height: 60px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
        position: relative;

        &:hover {
          color: #c00;
        }

        &.active {
          background-color: #c00;
          color: #fff;

          &:hover {
            background-color: #a00;
          }
        }

        &.dropdown-item {
          position: relative;

          &:after {
            content: "";
            display: inline-block;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid currentColor;
            margin-left: 5px;
            transition: transform 0.2s;
          }
        }
      }
    }
  }

  .search-area {
    flex: 0 0 auto;
    width: 200px;
    margin-right: 10px;

    .search-input {
      width: 100%;

      ::v-deep .el-input__inner {
        height: 30px;
        line-height: 30px;
        border-radius: 15px;
        padding-left: 30px;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        font-size: 12px;
        color: #666;

        &::placeholder {
          color: #999;
        }

        &:focus {
          border-color: #c00;
        }
      }

      ::v-deep .el-input__prefix {
        left: 10px;
        line-height: 30px;
        color: #999;
      }
    }
  }

  .branch-dropdown {
    position: relative !important;
    width: 100%;
    background-color: #e6f2e6;
    border-top: 1px solid #d0e9d0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding-bottom: 20px;
    display: block;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;

    .branch-dropdown-container {
      padding: 15px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .branch-loading {
      padding: 20px;
      text-align: center;
      color: #999;

      i {
        margin-right: 5px;
      }
    }

    .branch-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      padding: 10px 0;

      .branch-item {
        width: 16.666%;
        padding: 8px 0;
        margin: 5px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: #fff;
        border-radius: 4px;
        box-sizing: border-box;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &:hover {
          color: #c00;
          font-weight: bold;
          background-color: #f5f5f5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }

  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: opacity 0.2s, transform 0.2s;
  }

  .dropdown-enter,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
