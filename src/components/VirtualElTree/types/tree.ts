export type TreeNodeId = string | number;

export interface TreeNode {
  id: TreeNodeId;
  name: string;
  parentId?: TreeNodeId;
  level: number;
  expanded: boolean;
  children?: TreeNodeId[];
  isLeaf: boolean;
  pathKey: string;
  type?: 'department' | 'user';
}

export interface FlattenedNode extends TreeNode {
  index: number;
  visible: boolean;
  matched?: boolean;
}

export interface TreeState {
  expandedKeys: Set<TreeNodeId>;
  selectedKeys: Set<TreeNodeId>;
  checkedKeys: Set<TreeNodeId>;
  matchedKeys: Set<TreeNodeId>;
}

export interface ComputedState {
  visibleNodes: FlattenedNode[];
  totalHeight: number;
  offsetY: number;
}

export interface TreeOptions {
  nodeHeight: number;
  height: number;
  multiple: boolean;
  performanceMode: boolean;
  buffer?: number;
}

export interface TreeData {
  raw: TreeNode[];
  flattened: FlattenedNode[];
  nodeMap: Map<TreeNodeId, FlattenedNode>;
  idMap: Map<TreeNodeId, TreeNodeId[]>;
}

export type TreeWorkerMessage = {
  type: 'init' | 'update' | 'search' | 'expand' | 'scroll';
  payload: any;
}

export type TreeWorkerResponse = {
  type: 'init' | 'update' | 'search' | 'expand' | 'scroll';
  data: any;
} 