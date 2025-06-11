
---

## 📋 Brief del Proyecto

### Objetivo
Desarrollar una aplicación React para la visualización y gestión de proyecciones diarias de productos mediante dos componentes principales: un Grid de Proyección interactivo y un componente de Resumen dinámico.

### Alcance
- **Componente 1**: Grid de Proyección con celdas editables y coloreado dinámico
- **Componente 2**: Resumen estadístico por columna seleccionada
- **Integración**: Página principal que monte ambos componentes con funcionalidad completa

### Stakeholders
- Desarrolladores React
- Usuarios finales que gestionan inventario y proyecciones

---

## 🛠 Especificaciones Técnicas

### Stack Tecnológico
- **React 19**: Framework principal con nuevas características y optimizaciones
- **TanStack Table v8**: Manejo avanzado de tablas con virtualización y estado
- **shadcn/ui**: Sistema de componentes moderno y accesible
- **TypeScript**: Tipado estático para mejor desarrollo
- **Tailwind CSS**: Styling utility-first integrado con shadcn

### Estructura de Datos

#### Modelo de Datos de Entrada
```typescript
interface ProductProjection {
  CenterCode: string;           // Código del centro
  Reference: string;            // Referencia del producto
  VisibleForecastedDate: string; // Fecha en formato ISO
  NetFlow: number;              // Inventario neto diario
  GreenZone: number;            // Umbral zona verde
  YellowZone: number;           // Umbral zona amarilla
  RedZone: number;              // Umbral zona roja
  MakeToOrder: number;          // Pedido de abastecimiento (editable)
}

// Tipo para identificación única de celda
type CellId = `${string}-${string}`; // Reference-Date

// Tipo para colores de celda
type CellColor = 'red' | 'yellow' | 'green' | 'black' | 'blue' | 'transparent';
```

#### Estados de la Aplicación con React 19
```typescript
interface AppState {
  data: ProductProjection[];
  selectedColumn: string | null;
  editedValues: Map<CellId, number>;
  isLoading: boolean;
  error: string | null;
}

// Hook personalizado usando React 19 features
interface UseProjectionDataReturn {
  data: ProductProjection[];
  selectedColumn: string | null;
  editedValues: Map<CellId, number>;
  actions: {
    editCell: (cellId: CellId, value: number) => void;
    selectColumn: (columnId: string) => void;
    loadData: (newData: ProductProjection[]) => void;
  };
  derived: {
    summaryData: SummaryData;
    processedTableData: ProcessedTableRow[];
  };
}
```

---

## 🎯 Componente 1: Grid de Proyección

### Implementación con TanStack Table

#### Configuración Base de la Tabla
```typescript
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table
} from '@tanstack/react-table';

interface ProcessedTableRow {
  reference: string;
  centerCode: string;
  [dateKey: string]: string | number | CellData; // Columnas dinámicas por fecha
}

interface CellData {
  value: number;           // MakeToOrder value
  netFlow: number;         // Para cálculo de color
  zones: {
    red: number;
    yellow: number;
    green: number;
  };
  color: CellColor;
  isEdited: boolean;
}

const columnHelper = createColumnHelper<ProcessedTableRow>();
```

