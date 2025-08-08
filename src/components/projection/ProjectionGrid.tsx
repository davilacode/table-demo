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
      <table className="min-w-full border-separate border-spacing-0" aria-label="Tabla de proyección de productos por fechas">
        <caption className="sr-only">Tabla editable de proyección de productos; seleccione una fecha en el encabezado para ver el resumen.</caption>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const meta = header.column.columnDef.meta as ProjectionColumnMeta | undefined;
                const isFixed = meta?.isFixed ?? false;
                const fixedLeft = meta?.fixedLeft ?? 0;
        const headerIsDate = !meta?.isFixed && typeof header.column.id === 'string' && !Number.isNaN(Date.parse(header.column.id));
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
                    scope="col"
          aria-selected={headerIsDate ? isSelected : undefined}
          title={headerIsDate && typeof header.column.id === 'string' ? new Date(header.column.id).toLocaleDateString() : undefined}
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
              {row.getVisibleCells().map((cell, cellIndex) => {
                const meta = cell.column.columnDef.meta as ProjectionColumnMeta | undefined;
                const isFixed = meta?.isFixed ?? false;
                const fixedLeft = meta?.fixedLeft ?? 0;

                // Use th with scope="row" for row header (Referencia) if present
                const isRowHeader = typeof cell.column.id === 'string' && cell.column.id === 'reference';

                const commonProps = {
                  className: cn(
                    "border-b border-r first:border-l px-2 py-1 text-sm",
                    isFixed ? "sticky left-0 z-10 bg-background" : "",
                  ),
                  style: {
                    minWidth: cell.column.getSize(),
                    left: isFixed ? `${fixedLeft}px` : undefined,
                  } as React.CSSProperties,
                };

                return isRowHeader ? (
                  <th key={cell.id} {...commonProps} scope="row">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </th>
                ) : (
                  <td key={cell.id} {...commonProps}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ProjectionGrid;