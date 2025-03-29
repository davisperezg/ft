import { Dayjs } from "dayjs";
import { IFormInvoiceDetail } from "./invoice-detail.interface";
import { IInvoice } from "../../models/invoices/invoice.interface";

export interface IFormInvoice
  extends Pick<IInvoice, "id" | "borrador" | "serie" | "tipo_operacion"> {
  ruc: string;
  cliente: string;
  direccion: string;
  empresa: number;
  establecimiento: number;
  tipo_documento: string; //boleta, factura, etc...
  tipo_entidad: string; //dni, ruc, pasaporte, ce
  numero: string;
  fecha_emision: Dayjs | Date | string;
  fecha_vencimiento?: Dayjs | null | Date;
  forma_pago: string;
  moneda: string;
  details: IFormInvoiceDetail[];
  observaciones?: string[];
  pos: number;
}
