import NavMenuItem from "./NavMenuItem";
import { IFeatureModule } from "../../../interfaces/features/modulo/modulo.interface";
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { convertirTitulo } from "../../../utils/functions.utils";
import { useTabStore } from "../../../store/zustand/tabs-zustand";

interface Props {
  modulo: IFeatureModule;
  clicked: number;
  position: number;
}

const NavModItem = ({ modulo, clicked }: Props) => {
  const tabs = useTabStore((state) => state.tabs);
  const setTabs = useTabStore((state) => state.setTabs);
  const setMenuSelected = useTabStore((state) => state.setMenuSelected);

  const handleModulo = () => {
    // si es el mismo modulo no hace nada
    const currentModule = tabs.find(
      (a) => a.index === clicked && a.modulo.nombre === modulo.nombre
    );
    if (currentModule) return;

    // si es otro modulo
    const updateTabWithModuleSelected = tabs.find(
      (a) => a.modulo.nombre !== modulo.nombre
    );
    setTabs(
      updateTabWithModuleSelected
        ? tabs.map((tab) => {
            if (tab.modulo.nombre !== modulo.nombre && tab.index === clicked) {
              return {
                ...tab,
                modulo: {
                  estado: true,
                  nombre: modulo.nombre,
                },
                menu: {
                  estado: true,
                  nombre: String(modulo?.menus?.[0].nombre),
                },
                moduloAux: {
                  estado: true,
                  nombre: modulo.nombre,
                },
                menuAux: {
                  estado: true,
                  nombre: String(modulo?.menus?.[0].nombre),
                },
              };
            }
            return tab;
          })
        : tabs
    );

    setMenuSelected(String(modulo?.menus?.[0].nombre));
  };

  const moduloSelected = tabs.find((a) => a.index === clicked);

  return (
    <>
      <dt
        onClick={handleModulo}
        className={`flex flex-[0_0_auto] font-[500] ${moduloSelected?.modulo.nombre === modulo.nombre ? "border-t " : ""}${
          moduloSelected?.modulo.nombre === modulo.nombre &&
          moduloSelected?.modulo.estado
            ? "bg-bgDefault hover:bg-bgDefault cursor-default"
            : " hover:bg-bgDefault cursor-pointer border-t border-solid"
        } leading-[20px]  p-[2px_10px] select-none text-default`}
      >
        <span className="flex-[1_1_auto]">
          {convertirTitulo(modulo.nombre)}
        </span>
        <span className="text-[14px] flex justify-center items-center">
          {moduloSelected?.modulo.nombre === modulo.nombre &&
          moduloSelected?.modulo.estado ? (
            <IoIosArrowUp />
          ) : (
            <IoIosArrowDown />
          )}
        </span>
      </dt>
      <dd
        className={`transition-all ease-linear duration-[300ms] ${
          moduloSelected?.modulo.nombre === modulo.nombre &&
          moduloSelected?.modulo.estado
            ? "flex-[1_1_auto] h-[300px]"
            : "flex-none h-0"
        } w-full overflow-hidden bg-[url('https://cms.wialon.us/frontend/static/accounts_bg-57ba306c992683f5882f0eeb2affbf08.svg')] bg-no-repeat bg-bottom hue-rotate-[0deg]`}
      >
        <div className="p-[5px]">
          <ol className="font-bold list-decimal pl-3">
            {modulo?.menus?.map((menu, i: number) => {
              return (
                <NavMenuItem
                  key={i}
                  modulo={modulo}
                  menu={menu}
                  clicked={clicked}
                />
              );
            })}
          </ol>
        </div>
      </dd>
    </>
  );
};

export default NavModItem;
