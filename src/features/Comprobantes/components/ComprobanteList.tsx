import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ComponentTable from "../../../components/common/Table/Index";
import { ModalContext } from "../../../store/context/dialogContext";
import { useSocketInvoice } from "../../../hooks/useSocket";
import {
  ColumnDef,
  ExtendedColumnDef,
  PaginationState,
  SortingState,
  TableOptions,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Alert } from "@mui/material";
import { FaRegFilePdf } from "react-icons/fa";
import { TfiTicket } from "react-icons/tfi";
import { BsFiletypeXml } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsFileEarmarkCode } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import ToolTipIconButton from "../../../components/Material/Tooltip/IconButton";
import CPEAcctionList from "./ComprobanteActions";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { listInvoices } from "../services/invoice";
import CPEButtonEnviarSunat from "./ComprobanteButtonEnviarSunat";
import dayjs from "dayjs";
import { fixed } from "../../../utils/functions.utils";
import { IConfigEstablecimiento } from "../../../interfaces/models/configurations/config_establecimiento.interface";
import { IMoneda } from "../../../interfaces/models/tipo-moneda/moneda.interface";
import { IInvoice } from "../../../interfaces/models/invoices/invoice.interface";
import { DataTable } from "../../../components/common/Table/DataTable";
import {
  Person,
  makeColumns,
  makeData,
} from "../../../components/common/Table/makeData";
import { usePaginationStore } from "../../../store/zustand/pagination-zustand";
import { IPagination } from "../../../components/common/Table/types";
import { useInvoices } from "../hooks/useInvoices";
import { useUserStore } from "../../../store/zustand/user-zustand";
import axios from "axios";
import { BASE_API } from "../../../config/constants";
import {
  DataTable2,
  MemoizedTableBody,
} from "../../../components/common/Table/DataTable2";
import { useReactTable } from "@tanstack/react-table";
import { VisibilityState } from "@tanstack/react-table";
import { DensityFeature } from "../../../components/common/Table/features/density";
import { BasicFeature } from "../../../components/common/Table/features/basic";
import { ColumnOrderState } from "@tanstack/react-table";

interface ILog {
  type: string;
  message: string;
  correlativo: string;
  time: string;
}

