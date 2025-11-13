
import React from 'react';
import type { LegendItem } from '../types';

interface LegendProps {
  legendData: LegendItem[];
}

export const Legend: React.FC<LegendProps> = ({ legendData }) => {
  const half = Math.ceil(legendData.length / 2);
  const firstHalf = legendData.slice(0, half);
  const secondHalf = legendData.slice(half);

  const renderLegendColumn = (items: LegendItem[]) => (
    <div className="space-y-3">
      {items.map(({ code, description, color }) => (
        <div key={code} className="flex items-center">
          <span className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold mr-3 ${color}`}>
            {code}
          </span>
          <span className="text-sm text-gray-700">{description}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">Leyenda</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {renderLegendColumn(firstHalf)}
        {renderLegendColumn(secondHalf)}
      </div>
    </div>
  );
};
