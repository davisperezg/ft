import {
  IFormProductCreate,
  IFormProductUpdate,
} from "../../forms/product/product.interface";

export interface IValidationProductInvoice {
  id: number | undefined;
  codigo: string | undefined;
  nombre: string | undefined;
  descripcion: string | undefined;
  cantidad: number | undefined;
  estado: boolean | undefined;
  mtoValorUnitario: string | undefined;
  tipAfeIgv: string | undefined;
  unidad: string | undefined;
}

export interface IValidationProductCreate
  extends Omit<IFormProductCreate, "codigo" | "descripcion" | "estado"> {
  codigo: string | undefined;
  descripcion: string | undefined;
  estado: string | undefined;
}

export interface IValidationProductUpdate
  extends IValidationProductCreate,
    Required<Pick<IFormProductUpdate, "id">> {}
