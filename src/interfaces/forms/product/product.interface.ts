import { IProducto } from "../../models/producto/producto.interface";

export interface IFormProductCreate
  extends Pick<
    IProducto,
    | "nombre"
    | "stock"
    | "min_stock"
    | "purchase_price"
    | "min_profit"
    | "max_profit"
    | "estado"
    | "codigo"
    | "descripcion"
  > {
  mtoValorUnitario: string;
  tipAfeIgv: string;
  unidad: string;
}

export interface IFormProductUpdate
  extends IFormProductCreate,
    Required<Pick<IProducto, "id">> {}
