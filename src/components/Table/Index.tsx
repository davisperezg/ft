import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  Row,
  Header,
  Cell,
  flexRender,
  getSortedRowModel,
  ColumnResizeMode,
  SortingState,
  PaginationState,
  ColumnOrderState,
  Column,
} from "@tanstack/react-table";
import { getPaginationRowModel, Table } from "@tanstack/table-core";
import {
  Dispatch,
  RefObject,
  UIEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDrop, useDrag } from "react-dnd";
import { useVirtual } from "react-virtual";
import { ModalContext } from "../../context/modalContext";

interface ITHeadItemProps<T> {
  header: Header<T, unknown>;
  refElement1: RefObject<HTMLTableCellElement>;
  refElement2: RefObject<HTMLDivElement>;
  refContentTHeader: RefObject<HTMLDivElement>;
  setShowOptions: Dispatch<React.SetStateAction<boolean>>;
  showOptions: boolean;
  table: Table<T>;
  isClicked: boolean;
  changeClicked: () => void;
  setSpacing: Dispatch<React.SetStateAction<boolean>>;
  setScrolled: Dispatch<React.SetStateAction<boolean>>;
  setLeftTable: Dispatch<React.SetStateAction<number>>;
  refContentTBody: RefObject<HTMLDivElement>;
}

interface ITBodyItemProps<T> {
  cell: Cell<any, unknown>;
  row: Row<any>;
  table: Table<T>;
  openEdit?: (value: boolean, row: T) => void;
}

interface Props<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  footerVisible?: boolean;
  getItemsRemoves?: (props: any) => void;
  getItemsRestores?: (props: any) => void;
  openEdit?: (value: boolean, row: T) => void;
  loading?: boolean;
}

interface PropsHead<T> {
  refTHeader: RefObject<HTMLDivElement>;
  configTable: Table<T>;
  setLeftTable: Dispatch<React.SetStateAction<number>>;
  setSpacing: Dispatch<React.SetStateAction<boolean>>;
  setScrolled: Dispatch<React.SetStateAction<boolean>>;
  setShowOptions: Dispatch<React.SetStateAction<boolean>>;
  refElement2: RefObject<HTMLDivElement>;
  showOptions: boolean;
  refContentTBody: RefObject<HTMLDivElement>;
}

interface PropsBody<T> {
  handleScroll: (e: UIEvent<HTMLDivElement>) => void;
  configTable: Table<T>;
  refContentTBody: RefObject<HTMLDivElement>;
  openEdit?: (value: boolean, row: T) => void;
}

interface PropsFooter<T> extends Omit<Props<T>, "columns"> {
  configTable: Table<any>;
  getItemsRemoves?: (props: any) => void;
  getItemsRestores?: (props: any) => void;
}

const ShowOptions = (table: any) => {
  const widthHeader =
    table.props.refContentTHeader.current &&
    table.props.refContentTHeader.current.clientWidth;
  const widthTable = table.props.leftTable;

  const widthGroup =
    table.props.refElement2.current &&
    table.props.refElement2.current.clientWidth;

  const calcScrollHeigth =
    table.props.refElement2.current &&
    table.props.refElement2.current.scrollHeight >
      table.props.refElement2.current.clientHeight;

  const widthInScroll = widthHeader - widthGroup - (calcScrollHeigth ? 34 : 17);
  const widthNoScroll = widthTable - 17;

  return (
    <div
      ref={table.props.refElement2}
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 1px 5px rgb(0 0 0 / 30%)",
        position: "absolute",
        zIndex: 1,
        float: "left",
        overflowX: "hidden",
        overflowY: "auto",
        height: "auto",
        width: "auto",
        whiteSpace: "nowrap",
        visibility: table.props.showOptions ? "visible" : "hidden",
        top: 25.5,
        left: table.props.spacing
          ? table.props.scrolled
            ? widthInScroll
            : widthTable - widthGroup - (calcScrollHeigth ? 6 : -11.5)
          : widthNoScroll,
        maxHeight: 210,
      }}
    >
      {table.props.getAllLeafColumns().map((column: any) => {
        if (column.id !== "actions") {
          return (
            <div
              key={column.id}
              style={{ padding: 8, borderBottom: "1px solid #e2e2e2" }}
            >
              <label
                style={{ display: "block", paddingLeft: 15, textIndent: -15 }}
              >
                <input
                  {...{
                    type: "checkbox",
                    checked: column.getIsVisible(),
                    onChange: column.getToggleVisibilityHandler(),
                    style: {
                      overflow: "hidden",
                      top: "-3px",
                      position: "relative",
                      verticalAlign: "bottom",
                    },
                  }}
                />{" "}
                {column.id}
              </label>
            </div>
          );
        }
      })}
    </div>
  );
};

