import { HeaderGroup, Row } from "@tanstack/react-table";
import { Table, flexRender } from "@tanstack/react-table";
import {
  UIEvent,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaUndo } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { Header } from "@tanstack/react-table";
import { dropOrSwap, state } from "@formkit/drag-and-drop";
import { Cell } from "@tanstack/react-table";
import { number } from "yup";

interface Props<T extends object> {
  table: Table<T>;
}

interface PropsTBody<T extends object> {
  table: Table<T>;
}

interface PropsHead<T extends object> {
  headerGroup: HeaderGroup<T>;
  changeClicked: (index: number) => void;
  table: Table<T>;
  clicked: number;
}

interface PropsHeadItem<T extends object> {
  header: Header<T, unknown>;
  clicked: number;
  changeClicked: (index: number) => void;
  table: Table<T>;
}

interface PropsTableCell<T extends object> {
  cell: Cell<T, unknown>;
  row: Row<T>;
}

//https://tanstack.com/table/latest/docs/guide/column-ordering#reordering-columns
function HeadItem<T extends object>({
  header,
  clicked,
  changeClicked,
  table,
}: PropsHeadItem<T>) {
  state.on("dragStarted", () => {
    const value = state.activeState?.node.data.value as any;
    table.setSorting([
      {
        id: value.id,
        desc: true,
      },
    ]);
  });

  return (
    <th
      {...{
        key: header.id,
        colSpan: header.colSpan,
        className: `relative flex hover:!bg-selected cursor-pointer h-[28px] whitespace-nowrap overflow-hidden p-0 text-left font-[500]`,
      }}
    >
      <div
        {...{
          className: `${
            {
              asc: `before:content-['▲'] before:text-center before:text-default before:text-[7px] ${
                header.column.getIsSorted() ? "pl-[5px] flex items-center" : ""
              }`,
              desc: `before:content-['▼'] before:text-center before:text-default before:text-[7px] ${
                header.column.getIsSorted() ? "pl-[5px] flex items-center" : ""
              }`,
            }[header.column.getIsSorted() as string] ?? ""
          } overflow-hidden px-[5px] flex items-center ${clicked === header.index ? "" : "border-r"}`,
          onClick: (e) => {
            if (header.id !== "actions" && header.id !== "acciones") {
              header.column.getToggleSortingHandler()?.(e);
              changeClicked(header.index);
              //console.log(table.options);
            }
          },
          style: {
            width: header.getSize(),
            backgroundColor: clicked === header.index ? "#e2e2e2" : "#1723360A",
          },
        }}
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </th>
  );
}

function Head<T extends object>({
  headerGroup,
  changeClicked,
  table,
  clicked,
}: PropsHead<T>) {
  const [parent, items] = useDragAndDrop<
    HTMLTableRowElement,
    Header<T, unknown>
  >(headerGroup.headers, {
    onDragend: (dragContext) => {
      table.setColumnOrder(dragContext.values.map((item: any) => item.id));
    },
    onDragstart: (dragContext) => {
      const value = dragContext.draggedNode.data.value as any;
      changeClicked(value.index);
    },
    plugins: [
      dropOrSwap({
        shouldSwap: () => false,
      }),
    ],
  });

  return (
    <tr ref={parent} className="flex">
      {items.map((header) => {
        return (
          <HeadItem
            key={header.id}
            header={header}
            clicked={clicked}
            changeClicked={changeClicked}
            table={table}
          />
        );
      })}
    </tr>
  );
}

function TableCell<T extends object>({ cell, row }: PropsTableCell<T>) {
  return (
    <td
      {...{
        className: `overflow-hidden flex whitespace-nowrap  align-middle p-0`,
      }}
    >
      <div
        {...{
          className: `flex items-center p-[4px] ${
            cell.id !== row.id + "_show_columns"
              ? "border-r border-solid border-b "
              : "border-none bg-white select-none"
          }`,
          style: {
            width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
          },
        }}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </td>
  );
}

