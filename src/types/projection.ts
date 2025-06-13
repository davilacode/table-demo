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
    [visibleForecastedDate: string]: CellData;
  };
}

export type ProcessedTable = Record<string, ProcessedTableRow>;

export type SummaryData = {
  red: { count: number; percentage: number };
  yellow: { count: number; percentage: number };
  green: { count: number; percentage: number };
  black: { count: number; percentage: number };
  blue: { count: number; percentage: number };
  total: number;
  selectedDate: string | null;
} | null;

export interface ColorSummaryItem {
  color: CellColor;
  count: number;
  percentage: number;
  label: string;
  bgColor: string;
  textColor: string;
}