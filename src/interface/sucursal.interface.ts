import { ISeries } from "./series.interface";

export interface IEstablecimiento {
  nombre_establecimiento: string;
  codigo_establecimiento_sunat: string;
  nombre_comercial_establecimiento: string;
  allowedDocuments: ISeries[];
}
