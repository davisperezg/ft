import { IEmpresa } from "../empresa/empresa.interface";
import { IEstablecimiento } from "../establecimiento/establecimiento.interface";
import { IUserMysql } from "../user/user.interface";
import { IMoneda } from "../tipo-moneda/moneda.interface";
import { IFormaPagos } from "../forma-pagos/forma_pagos.interface";
import { IEntidad } from "../entidad/entidad.interface";
import { ICPEType } from "../tipo-docs-cpe/tipo-docs.interface";
import { IInvoiceDetails, IQueryDetailsInvoice } from "./invoice-details.interface";
import { IPos } from "../pos/pos.interface";

export interface IInvoice {
  id?: number;
  tipo_operacion: string; //0101 venta interna
  tipo_documento: ICPEType; //boleta, factura, etc...
  serie: string;
  correlativo: string;
  fecha_emision: Date;
  fecha_vencimiento?: Date;
  forma_pago: IFormaPagos;
  moneda: IMoneda;
  empresa: IEmpresa;
  establecimiento: IEstablecimiento;
  cliente: IEntidad;
  usuario: IUserMysql;
  mto_operaciones_gravadas?: number;
  mto_operaciones_exoneradas?: number;
  mto_operaciones_inafectas?: number;
  mto_operaciones_exportacion?: number;
  mto_operaciones_gratuitas?: number;
  mto_igv?: number;
  mto_igv_gratuitas?: number;
  porcentaje_igv: number;
  estado_operacion?: number;
  estado_anulacion?: number;
  respuesta_sunat_codigo?: string;
  respuesta_sunat_descripcion?: string;
  respuesta_anulacion_codigo?: string;
  respuesta_anulacion_descripcion?: string;
  observaciones_invoice?: string;
  observaciones_sunat?: string;
  entidad: string;
  entidad_tipo: string; //dni, ruc, pasaporte, ce
  entidad_documento: string;
  entidad_direccion: string;
  createdAt?: Date;
  updatedAt?: Date;
  borrador?: boolean;
  invoices_details: IInvoiceDetails[];
  pos: IPos;
  envio_sunat_modo: string;
}

export interface IQueryInvoice {
  statusCode: string;
  pageSize: number;
  pageCount: number;
  rowCount: number;
  items: IQueryInvoiceList[];
}

export interface IQueryInvoiceList
  extends Required<
    Pick<
      IInvoice,
      | "id"
      | "tipo_operacion"
      | "serie"
      | "correlativo"
      | "mto_operaciones_gravadas"
      | "mto_operaciones_exoneradas"
      | "mto_operaciones_inafectas"
      | "mto_operaciones_exportacion"
      | "mto_operaciones_gratuitas"
      | "mto_igv"
      | "mto_igv_gratuitas"
      | "porcentaje_igv"
      | "estado_operacion"
      | "respuesta_sunat_codigo"
      | "respuesta_sunat_descripcion"
      | "borrador"
      | "envio_sunat_modo"
    >
  > {
  cliente: string;
  cliente_cod_doc: string;
  cliente_num_doc: string;
  cliente_direccion: string;
  empresa: number;
  establecimiento: number;
  pos: number;
  moneda_abrstandar: string;
  moneda_simbolo: string;
  forma_pago: string;
  usuario: string;
  fecha_vencimiento?: Date;
  estado_anulacion?: number;
  respuesta_anulacion_codigo?: string;
  respuesta_anulacion_descripcion?: string;
  observaciones_sunat?: string;
  observaciones?: {
    observacion: string;
    uuid: string;
  }[];
  xml?: string;
  cdr?: string;
  pdfA4?: string;
  fecha_registro: Date;
  fecha_emision: Date;
  details: IQueryDetailsInvoice[];
  status: boolean;
  tipo_documento: string;
  documento: string;
}

export interface IDTOQueryInvoiceRegistered {
  aceptada_sunat: string;
  borrador: boolean;
  cdr: string;
  codigo_sunat: string;
  correlativo_registrado: string;
  correlativo_registradoConCeros: string;
  documento: string;
  enviada_sunat: number;
  estado: string;
  fileName: string;
  invoice: IInvoice;
  loading: boolean;
  mensaje_sunat: string;
  numero: string;
  numeroConCeros: string;
  otros_sunat: string;
  pdfA4: string;
  serie: string;
  total: string;
  xml: string;
}
