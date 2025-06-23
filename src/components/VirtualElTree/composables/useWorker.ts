import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { TreeWorkerMessage, TreeWorkerResponse } from '../types';

/**
 * Web Worker管理组合式函数
 * 负责创建、通信和销毁Worker
 */
export function useWorker() {
  const workerRef = ref<Worker | null>(null);
  const workerReady = ref(false);
  
  // 初始化Worker
  const initWorker = () => {
    try {
      // 创建Worker
      const worker = new Worker(new URL('../../../workers/treeWorker.js', import.meta.url), {
        type: 'module'
      });
      
      // 设置消息监听
      worker.onmessage = (e: MessageEvent<TreeWorkerResponse>) => {
        const { type, data } = e.data;
        
        if (type === 'init') {
          workerReady.value = true;
          console.log('Worker已初始化');
        } else {
          handleWorkerMessage(type, data);
        }
      };
      
      // 设置错误监听
      worker.onerror = (error) => {
        console.error('Worker错误:', error);
      };
      
      workerRef.value = worker;
      
      // 发送初始化消息
      postWorkerMessage('init', { initialized: true });
      
    } catch (error) {
      console.error('初始化Worker失败:', error);
    }
  };
  
  // 发送消息到Worker
  const postWorkerMessage = (type: string, payload: any) => {
    if (workerRef.value) {
      workerRef.value.postMessage({ type, payload } as TreeWorkerMessage);
    } else {
      console.warn('Worker未初始化，无法发送消息');
    }
  };
  
  // 处理从Worker收到的消息
  const handleWorkerMessage = (type: string, data: any) => {
    // TODO: 根据消息类型处理数据
    console.log(`收到Worker消息: ${type}`, data);
  };
  
  // 销毁Worker
  const terminateWorker = () => {
    if (workerRef.value) {
      workerRef.value.terminate();
      workerRef.value = null;
      workerReady.value = false;
    }
  };
  
  // 生命周期钩子
  onMounted(() => {
    if (window.Worker) {
      initWorker();
    } else {
      console.warn('当前浏览器不支持Web Worker');
    }
  });
  
  onBeforeUnmount(() => {
    terminateWorker();
  });
  
  return {
    workerRef,
    workerReady,
    postWorkerMessage,
    terminateWorker
  };
} 