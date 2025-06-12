import { processInitialData, updateSingleCell } from '@/lib/color-calculator';
import { CellId, ProductProjection } from '@/types/projection';
import { useState, useMemo, useCallback } from 'react';

export const useProjectionData = (initialData: ProductProjection[]) => {
  const [data] = useState(initialData);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Map<CellId, number>>(new Map());

  const { rows: processedTableData, cellDataMap } = useMemo(() => {
    return processInitialData(data, editedValues);
  }, [data, editedValues]);

  const dates = useMemo(() => {
    return [...new Set(data.map(item => item.VisibleForecastedDate))].sort();
  }, [data]);

  const editCell = useCallback((cellId: CellId, value: number) => {
    setEditedValues(prev => {
      const newMap = new Map(prev);
      newMap.set(cellId, value);
      return newMap;
    });
  }, []);

  const updateCellDirect = useCallback((cellId: CellId, value: number) => {
    setEditedValues(prev => {
      const newMap = new Map(prev);
      newMap.set(cellId, value);
      return newMap;
    });
  }, [cellDataMap]);

  const selectColumn = useCallback((columnId: string) => {
    setSelectedColumn(columnId);
  }, []);

  return {
    data: processedTableData,
    cellDataMap, // expón el mapa si lo necesitas en el grid
    selectedColumn,
    dates,
    actions: {
      editCell,
      updateCellDirect, // expón la función optimizada si el grid la requiere
      selectColumn,
    }
  };
};