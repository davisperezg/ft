import { ICPEType } from "../../models/tipo-docs-cpe/tipo-docs.interface";

export interface IFormCPEType extends Pick<ICPEType, "abreviado" | "codigo"> {
  nombre: string;
}

export interface IFormCPETypeEmpresaCreate
  extends Required<Pick<ICPEType, "id">>,
    Pick<IFormCPEType, "nombre"> {}

export interface IFormCPETypeEmpresaUpdate
  extends Required<Pick<ICPEType, "id">>,
    Pick<IFormCPEType, "nombre"> {
  new: boolean;
}
