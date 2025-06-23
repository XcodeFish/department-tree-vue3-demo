<template>
  <div class="tree-performance-monitor" :class="{ 'is-expanded': expanded }">
    <div class="tree-performance-monitor__header" @click="toggleExpand">
      <span class="tree-performance-monitor__title">性能监控</span>
      <el-icon class="tree-performance-monitor__toggle">
        <arrow-up v-if="expanded" />
        <arrow-down v-else />
      </el-icon>
    </div>
    <div v-if="expanded" class="tree-performance-monitor__content">
      <div class="tree-performance-monitor__metrics">
        <div class="tree-performance-monitor__metric">
          <span class="tree-performance-monitor__label">FPS</span>
          <span class="tree-performance-monitor__value" :class="fpsClass">{{ fps }}</span>
        </div>
        <div class="tree-performance-monitor__metric">
          <span class="tree-performance-monitor__label">渲染节点</span>
          <span class="tree-performance-monitor__value">{{ renderCount }}</span>
        </div>
        <div class="tree-performance-monitor__metric">
          <span class="tree-performance-monitor__label">总节点</span>
          <span class="tree-performance-monitor__value">{{ totalCount }}</span>
        </div>
        <div class="tree-performance-monitor__metric">
          <span class="tree-performance-monitor__label">渲染耗时</span>
          <span class="tree-performance-monitor__value">{{ renderTime }}ms</span>
        </div>
      </div>
      <div class="tree-performance-monitor__chart">
        <canvas ref="fpsCanvas" width="280" height="80"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

// Props
const props = defineProps({
  renderCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  renderTime: {
    type: Number,
    default: 0
  }
});

// 状态
const fps = ref(0);
const fpsValues = ref<number[]>([]);
const expanded = ref(false);
const fpsCanvas = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number | null = null;
let lastFrameTime = performance.now();
let frameCount = 0;
let fpsUpdateInterval: number | null = null;

// 计算FPS状态类
const fpsClass = computed(() => {
  if (fps.value >= 50) return 'is-good';
  if (fps.value >= 30) return 'is-medium';
  return 'is-poor';
});

// 切换展开状态
const toggleExpand = () => {
  expanded.value = !expanded.value;
};

// 计算FPS
const calculateFPS = () => {
  const now = performance.now();
  const elapsed = now - lastFrameTime;
  
  frameCount++;
  
  // 每秒更新一次FPS
  if (elapsed >= 1000) {
    fps.value = Math.round((frameCount * 1000) / elapsed);
    
    // 记录FPS值用于绘制图表
    fpsValues.value.push(fps.value);
    if (fpsValues.value.length > 30) {
      fpsValues.value.shift();
    }
    
    // 重置计数器
    frameCount = 0;
    lastFrameTime = now;
    
    // 绘制FPS图表
    drawFPSChart();
  }
  
  // 请求下一帧
  animationFrameId = requestAnimationFrame(calculateFPS);
};

// 绘制FPS图表
const drawFPSChart = () => {
  if (!fpsCanvas.value) return;
  
  const ctx = fpsCanvas.value.getContext('2d');
  if (!ctx) return;
  
  const width = fpsCanvas.value.width;
  const height = fpsCanvas.value.height;
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  // 绘制背景
  ctx.fillStyle = '#f5f7fa';
  ctx.fillRect(0, 0, width, height);
  
  // 没有数据则返回
  if (fpsValues.value.length === 0) return;
  
  // 找到最大值和最小值
  const maxFPS = Math.max(...fpsValues.value, 60);
  const minFPS = Math.min(...fpsValues.value, 0);
  
  // 绘制FPS曲线
  ctx.beginPath();
  ctx.moveTo(0, height - (fpsValues.value[0] / maxFPS * height));
  
  for (let i = 1; i < fpsValues.value.length; i++) {
    const x = (i / (fpsValues.value.length - 1)) * width;
    const y = height - (fpsValues.value[i] / maxFPS * height);
    ctx.lineTo(x, y);
  }
  
  ctx.strokeStyle = '#409eff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 填充曲线下方区域
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = 'rgba(64, 158, 255, 0.1)';
  ctx.fill();
  
  // 绘制60FPS参考线
  const y60fps = height - (60 / maxFPS * height);
  ctx.beginPath();
  ctx.moveTo(0, y60fps);
  ctx.lineTo(width, y60fps);
  ctx.strokeStyle = '#67c23a';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 2]);
  ctx.stroke();
  ctx.setLineDash([]);
};

// 生命周期钩子
onMounted(() => {
  // 开始计算FPS
  animationFrameId = requestAnimationFrame(calculateFPS);
  
  // 定期绘制FPS图表
  fpsUpdateInterval = window.setInterval(() => {
    drawFPSChart();
  }, 1000);
});

onBeforeUnmount(() => {
  // 清理资源
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  
  if (fpsUpdateInterval !== null) {
    clearInterval(fpsUpdateInterval);
  }
});

// 监听展开状态变化，重新绘制图表
watch(expanded, (newValue) => {
  if (newValue) {
    // 延迟一帧，确保DOM已更新
    setTimeout(() => {
      drawFPSChart();
    }, 0);
  }
});
</script>

<style lang="scss">
.tree-performance-monitor {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 300px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  font-size: 14px;
  transition: all 0.3s;
  max-height: 40px;
  overflow: hidden;
  
  &.is-expanded {
    max-height: 280px;
  }
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #ebeef5;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
  
  &__title {
    font-weight: 500;
  }
  
  &__toggle {
    font-size: 12px;
  }
  
  &__content {
    padding: 10px 15px;
  }
  
  &__metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 10px;
  }
  
  &__metric {
    display: flex;
    flex-direction: column;
  }
  
  &__label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }
  
  &__value {
    font-size: 16px;
    font-weight: 500;
    
    &.is-good {
      color: #67c23a;
    }
    
    &.is-medium {
      color: #e6a23c;
    }
    
    &.is-poor {
      color: #f56c6c;
    }
  }
  
  &__chart {
    background-color: #f5f7fa;
    border-radius: 4px;
    overflow: hidden;
  }
}
</style> 