const THead = <T extends object>({
  configTable,
  refTHeader,
  setLeftTable,
  setSpacing,
  setScrolled,
  setShowOptions,
  refElement2,
  showOptions,
  refContentTBody,
}: PropsHead<T>) => {
  const [clicked, setClicked] = useState<number>(0);
  const refElement1 = useRef<HTMLTableCellElement>(null);

  const changeClicked = (index: number) => setClicked(index);

  useEffect(() => {
    if (configTable) {
      setLeftTable(configTable.getCenterTotalSize());
    }
  }, [configTable]);

  return (
    <div ref={refTHeader} className="flex flex-[0_0_auto] relative ">
      <div className="float-left pr-[40px] text-[#464646]">
        <table className="border-r border-solid border-[#444]">
          <thead>
            {configTable.getHeaderGroups().map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, i) => {
                    return (
                      <THeadItem
                        key={header.id}
                        header={header}
                        isClicked={clicked === i}
                        changeClicked={() => changeClicked(i)}
                        refElement1={refElement1}
                        refElement2={refElement2}
                        showOptions={showOptions}
                        setShowOptions={setShowOptions}
                        table={configTable}
                        refContentTHeader={refTHeader}
                        setSpacing={setSpacing}
                        setScrolled={setScrolled}
                        setLeftTable={setLeftTable}
                        refContentTBody={refContentTBody}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </thead>
        </table>
      </div>
    </div>
  );
};

const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[]
): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string
  );
  return [...columnOrder];
};

