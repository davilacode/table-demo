import { CellColor, ProcessedTableRow, ProductProjection, SummaryData } from "@/types/projection";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// funcion para asignar el color de la celda
export function calculateCellColor(
  netFlow: number,
  makeToOrder: number,
  redZone: number,
  yellowZone: number,
  greenZone: number
): CellColor {

  const total = netFlow + makeToOrder;

  if (total >= 1 && total <= redZone) return 'red';
  if (total > redZone && total <= redZone + yellowZone) return 'yellow';
  if (total > redZone + yellowZone && total <= redZone + yellowZone + greenZone) return 'green';
  if (total > redZone + yellowZone + greenZone) return 'blue';
  if (total === 0) return 'black';
  
  return 'transparent';

}

// funcion para procesar los datos crudos y convertirlos en un formato adecuado para la tabla
export function processDataForTable(
  data: ProductProjection[],
): ProcessedTableRow[] {

  const grouped: Record<string, ProcessedTableRow> = {};

  data.forEach(item => {
    const rowKey = `${item.Reference}-${item.CenterCode}`;
    if (!grouped[rowKey]) {
      grouped[rowKey] = {
        reference: item.Reference,
        centerCode: item.CenterCode,
        cells: {},
      };
    }
    
    const value = item.MakeToOrder;
    const color = calculateCellColor(
      item.NetFlow,
      value,
      item.RedZone,
      item.YellowZone,
      item.GreenZone
    );
    grouped[rowKey].cells[item.VisibleForecastedDate] = {
      value,
      netFlow: item.NetFlow,
      zones: {
        red: item.RedZone,
        yellow: item.YellowZone,
        green: item.GreenZone,
      },
      color,
      isEdited: false,
    };
  });


  return Object.values(grouped);
}

// funcion para calcular el resumen de colores por columna
export const calculateSummaryForColumn = (
  data: ProcessedTableRow[], 
  columnDate: string
): SummaryData => {

  const columnData = data
    .map(row => {
      const cellData = row.cells[columnDate];

      return {
        color: cellData.color,
      };
    })
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