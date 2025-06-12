import './App.css'
import { ProjectionGrid } from '@/components/projection/ProjectionGrid'
import sampleData from '@/data/sample-data.json'
import { ProductProjection } from './types/projection';
import { useProjectionData } from './hooks/useProjectionData';

const App = () => {

  const {
    data,
    selectedColumn,
    dates,
    actions
  } = useProjectionData(sampleData.Datos as ProductProjection[]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Proyección de Productos</h1>
      <ProjectionGrid data={data} dates={dates} selectedColumn={selectedColumn} onCellEdit={actions.editCell} onColumnSelect={actions.selectColumn} />
    </div>
  )
}

export default App