const CPEList = () => {
  const queryClient = useQueryClient();
  const userGlobal = useUserStore((state) => state.userGlobal);
  // const { socket, reconnecting } = useSocketInvoice();
  //const pagination = usePaginationStore((state) => state.pagination);
  const empresa = userGlobal?.empresaActual?.id;
  const establecimiento = userGlobal?.empresaActual?.establecimiento?.id;
  //const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // const [logs, setLogs] = useState<ILog[]>([]);
  // const [minimizar, setMinimizar] = useState<boolean>(false);
  // const DECIMAL = 6;

  // const configuracionesEstablecimiento = userGlobal?.empresaActual
  //   ?.establecimiento?.configuraciones as IConfigEstablecimiento[];

  // const ENVIA_DIRECTO_SUNAT = configuracionesEstablecimiento?.some(
  //   (config) => config.enviar_inmediatamente_a_sunat
  // );

  // const { data, isPlaceholderData, isPending, isFetching } = useInvoices(
  //   Number(empresa),
  //   Number(establecimiento),
  //   page,
  //   pagination.pageSize
  // );

  const { isPending, status, data, error, isFetching, isPlaceholderData } =
    useInvoices(
      Number(empresa),
      Number(establecimiento),
      pagination.pageIndex,
      pagination.pageSize
    );

  const { dataInvoices, dataProps } = useMemo<{
    dataInvoices: IInvoice[];
    dataProps: IPagination<IInvoice>;
  }>(() => {
    if (!isPending && data) {
      return {
        dataInvoices: data.items || [],
        dataProps: data,
      };
    }
    return {
      dataInvoices: [],
      dataProps: { statusCode: "", pageCount: 0, rowCount: 0, items: [] },
    };
  }, [data]);

  // const comunicatBaja = useCallback(
  //   (serie: string, correlativo: string, motivo: string) => {
  //     if (socket) {
  //       socket.volatile.emit("client::comunicarBaja", {
  //         serie: serie,
  //         numero: correlativo,
  //         motivo: motivo,
  //       });
  //     }
  //   },
  //   [socket]
  // );

  const columns = useMemo<ExtendedColumnDef<IInvoice>[]>(() => {
    return [
      {
        id: "index",
        header: () => <div className="text-center w-full">#</div>,
        cell: ({ row, table }) => {
          let result = 0;
          //console.log(row, table);
          const sortedRows = table.getSortedRowModel().rows;
          //console.log(sortedRows);
          const findIndex = sortedRows.findIndex(
            (item) => item.index === row.index
          );

          // Calcular el índice final considerando la paginación
          result =
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
            findIndex +
            1;

          return <div className="text-center w-full">{result}</div>;
        },
        size: 28,
        minSize: 28,
      },
      {
        accessorKey: "fecha_registro",
        id: "fecha_registro",
        header: "Fecha de registro",
        cell: ({ getValue }) => {
          const registro = getValue() as any;
          return dayjs(registro).format("DD-MM-YYYY HH:mm:ss");
        },
        size: 120,
        minSize: 31,
        visible: false,
      },
      {
        accessorKey: "fecha_emision",
        id: "fecha_emision",
        header: "Fecha de emision",
        cell: ({ getValue }) => {
          const emision = getValue() as any;
          return dayjs(emision).format("DD-MM-YYYY HH:mm:ss");
        },
        size: 150,
        minSize: 31,
        sortDescFirst: true,
      },
      {
        accessorKey: "tipo_doc",
        id: "tipo_doc",
        header: "Comprobante",
        cell: ({ getValue, row }) => {
          const comprobante = String(
            (getValue() as any).tipo_documento
          ).toUpperCase();

          const serie = row.original.serie;
          const correlativo = row.original.correlativo;

          return `${comprobante}:${serie}-${correlativo}`;
        },
        size: 180,
        minSize: 31,
      },
      {
        accessorKey: "cliente",
        id: "cliente",
        header: "Cliente",
        cell: ({ getValue, row }) => {
          if (getValue()) {
            const nombreEntidad = String(
              (getValue() as any).entidad
            ).toUpperCase();

            const nroDocEntidad = String(
              (getValue() as any).numero_documento
            ).toUpperCase();

            return `${nroDocEntidad} - ${nombreEntidad}`;
          } else {
            const nombreEntidad = String(row.original.entidad).toUpperCase();

            const nroDocEntidad = String(
              row.original.entidad_documento
            ).toUpperCase();
            return `${nroDocEntidad} - ${nombreEntidad}`;
          }
        },
        size: 280,
        minSize: 31,
      },
      {
        accessorKey: "total",
        id: "total",
        header: "Total",
        cell: ({ row }) => {
          //sumar todos los montos menos gratuitos ni igv_gratuitas
          const mto_operaciones_gravadas = Number(
            row.original.mto_operaciones_gravadas
          );
          const mto_operaciones_exoneradas = Number(
            row.original.mto_operaciones_exoneradas
          );
          const mto_operaciones_inafectas = Number(
            row.original.mto_operaciones_inafectas
          );
          const mto_operaciones_exportacion = Number(
            row.original.mto_operaciones_exportacion
          );
          const mto_igv = Number(row.original.mto_igv);

          //SUMAR TODOS LOS MONTOS + EL IGV
          const total = fixed(
            Number(
              mto_operaciones_gravadas +
                mto_operaciones_exoneradas +
                mto_operaciones_inafectas +
                mto_operaciones_exportacion +
                mto_igv
            ),
            6
            //DECIMAL
          );

          const moneda = row.original.moneda as IMoneda;

          return `${moneda.simbolo} ${total}`;
        },
        size: 80,
        minSize: 31,
      },
      {
        accessorKey: "usuario",
        id: "vendido_por",
        header: "Vendido por",
        cell: ({ getValue }) => {
          return getValue() as any;
        },
        visible: false,
        size: 80,
        minSize: 31,
      },
      {
        accessorKey: "moneda",
        id: "moneda",
        header: "Moneda",
        cell: ({ getValue }) => {
          return (
            <div className="text-center">{(getValue() as any).abrstandar}</div>
          );
        },
        visible: false,
        size: 60,
        minSize: 31,
      },
      {
        id: "pdf",
        accessorKey: "pdf",
        header: "PDF",
        cell: ({ row }) => {
          const pdfA4 = row.original.pdfA4;
          const status = row.original.status;
          return (
            <div className="text-[16px] text-center flex justify-center">
              {status ? (
                <ToolTipIconButton title="Descargar PDF formato A4">
                  <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                    <FaRegFilePdf className="text-danger cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <FaRegFilePdf className="text-danger" />
              )}

              {status ? (
                <ToolTipIconButton title="PDF formato Ticket 58mm">
                  <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                    <TfiTicket className="text-blue-700 cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <TfiTicket className="text-blue-700" />
              )}

              {status ? (
                <ToolTipIconButton title="PDF formato Ticket 80mm">
                  <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                    <TfiTicket className="text-blue-900 cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <TfiTicket className="text-blue-900" />
              )}
            </div>
          );
        },
        size: 100,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
      },
      {
        id: "xml",
        accessorKey: "xml",
        header: "XML",
        cell: ({ row }) => {
          const xmlSigned = row.original.xml;
          const status = row.original.status;

          return (
            <div className="text-[16px] text-center flex justify-center">
              {/* {!ENVIA_DIRECTO_SUNAT ? (
                 <>{"-"}</>
               ) : status ? (
                 <ToolTipIconButton title="Descargar XML firmado">
                   <a href={xmlSigned}>
                     <BsFiletypeXml className="text-green-700 cursor-pointer" />
                   </a>
                 </ToolTipIconButton>
               ) : (
                 <BsFiletypeXml className="text-green-700r" />
               )} */}
            </div>
          );
        },
        size: 60,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        //  visible: ENVIA_DIRECTO_SUNAT,
        //  enableHiding: ENVIA_DIRECTO_SUNAT,
      },
      {
        id: "cdr",
        accessorKey: "cdr",
        header: "CDR",
        cell: ({ row }) => {
          const cdr = row.original.cdr;
          const estadoOpe = Number(row.original.estado_operacion); //0-creado, 1-enviando, 2-aceptado, 3-rechazado
          //const estadoAnul = Number(row.original.estado_anulacion); //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado

          return (
            <div className="text-[14px] text-center flex justify-center">
              {estadoOpe === 0 ? (
                <>{"-"}</>
              ) : estadoOpe === 1 ? (
                <>
                  <ToolTipIconButton title="Enviando a sunat">
                    <AiOutlineLoading3Quarters className="text-black-700 animate-spin" />
                  </ToolTipIconButton>
                </>
              ) : (
                (estadoOpe === 2 || estadoOpe === 3) && (
                  <>
                    <ToolTipIconButton title="Descargar CDR">
                      <a href={cdr}>
                        <BsFileEarmarkCode className="text-blue-700 cursor-pointer" />
                      </a>
                    </ToolTipIconButton>
                  </>
                )
              )}
            </div>
          );
        },
        size: 60,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        //  visible: ENVIA_DIRECTO_SUNAT,
        //  enableHiding: ENVIA_DIRECTO_SUNAT,
      },
      {
        id: "sunat",
        accessorKey: "sunat",
        header: `{ENVIA_DIRECTO_SUNAT ? "SUNAT" : ""}`,
        cell: ({ row }) => {
          return <CPEButtonEnviarSunat row={row} />;
        },
        size: 60,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "acciones",
        header: "",
        cell: ({ row }) => {
          // <CPEAcctionList row={row} />;
          return "a";
        },
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "show_columns",
        header: "...",
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
      },
    ];
  }, []);

  //comunicatBaja, ENVIA_DIRECTO_SUNAT

  // Prefetch múltiples páginas
  useEffect(() => {
    if (!isPlaceholderData && data?.rowCount) {
      queryClient.prefetchQuery({
        queryKey: [
          "invoices",
          empresa,
          establecimiento,
          pagination.pageIndex + 1,
          pagination.pageSize,
        ],
        queryFn: () =>
          listInvoices(
            Number(empresa),
            Number(establecimiento),
            pagination.pageIndex + 1,
            pagination.pageSize
          ),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [
    data,
    pagination.pageIndex,
    pagination.pageSize,
    empresa,
    establecimiento,
    isPlaceholderData,
    queryClient,
  ]);

  // useEffect(() => {
  //   if (socket) {
  //     socket.emit("client::getInvoices");

  //     const receiveLogs = (log: any) => {
  //       setLogs((prev) => {
  //         // Verifica si el mensaje ya existe en el estado utilizando reduce
  //         const exists = prev.reduce((acc, curr) => {
  //           // Si ya existe un log igual, devolvemos true
  //           if (acc) return true;
  //           return curr.correlativo === log.correlativo;
  //         }, false);
  //         // Si el mensaje existe, no agregar al estado
  //         if (exists) return prev;
  //         // Si el mensaje ya existe, no realices cambios en el estado
  //         return [
  //           ...prev,
  //           {
  //             type: log.type,
  //             time: log.time,
  //             correlativo: log.correlativo,
  //             message: log.message,
  //           },
  //         ];
  //       });
  //     };

  //     const receiveInvoice = (data: any) => {
  //       queryClient.setQueryData(["invoices", 1], (prevInvoices: any) => {
  //         // Verificar si algún elemento del array items coincide con data.correlativo
  //         const hasCorrelativo = prevInvoices.items.find(
  //           (item: any) => item.correlativo === data.correlativo
  //         );

  //         // Si no hay ningún elemento con el mismo correlativo, agregar data al array items
  //         if (!hasCorrelativo) {
  //           return {
  //             ...prevInvoices,
  //             items: [
  //               data, // Agrega el nuevo objeto data al inicio del array items
  //               ...prevInvoices.items, // Conserva los elementos existentes en items
  //             ],
  //           };
  //         }

  //         return {
  //           ...prevInvoices,
  //           items: prevInvoices.items.map((item: any) => {
  //             // Si ya existe un elemento con el mismo correlativo y cambia de estado, actualizamos files y respuesta sunat
  //             if (
  //               item.correlativo === data.correlativo &&
  //               (item.estado_operacion !== data.estado_operacion ||
  //                 item.estado_operacion === data.estado_operacion)
  //             ) {
  //               return {
  //                 ...item,
  //                 fecha_emision: data.fecha_emision,
  //                 cliente: data.cliente,
  //                 moneda: data.moneda,
  //                 mto_operaciones_gravadas: data.mto_operaciones_gravadas,
  //                 mto_operaciones_exoneradas: data.mto_operaciones_exoneradas,
  //                 mto_operaciones_inafectas: data.mto_operaciones_inafectas,
  //                 mto_operaciones_exportacion: data.mto_operaciones_exportacion,
  //                 mto_igv: data.mto_igv,
  //                 respuesta_sunat_codigo: data.respuesta_sunat_codigo,
  //                 respuesta_sunat_descripcion: data.respuesta_sunat_descripcion,
  //                 observaciones_sunat: data.observaciones_sunat,
  //                 estado_operacion: data.estado_operacion,
  //                 status: data.status,
  //                 xml: data.xml,
  //                 cdr: data.cdr,
  //                 forma_pago: data.forma_pago,
  //               };
  //             } else {
  //               return item;
  //             }
  //           }),
  //         };
  //       });
  //     };

  //     //Escuchando al servidor
  //     socket.on("server::newInvoice", receiveInvoice);
  //     socket.on("server::notifyInvoice", receiveLogs);
  //     socket.on("exception", receiveLogs);
  //     return () => {
  //       socket.off("exception", receiveLogs);
  //       socket.off("server::notifyInvoice", receiveLogs);
  //       socket.off("server::newInvoice", receiveInvoice);
  //     };
  //   }
  // }, [socket, queryClient]);

  // useEffect(() => {
  //   if (socket) {
  //     const receiveComuBaja = (data: any) => {
  //       queryClient.setQueryData(["invoices", 1], (prevInvoices: any) => {
  //         if (data.invoice) {
  //           // Verificar si algún elemento del array items coincide con data.correlativo
  //           const hasCorrelativo = prevInvoices.items.find(
  //             (item: any) => item.correlativo === data.invoice.correlativo
  //           );

  //           // Si ya existe un elemento con el mismo correlativo validamos su cambio de estado
  //           if (hasCorrelativo) {
  //             return {
  //               ...prevInvoices,
  //               items: prevInvoices.items.map((item: any) => {
  //                 if (
  //                   item.estado_anulacion !== data.invoice.estado_anulacion &&
  //                   item.correlativo === data.invoice.correlativo
  //                 ) {
  //                   return {
  //                     ...item,
  //                     respuesta_anulacion_codigo:
  //                       data.invoice.respuesta_anulacion_codigo,
  //                     respuesta_anulacion_descripcion:
  //                       data.invoice.respuesta_anulacion_descripcion,
  //                     observaciones_sunat: data.invoice.observaciones_sunat,
  //                     estado_anulacion: data.invoice.estado_anulacion,
  //                     status: data.invoice.status,
  //                     xml: data.invoice.xml,
  //                     cdr: data.invoice.cdr,
  //                   };
  //                 }
  //                 return item;
  //               }),
  //             };
  //           }
  //         }
  //       });
  //     };

  //     socket.on("server::comuBaja", receiveComuBaja);

  //     return () => {
  //       socket.off("server::comuBaja", receiveComuBaja);
  //     };
  //   }
  // }, [queryClient, socket]);

  const initialVisibleColumn: VisibilityState = columns.reduce(
    (acc: VisibilityState, item) => {
      const visible = item.visible === undefined ? true : item.visible;
      if (item.id) {
        acc[item.id] = visible;
      }
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
  const [sorting, setSorting] = useState<SortingState>(initialSortColumn);

  const table = useReactTable({
    _features: [BasicFeature],
    data: dataInvoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      //columnOrder,
      sorting,
      columnVisibility,
      pagination,
    },
    columnResizeMode: "onChange",
    //onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    sortDescFirst: true,
    manualPagination: true,
    enableFooter: true,
    enableLoading: false,
    rowCount: dataProps.rowCount,
  });

  return (
    <>
      {/* {reconnecting && (
        <Alert severity="error">
          <strong>
            Se produjo un error en el servidor. Estamos trabajando para
            solucionarlo. Por favor, inténtalo de nuevo más tarde.
          </strong>
        </Alert>
      )} */}
      {/* {data &&
        data.items.map((project) => (
          <p key={project.correlativo}>{project.correlativo}</p>
        ))}
      <button
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        Previous Page
      </button>{" "}
      <button
        onClick={() => {
          setPage((old) => {
            console.log(old);
            return old + 1;
          });
        }}
        disabled={isPlaceholderData}
      >
        Next Page
      </button> */}
      <DataTable2 table={table} />
      {/* <DataTable<IInvoice>
        data={dataInvoices}
        columns={columns}
        isLoading={isPending}
        onRowClick={(invoice) => {
          // Manejar click en la fila
          console.log({ invoice });
        }}
        manualPagination={true}
        propsPagination={dataProps}
      /> */}
      {/* <ComponentTable
        loading={isPending || reconnecting || isFetching}
        data={data}
        columns={columns}
        propsPagination={propsPagination}
        setPaginationState={setPagination}
      /> */}
      {/* <div className="flex flex-col mt-2">
        <div className="rounded-[4px] flex flex-row w-full bg-bgDefault p-2 justify-between items-center ">
          <span className="text-default font-bold">Historial</span>
          <span
            className="text-default font-bold cursor-pointer"
            onClick={() => setMinimizar(!minimizar)}
          >
            {minimizar ? <FaMinus /> : <FaPlus />}
          </span>
        </div>
        {minimizar && (
          <div
            className={`flex flex-1 overflow-auto flex-row w-full ${
              logs.length > 0 ? "" : "justify-center text-center items-center"
            }`}
          >
            {logs.length > 0 ? (
              <div className="h-[140px] flex-col w-full text-[11px] overflow-auto">
                {logs.map((log, i) => {
                  const type = log.type;

                  return (
                    <div
                      key={i}
                      className={
                        type === "sunat.failed" || type === "error"
                          ? "text-danger"
                          : type === "sunat.success"
                            ? "text-green-600"
                            : "text-yellow-600"
                      }
                    >
                      {log.time} - {log.message}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[140px] text-[11px] flex flex-col justify-center items-center">
                No hay mensajes disponibles
              </div>
            )}
          </div>
        )}
      </div> */}
    </>
  );
};

export default CPEList;
