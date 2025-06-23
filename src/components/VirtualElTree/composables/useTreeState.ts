import { ref, reactive, watch } from 'vue';
import type { TreeNode, TreeNodeId, TreeState } from '../types';

/**
 * 树状态管理组合式函数
 * 负责管理展开/折叠、选中等状态
 */
export function useTreeState(props: any, emit: any) {
  // 节点状态映射
  const expandedKeysMap = reactive<Record<TreeNodeId, boolean>>({});
  const selectedKeysSet = reactive<Set<TreeNodeId>>(new Set());
  const checkedKeysSet = reactive<Set<TreeNodeId>>(new Set());
  const matchedKeysSet = reactive<Set<TreeNodeId>>(new Set());
  
  // 处理节点点击
  const handleNodeClick = (node: TreeNode) => {
    // 处理选择逻辑
    if (props.multiple) {
      // 多选逻辑
      if (selectedKeysSet.has(node.id)) {
        selectedKeysSet.delete(node.id);
      } else {
        selectedKeysSet.add(node.id);
      }
    } else {
      // 单选逻辑
      selectedKeysSet.clear();
      selectedKeysSet.add(node.id);
    }
    
    emit('select', Array.from(selectedKeysSet), node);
    emit('node-click', node);
  };
  
  // 处理节点展开/折叠
  const handleToggleExpand = (node: TreeNode, expanded: boolean) => {
    expandedKeysMap[node.id] = expanded;
    
    // 通知展开/折叠状态变化
    emit('expand', node, expanded);
    
    // TODO: 在实际业务中需要重新计算可见节点
  };
  
  // 处理节点复选框状态
  const handleNodeCheck = (node: TreeNode, checked: boolean) => {
    if (checked) {
      checkedKeysSet.add(node.id);
    } else {
      checkedKeysSet.delete(node.id);
    }
    
    emit('check', Array.from(checkedKeysSet), node, checked);
    
    // TODO: 在实际业务中需要处理父子节点关联选择
  };
  
  // 重置状态
  const resetState = () => {
    // 清空所有状态
    Object.keys(expandedKeysMap).forEach(key => {
      delete expandedKeysMap[key];
    });
    selectedKeysSet.clear();
    checkedKeysSet.clear();
    matchedKeysSet.clear();
  };
  
  // 监听数据变化，重置状态
  watch(
    () => props.treeData,
    () => {
      resetState();
    }
  );
  
  return {
    expandedKeysMap,
    selectedKeysSet,
    checkedKeysSet,
    matchedKeysSet,
    handleNodeClick,
    handleToggleExpand,
    handleNodeCheck,
    resetState
  };
} 