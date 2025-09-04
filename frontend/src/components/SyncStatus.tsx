import React from 'react';
import { useCloudStorage } from '../hooks/useCloudStorage';

export const SyncStatus: React.FC = () => {
  const { isSyncing, isOnline, formattedLastSync, syncError, syncAll } = useCloudStorage();

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-400">
            {isOnline ? 'Онлайн' : 'Офлайн'}
          </span>
        </div>
        
        <button
          onClick={syncAll}
          disabled={isSyncing || !isOnline}
          className={`p-2 rounded-lg transition-all ${
            isSyncing 
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 active:scale-95'
          }`}
          aria-label="Синхронизировать"
        >
          <svg
            className={`w-5 h-5 text-gray-400 ${isSyncing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {isSyncing ? 'Синхронизация...' : `Синхр.: ${formattedLastSync}`}
        </span>
        
        {syncError && (
          <span className="text-xs text-red-400">
            Ошибка синхронизации
          </span>
        )}
      </div>
    </div>
  );
};

interface CloudIndicatorProps {
  size?: 'sm' | 'md';
}

export const CloudIndicator: React.FC<CloudIndicatorProps> = ({ size = 'sm' }) => {
  const { isSyncing, isOnline } = useCloudStorage();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6'
  };

  if (!isOnline) {
    return (
      <svg
        className={`${sizeClasses[size]} text-gray-500`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  }

  return (
    <svg
      className={`${sizeClasses[size]} ${
        isSyncing ? 'text-indigo-400 animate-pulse' : 'text-green-500'
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
      {isOnline && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
          className={isSyncing ? 'opacity-0' : 'opacity-100'}
        />
      )}
    </svg>
  );
};