import { ISeriesExtendida } from "./series.interface";

export interface ITipoDoc {
  id?: number;
  codigo: string;
  nombre: string;
  abreviado: string;
  estado?: boolean;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deleteAt?: Date;
  restoreAt?: Date;
  new?: boolean;
}

export interface ITipoDocsExtentido
  extends Pick<ITipoDoc, "id" | "nombre" | "codigo"> {
  estado: boolean;
  series: ISeriesExtendida[];
}
