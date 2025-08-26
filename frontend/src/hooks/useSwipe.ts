import { useState, useEffect, useRef, TouchEvent } from 'react';
import hapticService from '../services/hapticService';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScroll?: boolean;
  hapticFeedback?: boolean;
}

interface SwipeState {
  touchStart: { x: number; y: number } | null;
  touchEnd: { x: number; y: number } | null;
  swiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  distance: { x: number; y: number };
}

export const useSwipe = (config: SwipeConfig) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventScroll = true,
    hapticFeedback = true
  } = config;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    touchStart: null,
    touchEnd: null,
    swiping: false,
    direction: null,
    velocity: 0,
    distance: { x: 0, y: 0 }
  });

  const startTime = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    startTime.current = Date.now();
    
    setSwipeState({
      touchStart: { x: touch.clientX, y: touch.clientY },
      touchEnd: null,
      swiping: true,
      direction: null,
      velocity: 0,
      distance: { x: 0, y: 0 }
    });

    if (hapticFeedback) {
      hapticService.light();
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!swipeState.touchStart || !swipeState.swiping) return;

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;

    const diffX = currentX - swipeState.touchStart.x;
    const diffY = currentY - swipeState.touchStart.y;

    // Determine swipe direction
    let direction: 'left' | 'right' | 'up' | 'down' | null = null;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      direction = diffX > 0 ? 'right' : 'left';
    } else {
      direction = diffY > 0 ? 'down' : 'up';
    }

    setSwipeState(prev => ({
      ...prev,
      touchEnd: { x: currentX, y: currentY },
      direction,
      distance: { x: Math.abs(diffX), y: Math.abs(diffY) }
    }));

    // Visual feedback for swipe progress
    if (elementRef.current) {
      const translateX = Math.min(Math.max(diffX * 0.3, -50), 50);
      elementRef.current.style.transform = `translateX(${translateX}px)`;
      elementRef.current.style.opacity = `${1 - Math.abs(diffX) / 300}`;
    }
  };

  const onTouchEnd = () => {
    if (!swipeState.touchStart || !swipeState.touchEnd) {
      resetSwipe();
      return;
    }

    const diffX = swipeState.touchEnd.x - swipeState.touchStart.x;
    const diffY = swipeState.touchEnd.y - swipeState.touchStart.y;
    const timeTaken = Date.now() - startTime.current;
    const velocity = Math.sqrt(diffX * diffX + diffY * diffY) / timeTaken;

    // Check if swipe exceeds threshold
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    let swipeDetected = false;

    if (absX > threshold && absX > absY) {
      // Horizontal swipe
      if (diffX > 0 && onSwipeRight) {
        onSwipeRight();
        swipeDetected = true;
      } else if (diffX < 0 && onSwipeLeft) {
        onSwipeLeft();
        swipeDetected = true;
      }
    } else if (absY > threshold && absY > absX) {
      // Vertical swipe
      if (diffY > 0 && onSwipeDown) {
        onSwipeDown();
        swipeDetected = true;
      } else if (diffY < 0 && onSwipeUp) {
        onSwipeUp();
        swipeDetected = true;
      }
    }

    if (swipeDetected && hapticFeedback) {
      hapticService.swipe();
    }

    resetSwipe();
  };

  const resetSwipe = () => {
    setSwipeState({
      touchStart: null,
      touchEnd: null,
      swiping: false,
      direction: null,
      velocity: 0,
      distance: { x: 0, y: 0 }
    });

    // Reset visual feedback
    if (elementRef.current) {
      elementRef.current.style.transform = '';
      elementRef.current.style.opacity = '';
      elementRef.current.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.style.transition = '';
        }
      }, 300);
    }
  };

  const bind = (element: HTMLElement | null) => {
    elementRef.current = element;
    
    if (!element) return;

    element.addEventListener('touchstart', onTouchStart as any);
    element.addEventListener('touchmove', onTouchMove as any);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart as any);
      element.removeEventListener('touchmove', onTouchMove as any);
      element.removeEventListener('touchend', onTouchEnd);
    };
  };

  return {
    bind,
    swipeState,
    isSwipingLeft: swipeState.direction === 'left' && swipeState.swiping,
    isSwipingRight: swipeState.direction === 'right' && swipeState.swiping,
    isSwipingUp: swipeState.direction === 'up' && swipeState.swiping,
    isSwipingDown: swipeState.direction === 'down' && swipeState.swiping,
  };
};

export default useSwipe;