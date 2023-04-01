import { useCallback, useContext, useEffect } from "react";
import { ModalContext } from "../../context/modalContext";
import { DialogActionKind } from "../../reducers/dialogReducer";
import {
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
} from "../../utils/const";
import ContentEmpty from "../Content/ContentEmpty";
import UserList from "../User/UserList";

const NavMenuItem = ({
  open,
  menu,
  onClickMenu,
  modulo,
  setNroTab,
  nroTab,
  clicked,
  setTest,
  setNameMenuInit,
  index,
}: any) => {
  const { dialogState, dispatch, setMenuContext } = useContext(ModalContext);

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
        setNroTab(personalizedComponent(<h1>MODULOS</h1>));
        break;
      case MENU_PERMISOS:
        setNroTab(personalizedComponent(<h1>PERMSISOS</h1>));
        break;
      case MENU_ROLES:
        setNroTab(personalizedComponent(<h1>ROLES</h1>));
        break;
      case MENU_USUARIOS:
        setNroTab(personalizedComponent(<UserList />));
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
                // onClick={() =>
                //   dispatch({ type: DialogActionKind.DIALOG_USER })
                // }
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
