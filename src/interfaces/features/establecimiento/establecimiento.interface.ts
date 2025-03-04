import { IEstablecimiento } from "../../models/establecimiento/establecimiento.interface";
import { IFeaturePosAsign } from "../pos/pos.interface";

export interface IFeatureEstablecimientoAsign
  extends Partial<IEstablecimiento> {
  checked: boolean;
  pos: IFeaturePosAsign[];
}
