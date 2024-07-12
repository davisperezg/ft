import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ComponentTable from "../Table/Index";
import { ModalContext } from "../../context/modalContext";
import { useSocketInvoice } from "../../hooks/useSocket";
import { IInvoice } from "../../interface/invoice.interface";
import { ColumnDef } from "@tanstack/react-table";
import { Alert } from "@mui/material";
import { FaRegFilePdf } from "react-icons/fa";
import { TfiTicket } from "react-icons/tfi";
import { BsFiletypeXml } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsFileEarmarkCode } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { IMoneda } from "../../interface/moneda.interface";
import ToolTipIconButton from "../Material/Tooltip/IconButton";
import CPEAcctionList from "./CPEAcctionList";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { listInvoices } from "../../api/invoice";
import { TableContext } from "../../context/tableContext";
import CPEButtonEnviarSunat from "./CPEButtonEnviarSunat";
import dayjs from "dayjs";
import { fixed } from "../../utils/functions";

interface ILog {
  type: string;
  message: string;
  correlativo: string;
  time: string;
}

const CPEList = () => {
  const queryClient = useQueryClient();
  const { userGlobal } = useContext(ModalContext);
  const { paginationSize } = useContext(TableContext);
  const { socket, reconnecting } = useSocketInvoice();

  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: paginationSize,
  });

  const empresa = userGlobal.empresaActual.id;
  const establecimiento = userGlobal.empresaActual.establecimiento.id;
  const [propsPagination, setPropsPagination] = useState<any>();
  const [logs, setLogs] = useState<ILog[]>([]);
  const [minimizar, setMinimizar] = useState<boolean>(false);

  const {
    data: dataPagination,
    isPlaceholderData,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: ["invoices", pagination.pageIndex],
    queryFn: () =>
      listInvoices(
        empresa,
        establecimiento,
        pagination.pageIndex,
        paginationSize
      ),
    placeholderData: keepPreviousData,
  });

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

  const columns = useMemo<ColumnDef<IInvoice>[]>(() => {
    return [
      {
        accessorKey: "fecha_registro",
        id: "fecha_registro",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">
              Fecha de registro
            </div>
          );
        },
        cell: ({ getValue }) => {
          const registro = getValue() as any;
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {dayjs(registro).format("DD-MM-YYYY HH:mm:ss")}
            </div>
          );
        },
        visible: false,
        size: 120,
        minSize: 31,
      },
      {
        accessorKey: "fecha_emision",
        id: "fecha_emision",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">
              Fecha de emision
            </div>
          );
        },
        cell: ({ getValue }) => {
          const emision = getValue() as any;
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {dayjs(emision).format("DD-MM-YYYY HH:mm:ss")}
            </div>
          );
        },
        size: 120,
        minSize: 31,
      },
      {
        accessorKey: "tipo_doc",
        id: "tipo_doc",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Comprobante</div>
          );
        },
        cell: ({ getValue, row }) => {
          const comprobante = String(
            (getValue() as any).tipo_documento
          ).toUpperCase();

          const serie = row.original.serie;
          const correlativo = row.original.correlativo;

          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">{`${comprobante}:${serie}-${correlativo}`}</div>
          );
        },
        size: 150,
        minSize: 31,
      },
      {
        accessorKey: "cliente",
        id: "cliente",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Cliente</div>;
        },
        cell: ({ getValue, row }) => {
          if (getValue()) {
            const nombreEntidad = String(
              (getValue() as any).entidad
            ).toUpperCase();

            const nroDocEntidad = String(
              (getValue() as any).numero_documento
            ).toUpperCase();

            return (
              <div className="p-[4px] pb-[4px] text-[12px] ">{`${nroDocEntidad} - ${nombreEntidad}`}</div>
            );
          } else {
            const nombreEntidad = String(row.original.entidad).toUpperCase();

            const nroDocEntidad = String(
              row.original.entidad_documento
            ).toUpperCase();
            return (
              <div className="p-[4px] pb-[4px] text-[12px] ">{`${nroDocEntidad} - ${nombreEntidad}`}</div>
            );
          }
        },
        size: 280,
        minSize: 31,
      },
      {
        accessorKey: "total",
        id: "total",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              Total
            </div>
          );
        },
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

          const DECIMAL = 6;

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

          const moneda = row.original.moneda as IMoneda;

          return (
            <div className="p-[4px] pb-[4px] text-[12px] text-center">
              {moneda.simbolo} {total}
            </div>
          );
        },
        size: 80,
        minSize: 31,
      },
      {
        accessorKey: "usuario",
        id: "vendido_por",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Vendido por</div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px]">
              {getValue() as any}
            </div>
          );
        },
        visible: false,
        size: 80,
        minSize: 31,
      },
      {
        accessorKey: "moneda",
        id: "moneda",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              Moneda
            </div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] text-center">
              {(getValue() as any).abrstandar}
            </div>
          );
        },
        visible: false,
        size: 60,
        minSize: 31,
      },
      {
        accessorKey: "pdf",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              PDF
            </div>
          );
        },
        cell: ({ row }) => {
          const pdfA4 = row.original.pdfA4;
          const status = row.original.status;
          return (
            <div className="p-[4px] pb-[4px] text-[16px] text-center flex justify-center">
              {status ? (
                <ToolTipIconButton title="Descargar PDF formato A4">
                  <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                    <FaRegFilePdf className="text-primary cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <FaRegFilePdf className="text-primary" />
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
        accessorKey: "xml",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              XML
            </div>
          );
        },
        cell: ({ row }) => {
          const xmlSigned = row.original.xml;
          const status = row.original.status;

          return (
            <div className="p-[4px] pb-[4px] text-[16px] text-center flex justify-center">
              {status ? (
                <ToolTipIconButton title="Descargar XML firmado">
                  <a href={xmlSigned}>
                    <BsFiletypeXml className="text-green-700 cursor-pointer" />
                  </a>
                </ToolTipIconButton>
              ) : (
                <BsFiletypeXml className="text-green-700r" />
              )}
            </div>
          );
        },
        size: 60,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
      },
      {
        accessorKey: "cdr",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              CDR
            </div>
          );
        },
        cell: ({ row }) => {
          const cdr = row.original.cdr;
          const estadoOpe = Number(row.original.estado_operacion); //0-creado, 1-enviando, 2-aceptado, 3-rechazado
          //const estadoAnul = Number(row.original.estado_anulacion); //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado

          return (
            <div className="p-[4px] pb-[4px] text-[14px] text-center flex justify-center">
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
      },
      {
        accessorKey: "sunat",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              Sunat
            </div>
          );
        },
        cell: ({ row }) => {
          return <CPEButtonEnviarSunat row={row} />;
        },
        size: 60,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
      },
      {
        accessorKey: "acciones",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center"></div>
          );
        },
        cell: ({ row }) => {
          return <CPEAcctionList row={row} comunicatBaja={comunicatBaja} />;
        },
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
      },
      {
        accessorKey: "actions",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              ...
            </div>
          );
        },
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
      },
    ];
  }, [comunicatBaja]);

  const data = useMemo(() => {
    if (
      dataPagination &&
      dataPagination?.statusCode === "success" &&
      dataPagination?.items.length === 0
    ) {
      setPagination((old) => {
        return {
          ...old,
          pageIndex: old.pageIndex - 1,
        };
      });
    }

    if (dataPagination && dataPagination?.items?.length > 0) {
      setPropsPagination(dataPagination);
      return dataPagination?.items;
    }

    return [];
  }, [dataPagination]);

  useEffect(() => {
    if (!isPlaceholderData && pagination.pageSize) {
      queryClient.prefetchQuery({
        queryKey: ["invoices", pagination.pageIndex],
        queryFn: () =>
          listInvoices(
            empresa,
            establecimiento,
            pagination.pageIndex,
            pagination.pageSize
          ),
      });
    }
  }, [
    empresa,
    establecimiento,
    isPlaceholderData,
    pagination.pageIndex,
    pagination.pageSize,
    queryClient,
  ]);
  // END: be15d9bcejpp

  // Prefetch the next page!
  useEffect(() => {
    if (!isPlaceholderData && dataPagination && dataPagination.nextPage) {
      queryClient.prefetchQuery({
        queryKey: ["invoices", pagination.pageIndex + 1],
        queryFn: async () =>
          await listInvoices(
            empresa,
            establecimiento,
            pagination.pageIndex + 1,
            pagination.pageSize
          ),
      });
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    data,
    empresa,
    establecimiento,
    isPlaceholderData,
    queryClient,
    dataPagination,
  ]);

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

      const receiveInvoice = (data: any) => {
        queryClient.setQueryData(["invoices", 1], (prevInvoices: any) => {
          // Verificar si algún elemento del array items coincide con data.correlativo
          const hasCorrelativo = prevInvoices.items.find(
            (item: any) => item.correlativo === data.correlativo
          );

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

          // Si ya existe un elemento con el mismo correlativo validamos su cambio de estado
          return {
            ...prevInvoices,
            items: prevInvoices.items.map((item: any) => {
              if (
                item.estado_operacion !== data.estado_operacion &&
                item.correlativo === data.correlativo
              ) {
                return {
                  ...item,
                  respuesta_sunat_codigo: data.respuesta_sunat_codigo,
                  respuesta_sunat_descripcion: data.respuesta_sunat_descripcion,
                  observaciones_sunat: data.observaciones_sunat,
                  estado_operacion: data.estado_operacion,
                  status: data.status,
                  xml: data.xml,
                  cdr: data.cdr,
                };
              }
              return item;
            }),
          };
        });
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
  }, [socket, queryClient]);

  useEffect(() => {
    if (socket) {
      const receiveComuBaja = (data: any) => {
        queryClient.setQueryData(["invoices", 1], (prevInvoices: any) => {
          if (data.invoice) {
            // Verificar si algún elemento del array items coincide con data.correlativo
            const hasCorrelativo = prevInvoices.items.find(
              (item: any) => item.correlativo === data.invoice.correlativo
            );

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
                      respuesta_anulacion_codigo:
                        data.invoice.respuesta_anulacion_codigo,
                      respuesta_anulacion_descripcion:
                        data.invoice.respuesta_anulacion_descripcion,
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
        });
      };

      socket.on("server::comuBaja", receiveComuBaja);

      return () => {
        socket.off("server::comuBaja", receiveComuBaja);
      };
    }
  }, [queryClient, socket]);

  return (
    <>
      {reconnecting && (
        <Alert severity="error">
          <strong>
            Se produjo un error en el servidor. Estamos trabajando para
            solucionarlo. Por favor, inténtalo de nuevo más tarde.
          </strong>
        </Alert>
      )}
      <ComponentTable
        loading={isPending || reconnecting || isFetching}
        data={data}
        columns={columns}
        propsPagination={propsPagination}
        setPaginationState={setPagination}
      />

      <div className="flex flex-col mt-2">
        <div className="flex flex-row w-full bg-[#F6F6F6] p-2 justify-between items-center text-[12px]">
          <span className="text-textDefault font-bold">Historial</span>
          <span
            className="text-textDefault font-bold cursor-pointer"
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
                          ? "text-primary"
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
      </div>
    </>
  );
};

export default CPEList;
