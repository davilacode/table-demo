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
          const cellsLength = Object.keys(row.cells).length;
          const newCells: { [key: string]: typeof row.cells[string] } = {};

          const cellKeys = Object.keys(row.cells);
          const editedIndex = cellKeys.findIndex(key => key === columnId);
          
          const cell = row.cells[columnId];
          const diffMakeToOrder = value - cell.value;
          const newNetFlow = cell.netFlow + diffMakeToOrder;

          for (let i = 0; i < cellsLength; i++) {
            const key = Object.keys(row.cells)[i];          
            const currentCell = row.cells[key];
          
            if (key === columnId) {
              console.log("celda",cell);

              const newColor = calculateCellColor(
                newNetFlow,
                value,
                currentCell.zones.red,
                currentCell.zones.yellow,
                currentCell.zones.green
              );

              newCells[columnId] = {
                ...currentCell,
                netFlow: newNetFlow,
                value,
                color: newColor,
                isEdited: true
              };

              console.log("newCells",newCells[columnId]);
            }else if(i > editedIndex){

              const newColor = calculateCellColor(
                newNetFlow,
                currentCell.value,
                currentCell.zones.red,
                currentCell.zones.yellow,
                currentCell.zones.green
              );

              newCells[key] = {
                ...currentCell,
                netFlow: currentCell.netFlow + diffMakeToOrder,
                color: newColor,
              };
            } else {
              newCells[key] = currentCell;
            }

           
          }
          
          return {
            ...row,
            cells: newCells
          };
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