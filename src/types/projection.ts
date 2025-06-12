export interface ProductProjection {
  CenterCode: string;
  Reference: string;
  VisibleForecastedDate: string;
  NetFlow: number;
  GreenZone: number;
  YellowZone: number;
  RedZone: number;
  MakeToOrder: number;
}

export type CellId = `${string}-${string}`;
export type CellColor = 'red' | 'yellow' | 'green' | 'black' | 'blue' | 'transparent';

export interface CellData {
  value: number;
  netFlow: number;
  zones: {
    red: number;
    yellow: number;
    green: number;
  };
  color: CellColor;
  isEdited: boolean;
}

export interface ProcessedTableRow {
  reference: string;
  centerCode: string;
  cells: {
    [visibleForecastedDate: string]: CellData | any; // Add index signature
  };
};
