import { IDTOEstablecimiento } from "../establecimiento/establecimiento.interface";
import { IDTOPos } from "../pos/pos.interface";
import { IDTOCPEType } from "../tipo-docs-cpe/tipo-docs.interface";
import { IDTOUsuario, IUserMysql } from "../user/user.interface";

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
  logo?: string;
  correo: string;
  ubigeo: string;
  urbanizacion: string;
  modo: number; //0 beta - 1 produccion
  cert?: string;
  fieldname_cert?: string;
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
  usuario: IUserMysql;
}

export interface IDTOEmpresa
  extends Omit<
    Pick<
      IEmpresa,
      | "id"
      | "ruc"
      | "razon_social"
      | "web_service"
      | "estado"
      | "logo"
      | "ubigeo"
    >,
    | "modo"
    | "usu_secundario_user"
    | "usu_secundario_password"
    | "usu_secundario_ose_user"
    | "usu_secundario_ose_password"
    | "domicilio_fiscal"
    | "usuario"
  > {
  modo: string;
  ose: string;
  usuario: IDTOUsuario;
  sunat_usu: string;
  sunat_pass: string;
  ose_usu: string;
  ose_pass: string;
  direccion?: string;
  documentos?: IDTOCPEType[];
  establecimientos?: IDTOEstablecimiento[];
}

export interface IDTOEmpresaDetail
  extends Omit<
    IDTOEmpresa,
    | "logo"
    | "cert"
    | "modo"
    | "ose"
    | "sunat_usu"
    | "sunat_pass"
    | "ose_usu"
    | "ose_pass"
    | "usuario"
    | "direccion"
    | "establecimientos"
  > {
  establecimientos: IDTOEstablecimiento[];
  usuario: Omit<IDTOUsuario, "id_usuario"> & {
    id: number;
  };
  logo: {
    name: string;
    src: string;
  }[];
  cert: {
    name: string;
  }[];
  nombre_comercial: string;
  domicilio_fiscal: string;
  urbanizacion: string;
  correo: string;
  telefono_movil_1: string;
  telefono_movil_2: string;
  telefono_fijo_1: string;
  telefono_fijo_2: string;
  fieldname_cert: string;
  cert_password: string;
  modo: number;
  ose_enabled: boolean;
  usu_secundario_user?: string;
  usu_secundario_password?: string;
  usu_secundario_ose_user?: string;
  usu_secundario_ose_password?: string;
  pos: IDTOPos[];
}
