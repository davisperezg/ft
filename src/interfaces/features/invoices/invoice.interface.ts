import { IValidationInvoiceDetails } from "../../validations/invoice/invoice-detail.interface";
import { IValidationInvoice } from "../../validations/invoice/invoice.interface";

export interface IFeatureInvoice extends IValidationInvoice {
  numeroConCeros: string | undefined;
  producto: IValidationInvoiceDetails | undefined;
  observacion: string | undefined;
}

interface IFeatureInvoiceProductExtend extends IValidationInvoiceDetails {
  uuid?: string;
  mtoPrecioUnitario: string;
  mtoTotalItem: string;
}

export interface IFeatureInvoiceProductTable {
  operacion_gravada: number;
  igv: number;
  operacion_exonerada: number;
  operacion_inafecta: number;
  operacion_exportacion: number;
  operacion_gratuita: number;
  operacion_total: number;
  items: IFeatureInvoiceProductExtend[];
}
