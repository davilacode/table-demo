import './App.css'
import { ProjectionGrid, useProjectionColumns } from '@/components/projection/ProjectionGrid'
import sampleData from '@/data/sample-data.json'
import { useCallback, useMemo, useState } from 'react';
import { CellId } from './types/projection';
import { processDataForTable } from './lib/color-calculator';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

const App = () => {

  const [data, setData] = useState(sampleData.Datos);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Map<CellId, number>>(new Map());

  // Procesar datos para TanStack Table
  const processedData = useMemo(() => {
    return processDataForTable(data, editedValues);
  }, [data, editedValues]);

  // Extraer fechas únicas
  const dates = useMemo(() => {
    return [...new Set(data.map(item => item.VisibleForecastedDate))].sort();
  }, [data]);

  const handleCellEdit = useCallback((cellId: CellId, value: number) => {
    setEditedValues(prev => new Map(prev.set(cellId, value)));
  }, []);

  // Configurar tabla
  

  // const table = useReactTable({
  //   data: processedData,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  //   enableRowSelection: false,
  // });

  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Proyección de Productos</h1>
      <ProjectionGrid data={processedData} dates={dates} selectedColumn={selectedColumn} onCellEdit={handleCellEdit} onColumnSelect={setSelectedColumn} />
    </div>
  )
}

export default App
