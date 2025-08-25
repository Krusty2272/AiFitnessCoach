import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ProgressItem {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface ProgressCardProps {
  items: ProgressItem[];
  title?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ 
  items, 
  title = "📈 Прогресс" 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => {
          const percentage = Math.min((item.current / item.target) * 100, 100);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{item.label}</span>
                <span className="text-gray-400">
                  {item.current} / {item.target} {item.unit}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}; 