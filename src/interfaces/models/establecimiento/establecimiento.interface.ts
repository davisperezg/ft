import { Option } from "../../common/option.interface";
import { ITipoDocsExtentido } from "../../features/tipo-docs-cpe/tipo-docs.interface";

export interface IEstablecimiento {
  id?: number;
  codigo: string;
  denominacion: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  direccion?: string;
  ubigeo?: string;
  logo?: string;
  estado?: boolean;
}

export interface IEstablecimientoExtendida
  extends Pick<IEstablecimiento, "id" | "codigo" | "denominacion" | "estado"> {
  documentos: ITipoDocsExtentido[];
}

export interface IDTOEstablecimiento
  extends Pick<IEstablecimiento, "id" | "codigo" | "denominacion"> {
  departamento: Option;
  provincia: Option;
  distrito: Option;
  direccion: string;
  logo: { name: string }[];
  ubigeo: string;
  estado?: boolean;
}
