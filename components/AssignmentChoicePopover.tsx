
import React, { useEffect, useRef } from 'react';

interface AssignmentChoicePopoverProps {
  top: number;
  left: number;
  onAssignDay: () => void;
  onAssignWeek: () => void;
  onClose: () => void;
}

export const AssignmentChoicePopover: React.FC<AssignmentChoicePopoverProps> = ({
  top,
  left,
  onAssignDay,
  onAssignWeek,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2 space-y-2"
      style={{ top, left }}
    >
      <button
        onClick={onAssignDay}
        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white rounded-md transition-colors"
      >
        Solo este día
      </button>
      <button
        onClick={onAssignWeek}
        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white rounded-md transition-colors"
      >
        Toda la semana
      </button>
    </div>
  );
};