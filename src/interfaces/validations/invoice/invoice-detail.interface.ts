import { IFormInvoiceDetail } from "../../forms/invoices/invoice-detail.interface";

export interface IValidationInvoiceDetails
  extends Omit<
    IFormInvoiceDetail,
    | "mtoValorGratuito"
    | "producto"
    | "codigo"
    | "presentation"
    | "descripcion"
    | "id"
    | "uuid"
  > {
  id: number | undefined;
  //producto: IValidationProductInvoice | undefined;
  producto: number | undefined;
  posicionTabla: number | undefined;
  codigo: string | undefined;
  descripcion: string | undefined;
  presentation: number | undefined;
}
