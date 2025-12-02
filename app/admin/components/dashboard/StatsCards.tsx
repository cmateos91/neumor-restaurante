'use client';

import React from 'react';
import { Users, Mail, Star, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatData {
  id: string;
  label: string;
  value: number;
  change?: number; // porcentaje de cambio
  icon: 'leads' | 'emails' | 'reviews' | 'messages';
}

interface StatsCardsProps {
  stats: StatData[];
}

const iconMap = {
  leads: Users,
  emails: Mail,
  reviews: Star,
  messages: MessageCircle
};

const colorMap = {
  leads: 'text-blue-500 bg-blue-100',
  emails: 'text-green-500 bg-green-100',
  reviews: 'text-amber-500 bg-amber-100',
  messages: 'text-purple-500 bg-purple-100'
};

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon];
        const colorClass = colorMap[stat.icon];
        const isPositive = stat.change && stat.change > 0;
        const isNegative = stat.change && stat.change < 0;

        return (
          <div
            key={stat.id}
            className="neuro-card p-5 transition-all hover:scale-[1.02] duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {isPositive && <TrendingUp className="w-4 h-4" />}
                  {isNegative && <TrendingDown className="w-4 h-4" />}
                  <span>{isPositive ? '+' : ''}{stat.change}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700 mb-1">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
