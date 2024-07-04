export const BASE_API = "http://192.168.18.28:3000";
//import.meta.env.VITE_API_URL ??
export const BASE_URL_WS = "http://192.168.18.28:3000/events";
//import.meta.env.VITE_API_WS_URL;
export const MOD_PRINCIPAL = import.meta.env.VITE_MOD_PRINCIPAL;
export const MENU_MODULOS = "Modulos";
export const MENU_PERMISOS = "Permisos";
export const MENU_ROLES = "Roles";
export const MENU_USUARIOS = "Usuarios";
export const MENU_COMPROBANTES_ELECT = "Comprobantes Electrónicos";
export const MENU_ALTAS = "Tipo de documentos";
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
