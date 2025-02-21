import { IInvoiceDetails } from "../../models/invoices/invoice-details.interface";

export interface IFormInvoiceDetail
  extends Pick<
    IInvoiceDetails,
    "cantidad" | "codigo" | "descripcion" | "porcentajeIgv" | "id"
  > {
  mtoValorUnitario: string;
  mtoValorGratuito?: string;
  tipAfeIgv: string;
  unidad: string;
  producto?: number;
  presentation?: number;
  uuid?: string;
}
