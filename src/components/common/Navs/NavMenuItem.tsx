import { useContext } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import { useAccess } from "../../../features/Permisos/hooks/useResources";
import {
  MENU_COMPROBANTES_ELECT,
  MENU_EMPRESAS,
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_SERIES,
  MENU_USUARIOS,
  MENU_TIPO_DOCUMENTOS,
} from "../../../config/constants";
import { DialogEnum } from "../../../types/enums/dialog.enum";
import { PageEnum } from "../../../types/enums/page.enum";
import { ITipoDocsExtentido } from "../../../interfaces/features/tipo-docs-cpe/tipo-docs.interface";
import { IFeatureMenu } from "../../../interfaces/features/recurso/menu.interface";
import { IFeatureModule } from "../../../interfaces/features/modulo/modulo.interface";
import { useTabStore } from "../../../store/zustand/tabs-zustand";
import { useUserStore } from "../../../store/zustand/user-zustand";
import { usePageStore } from "../../../store/zustand/page-zustand";

interface Props {
  menu: IFeatureMenu;
  modulo: IFeatureModule;
  clicked: number;
}

const NavMenuItem = ({ menu, modulo, clicked }: Props) => {
  const { dispatch } = useContext(ModalContext);
  const userGlobal = useUserStore((state) => state.userGlobal);
  const setPage = usePageStore((state) => state.setPage);
  const { data: dataAccess } = useAccess(String(userGlobal?.id));
  const tabs = useTabStore((state) => state.tabs);
  const setTabs = useTabStore((state) => state.setTabs);
  const setMenuSelected = useTabStore((state) => state.setMenuSelected);

  const documentos =
    (userGlobal?.empresaActual?.establecimiento
      ?.documentos as ITipoDocsExtentido[]) ?? [];

  const loadMenu = () => {
    //Evitar renderizar nuevamante el mismo menu
    const currentMenu = tabs.find(
      (a) => a.index === clicked && a.menu.nombre === menu.nombre
    );
    if (currentMenu) return;

    // si es otro menu renderiza
    const updateTabWithModuleSelected = tabs.find((a) => a.index === clicked);
    setTabs(
      updateTabWithModuleSelected
        ? tabs.map((tab) => {
            if (tab.index === clicked) {
              return {
                ...tab,
                modulo: {
                  estado: true,
                  nombre: modulo.nombre,
                },
                menu: {
                  estado: true,
                  nombre: menu.nombre,
                },
                moduloAux: {
                  estado: true,
                  nombre: modulo.nombre,
                },
                menuAux: {
                  estado: true,
                  nombre: menu.nombre,
                },
              };
            }
            return tab;
          })
        : tabs
    );

    setMenuSelected(menu.nombre);
  };

  const menuSelected = tabs.find((a) => a.index === clicked);

  return (
    <>
      <li className="p-1">
        <a
          onClick={loadMenu}
          className="cursor-pointer font-[500] text-default hover:text-default select-none"
        >
          {menu.nombre}
        </a>
      </li>
      {menuSelected?.menu.estado &&
        (menuSelected?.menu.nombre === menu.nombre ||
          menuSelected?.menuAux.nombre === menu.nombre) && (
          <fieldset className="border rounded-sm p-[8px]">
            <legend className="font-[500] p-[0_12px] dark:text-white">
              {menu.nombre === MENU_COMPROBANTES_ELECT
                ? "Documentos"
                : "Acciones"}
            </legend>
            {menu.nombre === MENU_MODULOS && (
              <div className="p-[10px] text-center">
                {dataAccess?.some((a) => a === "canCreate_modules") && (
                  <button
                    onClick={() =>
                      dispatch({ type: DialogEnum.DIALOG_MODULE_SYSTEM })
                    }
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
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
                      dispatch({ type: DialogEnum.DIALOG_RESORUCE })
                    }
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
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
                    onClick={() => dispatch({ type: DialogEnum.DIALOG_ROLE })}
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
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
                    onClick={() => dispatch({ type: DialogEnum.DIALOG_USER })}
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
                  >
                    Crear Usuario
                  </button>
                )}
              </div>
            )}

            {menu.nombre === MENU_TIPO_DOCUMENTOS && (
              <div className="p-[10px] text-center">
                {dataAccess?.some((a) => a === "canCreate_users") && (
                  <button
                    onClick={() =>
                      dispatch({ type: DialogEnum.DIALOG_TIPODOC })
                    }
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
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
                      dispatch({ type: DialogEnum.DIALOG_EMPRESA })
                    }
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
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
                    onClick={() => dispatch({ type: DialogEnum.DIALOG_SERIES })}
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
                  >
                    Crear Series
                  </button>
                )}
                {dataAccess?.some((a) => a === "canMigrate_series") && (
                  <button
                    onClick={() =>
                      dispatch({ type: DialogEnum.DIALOG_SERIES_MIGRATE })
                    }
                    type="button"
                    className="font-[500] w-[180px] mb-[5px] border  min-h-[24px] text-primary dark:text-white hover:bg-bgDefault"
                  >
                    Migrar Series
                  </button>
                )}
              </div>
            )}

            {menu.nombre === MENU_COMPROBANTES_ELECT && (
              <div className="p-[10px] text-center">
                {documentos.map((documento) => {
                  const DOCUMENTO = documento.nombre.toUpperCase();

                  // Definimos los tipos de permisos disponibles
                  type PermissionType =
                    | "canCreate_facturas"
                    | "canCreate_boletas";

                  // Mapeo de permisos a documentos específicos
                  const permisoPorDocumento: Record<string, PermissionType> = {
                    FACTURA: "canCreate_facturas",
                    BOLETA: "canCreate_boletas",
                    // Add more documents and their permissions here if needed
                  };

                  // Obtener el permiso requerido para este documento
                  const permisoRequerido = permisoPorDocumento[DOCUMENTO];

                  // Si el permiso no está definido, no renderizar nada
                  if (!permisoRequerido) return null;

                  // Verificar si el usuario tiene el permiso requerido
                  const tienePermiso = dataAccess?.includes(permisoRequerido);

                  // Renderizar solo si tiene el permiso
                  if (tienePermiso) {
                    const handleClick = () => {
                      if (DOCUMENTO === "FACTURA") {
                        setPage({
                          open: true,
                          namePage: PageEnum.SCREEN_FACTURA,
                          pageComplete: true,
                        });
                      } else if (DOCUMENTO === "BOLETA") {
                        setPage({
                          open: true,
                          namePage: PageEnum.SCREEN_BOLETA,
                          pageComplete: true,
                        });
                      }
                      // Agrega más acciones aquí si es necesario
                    };

                    return (
                      <button
                        key={documento.id}
                        onClick={handleClick}
                        type="button"
                        disabled={!documento.estado} // Se desactiva cuando el documento es desactivado desde la empresa
                        className={`text-primary font-[500] w-[180px] mb-[5px] border min-h-[24px] dark:text-white hover:bg-bgDefault ${documento.estado ? "" : "bg-bgDefault"}`}
                      >
                        {documento.nombre}
                      </button>
                    );
                  }

                  return null; // No renderiza si no tiene el permiso
                })}
              </div>
            )}
          </fieldset>
        )}
    </>
  );
};

export default NavMenuItem;
