import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CellColor } from '@/types/projection';
import { useState } from 'react';

interface EditableCellProps {
  value: number;
  color: CellColor;
  onEdit: (value: number) => void;
  isEdited: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  color,
  onEdit,
  isEdited
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  
  const colorClasses: Record<CellColor, string> = {
    red: 'bg-red-100 border-red-300 text-red-900',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    green: 'bg-green-100 border-green-300 text-green-900',
    black: 'bg-gray-900 text-white border-gray-700',
    blue: 'bg-blue-100 border-blue-300 text-blue-900',
    transparent: 'bg-background'
  };

  const handleSubmit = () => {
    const numValue = Number(tempValue);
    if (!isNaN(numValue)) {
      onEdit(numValue);
    }
    setIsEditing(false);
  };

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
    >
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
};

export { EditableCell };