import React from "react";
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
  onCellEdit: (ref: string, date: string, value: number) => void;
  selectedColumn?: string | null; // kept optional for compatibility
  onColumnSelect?: (columnId: string) => void; // header selection disabled in this version
}

const ProjectionGrid: React.FC<ProjectionGridProps> = React.memo(({ data, dates, onCellEdit, onColumnSelect, selectedColumn }) => {

  const columns = useProjectionColumns(dates, onCellEdit);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: false,
    getRowId: (row) => `${row.reference}-${row.centerCode}`
  });

  return (
    <div className="overflow-auto h-[40vh] mb-5 scroll-smooth">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const meta = header.column.columnDef.meta as ProjectionColumnMeta | undefined;
                const isFixed = meta?.isFixed ?? false;
                const fixedLeft = meta?.fixedLeft ?? 0;
                const headerIsDate = !meta?.isFixed && typeof header.column.id === 'string' && header.column.id.includes('T');
                const isSelected = headerIsDate && typeof selectedColumn === 'string' && selectedColumn === header.column.id;
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "border-b border-r first:border-l border-t px-2 py-1 text-xs font-semibold text-left sticky top-0 z-20 shadow-sm",
                      isFixed ? "sticky left-0 z-[100] bg-muted" : "",
                      headerIsDate ? (isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 cursor-pointer") : "bg-muted"
                    )}
                    style={{
                      minWidth: header.getSize(),
                      left: isFixed ? `${fixedLeft}px` : undefined,
                    }}
                    onClick={headerIsDate && typeof onColumnSelect === 'function' ? () => onColumnSelect!(header.column.id) : undefined}
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
                      "border-b border-r first:border-l px-2 py-1 text-sm",
                      isFixed ? "sticky left-0 z-10 bg-background" : "",
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