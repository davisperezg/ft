import { IEmpresa } from "./empresa.interface";
import { IEstablecimiento } from "./establecimiento.interface";

export interface ISeries {
  id?: number;
  empresa: number | IEmpresa;
  establecimiento: number | IEstablecimiento;
  documentos: Record<string, string[]>;
}