#### Definición de Columnas Dinámicas
```typescript
const useProjectionColumns = (
  dates: string[],
  onCellEdit: (cellId: CellId, value: number) => void,
  onColumnSelect: (columnId: string) => void,
  selectedColumn: string | null
): ColumnDef<ProcessedTableRow>[] => {
  
  return useMemo(() => {
    const staticColumns: ColumnDef<ProcessedTableRow>[] = [
      columnHelper.accessor('reference', {
        header: 'Referencia',
        cell: ({ getValue }) => (
          <div className="font-medium text-sm">
            {getValue()}
          </div>
        ),
        size: 180,
        enableSorting: true,
      }),
      columnHelper.accessor('centerCode', {
        header: 'Centro',
        cell: ({ getValue }) => (
          <Badge variant="outline" className="text-xs">
            {getValue()}
          </Badge>
        ),
        size: 100,
      }),
    ];

    const dynamicColumns: ColumnDef<ProcessedTableRow>[] = dates.map(date => 
      columnHelper.accessor(date as keyof ProcessedTableRow, {
        header: ({ column }) => (
          <div 
            className={cn(
              "text-center cursor-pointer transition-colors px-2 py-1 rounded",
              selectedColumn === date 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
            onClick={() => onColumnSelect(date)}
          >
            {format(new Date(date), 'dd/MM')}
          </div>
        ),
        cell: ({ getValue, row, column }) => {
          const cellData = getValue() as CellData;
          const cellId: CellId = `${row.original.reference}-${column.id}`;
          
          return (
            <EditableCell
              value={cellData.value}
              color={cellData.color}
              onEdit={(value) => onCellEdit(cellId, value)}
              isEdited={cellData.isEdited}
            />
          );
        },
        size: 80,
        enableSorting: false,
      })
    );

    return [...staticColumns, ...dynamicColumns];
  }, [dates, onCellEdit, onColumnSelect, selectedColumn]);
};
```

#### Componente de Celda Editable con shadcn
```typescript
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
```

#### Hook Principal del Grid
```typescript
const useProjectionGrid = (initialData: ProductProjection[]) => {
  const [data, setData] = useState(initialData);
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

  // Configurar tabla
  const columns = useProjectionColumns(
    dates,
    handleCellEdit,
    setSelectedColumn,
    selectedColumn
  );

  const table = useReactTable({
    data: processedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: false,
  });

  const handleCellEdit = useCallback((cellId: CellId, value: number) => {
    setEditedValues(prev => new Map(prev.set(cellId, value)));
  }, []);

  return {
    table,
    selectedColumn,
    editedValues,
    dates,
    processedData
  };
};
```

#### Sistema de Coloreado
**Fórmula de cálculo**: `NetFlow + MakeToOrder`

```typescript
const calculateCellColor = (
  netFlow: number, 
  makeToOrder: number, 
  redZone: number, 
  yellowZone: number, 
  greenZone: number
): CellColor => {
  const total = netFlow + makeToOrder;
  
  if (total === 0) return 'black';
  if (total >= 1 && total <= redZone) return 'red';
  if (total > redZone && total <= redZone + yellowZone) return 'yellow';
  if (total > redZone + yellowZone && total <= redZone + yellowZone + greenZone) return 'green';
  if (total > redZone + yellowZone + greenZone) return 'blue';
  
  return 'transparent';
};
```

---

## 📊 Componente 2: Resumen

### Implementación con shadcn/ui

#### Estructura de Datos del Resumen
```typescript
interface SummaryData {
  red: { count: number; percentage: number };
  yellow: { count: number; percentage: number };
  green: { count: number; percentage: number };
  black: { count: number; percentage: number };
  blue: { count: number; percentage: number };
  total: number;
  selectedDate: string | null;
}

interface ColorSummaryItem {
  color: CellColor;
  count: number;
  percentage: number;
  label: string;
  bgColor: string;
  textColor: string;
}
```

#### Componente Principal
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, BarChart3, AlertTriangle } from 'lucide-react';

interface SummaryProps {
  selectedColumn: string | null;
  processedData: ProcessedTableRow[];
  className?: string;
}

