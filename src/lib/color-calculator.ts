import { ProductProjection, CellColor, ProcessedTableRow } from '@/types/projection';

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

  console.log('Processed Data:', Object.values(grouped));

  return Object.values(grouped);
}
