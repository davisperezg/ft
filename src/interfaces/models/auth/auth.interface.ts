import { IFeatureRol } from "../../features/rol/rol.interface";
import { IConfigEmpresa } from "../configurations/config_empresa.interface";
import { IConfigEstablecimiento } from "../configurations/config_establecimiento.interface";
import { IEmpresa } from "../empresa/empresa.interface";
import { IEstablecimiento } from "../establecimiento/establecimiento.interface";
import { ISeries } from "../series/series.interface";
import { ITipoDoc } from "../tipo-docs-cpe/tipodocs.interface";

interface IAuthConfigEstablecimiento extends IConfigEstablecimiento {}

interface IAuthSeries extends Pick<ISeries, "estado" | "id" | "serie"> {
  numero?: string;
  numeroConCeros?: string;
}

interface IAuthTipoDocs extends Pick<ITipoDoc, "id" | "nombre" | "codigo"> {
  estado: boolean;
  series: IAuthSeries[];
}

export interface IAuthEstablecimiento
  extends Partial<
    Pick<IEstablecimiento, "id" | "codigo" | "denominacion" | "estado">
  > {
  documentos?: IAuthTipoDocs[];
  configuraciones?: IAuthConfigEstablecimiento[];
}

export interface IAuthEmpresa
  extends Partial<
    Pick<
      IEmpresa,
      "id" | "logo" | "estado" | "razon_social" | "ruc" | "nombre_comercial"
    >
  > {
  configuraciones?: IConfigEmpresa[];
  establecimiento?: IAuthEstablecimiento;
  modo?: string;
}

export interface IAuthEmpresas extends Omit<IAuthEmpresa, "establecimiento"> {
  establecimientos?: IAuthEstablecimiento[];
}

export type IAuthPayload = {
  id?: string;
  usuario?: string;
  nombre_usuario?: string;
  estado_usuario?: boolean;
  estado_rol?: boolean;
  email_usuario?: string;
  empresas?: IAuthEmpresas[] | null;
  empresaActual?: IAuthEmpresa | null;
  rol: IFeatureRol;
};
