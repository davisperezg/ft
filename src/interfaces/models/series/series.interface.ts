import { IOption } from "../../../components/common/Selects/SelectSimple";
import { IEstablecimientoExtendida } from "../establecimiento/establecimiento.interface";

export interface ISeries {
  id?: number;
  empresa: number;
  establecimiento: number;
  establecimientos?: IEstablecimientoExtendida[];
  documentos?: any[];
  serie: string;
  documento: Pick<IOption, "label" | "value">;
  estado?: boolean;
}

export interface ISeriesMigrate {
  empresa: number;
  establecimiento: number;
  establecimiento_destino: number;
  documentos: {
    establecimiento: string;
    idDocumento: number;
    serie: string;
  }[];
}

export interface ISeriesExtendida
  extends Pick<ISeries, "estado" | "id" | "serie"> {
  numero?: string;
  numeroConCeros?: string;
  aliasEstablecimiento?: string;
}

export interface ITransferListOf {
  nombre: string;
  series: {
    idDocumento: number;
    serie: string;
    establecimiento: string;
  }[];
}

export interface ITransferListTo {
  idDocumento: number;
  serie: string;
  establecimiento: string;
}
