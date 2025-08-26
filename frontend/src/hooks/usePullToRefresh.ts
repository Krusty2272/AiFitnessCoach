import { useState, useEffect, useRef, TouchEvent } from 'react';
import hapticService from '../services/hapticService';

interface PullToRefreshConfig {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
  hapticFeedback?: boolean;
}

interface PullState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
}

export const usePullToRefresh = (config: PullToRefreshConfig) => {
  const {
    onRefresh,
    threshold = 80,
    maxPull = 150,
    hapticFeedback = true
  } = config;

  const [pullState, setPullState] = useState<PullState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false
  });

  const startY = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);
  const hasTriggeredHaptic = useRef<boolean>(false);

  const onTouchStart = (e: TouchEvent) => {
    if (elementRef.current && elementRef.current.scrollTop === 0) {
      const touch = e.touches[0];
      startY.current = touch.clientY;
      setPullState(prev => ({ ...prev, isPulling: true }));
      hasTriggeredHaptic.current = false;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!pullState.isPulling || pullState.isRefreshing) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && elementRef.current?.scrollTop === 0) {
      e.preventDefault();
      
      // Calculate pull distance with resistance
      const resistance = 0.5;
      const pullDistance = Math.min(diff * resistance, maxPull);
      const canRefresh = pullDistance >= threshold;

      // Haptic feedback when crossing threshold
      if (hapticFeedback && canRefresh && !hasTriggeredHaptic.current) {
        hapticService.medium();
        hasTriggeredHaptic.current = true;
      } else if (hapticFeedback && !canRefresh && hasTriggeredHaptic.current) {
        hapticService.light();
        hasTriggeredHaptic.current = false;
      }

      setPullState(prev => ({
        ...prev,
        pullDistance,
        canRefresh
      }));
    }
  };

  const onTouchEnd = async () => {
    if (!pullState.isPulling) return;

    if (pullState.canRefresh && !pullState.isRefreshing) {
      // Start refreshing
      setPullState(prev => ({
        ...prev,
        isRefreshing: true,
        pullDistance: 60 // Keep indicator visible during refresh
      }));

      if (hapticFeedback) {
        hapticService.success();
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }

      // Reset after refresh
      setTimeout(() => {
        setPullState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
          canRefresh: false
        });
      }, 300);
    } else {
      // Reset without refresh
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        canRefresh: false
      });
    }
  };

  const bind = (element: HTMLElement | null) => {
    elementRef.current = element;
    
    if (!element) return;

    element.addEventListener('touchstart', onTouchStart as any);
    element.addEventListener('touchmove', onTouchMove as any, { passive: false });
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart as any);
      element.removeEventListener('touchmove', onTouchMove as any);
      element.removeEventListener('touchend', onTouchEnd);
    };
  };

  return {
    bind,
    pullState,
    threshold
  };
};

export default usePullToRefresh;