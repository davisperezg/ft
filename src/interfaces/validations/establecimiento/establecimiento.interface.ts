import { Option } from "../../common/option.interface";
import { IFormEstablecimiento } from "../../forms/establecimiento/establecimiento.interface";

export interface IValidationEstablecimientoEmpresaUpdate
  extends Omit<
    IFormEstablecimiento,
    | "departamento"
    | "provincia"
    | "distrito"
    | "id"
    | "estado"
    | "logo"
    | "ubigeo"
    | "direccion"
  > {
  id: number | undefined;
  estado: boolean | undefined;
  departamento: Option | undefined;
  provincia: Option | undefined;
  distrito: Option | undefined;
  logo: any | undefined;
  ubigeo: string;
  direccion: string;
  new: boolean | undefined;
}
