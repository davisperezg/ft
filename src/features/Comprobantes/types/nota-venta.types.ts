import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { IEmpresa } from "../../../interfaces/models/empresa/empresa.interface";
import type { IEstablecimiento } from "../../../interfaces/models/establecimiento/establecimiento.interface";
import type { IEntidad } from "../../../interfaces/models/entidad/entidad.interface";
import type { IUserMysql } from "../../../interfaces/models/user/user.interface";
import type { ICPEType } from "../../../interfaces/models/tipo-docs-cpe/tipo-docs.interface";
import type { IMoneda } from "../../../interfaces/models/tipo-moneda/moneda.interface";
import type { IPos } from "../../../interfaces/models/pos/pos.interface";
import type { IProducto } from "../../../interfaces/models/producto/producto.interface";
import type { ITipoIgv } from "../../../interfaces/models/tipo-igv/tipo_igv.interface";
import type { IUnidades } from "../../../interfaces/models/unidades-medida/unidades.interface";

// ─── Entity (mirrors backend) ──────────────────────────────────────────────

export interface NotaVenta {
  id?: number;
  tipoDocumento: ICPEType;
  serie: string;
  correlativo: string;
  fechaEmision: Date;
  tipoMoneda: IMoneda;
  empresa: IEmpresa;
  establecimiento: IEstablecimiento;
  cliente: IEntidad;
  usuario: IUserMysql;
  mtoOpeGravada?: number;
  mtoOpeExonerada?: number;
  mtoOpeInafecta?: number;
  mtoOpeExportacion?: number;
  mtoOpeGratuita?: number;
  mtoIgv?: number;
  mtoIgvGratuitas?: number;
  porcentajeIgv: number;
  estadoOperacion?: number;
  estadoAnulacion?: number;
  observaciones?: string;
  entidad: string;
  tipoEntidad: string;
  documentoEntidad: string;
  direccionEntidad: string;
  pos: IPos;
  detail: NotaVentaDetail[];
}

export interface NotaVentaDetail {
  id?: number;
  cantidad: number;
  codigo?: string;
  mtoValorUnitario: number;
  mtoValorGratuito: number;
  porcentajeIgv: number;
  invoice: NotaVenta;
  unidad: IUnidades;
  tipAfeIgv: ITipoIgv;
  descripcion?: string;
  producto?: IProducto;
  presentation?: IProducto;
}

// ─── API Response DTOs ──────────────────────────────────────────────────────

export interface NotaVentaListItem {
  id: number;
  tipo_operacion: string;
  serie: string;
  correlativo: string;
  mto_operaciones_gravadas: number;
  mto_operaciones_exoneradas: number;
  mto_operaciones_inafectas: number;
  mto_operaciones_exportacion: number;
  mto_operaciones_gratuitas: number;
  mto_igv: number;
  mto_igv_gratuitas: number;
  porcentaje_igv: number;
  estado_operacion: number;
  estado_anulacion: number | null;
  observaciones:
    | {
        observacion: string;
        uuid: string;
      }[]
    | null;
  documento: string;
  tipo_documento: string;
  cliente: string;
  cliente_cod_doc: string;
  cliente_num_doc: string;
  cliente_direccion: string;
  empresa: number;
  establecimiento: number;
  pos: number;
  envio_sunat_modo: string;
  moneda_abrstandar: string;
  moneda_simbolo: string;
  usuario: string;
  details: NotaVentaDetailListItem[];
  status: boolean;
  pdf80mm: string | null;
  pdf58mm: string | null;
  fecha_registro: Date;
  fecha_emision: Date;
}

export interface NotaVentaDetailListItem {
  id: number;
  posicionTabla: number;
  uuid: string;
  cantidad: number;
  codigo: string;
  descripcion: string;
  mtoValorUnitario: number;
  porcentajeIgv: number;
  tipAfeIgv: string;
  unidad: string;
}

export interface NotaVentaPagedResponse {
  statusCode: string;
  pageSize: number;
  pageCount: number;
  rowCount: number;
  items: NotaVentaListItem[];
}

// ─── Form Values (react-hook-form) ─────────────────────────────────────────

export interface NotaVentaObservacionFormValues {
  observacion: string;
  uuid?: string;
}

// export interface NotaVentaDetailFormValues {
//   id?: number;
//   cantidad?: number;
//   codigo?: string;
//   descripcion: string;
//   unidad: string;
//   tipAfeIgv: string;
//   porcentajeIgv: number;
//   mtoValorUnitario: string;
//   producto?: number;
//   presentation?: number;
//   posicionTabla?: number;
// }

export interface NotaVentaProductFormValues {
  id?: number;
  cantidad?: number;
  codigo?: string;
  descripcion?: string;
  mtoValorUnitario?: string;
  estado?: boolean;
  tipAfeIgv?: string;
  unidad?: string;
  porcentajeIgv?: number;
  posicionTabla?: number;
}

export type NotaVentaDetailFormValues = NotaVentaProductFormValues;

export interface NotaVentaFormValues {
  id?: number;
  tipoDocumento: string;
  serie: string;
  numero: string;
  fechaEmision: Dayjs | Date | string;
  moneda: string;
  empresa: number;
  establecimiento: number;
  pos: number;
  tipoEntidad: string;
  numeroDocumento: string;
  nombreCliente: string;
  detalles: NotaVentaDetailFormValues[];
  observaciones?: NotaVentaObservacionFormValues[];
  observacion?: string;
  numeroConCeros?: string;
  producto?: NotaVentaProductFormValues;
}

// ─── UI State ──────────────────────────────────────────────────────────────

interface NotaVentaDetailTableItem extends NotaVentaDetailFormValues {
  uuid?: string;
  mtoPrecioUnitario: string;
  mtoTotalItem: string;
}

export interface NotaVentaProductTableState {
  operacion_gravada: number;
  igv: number;
  operacion_exonerada: number;
  operacion_inafecta: number;
  operacion_exportacion: number;
  operacion_gratuita: number;
  operacion_total: number;
  items: NotaVentaDetailTableItem[];
}

// ─── API Registered Response ────────────────────────────────────────────────

export interface NotaVentaRegisteredResponse {
  notaVenta: NotaVenta;
  fileName: string;
  message: string;
  documento: string;
  codigo_respuesta: string;
  serie: string;
  correlativo: string;
  correlativo_registrado: string;
  total: string;
  pdf80mm: string;
  pdf58mm: string;
  sendMode: string;
}

// ─── Initial Form Values ────────────────────────────────────────────────────

export const FORM_INITIAL_NOTA_VENTA_PRODUCT: NotaVentaProductFormValues = {
  id: undefined,
  tipAfeIgv: "10",
  cantidad: 1,
  unidad: "NIU",
  codigo: "",
  descripcion: "",
  porcentajeIgv: 18,
  mtoValorUnitario: "",
};

export const FORM_INITIAL_NOTA_VENTA: NotaVentaFormValues = {
  empresa: 0,
  establecimiento: 0,
  pos: 0,
  tipoDocumento: "99", //otros(99)
  serie: "",
  numero: "",
  numeroConCeros: "",
  fechaEmision: dayjs(new Date()),
  tipoEntidad: "1",
  numeroDocumento: "00000000",
  nombreCliente: "CLIENTE VARIOS",
  moneda: "PEN",
  observaciones: [],
  detalles: [],
  producto: FORM_INITIAL_NOTA_VENTA_PRODUCT,
  observacion: undefined,
};
