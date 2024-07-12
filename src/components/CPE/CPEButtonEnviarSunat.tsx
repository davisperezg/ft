import { Row } from "@tanstack/react-table";
import { IInvoice } from "../../interface/invoice.interface";
import ToolTipIconButton from "../Material/Tooltip/IconButton";
import { IoIosCloseCircle } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import SunatLogo from "../../assets/sunat.svg";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { TiCancel } from "react-icons/ti";
import ButtonSimple from "../Material/Button/ButtonSimple";
import { DialogActionKind } from "../../reducers/dialogReducer";
import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { IFormaPagos } from "../../interface/forma_pagos.interface";
import { IMoneda } from "../../interface/moneda.interface";
import { IEntidad } from "../../interface/entidad.interface";
import dayjs from "dayjs";

interface IProps {
  row: Row<IInvoice>;
}

const CPEButtonEnviarSunat = ({ row }: IProps) => {
  const { dispatch } = useContext(ModalContext);

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
  const formatoEditInvoice: IInvoice = {
    id: row.original.id,
    cliente: row.original.cliente
      ? (row.original.cliente as IEntidad).entidad
      : String(row.original.entidad),
    direccion: row.original.cliente
      ? (row.original.cliente as IEntidad).direccion
      : String(row.original.entidad_direccion),
    fecha_emision: dayjs(row.original.fecha_emision),
    fecha_vencimiento: row.original.fecha_vencimiento
      ? dayjs(row.original.fecha_vencimiento)
      : null,
    forma_pago: (row.original.forma_pago as IFormaPagos).forma_pago,
    moneda: (row.original.moneda as IMoneda).abrstandar,
    numero: String(row.original.correlativo),
    numeroConCeros: row.original.correlativo,
    observacion: row.original.observacion,
    observaciones_invoice: [],
    productos: row.original.productos,
    ruc: row.original.cliente
      ? (row.original.cliente as IEntidad).numero_documento
      : String(row.original.entidad_documento),
    serie: row.original.serie,
    tipo_entidad: row.original.cliente
      ? String((row.original.cliente as IEntidad).tipo_entidad)
      : String(row.original.tipo_entidad),
    tipo_operacion: row.original.tipo_operacion,
  };

  return (
    <div className="p-[4px] pb-[4px] text-[14px] text-center flex justify-center">
      {estadoOpe === 0 ? (
        <>
          {borrador ? (
            <ToolTipIconButton
              title={
                <div className="flex flex-col">
                  <>
                    CUIDADO: Los borradores NO se envían automáticamente a la
                    SUNAT.
                  </>
                  <div className="flex justify-center items-center">
                    <ButtonSimple
                      onClick={() => {
                        return dispatch({
                          type: DialogActionKind.SCREEN_FACTURA,
                          payload: { ...formatoEditInvoice },
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
                className="bg-primary text-[10px] text-white px-[5px] py-[2px] rounded-full hover:text-white"
              >
                Borrador
              </a>
            </ToolTipIconButton>
          ) : (
            <ToolTipIconButton title="Enviar a sunat">
              <img
                src={SunatLogo}
                alt="Sunat"
                className="w-6 h-6 cursor-pointer"
              />
            </ToolTipIconButton>
          )}
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
              <IoIosCloseCircle className="text-primary cursor-pointer" />
            </ToolTipIconButton>
          ) : estadoAnul === 3 ? (
            <ToolTipIconButton
              title={
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
              title={
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
        estadoOpe === 3 && (
          <div>
            <ToolTipIconButton
              title={
                <>
                  <div className="flex flex-col">
                    <span>Estado: Rechazado</span>
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
