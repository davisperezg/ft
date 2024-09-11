import { Dayjs } from "dayjs";
import { IProducto } from "./producto.interface";
import { IEmpresa } from "./empresa.interface";
import { IEstablecimiento } from "./establecimiento.interface";
import { IUserMysql } from "./user.interface";
import { IMoneda } from "./moneda.interface";
import { IFormaPagos } from "./forma_pagos.interface";
import { IEntidad } from "./entidad.interface";

export interface IInvoice {
  id?: number;
  serie: string;
  correlativo?: string;
  numero: string;
  numeroConCeros?: string;
  fecha_emision: Dayjs | Date | string;
  fecha_vencimiento?: Dayjs | null | Date;
  ruc: string;
  cliente: IEntidad | string;
  direccion: string;
  tipo_documento?: string; //boleta, factura, etc...
  tipo_entidad: string; //dni, ruc, pasaporte, ce
  tipo_operacion: string; //0101 venta interna
  moneda: IMoneda | string;
  forma_pago: IFormaPagos | string;
  observacion?: string;
  observaciones_invoice?: any[];
  observaciones_sunat?: any[] | string;
  producto?: IProducto;
  productos: IProducto[];
  mto_operaciones_gravadas?: string;
  mto_operaciones_exoneradas?: string;
  mto_operaciones_inafectas?: string;
  mto_operaciones_exportacion?: string;
  mto_operaciones_gratuitas?: string;
  mto_igv?: string;
  mto_igv_gratuitas?: string;
  porcentaje_igv?: string;
  estado_operacion?: number;
  respuesta_sunat_codigo?: string;
  respuesta_sunat_descripcion?: string;
  estado_anulacion?: number;
  respuesta_anulacion_codigo?: string;
  respuesta_anulacion_descripcion?: string;
  empresa?: IEmpresa | number;
  establecimiento?: IEstablecimiento | number;
  usuario?: IUserMysql | string;
  entidad?: string;
  entidad_tipo?: string;
  entidad_documento?: string;
  entidad_direccion?: string;
  pdfA4?: string;
  xml?: string;
  xmlSigned?: string;
  cdr?: string;
  status?: boolean;
  borrador?: boolean;
}
