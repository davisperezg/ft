import { IFormSelectOption } from "../../forms/common/select.interface";
import { IEmpresa } from "../../models/empresa/empresa.interface";
import {
  IValidationEmpresaCreate,
  IValidationEmpresaUpdate,
} from "../../validations/empresa/empresa.interface";
import { IFeatureEstablecimientoAsign } from "../establecimiento/establecimiento.interface";

export interface IFeatureEmpresaCreate extends IValidationEmpresaCreate {
  departamento: IFormSelectOption | undefined;
  provincia: IFormSelectOption | undefined;
  distrito: IFormSelectOption | undefined;
  tip_documento: number | undefined;
}

//export interface IFeatureEmpresaUpdate extends IValidationEmpresaUpdate {}
export type IFeatureEmpresaUpdate = IValidationEmpresaUpdate;

export interface IFeatureEmpresaAsign
  extends Pick<IEmpresa, "id" | "ruc" | "razon_social" | "estado"> {
  checked: boolean;
  establecimientos: IFeatureEstablecimientoAsign[];
}
