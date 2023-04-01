import ContentEmpty from "../components/Content/ContentEmpty";
import UserList from "../components/User/UserList";
import {
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
} from "./const";

//Config to MAIN principal(tab0) and handleTabs
export const ComponentByName = (menu: string) => {
  switch (menu) {
    case MENU_MODULOS:
      return <h1>MODULOS</h1>;
    case MENU_PERMISOS:
      return <h1>PERMSISOS</h1>;
    case MENU_ROLES:
      return <h1>ROLES</h1>;
    case MENU_USUARIOS:
      return <UserList />;
    default:
      return <ContentEmpty />;
  }
};
