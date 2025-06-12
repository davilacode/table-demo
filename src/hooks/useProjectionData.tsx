import { processDataForTable } from '@/lib/color-calculator';
import { CellId, ProductProjection } from '@/types/projection';
import { useState, useMemo, useCallback } from 'react';

export const useProjectionData = (initialData: ProductProjection[]) => {
  const [data] = useState(initialData);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Map<CellId, number>>(new Map());

  const processedTableData = useMemo(() => {
    return processDataForTable(data, editedValues);
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

  const selectColumn = useCallback((columnId: string) => {
    setSelectedColumn(columnId);
  }, []);

  return {
    data: processedTableData,
    selectedColumn,
    dates,
    actions: {
      editCell,
      selectColumn
    }
  };
};