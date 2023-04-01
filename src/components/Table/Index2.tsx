import { useEffect, useMemo, useRef, useState, UIEvent } from "react";

import {
  ColumnDef,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Header,
  PaginationState,
} from "@tanstack/react-table";
import "./table.css";

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

const TableThItem = ({
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
}: any) => {
  return (
    <th
      ref={refElement1}
      className="th"
      {...{
        style: {
          backgroundColor: isClicked ? "#e2e2e2" : "",
        },
        colSpan: header.colSpan,
        onClick: () => {
          if (header.id === "actions") {
            setShowOptions(!showOptions);
            const widthHeader =
              refContentTHeader.current &&
              refContentTHeader.current.clientWidth;
            const widthTable = table.getCenterTotalSize();
            const scrollWBody =
              refContentTHeader.current &&
              refContentTHeader.current.scrollWidth;
            setScrolled(widthHeader - scrollWBody < -25 ? true : false);
            setSpacing(widthHeader - widthTable < 103 ? true : false);
          } else {
            changeClicked();
          }
        },
        //ref: refElement1,
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
        {...{
          className: `${
            {
              asc: "asc",
              desc: "desc",
            }[header.column.getIsSorted() as string] ?? ""
          } ${(header.column.columnDef as any).classNameHeader}`,
          style: {
            width: header.column.getSize(),
          },
          onClick: header.column.getToggleSortingHandler(),
        }}
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        {/* {{
          asc: " 🔼",
          desc: " 🔽",
        }[header.column.getIsSorted() as string] ?? null} */}
      </div>

      <div
        {...{
          onMouseDown: header.getResizeHandler(),
          onTouchStart: header.getResizeHandler(),
          className:
            header.id !== "actions"
              ? `resizer ${header.column.getIsResizing() ? "isResizing" : ""}`
              : ``,
        }}
      />
    </th>
  );
};

const ComponentList2 = ({ data, columns }: any) => {
  //table
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [leftTable, setLeftTable] = useState<number>(0);
  const [clicked, setClicked] = useState<number>(0);
  const [spacing, setSpacing] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const refElement1 = useRef<HTMLTableHeaderCellElement>(null);
  const refElement2 = useRef<HTMLDivElement>(null);
  const refContentTHeader = useRef<HTMLDivElement>(null);
  const refContentTable = useRef<HTMLDivElement>(null);
  const refContentTBody = useRef<HTMLDivElement>(null);

  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  //fin table

  //table
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const changeClicked = (index: number) => setClicked(index);

  const dataQuery = {
    rows: data
      .map((format: any, i: any) => {
        return { ...format, index: i + 1 };
      })
      .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    pageCount: Math.ceil(data.length / pageSize),
  };

  const table = useReactTable({
    data: dataQuery.rows,
    columns,
    pageCount: dataQuery.pageCount,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    columnResizeMode,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (typeof refContentTHeader === "object") {
      if (refContentTHeader.current) {
        refContentTHeader.current.scrollLeft = e.currentTarget.scrollLeft;
        refContentTHeader.current.scrollTop = e.currentTarget.scrollTop;
      }
    }
  };

  useEffect(() => {
    if (table) {
      setLeftTable(table.getCenterTotalSize());
    }
  }, [table]);
  //fin table

  return (
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
      <div
        ref={refContentTHeader}
        className="flex flex-[0_0_auto] bg-[#f4f4f4] relative overflow-hidden"
      >
        <div className="float-left pr-[40px] text-[#464646]">
          <table className="border-r border-solid border-[#444]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, i) => {
                    return (
                      <TableThItem
                        key={header.id}
                        header={header}
                        isClicked={clicked === i}
                        changeClicked={() => changeClicked(i)}
                        refElement1={refElement1}
                        refElement2={refElement2}
                        showOptions={showOptions}
                        setShowOptions={setShowOptions}
                        table={table}
                        refContentTHeader={refContentTHeader}
                        setSpacing={setSpacing}
                        setScrolled={setScrolled}
                        setLeftTable={setLeftTable}
                      />
                    );
                  })}
                </tr>
              ))}
            </thead>
          </table>
        </div>
      </div>
      <div
        onScroll={handleScroll}
        ref={refContentTBody}
        className="flex-[1_1_auto] bg-white relative overflow-auto w-full h-[260px] select-text border-t-1  border-solid border-t border-b"
      >
        <table
          {...{
            style: {
              width: table.getCenterTotalSize(),
              marginBottom: 10,
            },
          }}
        >
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                className="tbody-tr"
                key={row.id}
                style={
                  i % 2 !== 0
                    ? {
                        backgroundColor: "#f7f7f7",
                      }
                    : {
                        backgroundColor: "#fff",
                      }
                }
              >
                {row.getVisibleCells().map((cell: any) => {
                  return (
                    <td
                      className={`${
                        cell.id !== row.id + "_actions" ? "td" : "td-empty"
                      }`}
                      {...{
                        key: cell.id,
                      }}
                    >
                      <div
                        {...{
                          className: cell.column.columnDef.classNameBody,
                        }}
                        style={{
                          width: cell.column.getSize(),
                        }}
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
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          background: "none",
          border: 0,
          borderBottom: "3px solid #fff",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          color: "#000",
          flex: "0 0 auto",
        }}
        className="flex items-center gap-2"
      >
        <div
          style={{
            margin: "3px 3px 3px 0px",
            float: "left",
            width: "100%",
            whiteSpace: "nowrap",
            color: "#000",
            userSelect: "none",
          }}
        >
          <div
            style={{
              float: "left",
              background: "none",
              height: "24px",
              margin: "0 5px 0 0",
              verticalAlign: "middle",
              whiteSpace: "nowrap",
              color: "#000",
            }}
          >
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              style={{
                minHeight: "24px",
                padding: "0px 18px 0px .5rem",
                border: "1px solid #B4B4B4",
                borderRadius: "2px",
                verticalAlign: "middle",
                fontSize: "12px",
                textAlign: "left",
                textIndent: "0.01px",
                textOverflow: "ellipsis",
                backgroundColor: "#fff",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "100%",
                backgroundImage:
                  "url(https://cms.wialon.us/static/skin/misc/ddn.svg)",
                color: "#464646",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              {[10, 20, 50, 100, 500, 1000].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              float: "left",
              background: "none",
              height: "24px",
              margin: "0 5px",
              verticalAlign: "middle",
              whiteSpace: "nowrap",
              color: "#000",
            }}
          >
            {/* ICON */}
            <div
              className="prevAll"
              onClick={() => table.setPageIndex(0)}
              style={{
                float: "left",
                width: "22px",
                height: "22px",
                border: 0,
                cursor: "pointer",
                overflow: "hidden",
                fontSize: "12px",
                textAlign: "center",
                paddingTop: "2px",
                color: "#9b9c9c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></div>
            <div
              className="prev"
              onClick={() => table.previousPage()}
              style={{
                float: "left",
                width: "22px",
                height: "22px",
                border: 0,
                cursor: "pointer",
                overflow: "hidden",
                fontSize: "12px",
                textAlign: "center",
                paddingTop: "2px",
                color: "#9b9c9c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></div>
            <div
              style={{
                float: "left",
                background: "none",
                height: "24px",
                margin: "0 5px",
                verticalAlign: "middle",
                whiteSpace: "nowrap",
                color: "#000",
              }}
            >
              <span style={{ position: "relative", overflow: "visible" }}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <b
                          id="page"
                          style={{ fontWeight: "normal" }}
                          dir="auto"
                        >
                          Página
                        </b>
                      </td>
                      <td>
                        <input
                          style={{
                            width: 62,
                            fontSize: "12px",
                            marginTop: "1px",
                            padding: "0 5px",
                            position: "relative",
                            marginLeft: "8px",
                            marginRight: "8px",
                            minHeight: "24px",
                            border: "1px solid #B4B4B4",
                            borderRadius: "var(--button-border-radius)",
                            textAlign: "left",
                            fontFamily: "inherit",
                            color: "#464646",
                            resize: "none",
                            outline: "none",
                          }}
                          type="number"
                          value={table.getState().pagination.pageIndex + 1}
                          onChange={(e) => {
                            const page = e.target.value
                              ? Number(e.target.value) - 1
                              : 0;
                            table.setPageIndex(page);
                          }}
                        />
                      </td>
                      <td dir="auto">
                        <b id="of" style={{ fontWeight: "normal" }}>
                          de{" "}
                        </b>
                        <span>{table.getPageCount()}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </span>
            </div>
            <div
              style={{
                float: "left",
                background: "none",
                height: "24px",
                margin: "0 5px",
                verticalAlign: "middle",
                whiteSpace: "nowrap",
                color: "#000",
              }}
            >
              <div
                className="next"
                onClick={() => table.nextPage()}
                style={{
                  float: "left",
                  width: "22px",
                  height: "22px",
                  border: 0,
                  cursor: "pointer",
                  overflow: "hidden",
                  fontSize: "12px",
                  textAlign: "center",
                  paddingTop: "2px",
                  color: "#9b9c9c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></div>
              <div
                className="nextAll"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                style={{
                  float: "left",
                  width: "22px",
                  height: "22px",
                  border: 0,
                  cursor: "pointer",
                  overflow: "hidden",
                  fontSize: "12px",
                  textAlign: "center",
                  paddingTop: "2px",
                  color: "#9b9c9c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></div>
            </div>

            <div
              style={{
                float: "left",
                background: "none",
                height: "24px",
                margin: "0 5px",
                verticalAlign: "middle",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <label>
                Mostrando {dataQuery.rows[0].index} a{" "}
                {dataQuery.rows[dataQuery.rows.length - 1].index} de{" "}
                {data.length} registros
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComponentList2;