const Summary: React.FC<SummaryProps> = ({ 
  selectedColumn, 
  processedData, 
  className 
}) => {
  const summaryData = useMemo(() => {
    if (!selectedColumn) return null;
    return calculateSummaryForColumn(processedData, selectedColumn);
  }, [selectedColumn, processedData]);

  if (!selectedColumn) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-center">
            Selecciona una columna de fecha en el grid
            <br />
            para ver el resumen estadístico
          </p>
        </CardContent>
      </Card>
    );
  }

  const colorItems: ColorSummaryItem[] = [
    {
      color: 'red',
      count: summaryData.red.count,
      percentage: summaryData.red.percentage,
      label: 'Zona Roja',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    {
      color: 'yellow',
      count: summaryData.yellow.count,
      percentage: summaryData.yellow.percentage,
      label: 'Zona Amarilla',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    },
    {
      color: 'green',
      count: summaryData.green.count,
      percentage: summaryData.green.percentage,
      label: 'Zona Verde',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    {
      color: 'black',
      count: summaryData.black.count,
      percentage: summaryData.black.percentage,
      label: 'Sin Stock',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    },
    {
      color: 'blue',
      count: summaryData.blue.count,
      percentage: summaryData.blue.percentage,
      label: 'Exceso',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Resumen - {format(new Date(selectedColumn), 'dd/MM/yyyy')}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          Total de productos: {summaryData.total}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {colorItems.map((item) => (
          <SummaryItem key={item.color} {...item} />
        ))}
        
        {summaryData.total === 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              No hay datos para la fecha seleccionada
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### Componente de Item de Resumen
```typescript
interface SummaryItemProps extends ColorSummaryItem {}

const SummaryItem: React.FC<SummaryItemProps> = ({
  count,
  percentage,
  label,
  bgColor,
  textColor
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded", bgColor)} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn("text-xs", textColor, bgColor)}>
            {count}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        // Personalizar color de la barra según el tipo
      />
    </div>
  );
};
```

#### Hook para Cálculos
```typescript
const calculateSummaryForColumn = (
  data: ProcessedTableRow[], 
  columnDate: string
): SummaryData => {
  const columnData = data
    .map(row => row[columnDate] as CellData)
    .filter(Boolean);

  const colorCounts = columnData.reduce((acc, cellData) => {
    acc[cellData.color] = (acc[cellData.color] || 0) + 1;
    return acc;
  }, {} as Record<CellColor, number>);

  const total = columnData.length;

  return {
    red: { 
      count: colorCounts.red || 0, 
      percentage: total > 0 ? ((colorCounts.red || 0) / total) * 100 : 0 
    },
    yellow: { 
      count: colorCounts.yellow || 0, 
      percentage: total > 0 ? ((colorCounts.yellow || 0) / total) * 100 : 0 
    },
    green: { 
      count: colorCounts.green || 0, 
      percentage: total > 0 ? ((colorCounts.green || 0) / total) * 100 : 0 
    },
    black: { 
      count: colorCounts.black || 0, 
      percentage: total > 0 ? ((colorCounts.black || 0) / total) * 100 : 0 
    },
    blue: { 
      count: colorCounts.blue || 0, 
      percentage: total > 0 ? ((colorCounts.blue || 0) / total) * 100 : 0 
    },
    total,
    selectedDate: columnDate
  };
};
```

---

## 🏗 Arquitectura de la Aplicación

### Estructura de Carpetas con shadcn/ui
```
src/
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── projection/
│   │   ├── ProjectionGrid.tsx
│   │   ├── EditableCell.tsx
│   │   ├── Summary.tsx
│   │   └── index.ts
│   └── layout/
│       ├── Header.tsx
│       └── MainLayout.tsx
├── hooks/
│   ├── useProjectionData.ts
│   ├── useProjectionGrid.ts
│   └── useSummaryCalculations.ts
├── lib/
│   ├── utils.ts                # shadcn utilities
│   ├── color-calculator.ts
│   ├── data-processors.ts
│   └── constants.ts
├── types/
│   ├── projection.ts
│   └── table.ts
├── data/
│   └── sample-data.json
├── styles/
│   └── globals.css
└── App.tsx
```

### Configuración de shadcn/ui
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Hook Principal con React 19
```typescript
// hooks/useProjectionData.ts
import { useState, useMemo, useCallback, useOptimistic } from 'react';

export const useProjectionData = (initialData: ProductProjection[]) => {
  const [data] = useState(initialData);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  
  // React 19: useOptimistic para ediciones
  const [editedValues, setOptimisticEdits] = useOptimistic<
    Map<CellId, number>,
    { cellId: CellId; value: number }
  >(
    new Map(),
    (state, { cellId, value }) => {
      const newMap = new Map(state);
      newMap.set(cellId, value);
      return newMap;
    }
  );

  // Datos procesados para TanStack Table
  const processedTableData = useMemo(() => {
    return processDataForTable(data, editedValues);
  }, [data, editedValues]);

  // Fechas únicas ordenadas
  const dates = useMemo(() => {
    return [...new Set(data.map(item => item.VisibleForecastedDate))].sort();
  }, [data]);

  // Datos de resumen calculados
  const summaryData = useMemo(() => {
    if (!selectedColumn) return null;
    return calculateSummaryForColumn(processedTableData, selectedColumn);
  }, [processedTableData, selectedColumn]);

  // Acciones
  const editCell = useCallback((cellId: CellId, value: number) => {
    setOptimisticEdits({ cellId, value });
  }, [setOptimisticEdits]);

  const selectColumn = useCallback((columnId: string) => {
    setSelectedColumn(columnId);
  }, []);

  return {
    data: processedTableData,
    selectedColumn,
    editedValues,
    dates,
    summaryData,
    actions: {
      editCell,
      selectColumn,
    }
  };
};
```

### Componente Principal de la App
```typescript
// App.tsx
import { useState, Suspense } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectionGrid } from '@/components/projection/ProjectionGrid';
import { Summary } from '@/components/projection/Summary';
import { useProjectionData } from '@/hooks/useProjectionData';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import sampleData from '@/data/sample-data.json';

function App() {
  const {
    data,
    selectedColumn,
    dates,
    summaryData,
    actions
  } = useProjectionData(sampleData as ProductProjection[]);

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Sistema de Proyección de Productos
          </h1>
          <p className="text-muted-foreground">
            Gestión y visualización de proyecciones diarias de inventario
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Grid Principal */}
          <div className="xl:col-span-3">
            <Card className="p-6">
              <Suspense fallback={<ProjectionGridSkeleton />}>
                <ProjectionGrid
                  data={data}
                  dates={dates}
                  selectedColumn={selectedColumn}
                  onCellEdit={actions.editCell}
                  onColumnSelect={actions.selectColumn}
                />
              </Suspense>
            </Card>
          </div>

          {/* Panel de Resumen */}
          <div className="xl:col-span-1">
            <Summary
              selectedColumn={selectedColumn}
              summaryData={summaryData}
              className="sticky top-6"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const ProjectionGridSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

export default App;
```

---

## 🎨 Especificaciones de UI/UX

### Paleta de Colores del Grid
```css
:root {
  --color-red: #ff4757;
  --color-yellow: #ffa502;
  --color-green: #2ed573;
  --color-black: #2f3542;
  --color-blue: #3742fa;
  --color-selected: #e1f5fe;
  --border-color: #ddd;
}
```

### Responsive Design
- **Desktop**: Grid completo visible
- **Tablet**: Scroll horizontal habilitado
- **Mobile**: Vista colapsada con navegación optimizada

### Interacciones UX
- **Hover effects** en celdas editables
- **Loading states** durante cálculos
- **Visual feedback** para selección de columna
- **Tooltips** para explicar colores

---

## ⚡ Requisitos de Rendimiento

### Optimizaciones Críticas

#### Renderizado
```jsx
// Memoización de componentes pesados
const ProjectionGrid = React.memo(({ data, onCellEdit }) => {
  // Lógica del componente
});

// Virtualización para datasets grandes
import { FixedSizeGrid as Grid } from 'react-window';
```

#### Gestión de Estado
```jsx
// Debounce para edición de celdas
const debouncedCellEdit = useMemo(
  () => debounce((cellId, value) => {
    // Lógica de actualización
  }, 300),
  []
);
```

### Métricas de Rendimiento
- **Tiempo de carga inicial**: < 2 segundos
- **Respuesta a edición**: < 100ms
- **Cambio de selección**: < 50ms
- **Recálculo de resumen**: < 200ms

---

## 🧪 Estrategia de Testing

### Casos de Prueba con React 19 y Testing Library

#### Testing del Grid de Proyección
```typescript
// __tests__/ProjectionGrid.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectionGrid } from '@/components/projection/ProjectionGrid';
import { mockProjectionData } from '@/test-utils/mock-data';

describe('ProjectionGrid', () => {
  const defaultProps = {
    data: mockProjectionData,
    dates: ['2025-03-21', '2025-03-22'],
    selectedColumn: null,
    onCellEdit: jest.fn(),
    onColumnSelect: jest.fn(),
  };

  test('debe renderizar la tabla con datos correctos', () => {
    render(<ProjectionGrid {...defaultProps} />);
    
    expect(screen.getByText('210001000004R20')).toBeInTheDocument();
    expect(screen.getByText('BCV')).toBeInTheDocument();
  });

  test('debe calcular colores correctamente según reglas de negocio', () => {
    render(<ProjectionGrid {...defaultProps} />);
    
    // Caso: NetFlow=100, MakeToOrder=23, RedZone=50, YellowZone=55, GreenZone=55
    // Total=123, debe ser verde (> RedZone + YellowZone = 105)
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21');
    expect(cell).toHaveClass('bg-green-100');
  });

  test('debe permitir edición sin afectar celdas siguientes', async () => {
    const user = userEvent.setup();
    const onCellEdit = jest.fn();
    
    render(<ProjectionGrid {...defaultProps} onCellEdit={onCellEdit} />);
    
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21');
    await user.click(cell);
    
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '50');
    await user.keyboard('{Enter}');
    
    expect(onCellEdit).toHaveBeenCalledWith('210001000004R20-2025-03-21', 50);
    
    // Verificar que solo se afectó la celda editada
    const nextCell = screen.getByTestId('cell-210001000004R20-2025-03-22');
    expect(nextCell).not.toHaveClass('bg-red-100'); // No debe cambiar
  });

  test('debe actualizar color en tiempo real al editar', async () => {
    const user = userEvent.setup();
    
    render(<ProjectionGrid {...defaultProps} />);
    
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21');
    await user.click(cell);
    
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '1'); // Valor que resulta en zona roja
    
    await waitFor(() => {
      expect(cell).toHaveClass('bg-red-100');
    });
  });

  test('debe manejar selección de columna correctamente', async () => {
    const user = userEvent.setup();
    const onColumnSelect = jest.fn();
    
    render(<ProjectionGrid {...defaultProps} onColumnSelect={onColumnSelect} />);
    
    const columnHeader = screen.getByText('21/03');
    await user.click(columnHeader);
    
    expect(onColumnSelect).toHaveBeenCalledWith('2025-03-21');
  });
});
```

#### Testing del Componente Resumen
```typescript
// __tests__/Summary.test.tsx
import { render, screen } from '@testing-library/react';
import { Summary } from '@/components/projection/Summary';
import { mockProcessedTableData } from '@/test-utils/mock-data';

describe('Summary', () => {
  test('debe calcular porcentajes correctamente', () => {
    const summaryData = {
      red: { count: 2, percentage: 40 },
      yellow: { count: 1, percentage: 20 },
      green: { count: 2, percentage: 40 },
      black: { count: 0, percentage: 0 },
      blue: { count: 0, percentage: 0 },
      total: 5,
      selectedDate: '2025-03-21'
    };

    render(
      <Summary 
        selectedColumn="2025-03-21" 
        summaryData={summaryData}
      />
    );
    
    expect(screen.getByText('40.0%')).toBeInTheDocument(); // Red percentage
    expect(screen.getByText('20.0%')).toBeInTheDocument(); // Yellow percentage
    expect(screen.getByText('Total de productos: 5')).toBeInTheDocument();
  });

  test('debe mostrar estado vacío cuando no hay selección', () => {
    render(
      <Summary 
        selectedColumn={null} 
        summaryData={null}
      />
    );
    
    expect(screen.getByText(/Selecciona una columna de fecha/)).toBeInTheDocument();
  });

  test('debe actualizarse al cambiar columna seleccionada', () => {
    const { rerender } = render(
      <Summary 
        selectedColumn="2025-03-21" 
        summaryData={{
          red: { count: 2, percentage: 40 },
          yellow: { count: 1, percentage: 20 },
          green: { count: 2, percentage: 40 },
          black: { count: 0, percentage: 0 },
          blue: { count: 0, percentage: 0 },
          total: 5,
          selectedDate: '2025-03-21'
        }}
      />
    );

    expect(screen.getByText('21/03/2025')).toBeInTheDocument();

    rerender(
      <Summary 
        selectedColumn="2025-03-22" 
        summaryData={{
          red: { count: 1, percentage: 50 },
          yellow: { count: 0, percentage: 0 },
          green: { count: 1, percentage: 50 },
          black: { count: 0, percentage: 0 },
          blue: { count: 0, percentage: 0 },
          total: 2,
          selectedDate: '2025-03-22'
        }}
      />
    );

    expect(screen.getByText('22/03/2025')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });
});
```

### Testing de Integración
```typescript
// __tests__/integration/App.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { mockProjectionData } from '@/test-utils/mock-data';

// Mock del hook de datos
jest.mock('@/hooks/useProjectionData', () => ({
  useProjectionData: () => ({
    data: mockProcessedTableData,
    selectedColumn: null,
    dates: ['2025-03-21', '2025-03-22'],
    summaryData: null,
    actions: {
      editCell: jest.fn(),
      selectColumn: jest.fn(),
    }
  })
}));

describe('App Integration', () => {
  test('flujo completo: cargar datos → seleccionar columna → editar celda → verificar resumen', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // 1. Verificar carga de datos
    expect(screen.getByText('Sistema de Proyección de Productos')).toBeInTheDocument();
    expect(screen.getByText('210001000004R20')).toBeInTheDocument();
    
    // 2. Seleccionar columna
    const columnHeader = screen.getByText('21/03');
    await user.click(columnHeader);
    
    // 3. Verificar que el resumen se actualiza
    await waitFor(() => {
      expect(screen.getByText(/Resumen - 21\/03\/2025/)).toBeInTheDocument();
    });
    
    // 4. Editar celda
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21');
    await user.click(cell);
    
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '100');
    await user.keyboard('{Enter}');
    
    // 5. Verificar actualización del color y resumen
    await waitFor(() => {
      expect(cell).toHaveClass('bg-green-100');
      // El resumen debería reflejar el cambio
    });
  });

  test('debe manejar casos edge: datos vacíos, valores negativos', async () => {
    // Test con datos vacíos
    render(<App />);
    
    // Verificar manejo graceful de datos vacíos
    expect(screen.getByText(/No hay datos/)).toBeInTheDocument();
  });
});
```

### Utilities de Testing
```typescript
// test-utils/mock-data.ts
export const mockProjectionData: ProductProjection[] = [
  {
    CenterCode: "BCV",
    Reference: "210001000004R20",
    VisibleForecastedDate: "2025-03-21T00:00:00",
    NetFlow: 100,
    GreenZone: 55,
    YellowZone: 55,
    RedZone: 50,
    MakeToOrder: 23
  },
  // ... más datos de prueba
];

// test-utils/test-providers.tsx
import { ReactNode } from 'react';

interface TestProvidersProps {
  children: ReactNode;
}

export const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};

// Custom render with providers
export const renderWithProviders = (ui: ReactElement) => {
  return render(ui, {
    wrapper: TestProviders,
  });
};
```

---

## 📦 Dependencias Recomendadas

## 📦 Dependencias y Stack Tecnológico

### Core Dependencies (React 19)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.3.0"
  }
}
```

### TanStack Table v8
```json
{
  "@tanstack/react-table": "^8.11.0",
  "@tanstack/react-virtual": "^3.0.0"
}
```

### shadcn/ui Dependencies
```json
{
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0",
  "tailwindcss": "^3.4.0",
  "tailwindcss-animate": "^1.0.7",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-separator": "^1.0.3",
  "lucide-react": "^0.344.0"
}
```

### Utilities y Performance
```json
{
  "date-fns": "^3.0.0",          // Manejo de fechas optimizado
  "immer": "^10.0.0",            // Inmutabilidad performante
  "lodash-es": "^4.17.21",       // Utilidades con tree-shaking
  "@types/lodash-es": "^4.17.12"
}
```

### Development Dependencies
```json
{
  "vite": "^5.0.0",              // Build tool rápido
  "@vitejs/plugin-react": "^4.2.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "^3.0.0",
  "prettier-plugin-tailwindcss": "^0.5.0"
}
```

### Comandos de shadcn/ui Setup
```bash
# Inicializar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes necesarios
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add table
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add button
```

## ⚡ Requisitos de Rendimiento

### Optimizaciones con React 19 y TanStack Table

#### Renderizado Optimizado con React 19
```typescript
// Uso de React.memo con comparación personalizada
const ProjectionGrid = React.memo(({ 
  data, 
  dates, 
  selectedColumn, 
  onCellEdit, 
  onColumnSelect 
}) => {
  // Implementación del grid
}, (prevProps, nextProps) => {
  // Comparación optimizada para evitar re-renders innecesarios
  return (
    prevProps.selectedColumn === nextProps.selectedColumn &&
    prevProps.data === nextProps.data &&
    prevProps.dates === nextProps.dates
  );
});

// React 19: use() hook para data fetching
const useProjectionDataLoader = () => {
  const [dataPromise] = useState(() => 
    fetch('/api/projection-data').then(res => res.json())
  );
  
  const data = use(dataPromise); // React 19 feature
  return data;
};
```

#### Virtualización con TanStack Table
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedProjectionGrid = ({ table }) => {
  const { rows } = table.getRowModel();
  
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Altura estimada de fila
    overscan: 10, // Filas extra para renderizar
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: table.getAllColumns().length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Columnas de fecha más estrechas
      return index <= 1 ? 180 : 80;
    },
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{
        contain: 'strict', // CSS containment para mejor rendimiento
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${columnVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: virtualRow.start,
                left: 0,
                height: `${virtualRow.size}px`,
                width: '100%',
              }}
            >
              {/* Renderizar celdas virtualizadas */}
              {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
                <VirtualCell
                  key={virtualColumn.index}
                  row={row}
                  columnIndex={virtualColumn.index}
                  style={{
                    position: 'absolute',
                    left: virtualColumn.start,
                    width: `${virtualColumn.size}px`,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

#### Optimización de Estados con useOptimistic
```typescript
// React 19: Optimistic updates para edición de celdas
const useOptimisticCellEdits = (initialEditedValues: Map<CellId, number>) => {
  const [optimisticEdits, setOptimisticEdits] = useOptimistic<
    Map<CellId, number>,
    { type: 'EDIT_CELL'; cellId: CellId; value: number }
  >(
    initialEditedValues,
    (state, { cellId, value }) => {
      const newMap = new Map(state);
      newMap.set(cellId, value);
      return newMap;
    }
  );

  const editCell = useCallback(
    async (cellId: CellId, value: number) => {
      // Actualización optimista inmediata
      setOptimisticEdits({ type: 'EDIT_CELL', cellId, value });
      
      try {
        // Actualización real en el servidor/estado
        await updateCellValue(cellId, value);
      } catch (error) {
        // Revertir en caso de error
        console.error('Error updating cell:', error);
        // El estado se revierte automáticamente
      }
    },
    [setOptimisticEdits]
  );

  return { optimisticEdits, editCell };
};
```

#### Memoización Avanzada
```typescript
// Memoización de cálculos costosos
const useMemoizedColorCalculations = (
  data: ProductProjection[],
  editedValues: Map<CellId, number>
) => {
  return useMemo(() => {
    const colorMap = new Map<CellId, CellColor>();
    
    data.forEach(item => {
      const cellId: CellId = `${item.Reference}-${item.VisibleForecastedDate}`;
      const makeToOrder = editedValues.get(cellId) ?? item.MakeToOrder;
      
      const color = calculateCellColor(
        item.NetFlow,
        makeToOrder,
        item.RedZone,
        item.YellowZone,
        item.GreenZone
      );
      
      colorMap.set(cellId, color);
    });
    
    return colorMap;
  }, [data, editedValues]);
};

// Debounce para actualizaciones de resumen
const useDebouncedSummary = (
  processedData: ProcessedTableRow[],
  selectedColumn: string | null,
  delay = 300
) => {
  const [debouncedData, setDebouncedData] = useState(processedData);
  const [debouncedColumn, setDebouncedColumn] = useState(selectedColumn);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedData(processedData);
      setDebouncedColumn(selectedColumn);
    }, delay);

    return () => clearTimeout(timer);
  }, [processedData, selectedColumn, delay]);

  return useMemo(() => {
    if (!debouncedColumn) return null;
    return calculateSummaryForColumn(debouncedData, debouncedColumn);
  }, [debouncedData, debouncedColumn]);
};
```

### Métricas de Rendimiento Objetivo
- **Tiempo de carga inicial**: < 1.5 segundos (React 19 mejoras)
- **Respuesta a edición**: < 50ms (useOptimistic)
- **Cambio de selección**: < 30ms (memoización)
- **Recálculo de resumen**: < 100ms (debounce + memoización)
- **Scroll suave**: 60 FPS con virtualización
- **Memoria**: < 100MB para 10,000+ celdas# Brief y Especificaciones Técnicas
## Sistema de Proyección de Productos en React


---

## 🚀 Plan de Implementación

### Fase 1: Setup y Estructura (1 día)
- [ ] Inicializar proyecto React
- [ ] Configurar estructura de carpetas
- [ ] Implementar datos de prueba
- [ ] Setup básico de componentes

### Fase 2: Grid de Proyección (2-3 días)
- [ ] Implementar estructura de tabla
- [ ] Desarrollar lógica de coloreado
- [ ] Añadir funcionalidad de edición
- [ ] Implementar selección de columna

### Fase 3: Componente Resumen (1 día)
- [ ] Desarrollar cálculos estadísticos
- [ ] Implementar UI del resumen
- [ ] Conectar con estado del grid

### Fase 4: Integración y Optimización (1 día)
- [ ] Integrar componentes en App principal
- [ ] Optimizaciones de rendimiento
- [ ] Testing y bug fixes
- [ ] Documentación

---

## ✅ Criterios de Aceptación

### Funcionales (Must Have)
- [ ] Grid muestra datos correctamente organizados por producto/fecha
- [ ] Coloreado de celdas sigue reglas de negocio exactas
- [ ] Edición funciona sin afectar celdas siguientes
- [ ] Resumen calcula estadísticas correctamente
- [ ] Selección de columna actualiza resumen

### No Funcionales (Should Have)
- [ ] Interfaz responsive y profesional
- [ ] Rendimiento fluido con datasets medianos (1000+ registros)
- [ ] Código limpio y bien estructurado
- [ ] Documentación básica incluida

### Nice to Have
- [ ] Exportación de datos
- [ ] Filtros y búsqueda
- [ ] Temas de color personalizables
- [ ] Atajos de teclado para edición

---

## 📋 Entregables

1. **Código fuente completo** con estructura organizada
2. **package.json** con todas las dependencias
3. **README.md** con instrucciones de instalación y uso
4. **Documentación técnica** de componentes principales
5. **Demo funcional** lista para presentación

**Formato de entrega**: Archivo `.zip` conteniendo proyecto React completo