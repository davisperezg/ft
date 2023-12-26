import { IEmpresa } from "../interface/empresa.interface";
import { IModulosSystem } from "../interface/modulo_system.interface";
import { IRol } from "../interface/rol.interface";
import { IUser, IUserWithPassword } from "../interface/user.interface";

export const initialMenuContext = {};

export const FORM_INITIAL_MODULO: IModulosSystem = {
  name: "",
  description: "",
  menu: [],
};

export const FORM_INITIAL_ROL: IRol = {
  name: "",
  description: "",
  module: [],
};

export const FORM_EDIT_INITIAL_USER: IUser = {
  name: "",
  lastname: "",
  tipDocument: "DNI",
  nroDocument: "",
  email: "",
  username: "",
  role: "null",
  empresasAsign: [],
};

export const FORM_INITIAL_USER: IUserWithPassword = {
  name: "",
  lastname: "",
  tipDocument: "DNI",
  nroDocument: "",
  email: "",
  password: "",
  confirm_password: "",
  username: "",
  role: "null",
  empresasAsign: [],
};

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

export const FORM_INITIAL_SERIES = {
  empresa: 0,
  establecimiento: 0,
  serie: "",
  documento: undefined,
};

export const FORM_INITIAL_SERIES_MIGRATE = {
  empresa: 0,
  establecimiento: 0,
  establecimiento_destino: 0,
  documentos: [],
};
