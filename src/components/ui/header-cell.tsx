import { cn } from '@/lib/utils';
import { Column } from '@tanstack/react-table';
import { format } from 'date-fns';
import { memo } from 'react';

interface HeaderCellMeta {
  onColumnSelect: (date: string) => void;
  selectedColumn: string;
}

interface HeaderCellProps {
  date: string;
  selectedColumn: string | null;
  onColumnSelect?: (date: string) => void;
}

const HeaderCell: React.FC<HeaderCellProps> = ({ date, selectedColumn, onColumnSelect }) => {

  const handleClick = () => {
    if (onColumnSelect) {
      onColumnSelect(date); // Usamos column.id para la función de selección
    }
  };
  return (
    <div
      className={cn(
        "text-center cursor-pointer transition-colors px-2 py-1 rounded",
        selectedColumn === date ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
      onClick={handleClick} // Usa la función estable
    >
      {format(new Date(date), 'dd/MM')}
    </div>
  );
};

export default memo(HeaderCell);