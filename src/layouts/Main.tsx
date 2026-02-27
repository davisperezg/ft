import { useEffect } from "react";
import NavLeft from "../components/common/Navs/NavLeft";
import TabItem from "../components/common/Tabs/Views/TabItem";
import DynamicComponentLoader from "../utils/render-component-dynamic.utils";
import { useTabStore } from "../store/zustand/tabs-zustand";
import { INITIAL_VALUE_TAB, INITIAL_VALUE_PAGE } from "../config/constants";
import { useUserStore } from "../store/zustand/user-zustand";
import { usePageStore } from "../store/zustand/page-zustand";
import { useClickedStore } from "../store/zustand/clicked-tabs-zustand";
import { PageEnum } from "../types/enums/page.enum";

//https://codesandbox.io/s/dynamic-components-ngtnx7
const Main = () => {
  const tabs = useTabStore((state) => state.tabs);
  const setTabs = useTabStore((state) => state.setTabs);
  const menuSelected = useTabStore((state) => state.menuSelected);
  const setMenuSelected = useTabStore((state) => state.setMenuSelected);
  const clicked = useClickedStore((state) => state.clicked);
  const setClicked = useClickedStore((state) => state.setClicked);
  const userGlobal = useUserStore((state) => state.userGlobal);
  const setPage = usePageStore((state) => state.setPage);

  //Controlamos los tabs que se encuentran en el top(TabItem)
  const handleToggleTab = (index: number) => {
    if (clicked === index) return;
    setClicked(index);
    const tabSelected = tabs.find((a) => a.index === index);
    if (tabSelected) {
      setMenuSelected(tabSelected.menu.nombre);
      // Sincronizar el page store con la página guardada en el tab activo
      const tabPage = tabSelected.menu.page as PageEnum;
      setPage(
        tabPage && tabPage !== PageEnum.INIT
          ? { open: true, namePage: tabPage, pageComplete: false }
          : INITIAL_VALUE_PAGE
      );
    }
  };

  const addTab = () => {
    //Agregamos un tab nuevo y cargamos el componente x defecto
    const endTab = tabs[tabs.length - 1];
    const getTab = endTab.index + 1;
    setClicked(getTab);
    // Tab nuevo siempre empieza sin página activa
    setPage(INITIAL_VALUE_PAGE);

    //Al agregar nuevo tab se clona la información del tab seleccionado
    const tabSelected = tabs.find((a) => a.index === clicked);
    if (tabSelected) {
      setMenuSelected(INITIAL_VALUE_TAB.menu.nombre);
      setTabs([
        ...tabs,
        {
          ...INITIAL_VALUE_TAB,
          index: getTab,
          modulo: tabSelected.modulo,
          menuAux: tabSelected.menuAux,
        },
      ]);
    }
  };

  const removeTab = (tab: number) => {
    //Si solo hay un tab no se puede eliminar
    if (tabs.length === 1) return;

    //Eliminando el tab seleccionado
    const newTabs = tabs.filter((item) => item.index !== tab);

    //Si el tab a eliminar es el seleccionado
    if (clicked === tab) {
      const findIndex = tabs.findIndex((a) => a.index === clicked);

      //El tab0 seleccionado se prohíbe eliminar
      if (findIndex === 0) return;

      //Es otro tab seleccionado avanza hacia adelante
      const rest = newTabs.slice(0, findIndex);
      const previousTab = rest[rest.length - 1];
      setMenuSelected(previousTab.menu.nombre);
      setClicked(previousTab.index);
      setTabs(newTabs);
      // Sincronizar page con la página del tab que queda activo
      const tabPage = previousTab.menu.page as PageEnum;
      setPage(
        tabPage && tabPage !== PageEnum.INIT
          ? { open: true, namePage: tabPage, pageComplete: false }
          : INITIAL_VALUE_PAGE
      );
    } else {
      //Si el tab eliminado no es el seleccionado, el tab seleccionado se mantiene
      setTabs(newTabs);
    }
  };

  useEffect(() => {
    if (userGlobal && (userGlobal?.rol?.modulos?.length ?? 0) > 0) {
      const primerModulo = userGlobal?.rol?.modulos[0];

      const primerMenu = primerModulo?.menus?.[0];

      // Solo establecer el menú si NO hay uno ya seleccionado (persistido)
      if (!menuSelected || menuSelected === "") {
        setMenuSelected(String(primerMenu?.nombre ?? ""));
      }

      // Solo establecer tabs si no hay tabs o está vacío
      if (tabs.length === 0) {
        setTabs([
          {
            index: 0,
            modulo: {
              estado: true,
              nombre: String(primerModulo?.nombre),
            },
            moduloAux: {
              estado: true,
              nombre: String(primerModulo?.nombre),
            },
            menuAux: {
              estado: true,
              nombre: String(primerMenu?.nombre),
              page: PageEnum.INIT,
            },
            menu: {
              estado: true,
              nombre: String(primerMenu?.nombre),
              page: PageEnum.INIT,
            },
          },
        ]);
      }
    }
  }, [userGlobal, setMenuSelected, setTabs, setPage, menuSelected, tabs]);

  return (
    <>
      <div className="flex absolute top-[60px] bottom-[10px] left-[10px] right-[10px]">
        <NavLeft />
        <div className="flex flex-[1_1_auto] relative">
          <div className="flex absolute h-full w-full top-0 left-0 flex-col">
            <div className="flex relative flex-col flex-[1_1_auto] pl-[8px] min-h-0">
              <div className="flex flex-[1_1_auto] min-h-0 flex-col">
                <ul className="m-0 flex-[0_0_auto] list-none after:block content-[' '] clear-both">
                  {/* LISTA DE TABS */}
                  {tabs.map((tab, i) => {
                    return (
                      <TabItem
                        key={i + 1}
                        onclick={() => handleToggleTab(tab.index)}
                        active={clicked === tab.index}
                        onClose={() => removeTab(tab.index)}
                        entity={tab}
                      />
                    );
                  })}
                  {/* AGREGAR MAS TABS */}
                  {tabs.length <= 4 ? (
                    <li onClick={addTab} className="select-none float-left m-[0_8px_4px_0] cursor-pointer">
                      <a className="hover:bg-bgDefault flex justify-center items-center top-0 p-[4px_8px] hover:no-underline rounded-[4px] relative z-[2]  font-bold leading-[20px] text-center no-underline select-none whitespace-nowrap">
                        <label className="text-[24px] font-bold text-center align-middle cursor-pointer inline-block after:content-['+'] text-green-600"></label>
                      </a>
                    </li>
                  ) : null}
                </ul>
                <div className="flex flex-col min-h-0 min-w-0 flex-[1_1_auto] p-0 h-auto">
                  <div className="flex flex-col flex-[1_1_auto] relative text-[#000] overflow-hidden select-text">
                    <DynamicComponentLoader nombreMenu={menuSelected} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
