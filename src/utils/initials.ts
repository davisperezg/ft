import { IEmpresa } from "../interface/empresa.interface";

export const initialMenuContext = {};

export const FORM_INITIAL_EMPRESA: IEmpresa = {
  logo: undefined,
  cert: undefined,
  usuario: -1,
  ruc: "",
  razon_social: "",
  nombre_comercial: "",
  domicilio_fiscal: "",
  ubigeo: "",
  urbanizacion: "",
  correo: "",
  telefono_movil_1: "",
  telefono_movil_2: "",
  telefono_fijo_1: "",
  telefono_fijo_2: "",
  documentos: [],
  modo: 0,
  ose_enabled: false,
  web_service: "",
  cert_password: "",
  usu_secundario_ose_user: "",
  usu_secundario_ose_password: "",
  usu_secundario_user: "",
  usu_secundario_password: "",
};
