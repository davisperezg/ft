import { IEstablecimiento } from "./establecimiento.interface";
import { SelectOption } from "./select.interface";
import { ITipoDoc } from "./tipodocs.interface";
import { IUser } from "./user.interface";

export interface IEmpresa {
  id?: number;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  domicilio_fiscal: string;
  telefono_fijo_1?: string;
  telefono_fijo_2?: string;
  telefono_movil_1: string;
  telefono_movil_2?: string;
  logo?: FileList;
  correo: string;
  ubigeo: string;
  establecimientos?: IEstablecimiento[];
  urbanizacion: string;
  modo: number; //0 beta - 1 produccion
  cert?: FileList;
  cert_password?: string;
  usu_secundario_user?: string;
  usu_secundario_password?: string;
  usu_secundario_ose_user?: string;
  usu_secundario_ose_password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  ose_enabled?: boolean;
  web_service?: string;
  estado?: boolean;
  usuario: Partial<IUser> | number;
  documentos?: Pick<ITipoDoc, "id" | "nombre" | "new" | "estado">[];
  departamento?: SelectOption;
  provincia?: SelectOption;
  distrito?: SelectOption;
  tip_documento?: number;
}

interface IEstablecimientoAsign extends Partial<IEstablecimiento> {
  checked: boolean;
}

export interface IEmpresaAsign
  extends Pick<IEmpresa, "id" | "ruc" | "razon_social" | "estado"> {
  checked: boolean;
  establecimientos: IEstablecimientoAsign[];
}

//"id" | "codigo" | "denominacion" | "estado"
