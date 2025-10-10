import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'rose' | 'orange';
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}) => {
  const colorVariants = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    red: {
      gradient: 'from-red-500 to-pink-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    rose: {
      gradient: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    orange: {
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  };

  const currentColor = colorVariants[color];

  return (
    <div className="stat-card group animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={`icon-container-gradient bg-gradient-to-br ${currentColor.gradient}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        {subtitle && (
          <span className="text-sm text-gray-500">{subtitle}</span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
