import { IEstablecimiento } from "./sucursal.interface";

export interface IEmpresa {
  id?: number;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  domicilio_fiscal: string;
  telefono_fijo_1: string;
  telefono_fijo_2?: string;
  telefono_movil_1: string;
  telefono_movil_2?: string;
  foto?: string;
  correo: string;
  ubigeo: string;
  establecimientos: IEstablecimiento[];
  //regimen_id: number;
  urbanizacion: string;
  modo: number; //0 beta - 1 produccion
  cert?: string;
  cert_password?: string;
  usu_secundario_user?: string;
  usu_secundario_password?: string;
  usu_secundario_ose_user?: string;
  usu_secundario_ose_password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  ose_enabled?: boolean;
  web_service?: string;
}
