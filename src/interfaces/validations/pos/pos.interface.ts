import { IFormPOS } from "../../forms/pos/pos.interface";
import { IValidationEstablecimientoEmpresaUpdate } from "../establecimiento/establecimiento.interface";

export interface IValidationPOSEmpresaUpdate
  extends Omit<IFormPOS, "establecimiento"> {
  id: number | undefined;
  establecimiento:
    | Pick<
        IValidationEstablecimientoEmpresaUpdate,
        "id" | "codigo" | "denominacion"
      >
    | undefined;
  new: boolean | undefined;
}