const THeadItem = <T extends object>({
  header,
  refElement1,
  refElement2,
  setShowOptions,
  showOptions,
  table,
  isClicked,
  changeClicked,
  refContentTHeader,
  setSpacing,
  setScrolled,
  setLeftTable,
  refContentTBody,
}: ITHeadItemProps<T>) => {
  const [tableBody, setTableBody] = useState(270);
  const [status, setStatus] = useState(0);
  const [lengthMin, setLengthMin] = useState(0);

  //dragable
  const { getState, setColumnOrder } = table;
  const { columnOrder } = getState();
  const { column } = header;

  const [, dropRef] = useDrop({
    accept: "column",
    drop: (draggedColumn: Column<any>) => {
      const newColumnOrder = reorderColumn(
        draggedColumn.id,
        column.id,
        columnOrder
      );
      setColumnOrder(newColumnOrder);
    },
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => column,
    type: "column",
  });
  //end dragable

  const operador =
    table.getState().columnSizingInfo.deltaOffset !== null
      ? String(table.getState().columnSizingInfo.deltaOffset)[0] === "-"
        ? "negativo"
        : Number(String(table.getState().columnSizingInfo.deltaOffset)[0]) > 0
        ? "positivo"
        : "neutro"
      : null;

  useEffect(() => {
    const colMinSize = header.column.columnDef.minSize as number;
    const tableStartSize = table.getState().columnSizingInfo
      .startSize as number;
    const stop = table.getState().columnSizingInfo.deltaOffset as number;

    if (operador === "negativo") {
      const result =
        tableStartSize -
        Number(
          String(table.getState().columnSizingInfo.deltaOffset).substring(
            1,
            9999
          )
        );

      if (result === colMinSize) {
        setLengthMin(stop);
      } else if (result <= colMinSize) {
        setLengthMin(-tableStartSize + colMinSize);
        setStatus(1);
      } else {
        setStatus(2);
      }
    }

    if (operador === "positivo") {
      setStatus(2);
    }

    const tamañoPantalla = window.innerWidth;

    if (refContentTBody.current) {
      const altTbody = refContentTBody.current.offsetHeight;
      setTableBody(altTbody);
    }

    const changeWindows = () => {
      if (refContentTBody.current) {
        if (window.innerWidth !== tamañoPantalla) {
          const altTbody = refContentTBody.current.offsetHeight;
          setTableBody(altTbody);
        }
      }
    };

    window.addEventListener("resize", changeWindows);

    return () => {
      window.removeEventListener("resize", changeWindows);
    };
  }, [header.column.columnDef.minSize, operador, refContentTBody, table]);

  if (table.getState().columnSizingInfo.deltaOffset !== null) {
    document.body.style.cursor = "col-resize";
  } else {
    document.body.style.cursor = "auto";
  }

  return (
    <th
      ref={dropRef}
      className={`border-r border-solid font-bold h-[24px] whitespace-nowrap align-middle text-left p-0 relative hover:!bg-[#e2e2e2] ${
        table.getState().columnSizingInfo.deltaOffset !== null
          ? "cursor-col-resize"
          : "cursor-pointer"
      }`}
      {...{
        style: {
          backgroundColor: isClicked ? "#e2e2e2" : "#f4f4f4",
          opacity: isDragging ? 0.5 : 1,
        },
        colSpan: header.colSpan,
        onClick: () => {
          if (header.id === "actions") {
            setShowOptions(!showOptions);
            if (refContentTHeader.current) {
              const widthHeader = refContentTHeader.current.clientWidth;
              const widthTable = table.getCenterTotalSize();
              const scrollWBody = refContentTHeader.current.scrollWidth;
              setScrolled(widthHeader - scrollWBody < -25 ? true : false);
              setSpacing(widthHeader - widthTable < 103 ? true : false);
            }
          } else {
            changeClicked();
          }
        },
        onMouseOut: () => {
          if (header.id === "actions") {
            if (showOptions) {
              document.onmouseover = function (e) {
                if (
                  (refElement2.current &&
                    refElement2.current.contains(e.target as null)) ||
                  (refElement1.current &&
                    refElement1.current.contains(e.target as null))
                ) {
                  setShowOptions(true);
                } else {
                  setLeftTable(table.getCenterTotalSize());
                  setShowOptions(false);
                  document.onmouseover = null;
                }
              };
            }
          }
        },
      }}
    >
      <div
        ref={previewRef}
        {...{
          className: `${
            {
              asc: `before:content-['▲'] before:text-center before:text-[#464646] text-[7px] ${
                header.column.getIsSorted() ? "pl-[5px] flex items-center" : ""
              }`,
              desc: `before:content-['▼'] before:text-center before:text-[#464646] text-[7px] ${
                header.column.getIsSorted() ? "pl-[5px] flex items-center" : ""
              }`,
            }[header.column.getIsSorted() as string] ?? ""
          } overflow-hidden`,
          style: {
            width: header.column.getSize(),
          },
          onClick: header.column.getToggleSortingHandler(),
        }}
      >
        <div ref={dragRef}>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </div>
      <div
        {...{
          onMouseDown: (e) => {
            header.getResizeHandler()(e);
            setLengthMin(0);
          },
          onTouchStart: header.getResizeHandler(),
          onMouseUp: () => setLengthMin(0),
          style: {
            height: tableBody + 28,
            position: "absolute",
            transform: header.column.getIsResizing()
              ? status === 1
                ? `translateX(${lengthMin}px)`
                : `translateX(${
                    table.getState().columnSizingInfo.deltaOffset
                  }px)`
              : "",
          },
          className:
            header.id !== "actions"
              ? `absolute right-0 top-0 w-[2px] cursor-col-resize select-none touch-none hover:bg-[#B0AC9E] z-10 hover:z-10 ${
                  header.column.getIsResizing() ? "bg-[#B0AC9E] z-10" : null
                }`
              : ``,
        }}
      />
    </th>
  );
};

