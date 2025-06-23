<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElRadioGroup, ElRadioButton } from 'element-plus';
import BasicUsage from './examples/BasicUsage.vue';

// 当前选中的示例
const currentExample = ref('basic');

// 动态计算当前示例组件
const currentExampleComponent = computed(() => {
  switch(currentExample.value) {
    case 'basic':
      return BasicUsage;
    case 'multiSelect':
      // 注：暂未实现，将在未来实现
      return BasicUsage;
    case 'integration':
      // 注：暂未实现，将在未来实现
      return BasicUsage;
    default:
      return BasicUsage;
  }
});
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>部门树虚拟滚动组件</h1>
      <div class="app-nav">
        <el-radio-group v-model="currentExample" size="large">
          <el-radio-button label="basic">基本用法</el-radio-button>
          <el-radio-button label="multiSelect">多选示例</el-radio-button>
          <el-radio-button label="integration">集成示例</el-radio-button>
        </el-radio-group>
      </div>
    </header>
    
    <main class="app-content">
      <component :is="currentExampleComponent" />
    </main>
    
    <footer class="app-footer">
      <p>部门树虚拟滚动组件 - 基于Vue3和Element Plus</p>
    </footer>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #409eff;
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin-top: 0;
  margin-bottom: 20px;
}

.app-nav {
  margin-bottom: 10px;
}

.app-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

.app-footer {
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
  padding: 20px;
  text-align: center;
  color: #909399;
}
</style>
