import ContentEmpty from "../components/common/Contents/ContentEmpty";
import ModulosScreen from "../features/Modulos/pages/ModuloPage";
import PermisosScreen from "../features/Permisos/pages/PermisoPage";
import RolesScreen from "../features/Roles/pages/RolPage";
import TipoDocsScreen from "../features/TiposDocsCpes/pages/TipoDocCpeOverviewPage";
import UserScreen from "../features/Users/pages/UserOverviewPage";
import {
  MENU_ALTAS,
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
} from "../config/constants";

//Config to MAIN principal(tab0) and handleTabs
export const ComponentByName = (menu: string) => {
  switch (menu) {
    case MENU_MODULOS:
      return <ModulosScreen />;
    case MENU_PERMISOS:
      return <PermisosScreen />;
    case MENU_ROLES:
      return <RolesScreen />;
    case MENU_USUARIOS:
      return <UserScreen />;
    case MENU_ALTAS:
      return <TipoDocsScreen />;
    default:
      return <ContentEmpty />;
  }
};
