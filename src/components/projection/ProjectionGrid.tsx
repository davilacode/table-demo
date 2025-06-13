import React, { useMemo } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import type { ProcessedTableRow } from '@/types/projection';
import EditableCell from '@/components/ui/editable-cell';
import { Badge } from '@/components/ui/badge';
import HeaderCell from "@/components/ui/header-cell";

const columnHelper = createColumnHelper<ProcessedTableRow>();

interface ProjectionGridProps {
  data: ProcessedTableRow[];
  dates: string[];
  selectedColumn: string | null;
  onCellEdit: (ref: string, date: string, value: number) => void;
  onColumnSelect: (columnId: string) => void;
}

export const useProjectionColumns = (
  dates: string[],
  onCellEdit: (ref: string, date: string, value: number) => void,
  onColumnSelect: (columnId: string) => void,
  selectedColumn: string | null
) => {
  return useMemo(() => {
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
      }),
    ];
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

const ProjectionGrid: React.FC<ProjectionGridProps> = React.memo(({ data, dates, selectedColumn, onCellEdit, onColumnSelect }) => {

  const columns = useProjectionColumns(
    dates,
    onCellEdit,
    onColumnSelect,
    selectedColumn
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: false,
    getRowId: (row) => `${row.reference}-${row.centerCode}`
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="border px-2 py-1 bg-muted text-xs font-semibold text-left"
                  style={{ minWidth: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="border px-2 py-1 text-sm"
                  style={{ minWidth: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export { ProjectionGrid };