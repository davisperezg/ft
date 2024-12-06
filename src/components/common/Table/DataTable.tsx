import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  RowSelectionState,
  ColumnDef,
  Row,
  ColumnResizeMode,
  ColumnResizeDirection,
  VisibilityState,
} from "@tanstack/react-table";
import { useState, useMemo, useRef, UIEvent } from "react";
import type { TableProps } from "./types";
import { IoClose } from "react-icons/io5";
import { FaUndo } from "react-icons/fa";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { usePaginationStore } from "../../../store/zustand/pagination-zustand";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ExtendedColumnDef } from "@tanstack/react-table";

export function DataTable<T extends object>({
  data,
  columns: userColumns,
  isLoading,
  onRowClick,
  manualPagination = false,
  propsPagination,
  footerVisible = true,
  getItemsRemoves,
  getItemsRestores,
  sortDescFirst = true,
}: TableProps<T>) {
  const columnResizeMode = useState<ColumnResizeMode>("onEnd")[0];

  const columnResizeDirection = useState<ColumnResizeDirection>("ltr")[0];

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const pagination = usePaginationStore((state) => state.pagination);
  const setPagination = usePaginationStore((state) => state.setPagination);

  // Crear la columna de índice y combinarla con las columnas del usuario
  const columns = useMemo(() => {
    const indexColumn: ExtendedColumnDef<T> = {
      id: "index",
      header: () => <div className="text-center">#</div>,
      cell: ({ row, table }) => {
        let result = 0;
        // Obtener todas las filas ordenadas
        const sortedRows = table.getSortedRowModel().rows;
        // Encontrar el índice de la fila actual en las filas ordenadas
        const sortedIndex = sortedRows.findIndex(
          (sortedRow) => sortedRow.id === row.id
        );
        // Calcular el índice final considerando la paginación
        result = pagination.pageIndex * pagination.pageSize + sortedIndex + 1;
        return <div className="text-center">{result}</div>;
      },
      size: 28,
      minSize: 28,
    };

    const itemsColumns = userColumns.map((item) => ({
      ...item,
      sortDescFirst: sortDescFirst,
    }));

    return [indexColumn, ...itemsColumns];
  }, [userColumns, propsPagination]);

  const initialVisibleColumn: VisibilityState = columns.reduce(
    (acc: VisibilityState, item) => {
      const visible = item.visible === undefined ? true : item.visible;
      acc[String(item.id)] = visible;
      return acc;
    },
    {}
  );

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialVisibleColumn);

  const initialSortColumn: SortingState = columns.reduce(
    (acc: SortingState, item) => {
      if (item.sortDescFirst && initialVisibleColumn[String(item.id)]) {
        acc.push({ id: String(item.id), desc: item.sortDescFirst });
      }
      return acc;
    },
    []
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialSortColumn[0].id, desc: initialSortColumn[0].desc },
  ]);

  const indexClicked = columns.findIndex(
    (item) => item.id !== "index" && item.id !== "select"
  );
  const [clicked, setClicked] = useState<number>(indexClicked);
  //const [tableBody, setTableBody] = useState(270);
  const refHeader = useRef<HTMLDivElement>(null);
  const refBody = useRef<HTMLDivElement>(null);

  const rowCount = manualPagination ? propsPagination?.rowCount : data.length;

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      rowSelection,
      pagination,
      columnVisibility,
    },
    enableRowSelection: true, //enable row selection for all rows
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: manualPagination, // true si es paginacion del lado del servidor, false de lado del cliente
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableSortingRemoval: false,
    //pageCount: manualPagination, //calcula la cantidad de paginas
    rowCount: rowCount, // cantidad de filas
    autoResetPageIndex: false, // true la paginacion restablecera a la primera pagina cuando exista un cambio, false la paginacion se mantiene
  });

  const itemsSelecteds = table
    .getSelectedRowModel()
    .flatRows.map((a) => a.original) as any[];

  //const tamañoPantalla = window.innerWidth;

  const changeClicked = (index: number) => setClicked(index);

  const itemsCurrent = table.getRowModel().rows;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (typeof refHeader === "object") {
      if (refHeader.current) {
        refHeader.current.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;
      }
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: itemsCurrent.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => refBody.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  //   useEffect(() => {
  //     if (refBody.current) {
  //       const altTbody = refBody.current.offsetHeight;
  //       setTableBody(altTbody);

  //       const changeWindows = () => {
  //         if (refBody.current) {
  //           if (window.innerWidth !== tamañoPantalla) {
  //             const altTbody = refBody.current.offsetHeight;
  //             setTableBody(altTbody);
  //           }
  //         }
  //       };

  //       window.addEventListener("resize", changeWindows);

  //       return () => {
  //         window.removeEventListener("resize", changeWindows);
  //       };
  //     }
  //   }, [refBody]);

  return (
    <div className="flex flex-col flex-[1_1_auto] overflow-hidden border border-solid relative rounded-[4px]">
      {isLoading ? (
        <div className="flex h-full justify-center items-center">
          Por favor, espere, buscando...
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div ref={refHeader} className="flex flex-[0_0_auto] relative">
            <div className="float-left pr-[40px] text-default">
              <table
                className="border-r border-solid border-[#444]"
                {...{
                  style: {
                    width: table.getCenterTotalSize(),
                  },
                }}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => {
                    return (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header, i) => {
                          return (
                            <th
                              key={header.id}
                              className={`hover:!bg-selected border-r border-solid font-bold h-[24px] whitespace-nowrap align-middle text-left p-0 relative cursor-pointer`}
                              {...{
                                colSpan: header.colSpan,
                                style: {
                                  backgroundColor:
                                    clicked === i ? "#e2e2e2" : "#1723360A",
                                  width: header.getSize(),
                                  //opacity: isDragging ? 0.5 : 1,
                                },
                                onClick: () => {
                                  changeClicked(i);
                                },
                              }}
                            >
                              <div
                                {...{
                                  className: `${
                                    {
                                      asc: `before:content-['▲'] before:text-center before:text-default before:text-[7px] ${
                                        header.column.getIsSorted()
                                          ? "pl-[5px] flex items-center"
                                          : ""
                                      }`,
                                      desc: `before:content-['▼'] before:text-center before:text-default before:text-[7px] ${
                                        header.column.getIsSorted()
                                          ? "pl-[5px] flex items-center"
                                          : ""
                                      }`,
                                    }[header.column.getIsSorted() as string] ??
                                    ""
                                  } overflow-hidden`,
                                  style: {
                                    width: header.column.getSize(),
                                  },
                                  onClick:
                                    header.column.getToggleSortingHandler(),
                                }}
                              >
                                <div className="p-[5px] select-none">
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </div>
                              </div>
                              <div
                                {...{
                                  //   onDoubleClick: () =>
                                  //     header.column.resetSize(),
                                  onMouseDown: header.getResizeHandler(),
                                  onTouchStart: header.getResizeHandler(),
                                  className: `resizer ${
                                    table.options.columnResizeDirection
                                  } ${
                                    header.column.getIsResizing()
                                      ? "isResizing"
                                      : ""
                                  }`,
                                  style: {
                                    height:
                                      refBody?.current?.offsetHeight ?? "100%",
                                    zIndex: 1,
                                    transform:
                                      columnResizeMode === "onEnd" &&
                                      header.column.getIsResizing()
                                        ? `translateX(${
                                            (table.options
                                              .columnResizeDirection === "rtl"
                                              ? -1
                                              : 1) *
                                            (table.getState().columnSizingInfo
                                              .deltaOffset ?? 0)
                                          }px)`
                                        : "",
                                  },
                                }}
                              />
                            </th>
                          );
                        })}
                      </tr>
                    );
                  })}
                </thead>
              </table>
            </div>
          </div>
          {/* FIN HEADER */}

          {/* BODY */}
          <div
            onScroll={handleScroll}
            ref={refBody}
            className="flex-[1_1_auto] relative overflow-auto w-full select-text border-t-1  border-solid border-t border-b text-default"
          >
            <table
              {...{
                style: {
                  width: table.getCenterTotalSize(),
                  marginBottom: 10,
                },
              }}
            >
              <tbody
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                  position: "relative", //needed for absolute positioning of rows
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow, i) => {
                  const row = table.getRowModel().rows[
                    virtualRow.index
                  ] as Row<any>;

                  return (
                    <tr
                      data-index={virtualRow.index} //needed for dynamic row height measurement
                      ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                      style={{
                        backgroundColor: i % 2 !== 0 ? "#f5f5f5" : "#fff",
                        transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                      }}
                      key={row.id}
                      className={`absolute ${
                        !row.original.status
                          ? " text-borders cursor-default"
                          : "hover:!bg-bgDefaultAux"
                      }`}
                      // [#e2e2e2]
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td
                            key={cell.id}
                            className={`${
                              cell.id !== row.id + "_actions"
                                ? "border-r border-solid whitespace-nowrap  align-middle p-0 border-b overflow-hidden"
                                : "border-none bg-white select-none"
                            } ${
                              table.getState().columnSizingInfo.deltaOffset !==
                              null
                                ? "cursor-col-resize"
                                : !row.original.status
                                  ? ""
                                  : "cursor-pointer"
                            }`}
                            onClick={() => {
                              if (
                                row.original.status &&
                                cell.id !== row.id + "_select"
                              ) {
                                console.log("OPEN EDIT");
                                // dispatch({
                                //   type: "OPEN_EDIT",
                                //   payload: row.original,
                                // });
                                // openEdit && openEdit(true, row.original);
                              }
                            }}
                          >
                            <div
                              style={{
                                width: cell.column.getSize(),
                              }}
                              className="p-[4px]"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* FIN BODY */}

          {footerVisible && data.length > 0 && (
            <div className="bg-none overflow-hidden whitespace-nowrap relative flex-[0_0_auto] gap-2 flex items-center p-2">
              <div className="m-[6px_3px_6px_6px] float-left w-full whitespace-nowrap select-none">
                {getItemsRemoves && (
                  <div className="float-left bg-none h-[24px] m-[0_10px_0_0] align-middle whitespace-nowrap flex items-center">
                    <label
                      className={`${
                        itemsSelecteds.filter((a) => !a.status).length > 0 ||
                        itemsSelecteds.length === 0
                          ? "text-borders cursor-default"
                          : "text-danger cursor-pointer"
                      } text-[16px]`}
                      onClick={() => {
                        if (
                          itemsSelecteds.length > 0 &&
                          !itemsSelecteds.find((a) => !a.status)
                        ) {
                          if (getItemsRemoves) {
                            return getItemsRemoves(
                              table.getSelectedRowModel().flatRows
                            );
                          }
                        }
                      }}
                    >
                      <IoClose />
                    </label>
                  </div>
                )}

                {getItemsRestores && (
                  <div className="float-left bg-none h-[24px] m-[0_10px_0_0] align-middle whitespace-nowrap flex items-center">
                    <label
                      className={`${
                        itemsSelecteds.filter((a) => a.status).length > 0 ||
                        itemsSelecteds.length === 0
                          ? "text-borders cursor-default"
                          : "text-default cursor-pointer"
                      }`}
                      onClick={() => {
                        if (
                          itemsSelecteds.length > 0 &&
                          !itemsSelecteds.find((a) => a.status)
                        ) {
                          if (getItemsRestores) {
                            return getItemsRestores(
                              table.getSelectedRowModel().flatRows
                            );
                          }
                        }
                      }}
                    >
                      <FaUndo />
                    </label>
                  </div>
                )}
                <div className="float-left bg-none h-[24px] m-[0_5px_0_0] align-middle whitespace-nowrap">
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      table.setPageSize(value);
                    }}
                    className="border-solid border min-h-[24px] p-[0_18px_0_0.5rem] rounded-sm align-middle text-[14px] text-left indent-[0.01px] overflow-ellipsis bg-white bg-no-repeat bg-[url(https://cms.wialon.us/static/skin/misc/ddn.svg)] text-default outline-none appearance-none cursor-pointer bg-right"
                  >
                    {[10, 20, 50, 100].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="float-left bg-none h-[24px] m-[0_5px] align-middle whitespace-nowrap">
                  <button
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    className={`bg-transparent ${!table.getCanPreviousPage() ? "text-textDisabled cursor-pointer" : "text-default"} float-left w-[22px] h-[22px] border-0 overflow-hidden text-[14px] text-center pt-[2px] flex items-center justify-center`}
                  >
                    <MdKeyboardDoubleArrowLeft className="text-[24px]" />
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className={`bg-transparent ${!table.getCanPreviousPage() ? "text-textDisabled cursor-pointer" : "text-default"} float-left w-[22px] h-[22px] border-0 overflow-hidden text-[14px] text-center pt-[2px] flex items-center justify-center`}
                  >
                    <MdKeyboardArrowLeft className="text-[24px]" />
                  </button>
                  <div className="float-left bg-none text-default h-[24px] m-[0_5px] align-middle whitespace-nowrap">
                    <span className="relative overflow-visible">
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <b id="page" dir="auto" className="font-light">
                                Página
                              </b>
                            </td>
                            <td>
                              <input
                                className="border-solid border w-[63px] text-[14px] p-[0_5px] relative ml-[8px] mr-[8px] min-h-[24px] text-left resize-none outline-none rounded-sm"
                                type="number"
                                min="1"
                                max={table.getPageCount()}
                                value={
                                  table.getState().pagination.pageIndex + 1
                                }
                                // defaultValue={
                                //   table.getState().pagination.pageIndex + 1
                                // }
                                onChange={(e) => {
                                  const page = e.target.value
                                    ? Number(e.target.value) - 1
                                    : 0;
                                  if (page + 1 > table.getPageCount()) return;
                                  table.setPageIndex(page);
                                }}
                              />
                            </td>
                            <td dir="auto">
                              <b id="of" className="font-light">
                                de{" "}
                              </b>
                              <span>
                                {table.getPageCount().toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </span>
                  </div>
                  <div className="float-left bg-none text-default h-[24px] m-[0_5px] align-middle whitespace-nowrap">
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className={`bg-transparent ${!table.getCanNextPage() ? "text-textDisabled" : "text-default cursor-pointer"} float-left w-[22px] h-[22px] border-0 overflow-hidden text-[14px] text-center pt-[2px] flex items-center justify-center`}
                    >
                      <MdKeyboardArrowRight className="text-[24px] " />
                    </button>
                    <button
                      onClick={() => table.lastPage()}
                      disabled={!table.getCanNextPage()}
                      className={`bg-transparent ${!table.getCanNextPage() ? "text-textDisabled" : "text-default cursor-pointer"} float-left w-[22px] h-[22px] border-0 overflow-hidden text-[14px] text-center pt-[2px] flex items-center justify-center`}
                    >
                      <MdKeyboardDoubleArrowRight className="text-[24px] " />
                    </button>
                  </div>
                  <div className="float-left bg-none text-default h-[24px] m-[0_5px] align-middle text-[14px] flex items-center justify-center">
                    <label>
                      Mostrando de{" "}
                      {table.getState().pagination.pageSize *
                        table.getState().pagination.pageIndex +
                        1}{" "}
                      a{" "}
                      {table.getState().pagination.pageSize *
                        table.getState().pagination.pageIndex +
                        itemsCurrent.length}{" "}
                      de {rowCount} elementos.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
