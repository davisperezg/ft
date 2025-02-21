import { ITipoEntidades } from "../tipo-docs-identidad/tipo_entidades.interface";
import { IUserMysql } from "../user/user.interface";

export interface IClient {
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
  estado?: string;
  tipo_entidad: ITipoEntidades;
  user?: IUserMysql;
  empresa?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
