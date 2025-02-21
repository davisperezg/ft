import {
  IFormCPEType,
  IFormCPETypeEmpresaCreate,
  IFormCPETypeEmpresaUpdate,
} from "../../forms/type-doc-cpe/type-doc-cpe.interface";

// export interface IValidationCPEType extends IFormCPEType {}

// export interface IValidationCPETypeEmpresaCreate
//   extends IFormCPETypeEmpresaCreate {}
export type IValidationCPEType = IFormCPEType;
export type IValidationCPETypeEmpresaCreate = IFormCPETypeEmpresaCreate;

export interface IValidationCPETypeEmpresaUpate
  extends IFormCPETypeEmpresaUpdate {
  estado: boolean | undefined;
}
