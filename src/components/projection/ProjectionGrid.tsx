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
import { cn } from "@/lib/utils";

type ProjectionColumnMeta = {
  isFixed?: boolean;
  fixedLeft?: number;
};

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

    const centerCodeFixedLeft = 0;
    const referenceFixedLeft = 100;

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
    <div className="overflow-auto h-[40vh] mb-5">
      <table className="min-w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const meta = header.column.columnDef.meta as ProjectionColumnMeta | undefined;
                const isFixed = meta?.isFixed ?? false;
                const fixedLeft = meta?.fixedLeft ?? 0;
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "border px-2 py-1 bg-muted text-xs font-semibold text-left sticky top-0",
                      isFixed ? "sticky left-0 z-[100]" : ""
                    )}
                    style={{
                      minWidth: header.getSize(),
                      left: isFixed ? `${fixedLeft}px` : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                )})}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => {
                const meta = cell.column.columnDef.meta as ProjectionColumnMeta | undefined;
                const isFixed = meta?.isFixed ?? false;
                const fixedLeft = meta?.fixedLeft ?? 0;

                return (
                  <td
                    key={cell.id}
                    className={cn(
                      "border px-2 py-1 text-sm",
                      isFixed ? "sticky left-0 z-10 bg-white" : "",
                    )}
                    style={{ 
                      minWidth: cell.column.getSize(),
                      left: isFixed ? `${fixedLeft}px` : undefined,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
              )})}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export { ProjectionGrid };