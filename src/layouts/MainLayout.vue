<template>
  <div class="main-layout">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <div class="logo">
            <h1>新闻门户系统</h1>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="nav-menu"
            mode="horizontal"
            router>
            <el-menu-item index="/layout">
              <i class="el-icon-s-grid"></i>
              布局编辑器
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  computed: {
    activeMenu() {
      return this.$route.path;
    }
  }
};
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  background-color: #f0f2f5;

  .el-container {
    height: 100%;
  }

  .el-header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0;
    z-index: 10;

    .header-content {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 24px;

      .logo {
        margin-right: 40px;

        h1 {
          margin: 0;
          font-size: 20px;
          color: #303133;
          font-weight: 500;
        }
      }

      .nav-menu {
        border-bottom: none;
        flex: 1;
      }
    }
  }

  .el-main {
    padding: 0;
    overflow: hidden;
  }
}
</style> 