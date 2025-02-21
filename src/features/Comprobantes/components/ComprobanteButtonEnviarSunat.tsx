import { Row } from "@tanstack/react-table";
import ToolTipIconButton from "../../../components/Material/Tooltip/IconButton";
import { IoIosCloseCircle } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import SunatLogo from "../../../assets/sunat.svg";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { TiCancel } from "react-icons/ti";
import ButtonSimple from "../../../components/Material/Button/ButtonSimple";
import dayjs from "dayjs";
import { IQueryInvoiceList } from "../../../interfaces/models/invoices/invoice.interface";
import { useUserStore } from "../../../store/zustand/user-zustand";
import { usePageStore } from "../../../store/zustand/page-zustand";
import { PageEnum } from "../../../types/enums/page.enum";
import { IFeatureInvoice } from "../../../interfaces/features/invoices/invoice.interface";

interface IProps {
  row: Row<IQueryInvoiceList>;
}

const CPEButtonEnviarSunat = ({ row }: IProps) => {
  const userGlobal = useUserStore((state) => state.userGlobal);
  const setPage = usePageStore((state) => state.setPage);

  const configuracionesEstablecimiento =
    userGlobal?.empresaActual?.establecimiento?.configuraciones ?? [];

  const ENVIA_DIRECTO_SUNAT = configuracionesEstablecimiento.some(
    (config) => config.enviar_inmediatamente_a_sunat
  );

  const estadoOpe = Number(row.original.estado_operacion); //0-creado, 1-enviando, 2-aceptado, 3-rechazado
  const estadoAnul = Number(row.original.estado_anulacion); //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado
  const mensajeSunat = row.original.respuesta_sunat_descripcion;
  const codigoSunat = row.original.respuesta_sunat_codigo;
  const mensajeSunatAnulacion = row.original.respuesta_anulacion_descripcion;
  const codigoSunatAnulacion = row.original.respuesta_anulacion_codigo;
  const observaciones = row.original.observaciones_sunat
    ? String(row.original.observaciones_sunat)
        .split("|")
        .map((obs) => obs.match(/\b\w+\b/)?.[0])
    : [];

  const borrador = row.original.borrador;

  //null-no enviado, 1-enviado con ticket, 2-aceptado, 3-rechazado
  const formatoEditInvoice: IFeatureInvoice = {
    id: row.original.id,
    empresa: row.original.empresa,
    establecimiento: row.original.establecimiento,
    tipo_documento: row.original.tipo_documento,
    serie: row.original.serie,
    numero: row.original.correlativo,
    numeroConCeros: row.original.correlativo,
    fecha_emision: dayjs(row.original.fecha_emision),
    fecha_vencimiento: row.original.fecha_vencimiento
      ? dayjs(row.original.fecha_vencimiento)
      : undefined,
    ruc: row.original.cliente_num_doc,
    cliente: row.original.cliente,
    direccion: row.original.cliente_direccion,
    tipo_entidad: row.original.cliente_cod_doc,
    tipo_operacion: row.original.tipo_operacion,
    moneda: row.original.moneda_abrstandar,
    forma_pago: row.original.forma_pago,
    borrador: row.original.borrador,
    producto: undefined,
    details: row.original.details.map((item) => {
      return {
        id: item.id,
        posicionTabla: item.posicionTabla,
        uuid: item.uuid,
        cantidad: item.cantidad,
        codigo: item.codigo,
        descripcion: item.descripcion,
        mtoValorUnitario: String(item.mtoValorUnitario),
        porcentajeIgv: item.porcentajeIgv,
        tipAfeIgv: item.tipAfeIgv,
        unidad: item.unidad,
        presentation: undefined,
        producto: undefined,
      };
    }),
    observaciones: row.original.observaciones?.map((item) => {
      return {
        observacion: item.observacion,
        uuid: item.uuid,
      };
    }),
    observacion: undefined,
  };

  const handleEnviaSunat = () => {
    if (!ENVIA_DIRECTO_SUNAT) return;
    alert("Enviando a sunat...");
  };

  return (
    <div className="p-[4px] pb-[4px] text-[14px] text-center flex justify-center">
      {estadoOpe === 0 ? (
        <>
          {borrador ? (
            <ToolTipIconButton
              titleTooltip={
                <div className="flex flex-col">
                  <>
                    CUIDADO: Los borradores NO se envían automáticamente a la
                    SUNAT.
                  </>
                  <div className="flex justify-center items-center">
                    <ButtonSimple
                      onClick={() => {
                        setPage({
                          namePage: PageEnum.SCREEN_FACTURA,
                          payload: { ...formatoEditInvoice },
                          open: true,
                          pageComplete: true,
                        });
                      }}
                      variant="contained"
                      color="info"
                    >
                      Editar borrador
                    </ButtonSimple>
                  </div>
                </div>
              }
            >
              <a
                type="button"
                className="bg-danger text-[10px] text-white px-[5px] rounded-full hover:text-white"
              >
                Borrador
              </a>
            </ToolTipIconButton>
          ) : ENVIA_DIRECTO_SUNAT ? (
            <ToolTipIconButton
              component={"button"}
              titleTooltip="Enviar a sunat"
              onClick={handleEnviaSunat}
            >
              <img
                src={SunatLogo}
                alt="Sunat"
                className="w-6 h-6 cursor-pointer"
              />
            </ToolTipIconButton>
          ) : (
            <a
              type="button"
              className="bg-green-700 text-[10px] text-white px-[5px] py-[2px] rounded-full hover:text-white"
            >
              Generado
            </a>
          )}
        </>
      ) : estadoOpe === 1 || estadoAnul === 1 ? (
        <>
          <ToolTipIconButton titleTooltip="Enviando a sunat">
            <AiOutlineLoading3Quarters className="text-black-700 animate-spin" />
          </ToolTipIconButton>
        </>
      ) : estadoOpe === 2 ? (
        <>
          {estadoAnul === 2 ? (
            <ToolTipIconButton
              titleTooltip={
                <>
                  <div className="flex flex-col">
                    <span>Estado: Baja</span>
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
              <IoIosCloseCircle className="text-danger cursor-pointer" />
            </ToolTipIconButton>
          ) : estadoAnul === 3 ? (
            <ToolTipIconButton
              titleTooltip={
                <>
                  <div className="flex flex-col">
                    <span>Estado: Rechazado</span>
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
              <TiCancel className="cursor-pointer" />
            </ToolTipIconButton>
          ) : (
            <ToolTipIconButton
              titleTooltip={
                <>
                  <div className="flex flex-col">
                    <span>Estado: Aceptado</span>
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
        (estadoOpe === 3 || estadoOpe === 4) && (
          <div>
            <ToolTipIconButton
              titleTooltip={
                <>
                  <div className="flex flex-col">
                    <span>
                      Estado:
                      {estadoOpe === 3
                        ? "Rechazado"
                        : "Excepcion - Error del Contribuyente"}
                    </span>
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
              <TiCancel className="cursor-pointer" />
            </ToolTipIconButton>
          </div>
        )
      )}
    </div>
  );
};

export default CPEButtonEnviarSunat;
