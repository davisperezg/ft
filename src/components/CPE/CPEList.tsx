import { useContext, useEffect, useMemo, useState } from "react";
import ComponentTable from "../Table/Index";
import { ModalContext } from "../../context/modalContext";
import { useSocketInvoice } from "../../hooks/useSocket";
import { IInvoice } from "../../interface/invoice.interface";
import { ColumnDef } from "@tanstack/react-table";
import { Alert, IconButton, Tooltip } from "@mui/material";
import { decimalesSimples } from "../../utils/letras_numeros";
import { FaRegFilePdf } from "react-icons/fa";
import { TfiTicket } from "react-icons/tfi";
import { BsFiletypeXml } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsFileEarmarkCode } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import SunatLogo from "../../assets/sunat.svg";
import { IConfigEstablecimiento } from "../../interface/config_establecimiento.interface";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { FcInfo } from "react-icons/fc";
import { IoIosCloseCircle } from "react-icons/io";
import { IMoneda } from "../../interface/moneda.interface";
import ToolTipIconButton from "../Material/Tooltip/IconButton";

interface ILog {
  type: "";
  message: "";
  correlativo: "";
  time: "";
}

const CPEList = () => {
  const { userGlobal } = useContext(ModalContext);
  const { socket, reconnecting } = useSocketInvoice();
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [minimizar, setMinimizar] = useState<boolean>(false);
  const configuraciones = userGlobal.empresaActual.establecimiento
    .configuraciones as IConfigEstablecimiento[];

  const [logs, setLogs] = useState<ILog[]>([]);

  const loadDataInvoices = useMemo(() => {
    return invoices;
  }, [invoices]);

  const columns = useMemo<ColumnDef<IInvoice>[]>(
    () => [
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
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue() as any}
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
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue() as any}
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

          //SUMAR TODOS LOS MONTOS + EL IGV
          const total = decimalesSimples(
            String(
              mto_operaciones_gravadas +
                mto_operaciones_exoneradas +
                mto_operaciones_inafectas +
                mto_operaciones_exportacion +
                mto_igv
            )
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

          return (
            <div className="p-[4px] pb-[4px] text-[16px] text-center flex justify-center">
              <ToolTipIconButton title="Descargar PDF formato A4">
                <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                  <FaRegFilePdf className="text-primary cursor-pointer" />
                </a>
              </ToolTipIconButton>

              <ToolTipIconButton title="PDF formato Ticket 58mm">
                <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                  <TfiTicket className="text-blue-700 cursor-pointer" />
                </a>
              </ToolTipIconButton>

              <ToolTipIconButton title="PDF formato Ticket 80mm">
                <a target="_blank" rel="noopener noreferrer" href={pdfA4}>
                  <TfiTicket className="text-blue-900 cursor-pointer" />
                </a>
              </ToolTipIconButton>
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
          const xmlSigned = row.original.xmlSigned;

          return (
            <div className="p-[4px] pb-[4px] text-[16px] text-center flex justify-center">
              <ToolTipIconButton title="Descargar XML firmado">
                <a href={xmlSigned}>
                  <BsFiletypeXml className="text-green-700 cursor-pointer" />
                </a>
              </ToolTipIconButton>
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
          const estadoAnul = Number(row.original.estado_anulacion); //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado

          return (
            <div className="p-[4px] pb-[4px] text-[14px] text-center flex justify-center">
              {estadoOpe === 0 ? (
                <>{"-"}</>
              ) : estadoOpe === 1 || estadoAnul === 1 ? (
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
          const estadoOpe = Number(row.original.estado_operacion); //0-creado, 1-enviando, 2-aceptado, 3-rechazado
          const estadoAnul = Number(row.original.estado_anulacion); //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado
          const mensajeSunat = row.original.respuesta_sunat_descripcion;
          const codigoSunat = row.original.respuesta_sunat_codigo;
          const mensajeSunatAnulacion =
            row.original.respuesta_anulacion_descripcion;
          const codigoSunatAnulacion = row.original.respuesta_anulacion_codigo;
          const observaciones = row.original.observaciones_sunat
            ? String(row.original.observaciones_sunat)
                .split("|")
                .map((obs) => obs.match(/\b\w+\b/)?.[0])
            : [];

          return (
            <div className="p-[4px] pb-[4px] text-[14px] text-center flex justify-center">
              {estadoOpe === 0 ? (
                <>
                  <ToolTipIconButton
                    title="Enviar a sunat"
                    onClick={() => {
                      return socket?.volatile.emit(
                        "client::newInvoice",
                        row.original
                      );
                    }}
                  >
                    <img
                      src={SunatLogo}
                      alt="Sunat"
                      className="w-6 h-6 cursor-pointer"
                    />
                  </ToolTipIconButton>
                </>
              ) : estadoOpe === 1 || estadoAnul === 1 ? (
                <>
                  <ToolTipIconButton title="Enviando a sunat">
                    <AiOutlineLoading3Quarters className="text-black-700 animate-spin" />
                  </ToolTipIconButton>
                </>
              ) : estadoOpe === 2 ? (
                <>
                  {estadoAnul === 2 ? (
                    <ToolTipIconButton
                      title={
                        <>
                          <div className="flex flex-col">
                            <strong>Anulación aceptada</strong>
                            <span>Código: {codigoSunatAnulacion}</span>
                            <span>Mensaje: {mensajeSunatAnulacion}</span>
                            <div className="flex flex-row">
                              Observaciones:{" "}
                              {observaciones.length > 0 ? (
                                <div>
                                  {" ["}
                                  {observaciones.map((obs) => obs).join(",")}
                                  {"]"}
                                </div>
                              ) : (
                                "Ninguna"
                              )}
                            </div>
                          </div>
                        </>
                      }
                    >
                      <IoIosCloseCircle className="text-primary cursor-pointer" />
                    </ToolTipIconButton>
                  ) : estadoAnul === 3 ? (
                    <ToolTipIconButton
                      title={
                        <>
                          <div className="flex flex-col">
                            <strong>Rechazado por sunat</strong>
                            <span>Código: {codigoSunatAnulacion}</span>
                            <span>Mensaje: {mensajeSunatAnulacion}</span>
                            <div className="flex flex-row">
                              Observaciones:{" "}
                              {observaciones.length > 0 ? (
                                <div>
                                  {" ["}
                                  {observaciones.map((obs) => obs).join(",")}
                                  {"]"}
                                </div>
                              ) : (
                                "Ninguna"
                              )}
                            </div>
                          </div>
                        </>
                      }
                    >
                      <FcInfo className="cursor-pointer" />
                    </ToolTipIconButton>
                  ) : (
                    <ToolTipIconButton
                      title={
                        <>
                          <div className="flex flex-col">
                            <strong>Aceptado por sunat</strong>
                            <span>Código: {codigoSunat}</span>
                            <span>Mensaje: {mensajeSunat}</span>
                            <div className="flex flex-row">
                              Observaciones:{" "}
                              {observaciones.length > 0 ? (
                                <div>
                                  {" ["}
                                  {observaciones.map((obs) => obs).join(",")}
                                  {"]"}
                                </div>
                              ) : (
                                "Ninguna"
                              )}
                            </div>
                          </div>
                        </>
                      }
                    >
                      <FaCheck className="text-green-700 cursor-pointer" />
                    </ToolTipIconButton>
                  )}
                </>
              ) : (
                estadoOpe === 3 && (
                  <>
                    <ToolTipIconButton
                      title={
                        <>
                          <div className="flex flex-col">
                            <strong>Rechazado por sunat</strong>
                            <span>Código: {codigoSunat}</span>
                            <span>Mensaje: {mensajeSunat}</span>
                            <div className="flex flex-row">
                              Observaciones:{" "}
                              {observaciones.length > 0 ? (
                                <div>
                                  {" ["}
                                  {observaciones.map((obs) => obs).join(",")}
                                  {"]"}
                                </div>
                              ) : (
                                "Ninguna"
                              )}
                            </div>
                          </div>
                        </>
                      }
                    >
                      <FcInfo className="cursor-pointer" />
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
        accessorKey: "acciones",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center"></div>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[14px] text-center flex justify-center">
              <Tooltip
                title="Más opciones"
                sx={{ marginTop: "-4px" }}
                placement="top"
                arrow
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -8],
                        },
                      },
                    ],
                  },
                }}
              >
                <IconButton
                  sx={{
                    margin: 0,
                    padding: 0,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <SlOptionsVertical className="text-black-700 cursor-pointer" />
                </IconButton>
              </Tooltip>
            </div>
          );
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
    ],
    [socket]
  );

  useEffect(() => {
    if (socket) {
      socket.emit("client::getInvoices");
      const interval = setInterval(() => {
        socket.emit("client::getInvoices");
      }, 1000 * 60);

      const receiveInvoices = (invoice: IInvoice[]) => {
        setLoading(false);
        setInvoices(invoice);
      };

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

      //Escuchando al servidor
      socket.on("server::listInvoices", receiveInvoices);

      socket.on("server::notifyInvoice", receiveLogs);

      socket.on("exception", (data: any) => {
        console.log(data);
        //receiveLogs(data);
      });

      return () => {
        socket.off("server::listInvoices", receiveInvoices);
        socket.off("error");
        socket.off("exception", receiveLogs);
        socket.off("server::notifyInvoice", receiveLogs);
        clearInterval(interval);
      };
    }
  }, [socket]);
  //console.log(loadDataInvoices);
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
        loading={loading || reconnecting}
        data={loadDataInvoices}
        columns={columns}
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
                  return (
                    <div
                      key={i}
                      className={`${
                        log.type === "error" || log.type === "sunat.failed"
                          ? "text-primary"
                          : log.type === "sunat.success"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
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
