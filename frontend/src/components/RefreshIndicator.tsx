import React from 'react';

interface RefreshIndicatorProps {
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
  canRefresh: boolean;
  threshold: number;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  pullDistance,
  isPulling,
  isRefreshing,
  canRefresh,
  threshold
}) => {
  if (pullDistance === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${pullDistance}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: isPulling ? 'none' : 'height 0.3s ease-out'
      }}
    >
      <div
        style={{
          transform: `translateY(${pullDistance - 40}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {isRefreshing ? (
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(102, 126, 234, 0.3)',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        ) : (
          <div
            style={{
              fontSize: '20px',
              opacity: canRefresh ? 1 : 0.5,
              transform: canRefresh 
                ? 'rotate(180deg) scale(1.2)' 
                : `rotate(${(pullDistance / threshold) * 180}deg) scale(1)`,
              transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
            }}
          >
            ↓
          </div>
        )}
      </div>
    </div>
  );
};