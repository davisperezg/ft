import { ISeries } from "./series.interface";

interface Option {
  value: string;
  label: string;
}

export interface IEstablecimiento {
  id?: number;
  codigo: string;
  denominacion: string;
  departamento: Option;
  provincia: Option;
  distrito: Option;
  direccion: string;
  ubigeo: string;
  logo?: FileList;
  status?: boolean;
  new?: boolean;
  allowedDocuments?: ISeries[];
}
