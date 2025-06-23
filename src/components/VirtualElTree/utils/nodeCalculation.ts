import type { TreeNode, FlattenedNode, TreeNodeId } from '../types';

/**
 * 从扁平节点列表中获取指定节点
 */
export function getNodeById(
  nodes: FlattenedNode[],
  id: TreeNodeId
): FlattenedNode | undefined {
  return nodes.find(node => node.id === id);
}

/**
 * 获取节点所有父节点ID
 */
export function getNodeParentIds(
  nodes: FlattenedNode[],
  node: FlattenedNode
): TreeNodeId[] {
  const parentIds: TreeNodeId[] = [];
  let currentNode = node;
  
  while (currentNode.parentId) {
    parentIds.push(currentNode.parentId);
    const parent = nodes.find(n => n.id === currentNode.parentId);
    if (!parent) break;
    currentNode = parent;
  }
  
  return parentIds;
}

/**
 * 获取节点所有子节点ID
 */
export function getNodeChildrenIds(
  nodes: FlattenedNode[],
  node: FlattenedNode
): TreeNodeId[] {
  const childrenIds: TreeNodeId[] = [];
  
  function traverse(id: TreeNodeId) {
    const children = nodes.filter(n => n.parentId === id);
    
    children.forEach(child => {
      childrenIds.push(child.id);
      
      // 递归处理子节点的子节点
      if (!child.isLeaf) {
        traverse(child.id);
      }
    });
  }
  
  traverse(node.id);
  return childrenIds;
}

/**
 * 计算向上或向下折叠/展开操作影响的所有节点
 */
export function getAffectedNodes(
  nodes: FlattenedNode[],
  expandingNode: FlattenedNode,
  expanding: boolean
): Set<TreeNodeId> {
  const affectedIds = new Set<TreeNodeId>();
  
  if (expanding) {
    // 展开节点：只影响直接子节点
    nodes
      .filter(n => n.parentId === expandingNode.id)
      .forEach(n => affectedIds.add(n.id));
  } else {
    // 折叠节点：影响所有子孙节点
    getNodeChildrenIds(nodes, expandingNode).forEach(id => {
      affectedIds.add(id);
    });
  }
  
  return affectedIds;
}

/**
 * 计算节点的路径，用于处理选择状态
 */
export function generateNodePath(
  nodes: FlattenedNode[],
  node: FlattenedNode
): string {
  const parts: string[] = [node.id.toString()];
  let currentNode = node;
  
  // 向上遍历父节点
  while (currentNode.parentId) {
    parts.unshift(currentNode.parentId.toString());
    const parent = nodes.find(n => n.id === currentNode.parentId);
    if (!parent) break;
    currentNode = parent;
  }
  
  return parts.join('-');
} 