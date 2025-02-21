import {
  MENU_COMPROBANTES_ELECT,
  MENU_EMPRESAS,
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_SERIES,
  MENU_TIPO_DOCUMENTOS,
  MENU_USUARIOS,
} from "../config/constants";
import { quitarEspacios, quitarTildes } from "./functions.utils";

// Función para obtener dinámicamente el componente basado en el nombre del módulo
export const findComponentByMenu = async (nombreMenu: string) => {
  const menuDefault = quitarTildes(quitarEspacios(nombreMenu));
  switch (nombreMenu) {
    case MENU_COMPROBANTES_ELECT:
      return (
        await import(`../features/Comprobantes/pages/${menuDefault}Page.tsx`)
      ).default;

    case MENU_EMPRESAS:
      return (await import(`../features/Empresa/pages/EmpresaOverviewPage.tsx`))
        .default;

    case MENU_TIPO_DOCUMENTOS:
      return (
        await import(
          `../features/TiposDocsCpes/pages/TipoDocCpeOverviewPage.tsx`
        )
      ).default;

    case MENU_SERIES:
      return (await import(`../features/Series/pages/SeriePage.tsx`)).default;

    case MENU_USUARIOS:
      return (await import(`../features/Users/pages/UserOverviewPage.tsx`))
        .default;

    case MENU_ROLES:
      return (await import(`../features/Roles/pages/RolPage.tsx`)).default;

    case MENU_MODULOS:
      return (await import(`../features/Modulos/pages/ModuloPage.tsx`)).default;

    case MENU_PERMISOS:
      return (await import(`../features/Permisos/pages/PermisoPage.tsx`))
        .default;

    case "DEFAULT":
      return (await import(`../components/common/Contents/ContentEmpty.tsx`))
        .default;
    // Agregar otros casos según los módulos disponibles
    default:
      throw new Error(`Recurso no encontrado: ${nombreMenu}`);
  }
};
