import { calculateCellColor, processDataForTable } from '@/lib/utils';
import { calculateSummaryForColumn } from '@/lib/utils';
import { ProcessedTableRow, ProductProjection } from '@/types/projection';
import { useState, useMemo, useCallback } from 'react';

export const useProjectionData = (initialData: ProductProjection[]) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  
  // Procesar los datos iniciales para la tabla
  const [formatData, setFormatData] = useState<ProcessedTableRow[]>(() =>
    processDataForTable(initialData)
  );

  // Extraer las fechas únicas y ordenarlas
 const dates = useMemo(() => {
    return [...new Set(initialData.map(item => item.VisibleForecastedDate))].sort();
  }, [initialData]);

  // Función para editar una celda
  const editCell = useCallback((rowIndex: string, columnId: string, value: number) => {

    const [reference] = rowIndex.split('-');
    
    setFormatData(prevData => {
      return prevData.map(row => {
        if (row.reference === reference) {
          const cell = row.cells[columnId];
          if (cell) {
            const newColor = calculateCellColor(
              cell.netFlow,
              value,
              cell.zones.red,
              cell.zones.yellow,
              cell.zones.green
            );
            return {
              ...row,
              cells: {
                ...row.cells,
                [columnId]: {
                  ...cell,
                  value,
                  color: newColor,
                  isEdited: true
                }
              }
            };
          }
        }
        return row;
      });
    });
  
  }, []);

  const selectColumn = useCallback((columnId: string) => {
    setSelectedColumn(columnId);
  }, []);

  // Datos de resumen calculados
  const summaryData = useMemo(() => {
    if (!selectedColumn) return null;
    return calculateSummaryForColumn(formatData, selectedColumn);
  }, [formatData, selectedColumn]);

  return {
    data: formatData,
    selectedColumn,
    dates,
    summaryData,
    actions: {
      editCell,
      selectColumn
    }
  };
};