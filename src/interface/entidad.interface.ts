import { IEmpresa } from "./empresa.interface";
import { ITipoEntidades } from "./tipo_entidades.interface";
import { IUser } from "./user.interface";

export interface IEntidad {
  id?: number;
  entidad: string;
  nombre_comercial?: string;
  numero_documento: string;
  direccion: string;
  email_1?: string;
  email_2?: string;
  telefono_movil_1?: string;
  telefono_movil_2?: string;
  pagina_web?: string;
  facebook?: string;
  twitter?: string;
  estado?: boolean;
  tipo_entidad?: ITipoEntidades;
  usuario?: IUser;
  empresa?: IEmpresa;
}
