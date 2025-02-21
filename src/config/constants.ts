import { DialogState } from "../interfaces/common/dialog.interface";
import { PageState } from "../interfaces/common/page.interface";
import { IPaginationTable } from "../interfaces/common/pagination.interface";
import { ITabItem } from "../interfaces/components/tab-top/tab.interface";
import {
  IFeatureEmpresaCreate,
  IFeatureEmpresaUpdate,
} from "../interfaces/features/empresa/empresa.interface";
import { IFeatureInvoice } from "../interfaces/features/invoices/invoice.interface";
import { IModulosSystem } from "../interfaces/features/modulo/modulo_system.interface";
import { IRol } from "../interfaces/models/rol/rol.interface";
import {
  IUser,
  IUserWithPassword,
} from "../interfaces/models/user/user.interface";
import { IValidationInvoiceDetails } from "../interfaces/validations/invoice/invoice-detail.interface";
import { PageEnum } from "../types/enums/page.enum";
import dayjs from "dayjs";

export const BASE_API = import.meta.env.VITE_API_URL;
//import.meta.env.VITE_API_URL ??
export const BASE_URL_WS = import.meta.env.VITE_API_WS_URL;
//import.meta.env.VITE_API_WS_URL;
export const MOD_PRINCIPAL = import.meta.env.VITE_MOD_PRINCIPAL;
export const MENU_MODULOS = "Modulos";
export const MENU_PERMISOS = "Permisos";
export const MENU_ROLES = "Roles";
export const MENU_USUARIOS = "Usuarios";
export const MENU_COMPROBANTES_ELECT = "Comprobantes Electrónicos";
export const MENU_TIPO_DOCUMENTOS = "Tipo de documentos";
export const MENU_EMPRESAS = "Empresas";
export const MENU_SERIES = "Series";
export const MODS_TEST = [
  {
    nombre: "Administración de sistema - PRINCIPAL",
    estado: true,
    menus: [
      {
        nombre: "Modulos",
        estado: true,
      },
      {
        nombre: "Permisos",
        estado: true,
      },
      {
        nombre: "Roles",
        estado: true,
      },
      {
        nombre: "Usuarios",
        estado: true,
      },
    ],
  },
  {
    nombre: "Perfiles",
    estado: true,
    menus: [
      {
        nombre: "Usuarios",
        estado: true,
      },
      {
        nombre: "Oferta",
        estado: true,
      },
    ],
  },
  {
    nombre: "Tickets",
    estado: true,
    menus: [],
  },
];

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

export const FORM_INITIAL_EMPRESA: IFeatureEmpresaCreate = {
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
  tip_documento: -1,
  departamento: undefined,
  provincia: undefined,
  distrito: undefined,
};

export const FORM_INITIAL_EMPRESA_UPDATE: IFeatureEmpresaUpdate = {
  cert: undefined,
  logo: undefined,
  nombre_comercial: "",
  domicilio_fiscal: "",
  ubigeo: "",
  urbanizacion: "",
  modo: 0,
  ose_enabled: false,
  web_service: "",
  usu_secundario_ose_password: "",
  usu_secundario_ose_user: "",
  usu_secundario_user: "",
  usu_secundario_password: "",
  cert_password: "",
  documentos: [],
  correo: "",
  telefono_fijo_1: "",
  telefono_movil_1: "",
  telefono_fijo_2: "",
  telefono_movil_2: "",
  establecimientos: [],
};

export const FORM_MODAL_PRODUCT_INVOICE: IValidationInvoiceDetails = {
  id: undefined,
  tipAfeIgv: "10",
  cantidad: 1,
  unidad: "NIU",
  codigo: "",
  descripcion: "",
  porcentajeIgv: 18,
  mtoValorUnitario: "",
  presentation: undefined,
  producto: undefined,
  posicionTabla: undefined,
};

export const FORM_INITIAL_INVOICE: IFeatureInvoice = {
  empresa: 0,
  establecimiento: 0,
  tipo_documento: "01", //boleta(03), factura(01)
  serie: "",
  numero: "",
  numeroConCeros: "",
  fecha_emision: dayjs(new Date()),
  fecha_vencimiento: undefined,
  ruc: "",
  cliente: "",
  direccion: "",
  tipo_entidad: "6", //dni, ruc - default es 2 tipos ya q factura solo acepta rucs
  tipo_operacion: "0101",
  moneda: "PEN",
  forma_pago: "Contado",
  observaciones: [],
  details: [],
  producto: FORM_MODAL_PRODUCT_INVOICE,
  borrador: false,
  id: undefined,
  observacion: undefined,
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

export const INITIAL_VALUE_DIALOG: DialogState = {
  open: false,
  nameDialog: "",
};

export const INITIAL_VALUE_PAGE: PageState = {
  open: false,
  namePage: PageEnum.INIT,
  pageComplete: true,
};

export const INITIAL_VALUE_TAB: ITabItem = {
  index: 0,
  modulo: {
    estado: true,
    nombre: "Pestaña",
  },
  menu: {
    estado: true,
    nombre: "DEFAULT",
  },
  moduloAux: {
    estado: true,
    nombre: "Pestaña",
  },
  menuAux: {
    estado: true,
    nombre: "DEFAULT",
  },
};

export const INITIAL_VALUE_PAGINATION: IPaginationTable = {
  pageIndex: 0,
  pageSize: 10,
};
