import { IFormInvoice } from "../../forms/invoices/invoice.interface";
import { IValidationInvoiceDetails } from "./invoice-detail.interface";
import { Dayjs } from "dayjs";
import { IValidationInvoiceObservaciones } from "./invoice-observaciones.interface";

export interface IValidationInvoice
  extends Omit<
    IFormInvoice,
    "id" | "observaciones" | "borrador" | "details" | "fecha_vencimiento"
  > {
  id: number | undefined;
  observaciones: IValidationInvoiceObservaciones[] | undefined;
  borrador: boolean | undefined;
  details: IValidationInvoiceDetails[];
  fecha_vencimiento: Dayjs | undefined | Date;
}
