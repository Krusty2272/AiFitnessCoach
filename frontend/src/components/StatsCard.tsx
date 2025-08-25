import React from 'react';
import { Card, CardContent } from './ui/Card';

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface StatsCardProps {
  stats: StatItem[];
  title?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, title = "📊 Статистика" }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-4 text-center"
            >
              <div className={`text-2xl mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 