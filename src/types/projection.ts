// Tipos centrales para grid de proyección

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

export type CellId = `${string}-${string}`; // Reference-Date
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

// Solución: separar campos estáticos y dinámicos
export interface ProcessedTableRow {
  [key: string]: CellData | string;
}
