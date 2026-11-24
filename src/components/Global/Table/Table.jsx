import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import icons from "~/assets/js/icons";
import { classNames } from "~/utilities/classNames";
import Button from "../Button/Button";
import Loading from "../Loading/Loading";

function IndeterminateCheckbox({ indeterminate, className = "", ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return <input type="checkbox" ref={ref} className={className + " cursor-pointer h-4 w-4 accent-primary"} {...rest} />;
}

const Table = ({
  tableData,
  tableColumns, // Array of objects ({ header: required, accessor: required }) to use as column title, key, and control the display
  enableRowSelection, // set as true if you need to select rows, use onRowSelectionChange to handle selectedRows
  onRowSelectionChange = console.log, // function to handle selectedRows - contains selectedRows as a parameter
  onRowClick,
  loading,
  searchFilter, // state for your search query,
  setSearchFilter, // function that sets the state of your search query
  serverSidePagination, // set true to control pagination with server
  showPagination = true, // set false to hide pagination row
  currentPage = 1, // current page in pagination
  perPage = 10, // number of items per page
  perPageOptions = [10, 25, 50, 100], // Array of numbers to use as select options to control perPage
  totalPageCount = -1, // total number of pages
  totalItemsCount, // total number of items in the data
  onPaginationChange = console.log, // function to handle pagination change - contains the object {perPage: number, currentPage: number } as parameters
}) => {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: currentPage - 1,
    pageSize: perPage,
  });

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  const data = useMemo(() => {
    if (!tableData || !Array.isArray(tableData)) return [];
    else return tableData;
  }, [tableData]);

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("select", {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
            className: "accent-white",
          }}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      ),
      enableSorting: false,
    }),
    ...tableColumns.map(({ header, accessor, cell: Cell, enableSorting = true }) =>
      columnHelper.accessor(accessor, {
        header,
        cell: (info) => (Cell ? <Cell {...info} /> : info.getValue()),
        enableSorting,
      })
    ),
  ];

  const table = useReactTable({
    data,
    columns: enableRowSelection ? columns : columns.slice(1),
    state: { sorting, rowSelection, pagination, globalFilter: searchFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setSearchFilter,
    enableRowSelection,
    ...(serverSidePagination ? { pageCount: totalPageCount } : { getPaginationRowModel: getPaginationRowModel() }),
    onRowSelectionChange: setRowSelection,
    manualPagination: serverSidePagination,
    onPaginationChange: setPagination,
  });

  useEffect(() => {
    if (serverSidePagination) {
      onPaginationChange({ currentPage: pagination.pageIndex + 1, perPage: pagination.pageSize });
    }
  }, [pagination, onPaginationChange, serverSidePagination]);

  useEffect(() => {
    if (enableRowSelection) {
      const selected = Object.keys(rowSelection).map((idx) => data[idx]);
      onRowSelectionChange(selected);
    }
  }, [data, rowSelection, enableRowSelection, onRowSelectionChange]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center px-6 py-20">
          <Loading height={64} width={64} className="text-primary" />
        </div>
      ) : table.getRowModel().rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full" border={0}>
            <thead className="border-t border-b-2 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <span
                          {...{
                            className: classNames(
                              header.column.getCanSort() && "cursor-pointer",
                              "flex gap-2 items-center select-none py-3 px-3",
                              "text-sm font-semibold text-capitalize"
                            ),
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort()
                            ? {
                                asc: icons.ascending,
                                desc: icons.descending,
                                false: icons.sort,
                              }[header.column.getIsSorted()]
                            : null}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="relative">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "border-b border-b-gray-200 last:border-b-0",
                    (enableRowSelection || onRowClick) && "hover:bg-primary/5 cursor-pointer",
                    row.getIsSelected() && "bg-primary/5"
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : () => {}}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-4 px-3 text-sm min-w-fit">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 flex justify-center">
          <div className="w-full max-w-[360px] text-center">
            <span
              className={classNames(
                "flex items-center justify-center text-primary text-2xl",
                "size-14 mx-auto rounded-full bg-onPrimaryContainer"
              )}
            >
              {icons.file}
            </span>

            <h3 className="font-bold text-primary mb-1 text-lg mt-2">No Data Available</h3>
            <p className=" text-sm text-gray-600 mb-6">There are currently no data to display for this table</p>
          </div>
        </div>
      )}

      {table.getRowModel().rows.length && showPagination ? (
        <div className="flex flex-col-reverse md:flex-row justify-between md:items-center gap-3 py-4 px-4 border-t">
          <label className="inline-flex gap-2 items-center text-sm font-semibold text-gray-600">
            Entries per page
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className={classNames(
                "bg-primary/10 border border-gray-300 rounded-md block min-w-max text-sm font-normal px-2 py-1.5 cursor-pointer",
                "focus:ring focus:ring-primary/20 focus:outline-none focus:bg-white focus:border-transparent transition-all"
              )}
            >
              {perPageOptions.map((page) => (
                <option key={page} value={page} color="red">
                  {page}
                </option>
              ))}
            </select>
          </label>
          {/* pagination buttons */}
          <div className="ml-auto md:ml-0 flex items-center gap-1 text-ink">
            <Button
              icon={icons.chevronLeft}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outlined"
              small
            />
            <span className="mx-2 text-sm">
              <b>
                {table.getState().pagination.pageIndex > 0
                  ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
                  : table.getState().pagination.pageIndex + 1}
              </b>{" "}
              -{" "}
              <b>
                {(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize <
                (serverSidePagination ? totalItemsCount : tableData.length)
                  ? (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize
                  : serverSidePagination
                    ? totalItemsCount
                    : tableData.length}
              </b>{" "}
              of <b>{serverSidePagination ? totalItemsCount : tableData.length}</b>
            </span>
            <Button
              icon={icons.chevronRight}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outlined"
              small
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Table;
