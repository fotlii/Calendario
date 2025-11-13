
import React from 'react';
import type { LegendItem } from '../types';

interface LegendProps {
  legendData: LegendItem[];
}

export const Legend: React.FC<LegendProps> = ({ legendData }) => {

  const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, code: string) => {
    e.dataTransfer.setData('text/plain', code);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
        {legendData.map(({ code, description, color }) => (
            <div key={code} className="flex items-center">
            <span 
                draggable
                onDragStart={(e) => handleDragStart(e, code)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-black mr-3 cursor-move ${color}`}
            >
                {code}
            </span>
            <span className="text-sm text-gray-700">{description}</span>
            </div>
        ))}
      </div>
    </div>
  );
};