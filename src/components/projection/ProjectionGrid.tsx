import React, { useMemo } from "react";
import {
  getCoreRowModel,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import type { ProcessedTableRow } from '@/types/projection';
import { cn } from "@/lib/utils";
import { useProjectionColumns } from "@/hooks/useProjectionColumns";

type ProjectionColumnMeta = {
  isFixed?: boolean;
  fixedLeft?: number;
};

interface ProjectionGridProps {
  data: ProcessedTableRow[];
  dates: string[];
  selectedColumn: string | null;
  onCellEdit: (ref: string, date: string, value: number) => void;
  onColumnSelect: (columnId: string) => void;
}

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

export default ProjectionGrid;