import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'outlined';
  hover?: boolean;
  className?: string;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hover = true,
  className,
  ...props
}) => {
  const baseClasses = 'rounded-3xl transition-all duration-300 relative overflow-hidden';
  
  const variantClasses = {
    default: 'bg-gray-900/50 border border-gray-800',
    glass: 'glass border border-white/5',
    gradient: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20',
    outlined: 'bg-transparent border-2 border-purple-500/30',
  };
  
  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-xl hover:border-purple-500/30' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4 } : {}}
      className={clsx(baseClasses, variantClasses[variant], hoverClasses, className)}
      {...props}
    >
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-50" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('px-6 py-5 border-b border-white/5', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={clsx('text-xl font-bold gradient-text', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('px-6 py-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('px-6 py-4 border-t border-white/5 bg-white/[0.02]', className)}
      {...props}
    >
      {children}
    </div>
  );
}; 