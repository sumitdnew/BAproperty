import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red';
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
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      border: 'border-green-200'
    },
    yellow: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    red: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      border: 'border-red-200'
    }
  };

  const currentColor = colorVariants[color];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${currentColor.border} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${currentColor.iconBg} ${currentColor.iconColor} p-3 rounded-full`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
