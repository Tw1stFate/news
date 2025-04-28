<template>
  <div id="app">
    <layout-editor />
  </div>
</template>

<script>
import LayoutEditor from './views/LayoutEditor.vue';

export default {
  name: 'App',
  components: {
    LayoutEditor
  }
};
</script>

<style>
/* 可以保留一些全局基础样式或删除 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
</style>