<template>
  <div class="basic-example">
    <h2>基本用法示例</h2>
    <div class="example-container">
      <VirtualElTree
        :tree-data="treeData"
        :height="600"
        :node-height="40"
        :show-search="true"
        @node-click="handleNodeClick"
        @expand="handleExpand"
      />
      <div class="selected-info" v-if="selectedNode">
        <h3>已选节点</h3>
        <pre>{{ selectedNodeInfo }}</pre>
      </div>
    </div>
    
    <TreePerformanceMonitor
      :render-count="renderCount"
      :total-count="totalCount"
      :render-time="renderTime"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VirtualElTree from '../components/VirtualElTree/index.vue';
import TreePerformanceMonitor from '../components/TreePerformanceMonitor/index.vue';

// 生成模拟数据
const generateTreeData = (depth = 3, breadth = 4, nodePrefix = 'node', startId = 1) => {
  const nodes = [];
  let id = startId;
  
  const generateLevel = (level, parentId = null, levelPrefix = '') => {
    if (level > depth) return [];
    
    const result = [];
    
    for (let i = 0; i < breadth; i++) {
      const nodeName = `${levelPrefix}${nodePrefix}-${level}-${i + 1}`;
      const isLeaf = level === depth;
      const node = {
        id: id++,
        name: nodeName,
        level,
        isLeaf,
        expanded: level < 2,
        type: isLeaf ? 'user' : 'department',
        pathKey: parentId ? `${parentId}-${id - 1}` : `${id - 1}`
      };
      
      if (!isLeaf) {
        node.children = generateLevel(level + 1, node.id, `${nodeName}-`);
      }
      
      result.push(node);
    }
    
    return result;
  };
  
  return generateLevel(1);
};

// 状态
const treeData = ref([]);
const selectedNode = ref(null);
const renderCount = ref(0);
const totalCount = ref(0);
const renderTime = ref(0);

// 计算属性
const selectedNodeInfo = computed(() => {
  return selectedNode.value ? JSON.stringify(selectedNode.value, null, 2) : '';
});

// 处理节点点击
const handleNodeClick = (node) => {
  selectedNode.value = node;
};

// 处理展开/折叠
const handleExpand = (node, expanded) => {
  console.log('展开/折叠:', node.name, expanded);
};

// 生命周期钩子
onMounted(() => {
  // 生成模拟数据 (3层深度，每层4个节点)
  treeData.value = generateTreeData(3, 4);
  
  // 计算总节点数
  const countNodes = (nodes) => {
    let count = 0;
    const traverse = (items) => {
      count += items.length;
      items.forEach(item => {
        if (item.children && item.children.length) {
          traverse(item.children);
        }
      });
    };
    traverse(nodes);
    return count;
  };
  
  totalCount.value = countNodes(treeData.value);
  renderCount.value = Math.min(30, totalCount.value); // 假设初始渲染30个节点
  
  // 测量渲染性能
  const start = performance.now();
  setTimeout(() => {
    renderTime.value = Math.round(performance.now() - start);
  }, 100);
});
</script>

<style lang="scss">
.basic-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  h2 {
    margin-bottom: 20px;
    font-weight: 500;
  }
  
  .example-container {
    display: flex;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .selected-info {
    flex: 0 0 300px;
    padding: 20px;
    border-left: 1px solid #ebeef5;
    background-color: #f9f9f9;
    overflow: auto;
    
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 500;
    }
    
    pre {
      font-family: monospace;
      white-space: pre-wrap;
      font-size: 12px;
      background-color: #f5f7fa;
      padding: 10px;
      border-radius: 4px;
      max-height: 500px;
      overflow: auto;
    }
  }
}
</style> 