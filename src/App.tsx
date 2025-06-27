import './App.css'
import sampleData from '@/data/sample-data.json'
import { ProductProjection } from '@/types/projection';
import { useProjectionData } from '@/hooks/useProjectionData';
import { ProjectionGrid, Summary } from '@/components/projection'

const App = () => {

  const {
    data,
    selectedColumn,
    dates,
    summaryData,
    actions
  } = useProjectionData(sampleData.Datos as ProductProjection[]);

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Proyección de Productos</h1>
      <ProjectionGrid data={data} dates={dates} selectedColumn={selectedColumn} onCellEdit={actions.editCell} onColumnSelect={actions.selectColumn} />

      <div className="xl:col-span-1">
        <Summary
          selectedColumn={selectedColumn}
          summaryData={summaryData}
          className="sticky top-6"
        />
      </div>
    </div>
  )
}

export default App
