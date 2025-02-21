import { IProducto } from "../producto/producto.interface";
import { ITipoIgv } from "../tipo-igv/tipo_igv.interface";
import { IUnidades } from "../unidades-medida/unidades.interface";
import { IInvoice } from "./invoice.interface";

export interface IInvoiceDetails {
  id?: number;
  cantidad: number;
  codigo?: string;
  mtoValorUnitario: number;
  mtoValorGratuito: number;
  porcentajeIgv: number;
  invoice: IInvoice;
  unidad: IUnidades;
  tipAfeIgv: ITipoIgv;
  descripcion?: string;
  producto?: IProducto;
  presentation?: IProducto;
}

export interface IQueryDetailsInvoice
  extends Required<
    Pick<
      IInvoiceDetails,
      | "id"
      | "cantidad"
      | "codigo"
      | "descripcion"
      | "mtoValorUnitario"
      | "porcentajeIgv"
    >
  > {
  posicionTabla: number;
  uuid: string;
  tipAfeIgv: string;
  unidad: string;
}
