import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  variant = 'text',
  animation = 'pulse',
  className = '',
  style = {}
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: '50%',
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof width === 'number' ? `${width}px` : width
        };
      case 'rectangular':
        return {
          borderRadius: '0'
        };
      case 'rounded':
        return {
          borderRadius: '12px'
        };
      case 'text':
      default:
        return {
          borderRadius: '4px',
          transform: 'scale(1, 0.6)',
          transformOrigin: '0 60%'
        };
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'wave':
        return 'skeleton-wave';
      case 'pulse':
        return 'skeleton-pulse';
      default:
        return '';
    }
  };

  return (
    <div
      className={`skeleton ${getAnimationClass()} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
        backgroundSize: '200% 100%',
        ...getVariantStyles(),
        ...style
      }}
    />
  );
};

// Composite skeleton components
export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <Skeleton variant="circular" width={40} height={40} />
      <div style={{ marginLeft: '10px', flex: 1 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: '5px' }} />
        <Skeleton width="40%" height={14} />
      </div>
    </div>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        width={i === lines - 1 ? "80%" : "100%"} 
        height={14} 
        style={{ marginBottom: '8px' }}
      />
    ))}
  </div>
);

export const SkeletonStatCard: React.FC = () => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center'
  }}>
    <Skeleton variant="circular" width={30} height={30} style={{ margin: '0 auto 5px' }} />
    <Skeleton width="50%" height={20} style={{ margin: '0 auto 5px' }} />
    <Skeleton width="70%" height={12} style={{ margin: '0 auto' }} />
  </div>
);

export const SkeletonWorkoutCard: React.FC = () => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      <Skeleton variant="circular" width={50} height={50} />
      <div style={{ marginLeft: '15px', flex: 1 }}>
        <Skeleton width="70%" height={18} style={{ marginBottom: '5px' }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: '5px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton width={60} height={12} />
          <Skeleton width={80} height={12} />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonProgressChart: React.FC = () => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <Skeleton width={120} height={20} />
      <div style={{ display: 'flex', gap: '5px' }}>
        <Skeleton variant="rounded" width={60} height={28} />
        <Skeleton variant="rounded" width={60} height={28} />
        <Skeleton variant="rounded" width={60} height={28} />
      </div>
    </div>
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'space-between',
      height: '120px',
      gap: '8px'
    }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton 
          key={i}
          variant="rectangular"
          width="100%"
          height={`${Math.random() * 80 + 20}%`}
          style={{ flex: 1 }}
        />
      ))}
    </div>
  </div>
);

export default Skeleton;