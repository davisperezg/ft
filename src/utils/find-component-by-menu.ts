import {
  MENU_COMPROBANTES_ELECT,
  MENU_ROLES,
  MENU_USUARIOS,
} from "../config/constants";
import { quitarEspacios, quitarTildes } from "./functions.utils";

// Función para obtener dinámicamente el componente basado en el nombre del módulo
export const findComponentByMenu = async (nombreMenu: string) => {
  const menuDefault = quitarTildes(quitarEspacios(nombreMenu));

  switch (nombreMenu) {
    case MENU_COMPROBANTES_ELECT:
      return (await import(`../features/Comprobantes/pages/${menuDefault}Page`))
        .default;

    case MENU_USUARIOS:
      return (await import(`../features/Users/pages/UserOverviewPage`)).default;

    case MENU_ROLES:
      return (await import(`../features/Roles/pages/RolPage`)).default;

    case "DEFAULT":
      return (await import(`../components/common/Contents/ContentEmpty`))
        .default;
    // Agregar otros casos según los módulos disponibles
    default:
      throw new Error(`Recurso no encontrado: ${nombreMenu}`);
  }
};
