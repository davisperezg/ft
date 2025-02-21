import { Option } from "../../common/option.interface";
import { IEstablecimiento } from "../../models/establecimiento/establecimiento.interface";

export interface IFormEstablecimiento
  extends Omit<
    IEstablecimiento,
    "departamento" | "provincia" | "distrito" | "logo"
  > {
  departamento: Option;
  provincia: Option;
  distrito: Option;
  logo: any;
}
