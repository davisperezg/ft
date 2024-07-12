import ContentEmpty from "../components/Content/ContentEmpty";
import ModulosScreen from "../views/ModulosScreen";
import PermisosScreen from "../views/PermisosScreen";
import RolesScreen from "../views/RolesScreen";
import TipoDocsScreen from "../views/TipoDocsScreen";
import UserScreen from "../views/UserScreen";
import {
  MENU_ALTAS,
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
} from "./const";

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
