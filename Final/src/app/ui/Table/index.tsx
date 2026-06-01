import { Fragment, useEffect, useState } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';

import type {
  ColumnDef,
  Row,
  Table as ReactTable,
  PaginationState,
} from '@tanstack/react-table';

import classNames from 'classnames';
import { IconButton } from '@material-tailwind/react';

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  className?: string;
}

const Table = ({
  data,
  columns,
  renderSubComponent,
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
  className,
  hidePagination = true,
}: any) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 15,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(pagination);
    }
  }, [pagination, onPaginationChange]);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full py-1">
          <div className="overflow-hidden p-1">
            <table className={classNames(`Table min-w-full`, className)}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      className={classNames({
                        'bg-gray-50 transition-colors dark:bg-black-300':
                          row.getIsExpanded(),
                      })}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          style={{
                            width: cell.column.getSize(),
                          }}
                          key={cell.id}
                          className="px-2 py-1 text-center"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>

                    {renderSubComponent ? (
                      <tr key={row.id + '-expanded'}>
                        <td colSpan={columns.length}>
                          {renderSubComponent({ row })}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {!hidePagination && <Pagination table={table} />}
        </div>
      </div>
    </div>
  );
};

function Pagination<T>({
  table,
}: React.PropsWithChildren<{
  table: ReactTable<T>;
}>) {
  return (
    <div className="flex items-center gap-2">
      <IconButton
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronDoubleLeftIcon className={'h-5'} />
      </IconButton>

      <IconButton
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeftIcon className={'h-5'} />
      </IconButton>

      <IconButton
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRightIcon className={'h-5'} />
      </IconButton>

      <IconButton
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        <ChevronDoubleRightIcon className={'h-5'} />
      </IconButton>

      <span className="flex items-center gap-1 text-sm">
        <div>Page</div>

        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
    </div>
  );
}

export default Table;
