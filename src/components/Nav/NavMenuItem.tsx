import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { IMenuAccess } from "../../interface/menu.interface";
import { IModuloAccess } from "../../interface/modulo.interface";
import { DialogActionKind } from "../../reducers/dialogReducer";
import {
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
} from "../../utils/const";
import ModulosScreen from "../../views/ModulosScreen";
import PermisosScreen from "../../views/PermisosScreen";
import RolesScreen from "../../views/RolesScreen";
import UserScreen from "../../views/UserScreen";
import ContentEmpty from "../Content/ContentEmpty";
import UserList from "../User/UserList";

interface Props {
  open: boolean;
  menu: IMenuAccess;
  onClickMenu: (i: number) => void;
  modulo: IModuloAccess;
  setNroTab: React.Dispatch<React.SetStateAction<any[]>>;
  nroTab: any[];
  clicked: number;
  setNameMenuInit: React.Dispatch<React.SetStateAction<string>>;
  index: number;
}

const NavMenuItem = ({
  open,
  menu,
  onClickMenu,
  modulo,
  setNroTab,
  nroTab,
  clicked,
  setNameMenuInit,
  index,
}: Props) => {
  const { dispatch } = useContext(ModalContext);

  const loadMenuContext = (menu: string) => {
    const personalizedComponent = (Component: any) => {
      return nroTab.map((a: any) => {
        if (a.index === clicked) {
          return {
            ...a,
            title: modulo.nombre,
            component: Component,
          };
        } else {
          return a;
        }
      });
    };

    //Config to TABS>0
    switch (menu) {
      case MENU_MODULOS:
        setNroTab(personalizedComponent(<ModulosScreen />));
        break;
      case MENU_PERMISOS:
        setNroTab(personalizedComponent(<PermisosScreen />));
        break;
      case MENU_ROLES:
        setNroTab(personalizedComponent(<RolesScreen />));
        break;
      case MENU_USUARIOS:
        setNroTab(personalizedComponent(<UserScreen />));
        break;
      default:
        setNroTab(personalizedComponent(<ContentEmpty />));
        break;
    }
  };

  return (
    <>
      <li className="p-1">
        <a
          onClick={() => {
            if (clicked === 0) {
              setNameMenuInit(menu.nombre);
            } else {
              loadMenuContext(menu.nombre);
            }
            return onClickMenu(index);
          }}
          className="cursor-pointer font-bold"
        >
          {menu.nombre}
        </a>
      </li>
      {open && (
        <fieldset className="border rounded-sm p-[8px]">
          <legend className="font-bold p-[0_12px] dark:text-white">
            Actions
          </legend>
          {menu.nombre === MENU_MODULOS && (
            <div className="p-[10px] text-center">
              <button
                onClick={() =>
                  dispatch({ type: DialogActionKind.DIALOG_MODULE_SYSTEM })
                }
                type="button"
                className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
              >
                Crear Modulos
              </button>
            </div>
          )}

          {menu.nombre === MENU_PERMISOS && (
            <div className="p-[10px] text-center">
              <button
                // onClick={() =>
                //   dispatch({ type: DialogActionKind.DIALOG_USER })
                // }
                type="button"
                className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
              >
                Crear Permiso
              </button>
            </div>
          )}

          {menu.nombre === MENU_ROLES && (
            <div className="p-[10px] text-center">
              <button
                onClick={() => dispatch({ type: DialogActionKind.DIALOG_ROLE })}
                type="button"
                className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
              >
                Crear Roles
              </button>
            </div>
          )}

          {menu.nombre === MENU_USUARIOS && (
            <div className="p-[10px] text-center">
              <button
                onClick={() => dispatch({ type: DialogActionKind.DIALOG_USER })}
                type="button"
                className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
              >
                Crear Usuario
              </button>
            </div>
          )}
        </fieldset>
      )}
    </>
  );
};

export default NavMenuItem;
