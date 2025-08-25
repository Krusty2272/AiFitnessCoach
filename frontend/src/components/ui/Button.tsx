import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95',
    secondary: 'glass text-white border border-white/10 hover:border-white/20 hover:bg-white/5',
    outline: 'border-2 border-purple-500/50 bg-transparent text-purple-400 hover:bg-purple-500/10 hover:border-purple-500',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/5 hover:text-white',
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 active:scale-95',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25',
    error: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg hover:shadow-rose-500/25',
  };
  
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Gradient overlay effect */}
      {(variant === 'gradient' || variant === 'primary') && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mr-2"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
      )}
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}; 