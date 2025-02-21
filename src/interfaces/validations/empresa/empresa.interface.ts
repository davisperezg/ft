import { IFormEmpresaCreate } from "../../forms/empresa/empresa.interface";
import { IValidationEstablecimientoEmpresaUpdate } from "../establecimiento/establecimiento.interface";
import {
  IValidationCPETypeEmpresaCreate,
  IValidationCPETypeEmpresaUpate,
} from "../type-doc-cpe/type-doc-cpe.interface";

export interface IValidationEmpresaCreate
  extends Omit<
    IFormEmpresaCreate,
    | "logo"
    | "cert"
    | "ose_enabled"
    | "web_service"
    | "cert_password"
    | "usu_secundario_ose_user"
    | "usu_secundario_ose_password"
    | "usu_secundario_user"
    | "usu_secundario_password"
    | "telefono_movil_2"
    | "telefono_fijo_1"
    | "telefono_fijo_2"
    | "documentos"
  > {
  logo: FileList | undefined;
  cert: FileList | undefined;
  ose_enabled: boolean | undefined;
  web_service: string | undefined;
  cert_password: string | undefined;
  usu_secundario_ose_user: string | undefined;
  usu_secundario_ose_password: string | undefined;
  usu_secundario_user: string | undefined;
  usu_secundario_password: string | undefined;
  telefono_movil_2: string | undefined;
  telefono_fijo_1: string | undefined;
  telefono_fijo_2: string | undefined;
  documentos: IValidationCPETypeEmpresaCreate[];
}

export interface IValidationEmpresaUpdate
  extends Omit<
    IValidationEmpresaCreate,
    | "logo"
    | "cert"
    | "documentos"
    | "establecimientos"
    | "ruc"
    | "razon_social"
    | "usuario"
  > {
  logo: any | undefined;
  cert: any | undefined;
  documentos: IValidationCPETypeEmpresaUpate[];
  establecimientos: IValidationEstablecimientoEmpresaUpdate[];
}
