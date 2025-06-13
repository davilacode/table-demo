import { CellColor, SummaryData, ProcessedTableRow, CellData } from "@/types/projection";

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