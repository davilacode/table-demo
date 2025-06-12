import './App.css'
import { ProjectionGrid } from '@/components/projection/ProjectionGrid'
import sampleData from '@/data/sample-data.json'
import { useCallback, useMemo, useState } from 'react';
import { CellId } from './types/projection';
import { processDataForTable } from './lib/color-calculator';

const App = () => {

  const [data] = useState(sampleData.Datos);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Map<CellId, number>>(new Map());

  const processedData = useMemo(() => {
    return processDataForTable(data, editedValues);
  }, [data, editedValues]);

  const dates = useMemo(() => {
    return [...new Set(data.map(item => item.VisibleForecastedDate))].sort();
  }, [data]);

  const handleCellEdit = useCallback((cellId: CellId, value: number) => {
    setEditedValues(prev => new Map(prev.set(cellId, value)));
  }, []);  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Proyección de Productos</h1>
      <ProjectionGrid data={processedData} dates={dates} selectedColumn={selectedColumn} onCellEdit={handleCellEdit} onColumnSelect={setSelectedColumn} />
    </div>
  )
}

export default App
