import { Row } from "@tanstack/react-table";
import { Table, flexRender } from "@tanstack/react-table";
import {
  ReactNode,
  UIEvent,
  memo,
  useEffect,
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

import { Cell } from "@tanstack/react-table";
import useSize from "../../../hooks/useSize";
import { useReactTable } from "@tanstack/react-table";
import { ExtendedColumnDef } from "@tanstack/react-table";

interface Props<T extends object> {
  table: Table<T>;
}

interface PropsTBody<T extends object> {
  table: Table<T>;
}

interface PropsTableCell<T extends object> {
  cell: Cell<T, unknown>;
  row: Row<T>;
}

const LiveRegionStyler = () => {
  useEffect(() => {
    const polite = document.querySelectorAll<HTMLDivElement>("#-live-region");
    polite.forEach((item) => {
      item.style.width = "0px";
    });

    // Función para aplicar estilos
    const applyStyles = (element: HTMLElement) => {
      element.style.width = "0px";
    };

    // Configurar el MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.id === "-live-region") {
              applyStyles(node);
            }
          });
        }
      });
    });

    // Observar el cuerpo del documento
    const targetNode = document.body;
    observer.observe(targetNode, {
      childList: true, // Observar cambios en los hijos directos
      subtree: true, // Observar todos los descendientes
    });

    // Limpiar el observador al desmontar el componente
    return () => observer.disconnect();
  }, []);

  return null; // Este componente no renderiza nada
};

