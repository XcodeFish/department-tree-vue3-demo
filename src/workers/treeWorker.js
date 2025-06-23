// Web Worker for tree operations
// 用于在独立线程中处理树数据计算，避免阻塞主线程UI渲染

/**
 * 扁平化树结构
 */
function flattenTree(nodes, parentId = null, level = 0, path = '') {
  let result = [];
  
  nodes.forEach((node, index) => {
    const currentPath = path ? `${path}-${node.id}` : `${node.id}`;
    const flatNode = {
      ...node,
      level,
      index: result.length,
      parentId: parentId,
      pathKey: currentPath,
      visible: true,
      isLeaf: node.isLeaf ?? (!node.children || node.children.length === 0)
    };
    
    result.push(flatNode);
    
    // 处理子节点
    if (node.children && node.children.length > 0) {
      const childrenNodes = flattenTree(node.children, node.id, level + 1, currentPath);
      result = result.concat(childrenNodes);
    }
  });
  
  return result;
}

/**
 * 创建树数据索引
 */
function createTreeIndexes(flattenedNodes) {
  const nodeMap = new Map();
  const idMap = new Map();
  
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
    flattened: flattenedNodes,
    nodeMap: Object.fromEntries(nodeMap),
    idMap: Object.fromEntries(Array.from(idMap.entries()).map(([key, value]) => [key, value]))
  };
}

/**
 * 计算可见节点
 */
function calculateVisibleNodes(flattenedNodes, expandedKeysMap, nodeHeight) {
  const visibleNodes = [];
  let totalHeight = 0;
  
  flattenedNodes.forEach(node => {
    // 判断节点是否可见 (需要所有父节点都是展开状态)
    let isNodeVisible = true;
    
    if (node.parentId) {
      // 如果有父节点，需要判断父节点是否展开
      let current = node;
      while (current.parentId) {
        const parentExpanded = expandedKeysMap[current.parentId];
        if (!parentExpanded) {
          isNodeVisible = false;
          break;
        }
        current = flattenedNodes.find(n => n.id === current.parentId);
        if (!current) break;
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
 * 计算显示范围内的节点
 */
function calculateVisibleRange(scrollTop, viewportHeight, nodeHeight, nodes, buffer = 5) {
  const startIndex = Math.max(0, Math.floor(scrollTop / nodeHeight) - buffer);
  const endIndex = Math.min(
    nodes.length - 1,
    Math.ceil((scrollTop + viewportHeight) / nodeHeight - 1) + buffer
  );
  
  const offsetY = startIndex * nodeHeight;
  const visibleNodes = nodes.slice(startIndex, endIndex + 1);
  
  return { visibleNodes, startIndex, endIndex, offsetY };
}

/**
 * 搜索过滤处理
 */
function filterTreeNodes(flattenedNodes, searchText) {
  const matchedIds = new Set();
  const matchedNodes = [];
  
  if (!searchText) {
    return { matchedNodes: [], matchedIds: [] };
  }
  
  // 转为小写进行不区分大小写的匹配
  const lowerSearchText = searchText.toLowerCase();
  
  flattenedNodes.forEach(node => {
    if (node.name.toLowerCase().includes(lowerSearchText)) {
      matchedIds.add(node.id);
      matchedNodes.push(node);
    }
  });
  
  return { 
    matchedNodes, 
    matchedIds: Array.from(matchedIds)
  };
}

// 消息处理
self.onmessage = function(event) {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'init': {
        // 初始化确认
        self.postMessage({ type: 'init', data: { initialized: true } });
        break;
      }
      
      case 'flatten': {
        // 扁平化处理树数据
        const { treeData } = payload;
        const flattenedNodes = flattenTree(treeData);
        const indexes = createTreeIndexes(flattenedNodes);
        self.postMessage({ 
          type: 'flatten', 
          data: indexes
        });
        break;
      }
      
      case 'calculate': {
        // 计算可见节点
        const { flattenedNodes, expandedKeysMap, nodeHeight } = payload;
        const result = calculateVisibleNodes(flattenedNodes, expandedKeysMap, nodeHeight);
        self.postMessage({ 
          type: 'calculate', 
          data: result
        });
        break;
      }
      
      case 'scroll': {
        // 滚动计算可见范围
        const { scrollTop, viewportHeight, nodeHeight, visibleNodes, bufferSize } = payload;
        const result = calculateVisibleRange(scrollTop, viewportHeight, nodeHeight, visibleNodes, bufferSize);
        self.postMessage({ 
          type: 'scroll', 
          data: result
        });
        break;
      }
      
      case 'search': {
        // 搜索过滤
        const { flattenedNodes, searchText } = payload;
        const result = filterTreeNodes(flattenedNodes, searchText);
        self.postMessage({ 
          type: 'search', 
          data: result
        });
        break;
      }
      
      default:
        console.warn('未知消息类型:', type);
        break;
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      data: { 
        error: error.message,
        originalType: type
      }
    });
  }
}; 