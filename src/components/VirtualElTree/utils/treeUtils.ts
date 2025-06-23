import type { TreeNode, FlattenedNode, TreeNodeId, TreeData } from '../types';

/**
 * 扁平化树结构
 * 将嵌套的树结构转为扁平数组，便于高效处理
 */
export function flattenTree(
  nodes: TreeNode[],
  parentId: TreeNodeId | null = null,
  level: number = 0,
  path: string = ''
): FlattenedNode[] {
  let result: FlattenedNode[] = [];
  
  nodes.forEach((node, index) => {
    const currentPath = path ? `${path}-${node.id}` : `${node.id}`;
    const flatNode: FlattenedNode = {
      ...node,
      level,
      index: result.length,
      parentId: parentId,
      pathKey: currentPath,
      visible: true,
      // 如果节点里没有设置isLeaf属性，通过是否有子节点判断
      isLeaf: node.isLeaf ?? (!node.children || node.children.length === 0)
    };
    
    result.push(flatNode);
    
    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      const childrenNodes = flattenTree(node.children as unknown as TreeNode[], node.id, level + 1, currentPath);
      result = result.concat(childrenNodes);
    }
  });
  
  return result;
}

/**
 * 创建树数据索引
 * 用于快速查找和更新节点
 */
export function createTreeIndexes(flattenedNodes: FlattenedNode[]): TreeData {
  const nodeMap = new Map<TreeNodeId, FlattenedNode>();
  const idMap = new Map<TreeNodeId, TreeNodeId[]>();
  
  // 构建节点Map
  flattenedNodes.forEach(node => {
    nodeMap.set(node.id, node);
    
    // 构建父子关系Map
    if (node.parentId) {
      const siblings = idMap.get(node.parentId) || [];
      siblings.push(node.id);
      idMap.set(node.parentId, siblings);
    }
  });
  
  return {
    raw: [],
    flattened: flattenedNodes,
    nodeMap,
    idMap
  };
}

/**
 * 过滤树中匹配的节点
 * 用于搜索功能
 */
export function filterTree(
  flattenedNodes: FlattenedNode[],
  searchText: string
): { matchedNodes: FlattenedNode[], matchedIds: Set<TreeNodeId> } {
  const matchedIds = new Set<TreeNodeId>();
  const matchedNodes: FlattenedNode[] = [];
  
  if (!searchText) {
    return { matchedNodes: [], matchedIds: new Set() };
  }
  
  // 转为小写进行不区分大小写的匹配
  const lowerSearchText = searchText.toLowerCase();
  
  flattenedNodes.forEach(node => {
    if (node.name.toLowerCase().includes(lowerSearchText)) {
      matchedIds.add(node.id);
      matchedNodes.push(node);
    }
  });
  
  return { matchedNodes, matchedIds };
}

/**
 * 根据可见状态重新计算节点位置和高度
 */
export function recalculateNodePositions(
  flattenedNodes: FlattenedNode[],
  expandedKeyMap: Record<TreeNodeId, boolean>,
  nodeHeight: number
): { visibleNodes: FlattenedNode[], totalHeight: number } {
  const visibleNodes: FlattenedNode[] = [];
  let totalHeight = 0;
  
  flattenedNodes.forEach(node => {
    // 判断节点是否可见 (需要所有父节点都是展开状态)
    let isNodeVisible = true;
    
    if (node.parentId) {
      // 如果有父节点，需要判断父节点是否展开
      let current = node;
      while (current.parentId) {
        const parentExpanded = expandedKeyMap[current.parentId];
        if (!parentExpanded) {
          isNodeVisible = false;
          break;
        }
        current = flattenedNodes.find(n => n.id === current.parentId) as FlattenedNode;
      }
    }
    
    if (isNodeVisible) {
      visibleNodes.push({ ...node, visible: true });
      totalHeight += nodeHeight;
    }
  });
  
  return { visibleNodes, totalHeight };
}

/**
 * 计算滚动视窗内需要显示的节点
 */
export function calculateVisibleRange(
  scrollTop: number,
  viewportHeight: number,
  nodeHeight: number,
  nodes: FlattenedNode[],
  bufferSize: number = 5
): { visibleNodes: FlattenedNode[], startIndex: number, endIndex: number, offsetY: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / nodeHeight) - bufferSize);
  const endIndex = Math.min(
    nodes.length - 1,
    Math.ceil((scrollTop + viewportHeight) / nodeHeight - 1) + bufferSize
  );
  
  const offsetY = startIndex * nodeHeight;
  const visibleNodes = nodes.slice(startIndex, endIndex + 1);
  
  return { visibleNodes, startIndex, endIndex, offsetY };
} 