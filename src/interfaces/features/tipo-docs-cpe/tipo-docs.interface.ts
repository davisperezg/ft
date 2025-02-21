import { IFormCPEType } from "../../forms/type-doc-cpe/type-doc-cpe.interface";
import { ISeriesExtendida } from "../../models/series/series.interface";

//export interface IFeatureCPEType extends IFormCPEType {}
export type IFeatureCPEType = IFormCPEType;

export interface ITipoDoc {
  id?: number;
  codigo: string;
  nombre: string;
  abreviado: string;
  estado?: boolean;
  status?: boolean;
  new?: boolean;
}

export interface ITipoDocsExtentido
  extends Pick<ITipoDoc, "id" | "nombre" | "codigo"> {
  estado: boolean;
  series: ISeriesExtendida[];
}
