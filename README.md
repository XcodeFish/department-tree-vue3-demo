# 部门树虚拟滚动组件

基于Vue3和Element Plus的高性能部门树组件，通过虚拟滚动、Web Worker多线程和数据优化等技术，解决大规模部门人员树渲染的性能问题。

## 项目特点

- 高性能：支持10,000+节点的流畅渲染
- 虚拟滚动：只渲染可视区域节点，极大减少DOM节点数
- Web Worker：UI渲染与计算逻辑分离，提升主线程响应速度
- 性能监控：内置FPS、渲染节点数等指标实时监控
- 数据优化：高效的树状结构扁平化和索引机制
- Element Plus风格：与Element Plus组件库无缝集成

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 项目构建

```bash
npm run build
```

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── VirtualElTree/    # 虚拟树组件
│   └── TreePerformanceMonitor/  # 性能监控组件
├── workers/              # Web Worker
├── examples/             # 示例代码
└── utils/                # 工具函数
```

## 技术栈

- Vue 3.2+
- TypeScript
- Element Plus
- Web Worker
- Vite

## 性能指标

- 首次渲染时间：<500ms (8000节点)
- 滚动帧率：50-60FPS
- 内存占用：<50MB (8000节点)
- 节点展开响应时间：<100ms
- 搜索响应时间：<300ms

## 示例

项目包含3个示例：

1. **基本用法**：展示基础树形结构和交互
2. **多选示例**：展示复选框和多选功能
3. **集成示例**：与其他Element Plus组件的集成

## 浏览器兼容性

- 所有支持Web Worker的现代浏览器
- 针对不支持Worker的浏览器提供降级处理

## 协议

[MIT](LICENSE)
