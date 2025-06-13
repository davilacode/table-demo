import { useMemo } from "react";
import { ProcessedTableRow } from "@/types/projection";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from '@/components/ui/badge';
import EditableCell from '@/components/ui/editable-cell';
import HeaderCell from "@/components/ui/header-cell";

const columnHelper = createColumnHelper<ProcessedTableRow>();

export const useProjectionColumns = (
  dates: string[],
  onCellEdit: (ref: string, date: string, value: number) => void,
  onColumnSelect: (columnId: string) => void,
  selectedColumn: string | null
) => {
  return useMemo(() => {

    const centerCodeFixedLeft = 0;
    const referenceFixedLeft = 100;

    // Columnas estaticas (Referencias y código de centro)
    const staticColumns = [
      columnHelper.accessor('centerCode' as keyof ProcessedTableRow, {
        header: 'Centro',
        cell: ({ getValue }) => {
          const value = getValue();
          return typeof value === 'string' ? (
            <Badge variant="outline" className="text-xs">{value}</Badge>
          ) : null;
        },
        size: 100,
        meta: {
          isFixed: true,
          fixedLeft: centerCodeFixedLeft,
        }
      }),
      columnHelper.accessor('reference' as keyof ProcessedTableRow, {
        header: 'Referencia',
        cell: ({ getValue }) => {
          const value = getValue();
          return typeof value === 'string' ? (
            <div className="font-medium text-sm">{value}</div>
          ) : null;
        },
        size: 180,
        enableSorting: true,
        meta: {
          isFixed: true,
          fixedLeft: referenceFixedLeft,
        }
      }),
    ];

    // Columnas dinámicas (Fechas)
    const dynamicColumns = dates.map(date =>
      columnHelper.accessor(date as keyof ProcessedTableRow, {
        header: () => (
          <HeaderCell 
            date={date}
            selectedColumn={selectedColumn}
            onColumnSelect={onColumnSelect}
          />
        ),
        cell: ({ row }) => {
          const cellData = row.original['cells']?.[date];
          return (
            <EditableCell
              value={cellData.value}
              color={cellData.color}
              onEdit={onCellEdit}
              reference={row.id}
              visibleForecastedDate={date}
              isEdited={cellData.isEdited}
            />
          )
        },
        size: 80,
        enableSorting: false,
      })
    );
    return [...staticColumns, ...dynamicColumns];
  }, [dates, onCellEdit, onColumnSelect, selectedColumn]);
};