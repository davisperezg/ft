import { IEmpresa } from "../../models/empresa/empresa.interface";
import { IFormEstablecimiento } from "../establecimiento/establecimiento.interface";
import { IFormPOS } from "../pos/pos.interface";
import {
  IFormCPETypeEmpresaCreate,
  IFormCPETypeEmpresaUpdate,
} from "../type-doc-cpe/type-doc-cpe.interface";

export interface IFormEmpresaCreate
  extends Omit<
    IEmpresa,
    | "id"
    | "logo"
    | "cert"
    | "fieldname_cert"
    | "createdAt"
    | "updatedAt"
    | "estado"
    | "usuario"
  > {
  logo: FileList;
  cert: FileList;
  documentos: IFormCPETypeEmpresaCreate[];
  usuario: number;
}

export interface IFormEmpresaUpdate
  extends Omit<
    IFormEmpresaCreate,
    "ruc" | "razon_social" | "usuario" | "documentos" | "logo" | "cert"
  > {
  logo?: any;
  cert?: any;
  documentos: IFormCPETypeEmpresaUpdate[];
  establecimientos: IFormEstablecimiento[];
  pos: IFormPOS[];
}