function TableBody<T extends object>({ table }: PropsTBody<T>) {
  return (
    <tbody>
      {table.getRowModel().rows.map((row: Row<any>, i) => {
        return (
          <tr
            key={row.id}
            style={{
              backgroundColor: i % 2 !== 0 ? "#f5f5f5" : "#fff",
            }}
            className={`flex ${
              !row.original.status
                ? " text-borders cursor-default"
                : "hover:!bg-bgDefaultAux"
            }`}
          >
            {row.getVisibleCells().map((cell) => {
              return <MemoizedTableCell cell={cell} row={row} key={cell.id} />;
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

export function DataTable2<T extends object>({ table }: Props<T>) {
  const indexClicked = table.options.columns.findIndex(
    (item) => item.id !== "index" && item.id !== "select"
  );
  const [clicked, setClicked] = useState<number>(indexClicked);
  const [showOptions, setShowOptions] = useState(false);
  const changeClicked = (index: number) => setClicked(index);

  const refHeader = useRef<HTMLDivElement>(null);
  const refBody = useRef<HTMLDivElement>(null);
  const refSizeHeader = useRef<HTMLDivElement>(null);
  const refShowColumns = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (typeof refHeader === "object") {
      if (refHeader.current) {
        refHeader.current.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;
      }
    }
  };

  const { rows } = table.getRowModel();

  /**
   * Instead of calling `column.getSize()` on every render for every header
   * and especially every data cell (very expensive),
   * we will calculate all column sizes at once at the root table level in a useMemo
   * and pass the column sizes down as CSS variables to the <table> element.
   */
  const columnSizeVars = useMemo(() => {
    const headers = table.getAllLeafColumns();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.id}-size`] = header.getSize();
    }
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  const itemsSelecteds = table
    .getSelectedRowModel()
    .flatRows.map((a) => a.original) as any[];

  const withShowOpts = useMemo(() => {
    if (refShowColumns.current && showOptions && refSizeHeader.current) {
      const centerTotalSize = table.getCenterTotalSize();
      const viewportWidth = window.innerWidth;
      const showTable = refSizeHeader.current.getBoundingClientRect();

      // Si no hay suficiente espacio a la derecha, posicionar a la izquierda
      if (showTable.right > viewportWidth) {
        return {
          left: "auto",
          right: 0,
        };
      }

      // Por defecto, mantener la posición actual
      return {
        left: centerTotalSize - 28,
        right: "auto",
      };
    }

    return {
      left: 0,
      right: 0,
    };
  }, [refShowColumns.current, showOptions, refSizeHeader.current]);

  const [heightTable, setHeightTable] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      if (refBody.current && refHeader.current) {
        setHeightTable(
          refBody.current.offsetHeight + refHeader.current.offsetHeight
        );
      } else {
        setHeightTable(0);
      }
    };

    // Calcular al montar
    calculateHeight();

    // Recalcular al cambiar el tamaño de la ventana
    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, [refBody, refHeader]); // Dependencias

  const [clickResizing, setClickResizing] = useState(false);
  const [resizing, setResizing] = useState<{ [key: string]: number }>({});

  useLayoutEffect(() => {
    if (table) {
      const headers = table.getAllLeafColumns();
      const sizing: { [key: string]: number } = {};
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]!;
        if (header.getCanResize()) {
          sizing[header.id] =
            Number(header.getStart()) + Number(header.getSize());
        }
      }
      setResizing(sizing);
    }
  }, [table]);

  return (
    <div
      {...{
        style: {
          ...columnSizeVars,
        },
      }}
      className="flex flex-col flex-[1_1_auto] overflow-hidden border border-solid relative rounded-[4px]"
    >
      {table.options.enableLoading ? (
        <div className="flex h-full justify-center items-center">
          Por favor, espere, buscando...
        </div>
      ) : (
        <>
          {/* SELECTION SHOW COLUMN */}
          <div
            ref={refShowColumns}
            className="flex-[0_0_auto] z-[11] absolute overflow-x-hidden overflow-y-auto max-h-[300px] float-left shadow-[0_1px_5px_rgba(0,0,0,.3)] bg-white"
            style={{
              height: "auto",
              width: "auto",
              whiteSpace: "nowrap",
              left: withShowOpts.left,
              right: withShowOpts.right,
              visibility: showOptions ? "visible" : "hidden",
              top: 25.5,
            }}
          >
            {table.getAllLeafColumns().map((column, i) => {
              if (column.getCanHide()) {
                const headerFn = column.columnDef.header;
                let result = "";
                if (typeof headerFn === "function") {
                  const headerElement = headerFn as any;
                  const childrenValue = headerElement().props.children;
                  result = childrenValue;
                } else {
                  result = column.columnDef.header as string;
                }

                return (
                  <div
                    key={column.id}
                    className={`cursor-pointer p-[8px] hover:bg-[#EDEDEF] ${i === 0 ? "mt-1" : ""}`}
                  >
                    <label className="select-none block pl-[15px] indent-[-15px] cursor-pointer">
                      <input
                        {...{
                          type: "checkbox",
                          checked: column.getIsVisible(),
                          onChange: column.getToggleVisibilityHandler(),
                          style: {
                            overflow: "hidden",
                            top: "-4px",
                            position: "relative",
                            verticalAlign: "bottom",
                            cursor: "pointer",
                          },
                        }}
                      />
                      <span className="m-[5px]">{result}</span>
                    </label>
                  </div>
                );
              }
            })}
          </div>
          {/* FIN SELECTION SHOW COLUMN */}

          {/* RESIZING */}
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <div
                key={headerGroup.id}
                className="top-[1px] flex-[0_0_auto] overflow-visible absolute z-[2]"
              >
                {headerGroup.headers.map((header) => {
                  if (header.column.getCanResize()) {
                    //hover:bg-primary absolute top-0 right-0 w-[5px] bg-none cursor-col-resize touch-none select-none
                    return (
                      <div
                        id={header.id}
                        key={header.id}
                        className={` bg-primary absolute top-0 right-0 w-[5px] bg-none cursor-col-resize touch-none select-none`}
                        {...{
                          style: {
                            zIndex: 2,
                            height: 100,
                            left: resizing[header.id],
                            display: "block",
                          },
                          onMouseDown: (e) => {
                            // Prevenir selección de texto
                            e.preventDefault();

                            // Usar la referencia del evento actual
                            const resizer = e.currentTarget;
                            const refTableHead = refHeader.current;
                            const refTableBody = refBody.current;

                            // Variables para el arrastre
                            let isDragging = true;
                            let newLeft = 0;
                            let deltaX = 0;

                            const startX = e.clientX;
                            const currentLeft = parseInt(
                              resizer.style.left || "0"
                            );

                            // Función de movimiento del ratón
                            const onMouseMove = (moveEvent) => {
                              if (!isDragging) return;

                              // Calcular el nuevo left en tiempo real
                              deltaX = moveEvent.clientX - startX;
                              newLeft = currentLeft + deltaX;

                              // Actualizar la posición left inmediatamente
                              resizer.style.left = `${newLeft}px`;
                            };

                            // Función de soltar el ratón
                            const onMouseUp = () => {
                              // Detener el arrastre
                              isDragging = false;

                              // Obtener el nuevo ancho basado en el left final
                              const newWidth =
                                parseInt(resizer.style.left || "0") -
                                Number(header.getStart());

                              // Actualizar el width del table header
                              refTableHead?.style.setProperty(
                                `--header-${header?.id}-size`,
                                `${newWidth}`,
                                "important"
                              );

                              // Actualizar el width del table body
                              refTableBody?.style.setProperty(
                                `--col-${header?.id}-size`,
                                `${newWidth}`,
                                "important"
                              );

                              console.log(resizing, newLeft, deltaX);

                              setResizing((old) => {
                                const keys = Object.keys(old);
                                const startIndex = keys.indexOf(header.id);

                                const updatedObject = {
                                  ...old,
                                  ...Object.fromEntries(
                                    keys
                                      .slice(startIndex)
                                      .map((key) => [key, old[key] + deltaX])
                                  ),
                                };

                                return updatedObject;
                              });

                              // Remover listeners globales
                              document.removeEventListener(
                                "mousemove",
                                onMouseMove
                              );
                              document.removeEventListener(
                                "mouseup",
                                onMouseUp
                              );
                            };

                            // Añadir listeners globales de documento
                            document.addEventListener("mousemove", onMouseMove);
                            document.addEventListener("mouseup", onMouseUp);
                          },
                          //onMouseUp: header.getResizeHandler(),
                          //onMouseDown: header.getResizeHandler(),
                          //onTouchStart: header.getResizeHandler(),
                        }}
                      />
                    );
                  }
                })}
              </div>
            );
          })}
          {/* RESIZING */}

          {/* HEADER */}
          <div ref={refHeader} className="flex flex-[0_0_auto] relative">
            <div
              ref={refSizeHeader}
              className="float-left pr-[40px] text-default"
            >
              <table
                {...{
                  style: {
                    width: table.getCenterTotalSize(),
                  },
                }}
                className="table border-none"
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => {
                    return (
                      <tr key={headerGroup.id} className="flex">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            {...{
                              style: {
                                backgroundColor:
                                  clicked === header.index
                                    ? "#e2e2e2"
                                    : "#EDEDEF",
                              },
                              className: `relative flex hover:!bg-[#e2e2e2] cursor-pointer h-[28px] whitespace-nowrap overflow-hidden p-0 text-left font-[500]`,
                            }}
                          >
                            <div
                              {...{
                                style: {
                                  width: `calc(var(--header-${header?.id}-size) * 1px`,
                                },
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
                                  }[header.column.getIsSorted() as string] ?? ""
                                } select-none overflow-hidden px-[5px] flex items-center ${clicked === header.index ? "" : "border-r"}`,
                                onClick: (e) => {
                                  if (
                                    header.id !== "show_columns" &&
                                    header.id !== "acciones"
                                  ) {
                                    header.column.getToggleSortingHandler()?.(
                                      e
                                    );
                                    changeClicked(header.index);
                                    //console.log(table.options);
                                  } else if (header.id === "show_columns") {
                                    setShowOptions(!showOptions);
                                  } else {
                                  }
                                },
                                onMouseOut: () => {
                                  if (header.id === "show_columns") {
                                    if (showOptions) {
                                      document.onmouseover = function (e) {
                                        if (
                                          refShowColumns.current &&
                                          refShowColumns.current.contains(
                                            e.target as null
                                          )
                                        ) {
                                          setShowOptions(true);
                                        } else {
                                          setShowOptions(false);
                                          document.onmouseover = null;
                                        }
                                      };
                                    }
                                  }
                                },
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </div>
                          </th>
                        ))}
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
                  //width: table.getCenterTotalSize(),
                  marginBottom: 10,
                },
              }}
            >
              {table.getState().columnSizingInfo.isResizingColumn ? (
                <MemoizedTableBody table={table} />
              ) : (
                <TableBody table={table} />
              )}
            </table>
          </div>
          {/* FIN BODY */}

          {/* FOOTER */}
          {table.options.enableFooter && table.options.data.length > 0 && (
            <div className="bg-none overflow-hidden whitespace-nowrap relative flex-[0_0_auto] gap-2 flex items-center p-2">
              <div className="m-[6px_3px_6px_6px] float-left w-full whitespace-nowrap select-none">
                {table.options.acciones && (
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
                          return table.options.getItemsRemoves?.(
                            table.getSelectedRowModel().flatRows
                          );
                        }
                      }}
                    >
                      <IoClose />
                    </label>
                  </div>
                )}

                {table.options.acciones && (
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
                          return table.options.getItemsRestores?.(
                            table.getSelectedRowModel().flatRows
                          );
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
                        rows.length}{" "}
                      de {table.getRowCount()} elementos.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* FIN FOOTER */}
        </>
      )}
    </div>
  );
}

//special memoized wrapper for our table body that we will use during column resizing
export const MemoizedTableBody = memo(
  TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data
) as typeof TableBody;

//special memoized wrapper for our table body that we will use during column resizing
export const MemoizedTableCell = memo(
  TableCell,
  (prev, next) => prev.cell.row.original === next.cell.row.original
) as typeof TableCell;
