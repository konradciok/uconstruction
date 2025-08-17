import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  itemCount: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  sampleInterval?: number;
}

export function usePerformanceMonitor(
  itemCount: number,
  options: UsePerformanceMonitorOptions = {}
) {
  const {
    enabled = false,
    onMetricsUpdate,
    sampleInterval = 1000
  } = options;

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartRef = useRef<number | null>(null);
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    fps: 0,
    itemCount: 0
  });

  const startRenderMeasure = useCallback(() => {
    if (!enabled) return;
    renderStartRef.current = performance.now();
  }, [enabled]);

  const endRenderMeasure = useCallback(() => {
    if (!enabled || renderStartRef.current === null) return;
    
    const renderTime = performance.now() - renderStartRef.current;
    metricsRef.current.renderTime = renderTime;
    renderStartRef.current = null;
  }, [enabled]);

  const measureFPS = useCallback(() => {
    if (!enabled) return;

    frameCountRef.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTimeRef.current >= sampleInterval) {
      const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
      metricsRef.current.fps = fps;
      metricsRef.current.itemCount = itemCount;
      
      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
        if (memory) {
          metricsRef.current.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        }
      }
      
      onMetricsUpdate?.(metricsRef.current);
      
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  }, [enabled, sampleInterval, itemCount, onMetricsUpdate]);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(measureFPS, 16); // ~60fps measurement

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, measureFPS]);

  return {
    startRenderMeasure,
    endRenderMeasure,
    getMetrics: () => metricsRef.current,
  };
}
