import { IPos } from "../../models/pos/pos.interface";

export interface IFeaturePosAsign extends Partial<IPos> {
  checked: boolean;
}
