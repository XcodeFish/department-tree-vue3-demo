<template>
  <div
    class="virtual-tree-node"
    :class="{
      'virtual-tree-node--selected': selected,
      'virtual-tree-node--matched': matched
    }"
    :style="{ paddingLeft: `${level * 16 + 8}px` }"
    @click="handleClick"
  >
    <span
      v-if="!isLeaf"
      class="virtual-tree-node__expand-icon"
      :class="{ 'is-expanded': expanded }"
      @click.stop="handleToggleClick"
    >
      <el-icon>
        <arrow-right />
      </el-icon>
    </span>
    <span v-else class="virtual-tree-node__placeholder"></span>
    
    <span class="virtual-tree-node__icon">
      <el-icon v-if="node.type === 'department'">
        <folder />
      </el-icon>
      <el-icon v-else-if="node.type === 'user'">
        <user />
      </el-icon>
    </span>
    
    <span class="virtual-tree-node__label">{{ node.name }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight, Folder, User } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

// 节点类型定义
interface TreeNode {
  id: string | number;
  name: string;
  level: number;
  isLeaf: boolean;
  type?: 'department' | 'user';
  [key: string]: any;
}

// Props
const props = defineProps({
  node: {
    type: Object as () => TreeNode,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  isLeaf: {
    type: Boolean,
    default: false,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  matched: {
    type: Boolean,
    default: false,
  },
});

// 事件
const emit = defineEmits(['node-click', 'toggle-expand']);

// 处理节点点击
const handleClick = () => {
  emit('node-click', props.node);
};

// 处理展开/折叠点击
const handleToggleClick = () => {
  emit('toggle-expand', props.node, !props.expanded);
};
</script>

<style lang="scss">
.virtual-tree-node {
  display: flex;
  align-items: center;
  height: 40px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box;
  contain: layout style paint; // 优化渲染性能
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &--selected {
    background-color: #ecf5ff;
    color: var(--el-color-primary);
  }
  
  &--matched {
    color: var(--el-color-danger);
    font-weight: bold;
  }
  
  &__expand-icon {
    margin-right: 4px;
    display: inline-flex;
    transform: rotate(0deg);
    transition: transform 0.3s ease;
    
    &.is-expanded {
      transform: rotate(90deg);
    }
  }
  
  &__placeholder {
    width: 24px;
    display: inline-block;
  }
  
  &__icon {
    margin-right: 6px;
  }
  
  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style> 