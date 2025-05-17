import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocketInvoice } from "../../../hooks/useSocket";
import {
  ExtendedColumnDef,
  SortingState,
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
import { useQueryClient } from "@tanstack/react-query";
import { listInvoices } from "../services/invoice";
import CPEButtonEnviarSunat from "./ComprobanteButtonEnviarSunat";
import dayjs from "dayjs";
import { fixed } from "../../../utils/functions.utils";
import { IQueryInvoice, IQueryInvoiceList } from "../../../interfaces/models/invoices/invoice.interface";
import { usePaginationStore } from "../../../store/zustand/pagination-zustand";
import { IPagination } from "../../../components/common/Table/types";
import { useInvoices } from "../hooks/useInvoices";
import { useUserStore } from "../../../store/zustand/user-zustand";
import { DataTable2 } from "../../../components/common/Table/DataTable2";
import { useReactTable } from "@tanstack/react-table";
import { VisibilityState } from "@tanstack/react-table";
import { BasicFeature } from "../../../components/common/Table/features/basic";
import { SendModeSunat } from "../../../types/enums/send_mode_sunat.enum";

interface ILog {
  type: string;
  message: string;
  correlativo: string;
  time: string;
}

const CPEList = () => {
  const queryClient = useQueryClient();
  const userGlobal = useUserStore((state) => state.userGlobal);
  const { socket, reconnecting } = useSocketInvoice();
  const pagination = usePaginationStore((state) => state.pagination);
  const setPagination = usePaginationStore((state) => state.setPagination);
  const empresa = userGlobal?.empresaActual?.id;
  const establecimiento = userGlobal?.empresaActual?.establecimiento?.id;
  //const [page, setPage] = useState(0);

  const [logs, setLogs] = useState<ILog[]>([]);
  const [minimizar, setMinimizar] = useState<boolean>(true);
  const DECIMAL = 6;

  const configEstablishment = userGlobal?.empresaActual?.establecimiento?.configuraciones?.[0];
  const ENVIA_SUNAT = configEstablishment?.envio_sunat_modo !== SendModeSunat.NO_ENVIA;

  const { isPending, data, isFetching, isPlaceholderData } = useInvoices(
    Number(empresa),
    Number(establecimiento),
    pagination.pageIndex,
    pagination.pageSize
  );

  const { dataInvoices, dataProps } = useMemo<{
    dataInvoices: IQueryInvoiceList[];
    dataProps: IPagination<IQueryInvoiceList>;
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
  }, [data, isPending]);

  const comunicatBaja = useCallback(
    (serie: string, correlativo: string, motivo: string) => {
      if (socket) {
        socket.volatile.emit("client::comunicarBaja", {
          serie: serie,
          numero: correlativo,
          motivo: motivo,
        });
      }
    },
    [socket]
  );

  const columns = useMemo<ExtendedColumnDef<IQueryInvoiceList>[]>(() => {
    return [
      {
        accessorKey: "fecha_registro",
        id: "fecha_registro",
        header: "Fecha de registro",
        cell: ({ getValue }) => {
          const registro = getValue() as Date;
          return dayjs(registro).format("DD-MM-YYYY·HH:mm:ss");
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
          const emision = getValue() as Date;
          return dayjs(emision).format("DD-MM-YYYY·HH:mm:ss");
        },
        size: 150,
        minSize: 31,
        sortDescFirst: true,
      },
      {
        accessorKey: "documento",
        id: "documento",
        header: "Comprobante",
        cell: ({ getValue, row }) => {
          const comprobante = String(getValue()).toUpperCase();
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
          return `${row.original.cliente_num_doc} - ${getValue()}`;
        },
        size: 280,
        minSize: 31,
      },
      {
        accessorKey: "total",
        id: "total",
        header: () => <div className="text-center w-full">Total</div>,
        cell: ({ row }) => {
          //sumar todos los montos menos gratuitos ni igv_gratuitas
          const mto_operaciones_gravadas = Number(row.original.mto_operaciones_gravadas);
          const mto_operaciones_exoneradas = Number(row.original.mto_operaciones_exoneradas);
          const mto_operaciones_inafectas = Number(row.original.mto_operaciones_inafectas);
          const mto_operaciones_exportacion = Number(row.original.mto_operaciones_exportacion);
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
            DECIMAL
          );

          const moneda = row.original.moneda_simbolo;

          return `${moneda} ${total}`;
        },
        size: 80,
        minSize: 31,
      },
      {
        accessorKey: "usuario",
        id: "vendido_por",
        header: "Vendido por",
        cell: ({ getValue }) => {
          return getValue();
        },
        visible: false,
        size: 80,
        minSize: 31,
      },
      {
        accessorKey: "moneda_abrstandar",
        id: "moneda_abrstandar",
        header: () => <div className="text-center w-full">Moneda</div>,
        cell: ({ getValue }) => {
          const moneda = getValue<IQueryInvoiceList["moneda_abrstandar"]>();
          return <div className="text-center w-full">{moneda}</div>;
        },
        visible: false,
        size: 60,
        minSize: 31,
      },
      {
        id: "pdf",
        accessorKey: "pdf",
        header: () => <div className="text-center w-full">PDF</div>,
        cell: ({ row }) => {
          const pdfA4 = row.original.pdfA4;
          const status = row.original.status;
          return (
            <div className="text-[16px] text-center flex justify-center w-full">
              {status ? (
                <ToolTipIconButton titleTooltip="Descargar PDF formato A4">
                  <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                    <FaRegFilePdf className="text-danger cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <FaRegFilePdf className="text-danger" />
              )}

              {status ? (
                <ToolTipIconButton titleTooltip="PDF formato Ticket 58mm">
                  <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                    <TfiTicket className="text-blue-700 cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <TfiTicket className="text-blue-700" />
              )}

              {status ? (
                <ToolTipIconButton titleTooltip="PDF formato Ticket 80mm">
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
        header: () => <div className="text-center w-full">XML</div>,
        cell: ({ row }) => {
          const xmlSigned = row.original.xml;
          const status = row.original.status;
          //const estadoOpe = Number(row.original.estado_operacion); //0-creado, 1-enviando, 2-aceptado, 3-rechazado
          //const estadoAnul = Number(row.original.estado_anulacion); //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado
          return (
            <div className="text-[16px] text-center flex justify-center w-full">
              {!ENVIA_SUNAT ? (
                <>{"-"}</>
              ) : status ? (
                <ToolTipIconButton titleTooltip="Descargar XML firmado">
                  <a href={xmlSigned}>
                    <BsFiletypeXml className="text-green-700 cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <BsFiletypeXml className="" />
              )}
            </div>
          );
        },
        size: 60,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        visible: ENVIA_SUNAT,
        enableHiding: ENVIA_SUNAT,
      },
      {
        id: "cdr",
        accessorKey: "cdr",
        header: () => <div className="text-center w-full">CDR</div>,
        cell: ({ row }) => {
          const cdr = row.original.cdr;
          const estadoOpe = Number(row.original.estado_operacion); //0-creado, 1-enviando, 2-aceptado, 3-rechazado
          //const estadoAnul = Number(row.original.estado_anulacion); //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado

          return (
            <div className="text-[14px] text-center w-full flex justify-center">
              {estadoOpe === 0 ? (
                <>{"-"}</>
              ) : estadoOpe === 1 ? (
                <>
                  <ToolTipIconButton titleTooltip="Enviando a sunat">
                    <AiOutlineLoading3Quarters className="text-black-700 animate-spin" />
                  </ToolTipIconButton>
                </>
              ) : (
                (estadoOpe === 2 || estadoOpe === 3) && (
                  <>
                    <ToolTipIconButton titleTooltip="Descargar CDR">
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
        visible: ENVIA_SUNAT,
        enableHiding: ENVIA_SUNAT,
      },
      {
        id: "sunat",
        accessorKey: "sunat",
        header: () => <div className="text-center w-full">{ENVIA_SUNAT ? "SUNAT" : ""}</div>,
        cell: ({ row }) => {
          return (
            <div className="text-center w-full">
              <CPEButtonEnviarSunat row={row} />
            </div>
          );
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
          return (
            <div className="text-center w-full">
              <CPEAcctionList row={row} comunicatBaja={comunicatBaja} />
            </div>
          );
        },
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "show_columns",
        header: () => {
          return <div className="select-none text-center w-full">...</div>;
        },
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
      },
    ];
  }, [ENVIA_SUNAT, DECIMAL, comunicatBaja]);

  // Prefetch múltiples páginas
  useEffect(() => {
    if (!isPlaceholderData && data?.rowCount) {
      queryClient.prefetchQuery({
        queryKey: ["invoices", empresa, establecimiento, pagination.pageIndex + 1, pagination.pageSize],
        queryFn: () =>
          listInvoices(Number(empresa), Number(establecimiento), pagination.pageIndex + 1, pagination.pageSize),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [data, pagination.pageIndex, pagination.pageSize, empresa, establecimiento, isPlaceholderData, queryClient]);

  useEffect(() => {
    if (socket) {
      socket.emit("client::getInvoices");

      const receiveLogs = (log: any) => {
        setLogs((prev) => {
          // Verifica si el mensaje ya existe en el estado utilizando reduce
          const exists = prev.reduce((acc, curr) => {
            // Si ya existe un log igual, devolvemos true
            if (acc) return true;
            return curr.correlativo === log.correlativo;
          }, false);
          // Si el mensaje existe, no agregar al estado
          if (exists) return prev;
          // Si el mensaje ya existe, no realices cambios en el estado
          return [
            ...prev,
            {
              type: log.type,
              time: log.time,
              correlativo: log.correlativo,
              message: log.message,
            },
          ];
        });
      };

      const receiveInvoice = (data: IQueryInvoiceList) => {
        queryClient.setQueryData(
          [
            "invoices",
            empresa,
            establecimiento,
            0, //pagination.pageIndex
            pagination.pageSize,
          ],
          (prevInvoices: IQueryInvoice) => {
            // Verificar si algún elemento del array items coincide con data.correlativo
            const hasCorrelativo = prevInvoices.items.find((item) => item.correlativo === data.correlativo);

            // Si no hay ningún elemento con el mismo correlativo, agregar data al array items
            if (!hasCorrelativo) {
              return {
                ...prevInvoices,
                items: [
                  data, // Agrega el nuevo objeto data al inicio del array items
                  ...prevInvoices.items, // Conserva los elementos existentes en items
                ],
              };
            }

            return {
              ...prevInvoices,
              items: prevInvoices.items.map((item) => {
                // Si ya existe un elemento con el mismo correlativo y cambia de estado, actualizamos files y respuesta sunat
                if (
                  item.correlativo === data.correlativo &&
                  (item.estado_operacion !== data.estado_operacion || item.estado_operacion === data.estado_operacion)
                ) {
                  return {
                    ...item,
                    fecha_emision: data.fecha_emision,
                    cliente: data.cliente,
                    moneda: data.moneda_abrstandar,
                    mto_operaciones_gravadas: data.mto_operaciones_gravadas,
                    mto_operaciones_exoneradas: data.mto_operaciones_exoneradas,
                    mto_operaciones_inafectas: data.mto_operaciones_inafectas,
                    mto_operaciones_exportacion: data.mto_operaciones_exportacion,
                    mto_igv: data.mto_igv,
                    respuesta_sunat_codigo: data.respuesta_sunat_codigo,
                    respuesta_sunat_descripcion: data.respuesta_sunat_descripcion,
                    observaciones_sunat: data.observaciones_sunat,
                    estado_operacion: data.estado_operacion,
                    status: data.status,
                    xml: data.xml,
                    cdr: data.cdr,
                    forma_pago: data.forma_pago,
                  };
                } else {
                  return item;
                }
              }),
            };
          }
        );
      };

      //Escuchando al servidor
      socket.on("server::newInvoice", receiveInvoice);
      socket.on("server::notifyInvoice", receiveLogs);
      socket.on("exception", receiveLogs);
      return () => {
        socket.off("exception", receiveLogs);
        socket.off("server::notifyInvoice", receiveLogs);
        socket.off("server::newInvoice", receiveInvoice);
      };
    }
  }, [socket, queryClient, empresa, establecimiento, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    if (socket) {
      const receiveComuBaja = (data: any) => {
        queryClient.setQueryData(
          ["invoices", empresa, establecimiento, pagination.pageIndex, pagination.pageSize],
          (prevInvoices: IQueryInvoice) => {
            if (data.invoice) {
              // Verificar si algún elemento del array items coincide con data.correlativo
              const hasCorrelativo = prevInvoices.items.find((item) => item.correlativo === data.invoice.correlativo);

              // Si ya existe un elemento con el mismo correlativo validamos su cambio de estado
              if (hasCorrelativo) {
                return {
                  ...prevInvoices,
                  items: prevInvoices.items.map((item: any) => {
                    if (
                      item.estado_anulacion !== data.invoice.estado_anulacion &&
                      item.correlativo === data.invoice.correlativo
                    ) {
                      return {
                        ...item,
                        respuesta_anulacion_codigo: data.invoice.respuesta_anulacion_codigo,
                        respuesta_anulacion_descripcion: data.invoice.respuesta_anulacion_descripcion,
                        observaciones_sunat: data.invoice.observaciones_sunat,
                        estado_anulacion: data.invoice.estado_anulacion,
                        status: data.invoice.status,
                        xml: data.invoice.xml,
                        cdr: data.invoice.cdr,
                      };
                    }
                    return item;
                  }),
                };
              }
            }
          }
        );
      };

      socket.on("server::comuBaja", receiveComuBaja);

      return () => {
        socket.off("server::comuBaja", receiveComuBaja);
      };
    }
  }, [queryClient, socket, empresa, establecimiento, pagination.pageIndex, pagination.pageSize]);

  const initialVisibleColumn: VisibilityState = columns.reduce((acc: VisibilityState, item) => {
    const visible = item.visible ?? true;
    if (item.id) {
      acc[item.id] = visible;
    }
    return acc;
  }, {});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibleColumn);

  const initialSortColumn: SortingState = columns.reduce((acc: SortingState, item) => {
    if (item.sortDescFirst && initialVisibleColumn[String(item.id)]) {
      acc.push({ id: String(item.id), desc: item.sortDescFirst });
    }
    return acc;
  }, []);
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
    columnResizeMode: "onEnd",
    //onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    sortDescFirst: true,
    manualPagination: true,
    manualSorting: false,
    enableFooter: true,
    enableLoading: isPending || isFetching,
    rowCount: dataProps.rowCount,
  });

  return (
    <>
      {reconnecting && (
        <Alert severity="error">
          <strong>
            Se produjo un error en el servidor. Estamos trabajando para solucionarlo. Por favor, inténtalo de nuevo más
            tarde.
          </strong>
        </Alert>
      )}

      <DataTable2 table={table} />

      <div className="flex flex-col mt-2">
        <div className="rounded-[4px] flex flex-row w-full bg-bgDefault p-2 justify-between items-center ">
          <span className="text-default font-bold">Historial</span>
          <span className="text-default font-bold cursor-pointer" onClick={() => setMinimizar(!minimizar)}>
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
              <div className="h-[107px] flex-col w-full text-[11px] overflow-auto">
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
              <div className="h-[107px] text-[11px] flex flex-col justify-center items-center">
                No hay mensajes disponibles
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CPEList;
