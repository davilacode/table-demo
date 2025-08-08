import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CellColor } from '@/types/projection';
import React, { useState, useEffect, memo, useCallback } from 'react';

interface EditableCellProps {
  value: number;
  color: CellColor;
  onEdit: (reference: string, visibleForecastedDate: string, value: number) => void;
  reference: string;
  visibleForecastedDate: string;
  isEdited: boolean;
  dataTestId?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  color,
  onEdit,
  reference,
  visibleForecastedDate,
  isEdited,
  dataTestId,
}) => {
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);
  
  const colorClasses: Record<CellColor, string> = {
    red: 'bg-red-100 border-red-300 text-red-900',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    green: 'bg-green-100 border-green-300 text-green-900',
    black: 'bg-gray-900 text-white border-gray-700',
    blue: 'bg-blue-100 border-blue-300 text-blue-900',
    transparent: 'bg-background'
  };

  const handleSubmit = useCallback(() => {
    const numericValue = parseFloat(tempValue.toString());
    if (!isNaN(numericValue) && numericValue !== value) {
      onEdit(reference, visibleForecastedDate, numericValue);
    }
    setIsEditing(false);
  }, [tempValue, reference, visibleForecastedDate, onEdit]);

  if (isEditing) {
    return (
    <Input
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setTempValue(value.toString());
            setIsEditing(false);
          }
        }}
  className={cn(
          "h-8 text-center border-2",
          colorClasses[color]
        )}
        autoFocus
  inputMode="numeric"
  aria-label="cell-editor"
  aria-description={`Editar valor ${value} para la fecha ${visibleForecastedDate} y referencia ${reference}`}
      />
    );
  }

  return (
    <div
      className={cn(
        "h-8 flex items-center justify-center cursor-pointer rounded transition-colors border-2",
        colorClasses[color],
        "hover:opacity-80",
        isEdited && "ring-2 ring-blue-500 ring-opacity-50"
      )}
      onClick={() => setIsEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Celda editable, valor ${value}, fecha ${visibleForecastedDate}, referencia ${reference}. Presiona Enter para editar.`}
  data-testid={dataTestId}
    >
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
};

export default memo(EditableCell);