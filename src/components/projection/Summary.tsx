import { Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ColorSummaryItem, SummaryData } from '@/types/projection';
import { cn } from '@/lib/utils';

interface SummaryProps {
  selectedColumn: string | null;
  summaryData: SummaryData;
  className?: string;
}

const Summary: React.FC<SummaryProps> = ({ 
  selectedColumn, 
  summaryData, 
  className 
}) => {

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
      count: summaryData?.red.count ?? 0,
      percentage: summaryData?.red.percentage ?? 0,
      label: 'Zona Roja',
      bgColor: 'bg-red-300',
      textColor: 'text-red-800'
    },
    {
      color: 'yellow',
      count: summaryData?.yellow.count ?? 0,
      percentage: summaryData?.yellow.percentage ?? 0,
      label: 'Zona Amarilla',
      bgColor: 'bg-yellow-300',
      textColor: 'text-yellow-800'
    },
    {
      color: 'green',
      count: summaryData?.green.count ?? 0,
      percentage: summaryData?.green.percentage ?? 0,
      label: 'Zona Verde',
      bgColor: 'bg-green-300',
      textColor: 'text-green-800'
    },
    {
      color: 'black',
      count: summaryData?.black.count ?? 0,
      percentage: summaryData?.black.percentage ?? 0,
      label: 'Sin Stock',
      bgColor: 'bg-gray-800',
      textColor: 'text-gray-300'
    },
    {
      color: 'blue',
      count: summaryData?.blue.count ?? 0,
      percentage: summaryData?.blue.percentage ?? 0,
      label: 'Exceso',
      bgColor: 'bg-blue-300',
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
          Total de productos: {summaryData?.total}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {colorItems.map((item) => (
          <SummaryItem key={item.color} {...item} />
        ))}
        
        {summaryData?.total === 0 && (
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
          <span className="text-sm text-muted-foreground">
            {percentage.toFixed(1)}%
          </span>
          <Badge variant="secondary" className={cn("text-xs", textColor, bgColor)}>
            {count}
          </Badge>
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

export default Summary;