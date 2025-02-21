import { useEffect, useState } from "react";
import NavLeft from "../components/common/Navs/NavLeft";
import TabItem from "../components/common/Tabs/Views/TabItem";
import FacturaScreen from "../features/Comprobantes/pages/FacturaPage";
import PaperRounded from "../components/Material/Paper/PaperRounded";
import { Divider, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PageEnum } from "../types/enums/page.enum";
import DynamicComponentLoader from "../utils/render-component-dynamic.utils";
import { useTabStore } from "../store/zustand/tabs-zustand";
import { INITIAL_VALUE_PAGE, INITIAL_VALUE_TAB } from "../config/constants";
import { useUserStore } from "../store/zustand/user-zustand";
import { usePageStore } from "../store/zustand/page-zustand";

//https://codesandbox.io/s/dynamic-components-ngtnx7
const Main = () => {
  const tabs = useTabStore((state) => state.tabs);
  const setTabs = useTabStore((state) => state.setTabs);
  const menuSelected = useTabStore((state) => state.menuSelected);
  const setMenuSelected = useTabStore((state) => state.setMenuSelected);

  //console.log(tabs, setTabs);
  const [clicked, setClicked] = useState<number>(0);
  const userGlobal = useUserStore((state) => state.userGlobal);

  const page = usePageStore((state) => state.page);
  const setPage = usePageStore((state) => state.setPage);

  //Controlamos los tabs que se encuentran en el top(TabItem)
  const handleToggleTab = (index: number) => {
    if (clicked === index) return;
    setClicked(index);
    const tabSelected = tabs.find((a) => a.index === index);
    if (tabSelected) {
      setMenuSelected(tabSelected?.menu.nombre);
    }
  };

  const addTab = () => {
    //Agregamos un tab nuevo y cargamos el componente x defecto
    const endTab = tabs[tabs.length - 1];
    const getTab = endTab.index + 1;
    setClicked(getTab);

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
      setMenuSelected(rest[rest.length - 1].menu.nombre);
      setClicked(rest[rest.length - 1].index);
      setTabs(newTabs);
    } else {
      //Si el tab eliminado no es el seleccionado, el tab seleccionado se mantiene
      setTabs(newTabs);
    }
  };

  useEffect(() => {
    if (userGlobal && (userGlobal?.rol?.modulos?.length ?? 0) > 0) {
      const primerModulo = userGlobal?.rol?.modulos[0];
      const primerMenu = primerModulo?.menus?.[0];
      setMenuSelected(String(primerMenu?.nombre ?? ""));
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
          },
          menu: {
            estado: true,
            nombre: String(primerMenu?.nombre),
          },
        },
      ]);
    }
  }, [userGlobal, setMenuSelected, setTabs]);

  return (
    <>
      {page.pageComplete && page.namePage === PageEnum.SCREEN_FACTURA && (
        // <FacturaScreen /> bg-[#EDF1F4] border borders min-h-[100vh] flex justify-center pt-[60px]
        <div className="bg-[#F8F8F8] min-h-[100vh] min-w-max">
          <div className="min-w-[1050px] relative mt-[60px] mx-auto">
            <div className="p-[30px] w-[1050px] mx-auto">
              <PaperRounded className="!shadow-asun">
                <div className="pl-[15px] py-[10px] flex justify-start items-center">
                  <Tooltip title="Regresar" arrow>
                    <IconButton onClick={() => setPage(INITIAL_VALUE_PAGE)}>
                      <ArrowBackIcon />
                    </IconButton>
                  </Tooltip>{" "}
                  <Typography variant="h6">
                    Emitir <small className="text-default">Factura</small>
                  </Typography>
                </div>
                <Divider variant="fullWidth" />
                <div className="pt-[20px]">
                  <FacturaScreen />
                </div>
              </PaperRounded>
            </div>
          </div>
        </div>
      )}

      {page.namePage === PageEnum.INIT && (
        <div className="flex absolute top-[60px] bottom-[10px] left-[10px] right-[10px]">
          <NavLeft clicked={clicked} />
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
                      <li
                        onClick={addTab}
                        className="select-none float-left m-[0_8px_4px_0] cursor-pointer"
                      >
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
      )}

      {/* {dialogState.open && (
        <div className="absolute transition-all duration-1000 ease-in-out overflow-hidden w-full h-full top-0 left-0 bg-dialog z-[11]"></div>
      )} */}
    </>
  );
};

export default Main;