//https://tanstack.com/table/latest/docs/guide/column-ordering#reordering-columns
function TableCell<T extends object>({ cell, row }: PropsTableCell<T>) {
  return (
    <td
      {...{
        id: cell.column.id,
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
        {flexRender(cell.column.columnDef.cell, cell.getContext()) as ReactNode}
      </div>
    </td>
  );
}

function TableBody<T extends object>({ table }: PropsTBody<T>) {
  return (
    <>
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
              return (
                <td
                  key={cell.id}
                  {...{
                    id: cell.column.id,
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
                    {
                      flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      ) as ReactNode
                    }
                  </div>
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

//https://github.com/TanStack/table/discussions/5558#discussioncomment-10095814
export function DataTable2<T extends object>({ table: table2 }: Props<T>) {
  const columns = useMemo(() => {
    const indexColumn: ExtendedColumnDef<T> = {
      id: "index",
      header: () => <div className="text-center w-full">#</div>,
      cell: ({ row }) => {
        let result = 0;

        // Obtener todas las filas ordenadas
        const sortedRows = table2.getSortedRowModel().rows;

        // Encontrar el índice de la fila actual en las filas ordenadas
        const sortedIndex = sortedRows.findIndex(
          (sortedRow) => sortedRow.id === row.id
        );

        // Calcular el índice final considerando la paginación
        result =
          table2.getState().pagination.pageIndex *
            table2.getState().pagination.pageSize +
          sortedIndex +
          1;

        return <div className="text-center w-full">{result}</div>;
      },
      size: 28,
      minSize: 28,
    };

    return [indexColumn, ...table2.options.columns];
  }, [
    table2.options.columns,
    table2.getSortedRowModel().rows,
    table2.getState().pagination.pageIndex,
    table2.getState().pagination.pageSize,
  ]);

  const table = useReactTable({
    ...table2.options,
    data: table2.options.data,
    columns: columns,
    state: {
      ...table2.options.state,
    },
  });

  const indexClicked = columns.findIndex(
    (item) => item.id !== "index" && item.id !== "select"
  );
  const [clicked, setClicked] = useState<number>(indexClicked);
  const [showOptions, setShowOptions] = useState(false);
  const refHeader = useRef<HTMLDivElement>(null);
  const refResizer = useRef<HTMLDivElement>(null);
  const refBody = useRef<HTMLDivElement>(null);
  const refSizeHeader = useRef<HTMLTableElement>(null);
  const refShowColumns = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState(0);
  const windowsize = useSize();
  const [resizing, setResizing] = useState(false);
  const [resizerId, setResizerId] = useState("");

  const changeClicked = (index: number) => {
    setClicked(index);
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const scrollLeft = Number(e.currentTarget.scrollLeft) ?? 0;
    if (refHeader.current && refResizer.current) {
      // Actualizar el transform del header y del resizer
      refHeader.current.style.transform = `translateX(-${scrollLeft}px)`;
      refResizer.current.style.transform = `translateX(-${scrollLeft}px)`;
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
      colSizes[`--resizer-${header.id}-size`] = header.getSize();
    }

    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  const itemsSelecteds = table
    .getSelectedRowModel()
    .flatRows.map((a) => a.original) as any[];

  const withShowOpts = useMemo(() => {
    if (
      refShowColumns.current &&
      showOptions &&
      refSizeHeader.current &&
      refHeader.current
    ) {
      const widthViewport = window.innerWidth;
      const widthShowOpt = refShowColumns.current.offsetWidth;

      const allTh = refSizeHeader.current.querySelectorAll("th");
      const widthHeader = refHeader.current.clientWidth;
      const widthTotalTh = Array.from(allTh)
        .map((item) => item.getBoundingClientRect().width)
        .reduce((acc, item) => acc + item, 0);

      if (widthShowOpt > widthTotalTh) {
        return {
          left: widthTotalTh - 28,
          right: "auto",
        };
      } else if (widthTotalTh > widthViewport) {
        return {
          left: "auto",
          right: 0,
        };
      } else if (widthTotalTh < widthHeader) {
        return {
          left: widthTotalTh - widthShowOpt,
          right: "auto",
        };
      } else {
        return {
          left: "auto",
          right: 0,
        };
      }
    }

    return {
      left: "auto",
      right: "auto",
    };
  }, [
    refShowColumns.current,
    showOptions,
    refSizeHeader.current,
    refHeader.current,
  ]);

  useEffect(() => {
    if (windowsize || resizing) {
      const timer = setTimeout(() => {
        if (refBody.current && refHeader.current) {
          const clientHeightBody = refBody.current.clientHeight;
          const clientHeightHead = refHeader.current.clientHeight;
          setBodyHeight(clientHeightBody + clientHeightHead);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [windowsize, refBody.current?.offsetWidth, resizing]);

  return (
    <div
      {...{
        style: {
          ...columnSizeVars,
        },
      }}
      className="flex flex-col flex-[1_1_auto] overflow-hidden border border-solid relative rounded-[4px]"
    >
      <LiveRegionStyler />
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
          <div ref={refResizer} className="z-[2] flex flex-[0_0_auto] relative">
            <div className="float-left pr-[40px] text-default">
              <table
                className="table border-none"
                {...{
                  style: {
                    width: table.getCenterTotalSize(),
                  },
                }}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => {
                    return (
                      <tr key={headerGroup.id} className="flex">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className="relative flex whitespace-nowrap p-0"
                          >
                            <div
                              {...{
                                style: {
                                  width: `calc(var(--resizer-${header?.id}-size) * 1px`,
                                },
                              }}
                            >
                              {header.column.getCanResize() && (
                                <div
                                  className={`${resizerId === header.id ? "isResizing" : "resizer"} absolute top-0 right-0 w-[5px] bg-none cursor-col-resize touch-none select-none`}
                                  {...{
                                    style: {
                                      zIndex: 2,
                                      height: bodyHeight,
                                      display: "block",
                                    },
                                    onMouseDown: (e) => {
                                      e.stopPropagation();
                                      // Usar la referencia del evento actual
                                      const refTableHead = refHeader.current;
                                      const refTableBody = refBody.current;
                                      const refTableResizer =
                                        refResizer.current;
                                      const resizer = e.currentTarget;
                                      const getWidthCol =
                                        refTableHead?.style.getPropertyValue(
                                          `--header-${header?.id}-size`
                                        );

                                      const currenSize = getWidthCol
                                        ? parseInt(getWidthCol)
                                        : Number(header.getSize());

                                      // Variables para el arrastre
                                      let isDragging = true;
                                      let deltaX = 0;
                                      setResizing(true);
                                      setResizerId(header.id);

                                      const startX = e.clientX;
                                      const currentLeft = currenSize;

                                      // Función de movimiento del ratón
                                      const onMouseMove = (moveEvent: any) => {
                                        moveEvent.stopPropagation();
                                        if (!isDragging) return;

                                        // Calcular el nuevo left en tiempo real
                                        deltaX = moveEvent.clientX - startX;
                                        const newLeft = currentLeft + deltaX;
                                        resizer.style.left = `${newLeft}px`;
                                      };

                                      // Función de soltar el ratón
                                      const onMouseUp = () => {
                                        // Detener el arrastre
                                        isDragging = false;
                                        setResizing(false);
                                        setResizerId("");

                                        refTableHead?.style.setProperty(
                                          `--header-${header.id}-size`,
                                          `${currenSize + deltaX}`,
                                          "important"
                                        );

                                        // Actualizar el width del table body
                                        refTableBody?.style.setProperty(
                                          `--col-${header.id}-size`,
                                          `${currenSize + deltaX}`,
                                          "important"
                                        );

                                        refTableResizer?.style.setProperty(
                                          `--resizer-${header.id}-size`,
                                          `${currenSize + deltaX}`,
                                          "important"
                                        );

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
                                      document.addEventListener(
                                        "mousemove",
                                        onMouseMove
                                      );
                                      document.addEventListener(
                                        "mouseup",
                                        onMouseUp
                                      );
                                    },
                                  }}
                                ></div>
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
          {/* FIN RESIZING */}

          {/* HEADER */}
          <div ref={refHeader} className="z-[1] flex flex-[0_0_auto] relative">
            <div className="float-left pr-[40px] text-default">
              <table
                ref={refSizeHeader}
                className="table border-none"
                {...{
                  style: {
                    width: table.getCenterTotalSize(),
                  },
                }}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => {
                    return (
                      <tr
                        className="flex"
                        key={headerGroup.id}
                        onDragOver={(event) => {
                          event.preventDefault();
                        }}
                        onDrop={(event) => {
                          // Prevenir el comportamiento por defecto del navegador
                          event.preventDefault();
                          const target = event.target as HTMLElement;

                          if (
                            target.closest("th")?.id === "show_columns" ||
                            target.closest("th")?.id === "acciones" ||
                            resizing
                          )
                            return;

                          // Recuperar el ID de la columna que se está arrastrando
                          const draggedColumnId =
                            event.dataTransfer.getData("columnId");
                          // Obtener todas las columnas de la tabla
                          const currentColumns = table.getAllLeafColumns();

                          // Encontrar el índice de la columna que se está arrastrando
                          const draggedColumnIndex = currentColumns.findIndex(
                            (column) => column.id === draggedColumnId
                          );

                          // Encontrar el índice de la columna donde se suelta (objetivo)
                          const targetColumnIndex = currentColumns.findIndex(
                            (column) => column.id === target.closest("th")?.id
                          );

                          // Verificar que ambos índices sean válidos
                          if (
                            draggedColumnIndex !== -1 &&
                            targetColumnIndex !== -1
                          ) {
                            // Reordenar columnas
                            const newColumnOrder = [...currentColumns];

                            // Intercambiar las columnas
                            [
                              newColumnOrder[draggedColumnIndex],
                              newColumnOrder[targetColumnIndex],
                            ] = [
                              newColumnOrder[targetColumnIndex],
                              newColumnOrder[draggedColumnIndex],
                            ];

                            // Actualizar el orden de las columnas
                            table.setColumnOrder(
                              newColumnOrder.map((col) => col.id)
                            );
                          }
                        }}
                      >
                        {headerGroup.headers.map((header) => {
                          return (
                            <th
                              id={header.id}
                              key={header.id}
                              colSpan={header.colSpan}
                              draggable={
                                header.id !== "show_columns" &&
                                header.id !== "acciones" &&
                                !resizing
                              }
                              onDragStart={(event) => {
                                event.dataTransfer.setData(
                                  "columnId",
                                  header.id
                                );
                              }}
                              className="relative flex hover:!bg-[#e2e2e2] cursor-pointer h-[28px] whitespace-nowrap p-0 text-left font-[500]"
                              {...{
                                style: {
                                  backgroundColor:
                                    clicked === header.index
                                      ? "#e2e2e2"
                                      : "#EDEDEF",
                                },
                              }}
                            >
                              {/* `calc(var(--header-${header?.id}-size) * 1px` */}
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
                                    }[header.column.getIsSorted() as string] ??
                                    ""
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
                                    } else if (header.id === "show_columns") {
                                      setShowOptions(!showOptions);
                                    } else {
                                    }
                                  },
                                  onMouseOut: (_) => {
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
                                  : (flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    ) as ReactNode)}
                              </div>
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
            ref={refBody}
            onScroll={handleScroll}
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
                        return (
                          <TableCell cell={cell} row={row} key={cell.id} />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
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