// million-ignore
const TBodyItem = <T extends object>({
  cell,
  row,
  table,
  openEdit,
}: ITBodyItemProps<T>) => {
  const { dispatch } = useContext(ModalContext);

  return (
    <td
      className={`${
        cell.id !== row.id + "_actions"
          ? "border-r border-solid whitespace-nowrap  align-middle p-0 border-b relative overflow-hidden"
          : "border-none bg-white select-none"
      } ${
        table.getState().columnSizingInfo.deltaOffset !== null
          ? "cursor-col-resize"
          : !row.original.status
          ? ""
          : "cursor-pointer"
      }`}
      {...{
        key: cell.id,
      }}
      onClick={() => {
        if (row.original.status && cell.id !== row.id + "_select") {
          dispatch({ type: "OPEN_EDIT", payload: row.original });
          openEdit && openEdit(true, row.original);
        }
      }}
    >
      <>
        <div
          style={{
            width: cell.column.getSize(),
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      </>
    </td>
  );
};

const TBody = <T extends object>({
  configTable,
  handleScroll,
  refContentTBody,
  openEdit,
}: PropsBody<T>) => {
  //configTable.getRowModel().rows

  //virtualized
  const { rows } = configTable.getRowModel();
  const rowVirtualizer = useVirtual({
    parentRef: refContentTBody,
    size: rows.length,
    overscan: 100,
  });
  const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div
      onScroll={handleScroll}
      ref={refContentTBody}
      className="flex-[1_1_auto] bg-white relative overflow-auto w-full h-[260px] select-text border-t-1  border-solid border-t border-b"
    >
      <table
        {...{
          style: {
            width: configTable.getCenterTotalSize(),
            marginBottom: 10,
          },
        }}
      >
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: `${paddingTop}px` }} />
          </tr>
        )}

        <tbody>
          {virtualRows.map((virtualRow, i) => {
            const row = rows[virtualRow.index] as Row<any>;
            return (
              <tr
                style={
                  i % 2 !== 0
                    ? {
                        backgroundColor: "#f7f7f7",
                      }
                    : {
                        backgroundColor: "#fff",
                      }
                }
                key={row.id}
                className={`${
                  !row.original.status
                    ? " text-borders cursor-default"
                    : "hover:!bg-hover"
                }`}
                // [#e2e2e2]
              >
                {row.getVisibleCells().map((cell, i) => {
                  return (
                    <TBodyItem
                      key={i}
                      cell={cell}
                      row={row}
                      table={configTable}
                      openEdit={openEdit}
                    />
                  );
                })}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const TFooter = <T extends object>({
  configTable,
  data,
  getItemsRestores,
  getItemsRemoves,
}: PropsFooter<T>) => {
  const selects = configTable
    .getSelectedRowModel()
    .flatRows.map((a) => a.original);

  return (
    <div className="bg-none overflow-hidden whitespace-nowrap relative flex-[0_0_auto] gap-2 flex items-center p-2">
      <div className="m-[6px_3px_6px_6px] float-left w-full whitespace-nowrap select-none">
        {getItemsRemoves && (
          <div className="float-left bg-none h-[24px] m-[0_10px_0_0] align-middle whitespace-nowrap flex items-center">
            <label
              className={`${
                selects.filter((a) => !a.status).length > 0 ||
                selects.length === 0
                  ? "text-borders cursor-default"
                  : "text-primary cursor-pointer"
              } text-[16px]`}
              onClick={() => {
                if (selects.length > 0 && !selects.find((a) => !a.status)) {
                  if (getItemsRemoves) {
                    return getItemsRemoves(
                      configTable.getSelectedRowModel().flatRows
                    );
                  }
                }
              }}
            >
              x
            </label>
          </div>
        )}

        {getItemsRestores && (
          <div className="float-left bg-none h-[24px] m-[0_10px_0_0] align-middle whitespace-nowrap flex items-center">
            <label
              className={`${
                selects.filter((a) => a.status).length > 0 ||
                selects.length === 0
                  ? "text-borders cursor-default"
                  : "text-[#464646] cursor-pointer"
              }`}
              onClick={() => {
                if (selects.length > 0 && !selects.find((a) => a.status)) {
                  if (getItemsRestores) {
                    return getItemsRestores(
                      configTable.getSelectedRowModel().flatRows
                    );
                  }
                }
              }}
            >
              <i className="gg-undo w-[11px] h-[11px]"></i>
            </label>
          </div>
        )}

        <div className="float-left bg-none h-[24px] m-[0_5px_0_0] align-middle whitespace-nowrap">
          <select
            value={configTable.getState().pagination.pageSize}
            onChange={(e) => {
              configTable.setPageSize(Number(e.target.value));
            }}
            className=" border-solid border min-h-[24px] p-[0_18px_0_0.5rem] rounded-sm align-middle text-[12px] text-left indent-[0.01px] overflow-ellipsis bg-white bg-no-repeat bg-[url(https://cms.wialon.us/static/skin/misc/ddn.svg)] text-[#464646] outline-none appearance-none cursor-pointer bg-right"
          >
            {[10, 20, 50, 100, 500, 1000].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="float-left bg-none h-[24px] m-[0_5px] align-middle whitespace-nowrap">
          <div
            onClick={() => configTable.setPageIndex(0)}
            className={`
            float-left w-[22px] h-[22px] border-0 cursor-pointer overflow-hidden text-[12px] text-center pt-[2px] text-[#9b9c9c] flex items-center justify-center ${
              configTable.getState().pagination.pageIndex + 1 === 1
                ? "text-borders cursor-auto"
                : "text-[#9b9c9c]"
            }
            `}
          >
            <i className="gg-play-backwards"></i>
          </div>
          <div
            onClick={() => configTable.previousPage()}
            className={`float-left w-[22px] h-[22px] border-0 cursor-pointer overflow-hidden text-[12px] text-center pt-[2px] flex items-center justify-center ${
              configTable.getState().pagination.pageIndex + 1 === 1
                ? "text-borders cursor-auto"
                : "text-[#9b9c9c]"
            }`}
          >
            <i className="gg-play-button rotate-180"></i>
          </div>
          <div className="float-left bg-none h-[24px] m-[0_5px] align-middle whitespace-nowrap">
            <span className="relative overflow-visible">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <b id="page" className="font-bold" dir="auto">
                        Página
                      </b>
                    </td>
                    <td>
                      <input
                        className="border-solid border w-[63px] text-[12px] p-[0_5px] relative ml-[8px] mr-[8px] min-h-[24px] text-left resize-none outline-none rounded-sm"
                        type="number"
                        value={configTable.getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                          const page = e.target.value
                            ? Number(e.target.value) - 1
                            : 0;
                          configTable.setPageIndex(page);
                        }}
                      />
                    </td>
                    <td dir="auto">
                      <b id="of" className="font-bold">
                        de{" "}
                      </b>
                      <span>{configTable.getPageCount()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </span>
          </div>
          <div className="float-left bg-none h-[24px] m-[0_5px] align-middle whitespace-nowrap">
            <div
              className={`float-left w-[22px] h-[22px] border-0 cursor-pointer overflow-hidden text-[12px] text-center pt-[2px] text-[#9b9c9c] flex items-center justify-center ${
                configTable.getState().pagination.pageIndex + 1 ===
                configTable.getPageCount()
                  ? "text-borders cursor-auto"
                  : "text-[#9b9c9c]"
              }`}
              onClick={() => configTable.nextPage()}
            >
              <i className="gg-play-button"></i>
            </div>
            <div
              className={`float-left w-[22px] h-[22px] border-0 cursor-pointer overflow-hidden text-[12px] text-center pt-[2px] text-[#9b9c9c] flex items-center justify-center ${
                configTable.getState().pagination.pageIndex + 1 ===
                configTable.getPageCount()
                  ? "text-borders cursor-auto"
                  : "text-[#9b9c9c]"
              }`}
              onClick={() =>
                configTable.setPageIndex(configTable.getPageCount() - 1)
              }
            >
              <i className="gg-play-forwards"></i>
            </div>
          </div>
          <div className="float-left bg-none h-[24px] m-[0_5px] align-middle text-[12px] flex items-center justify-center">
            <label>
              Mostrando {configTable.options.data[0].index} a{" "}
              {
                configTable.options.data[configTable.options.data.length - 1]
                  .index
              }{" "}
              de {data.length} registros
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComponentTable = <T extends object>({
  data,
  columns,
  footerVisible = true,
  getItemsRemoves,
  getItemsRestores,
  openEdit,
  loading,
}: Props<T>) => {
  const refContentTHeader = useRef<HTMLDivElement>(null);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const [columnResizeMode] = useState<ColumnResizeMode>("onEnd");
  const [sorting, setSorting] = useState<SortingState>([]);
  const refElement2 = useRef<HTMLDivElement>(null);
  const [leftTable, setLeftTable] = useState<number>(0);
  const [spacing, setSpacing] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  //visible column
  const initialVisibleColumn = columns.reduce((acc: any, item: any) => {
    if (item.visible !== undefined) {
      acc[item.id] = item.visible;
    }
    return acc;
  }, {});

  const [rowSelection, setRowSelection] = useState({});

  const [columnVisibility, setColumnVisibility] =
    useState(initialVisibleColumn);

  const refContentTable = useRef<HTMLDivElement>(null);
  const refContentTBody = useRef<HTMLDivElement>(null);

  //dragable
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => column.id as string) //must start out with populated columnOrder so we can splice
  );

  const resetOrder = () =>
    setColumnOrder(columns.map((column) => column.id as string));
  //end dragable

  const dataQuery = {
    rows: data
      .map((column: any, i: number) => {
        return { ...column, index: i + 1, status: column.status };
      })
      .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) as any[],
    pageCount: Math.ceil(data.length / pageSize),
  };

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (typeof refContentTHeader === "object") {
      if (refContentTHeader.current) {
        refContentTHeader.current.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;
      }
    }
  };

  const table = useReactTable({
    data: dataQuery.rows,
    columns,
    pageCount: dataQuery.pageCount,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
      columnOrder,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true, //enable row selection for all rows
    //enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    columnResizeMode,
    manualPagination: true,
  });

  useEffect(() => {
    if (refContentTHeader.current) {
      refContentTHeader.current.scrollLeft = 100; // Establece el scrollLeft a 100 píxeles
    }
  }, [refContentTHeader]);

  return (
    <div className="flex flex-col flex-[1_1_auto] overflow-hidden border border-solid relative">
      {loading ? (
        <div className="flex h-full justify-center items-center">
          Por favor, espere, buscando...
        </div>
      ) : (
        <>
          <ShowOptions
            props={{
              ...table,
              refElement2,
              leftTable,
              refContentTHeader,
              refContentTable,
              showOptions,
              spacing,
              scrolled,
            }}
          />
          <THead
            configTable={table}
            refTHeader={refContentTHeader}
            setLeftTable={setLeftTable}
            setSpacing={setSpacing}
            setScrolled={setScrolled}
            setShowOptions={setShowOptions}
            refElement2={refElement2}
            showOptions={showOptions}
            refContentTBody={refContentTBody}
          />
          <TBody
            configTable={table}
            handleScroll={handleScroll}
            refContentTBody={refContentTBody}
            openEdit={openEdit}
          />
          {footerVisible === true && data.length > 0 && (
            <TFooter
              configTable={table}
              data={data}
              getItemsRemoves={getItemsRemoves}
              getItemsRestores={getItemsRestores}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ComponentTable;
