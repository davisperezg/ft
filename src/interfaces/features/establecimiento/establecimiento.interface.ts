import { IEstablecimiento } from "../../models/establecimiento/establecimiento.interface";

export interface IFeatureEstablecimientoAsign
  extends Partial<IEstablecimiento> {
  checked: boolean;
}
