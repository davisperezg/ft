export interface StatusInvoice {
  invoiceId: number;
  codigo_estado: number;
  nombre_estado: string;
  mensaje: string;
  loading: boolean;
  sendMode?: string;
  codigo?: string;
  otros?: string;
  xml?: string;
  cdr?: string;
  pdfA4?: string;
}
