import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { IMenuAccess } from "../../interface/menu.interface";
import { IModuloAccess } from "../../interface/modulo.interface";
import { DialogActionKind } from "../../reducers/dialogReducer";
import {
  MENU_FACTURA,
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
  MENU_ALTAS,
  MENU_EMPRESAS,
  MENU_SERIES,
} from "../../utils/const";
import ModulosScreen from "../../views/ModulosScreen";
import PermisosScreen from "../../views/PermisosScreen";
import RolesScreen from "../../views/RolesScreen";
import UserScreen from "../../views/UserScreen";
import ContentEmpty from "../Content/ContentEmpty";
import UserList from "../User/UserList";
import { useAccess } from "../../hooks/useResources";
import FacturaScreen from "../../views/FacturaScreen";
import TipoDocsScreen from "../../views/TipoDocsScreen";
import EmpresasScreen from "../../views/EmpresasScreen";

interface Props {
  open: boolean;
  menu: IMenuAccess;
  onClickMenu: (i: number) => void;
  modulo: IModuloAccess;
  setNroTab: React.Dispatch<React.SetStateAction<any[]>>;
  nroTab: any[];
  clicked: number;
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
  index,
}: Props) => {
  const { dispatch, setModulesGlobal, modulesGlobal, userGlobal } =
    useContext(ModalContext);

  const { data: dataAccess } = useAccess(userGlobal?.id);

  const loadMenuContext = (menu: string) => {
    const personalizedComponent = (Component: any) => {
      return nroTab.map((a: any) => {
        if (a.index === clicked) {
          //Si existe un tab ya antes seleccionado
          const existMenu = modulesGlobal.some((a: any) => a.tab === clicked);

          if (existMenu) {
            //Si existe el tab solo seteamos el menu
            const res = modulesGlobal.map((a: any) => {
              if (a.tab === clicked) {
                return {
                  ...a,
                  menu: index,
                  component: menu,
                };
              } else {
                return a;
              }
            });

            setModulesGlobal(res);
          } else {
            //Si no existe el tab se agrega
            setModulesGlobal([
              ...modulesGlobal,
              {
                tab: clicked,
                menu: index,
                title: modulo.nombre,
                component: menu,
              },
            ]);
          }

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
      case MENU_FACTURA:
        setNroTab(personalizedComponent(<FacturaScreen />));
        break;

      case MENU_ALTAS:
        setNroTab(personalizedComponent(<TipoDocsScreen />));
        break;

      case MENU_EMPRESAS:
        setNroTab(personalizedComponent(<EmpresasScreen />));
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
            // if (clicked === 0) {
            //   setNameMenuInit(menu.nombre);
            // } else {
            //   loadMenuContext(menu.nombre);
            // }
            loadMenuContext(menu.nombre);
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
              {dataAccess?.some((a) => a === "canCreate_modules") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_MODULE_SYSTEM })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Crear Modulos
                </button>
              )}
            </div>
          )}

          {menu.nombre === MENU_PERMISOS && (
            <div className="p-[10px] text-center">
              {dataAccess?.some((a) => a === "canCreate_permisos") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_RESORUCE })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Crear Permiso
                </button>
              )}
            </div>
          )}

          {menu.nombre === MENU_ROLES && (
            <div className="p-[10px] text-center">
              {dataAccess?.some((a) => a === "canCreate_roles") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_ROLE })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Crear Roles
                </button>
              )}
            </div>
          )}

          {menu.nombre === MENU_USUARIOS && (
            <div className="p-[10px] text-center">
              {dataAccess?.some((a) => a === "canCreate_users") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_USER })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Crear Usuario
                </button>
              )}
            </div>
          )}

          {menu.nombre === MENU_ALTAS && (
            <div className="p-[10px] text-center">
              {dataAccess?.some((a) => a === "canCreate_users") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_TIPODOC })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Crear Tipo de documento
                </button>
              )}
            </div>
          )}

          {menu.nombre === MENU_EMPRESAS && (
            <div className="p-[10px] text-center">
              {dataAccess?.some((a) => a === "canCreate_users") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_EMPRESA })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Crear Empresa
                </button>
              )}
            </div>
          )}

          {menu.nombre === MENU_SERIES && (
            <div className="p-[10px] text-center">
              {dataAccess?.some((a) => a === "canCreate_series") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_SERIES })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Crear Series
                </button>
              )}
              {dataAccess?.some((a) => a === "canMigrate_series") && (
                <button
                  onClick={() =>
                    dispatch({ type: DialogActionKind.DIALOG_SERIES })
                  }
                  type="button"
                  className="w-[180px] mb-[5px] border  min-h-[24px] text-secondary dark:text-white hover:bg-hover"
                >
                  Migrar Series
                </button>
              )}
            </div>
          )}
        </fieldset>
      )}
    </>
  );
};

export default NavMenuItem;
