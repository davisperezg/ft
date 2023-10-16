/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../context/modalContext";
import { ITabItem } from "../interface/tab.interface";
import { ComponentByName } from "../utils";
import ContentEmpty from "./Content/ContentEmpty";
import NavLeft from "./Nav/NavLeft";
import TabItem from "./Tab/Views/TabItem";
import UserScreen from "../views/UserScreen";

const initial_tab = {
  index: 0,
  title: "Tab",
};

//https://codesandbox.io/s/dynamic-components-ngtnx7
const Main = () => {
  const [nroTab, setNroTab] = useState<ITabItem[]>([]);

  const [menus, setMenus] = useState<any[]>([]);
  const [clicked, setClicked] = useState<number>(0);
  const {
    dialogState,
    userGlobal,
    setClickedGlobal,
    setModulesGlobal,
    modulesGlobal,
  } = useContext(ModalContext);

  const [nameComponentInit, setNameComponentInit] = useState<string>("");
  const [nameMenuInit, setNameMenuInit] = useState<string>("");

  //Controlamos los tabs que se encuentran en el top(TabItem)
  const handleToggle = (index: number) => {
    //if (index !== 0) {
    const findIndex = nroTab.find((a) => a.index === index);
    const { title } = findIndex!;
    if (title !== "Tab") {
      const filter = menus.map((a, i) => {
        return {
          ...a,
          item: { ...a.item, active: a.item.name === title },
        };
      });
      setMenus(filter);
    }
    //}
    // else {
    //   //Entra a este codigo so el tab es 0 o el principal
    //   const filter = menus.map((a, i) => {
    //     return {
    //       ...a,
    //       item: { ...a.item, active: a.item.name === nameComponentInit },
    //     };
    //   });
    //   setMenus(filter);

    //   const resFormated = modulesGlobal.map((a: any) => {
    //     if (a.tab === 0 && a.menu === 0) {
    //       return {
    //         ...a,
    //         menu: index,
    //         component: nameMenuInit,
    //       };
    //     } else {
    //       return a;
    //     }
    //   });

    //   setModulesGlobal(resFormated);
    // }

    setClickedGlobal(index);
    setClicked(index);
  };

  //Render components
  const renderComponent = (props?: any) => {
    const justNamesMods =
      userGlobal?.rol?.modulos.map((a: any) => a.nombre) || [];

    // if (clicked === 0) {
    //   if (justNamesMods.includes(nameComponentInit)) {
    //     return ComponentByName(nameMenuInit);
    //   }
    // } else {
    const TabSelected = nroTab.find((a) => a.index === clicked);

    return TabSelected?.component;
    //}
  };

  //Controlamos los tabs del Modulo que se encuentra en el NavLeft
  const handleTab = (name: string) => {
    const findModuleSelectedNavLeft = userGlobal?.rol?.modulos.find(
      (a: any) => a.nombre === name
    );
    if (clicked === 0) {
      //Si tiene menus el modulo usara el menu 0 x defecto de lo contrario usara un menu empty como vacio o no existe
      setNameMenuInit(
        findModuleSelectedNavLeft?.menus?.length! > 0
          ? (findModuleSelectedNavLeft?.menus[0]?.nombre as string)
          : "Empty"
      );
      setNameComponentInit(name);
    } else {
      const res = nroTab.map((a) => {
        if (a.index === clicked) {
          return {
            ...a,
            title: name,
            component: ComponentByName(
              findModuleSelectedNavLeft?.menus[0]?.nombre as string
            ),
          };
        } else {
          return a;
        }
      });

      setNroTab(res);
      // setModulesGlobal(res);
    }

    //De todos los menus agregados busco donde selecciono y actualizo array
    const filter = menus.map((a, i) => {
      return {
        ...a,
        item: { ...a.item, active: a.item.name === name },
      };
    });
    setMenus(filter);
  };

  const addTab = () => {
    //Aregamos un tab nuevo y cargamos el componente x defecto
    const getTab = nroTab.length;
    setClicked(getTab);
    setNroTab([
      ...nroTab,
      { ...initial_tab, index: getTab, component: <ContentEmpty /> },
    ]);

    setClickedGlobal(getTab);
  };

  const removeTab = (tab: number) => {
    //Eliminando el tab del module context
    const kickModule = modulesGlobal.filter((a: any) => a.tab !== tab);
    setModulesGlobal(kickModule);

    //Eliminando el tab seleccionado
    const filTabs = nroTab.filter((a) => a.index !== tab);
    // .map((_, i) => {
    //   return {
    //     ..._,
    //     index: i + 1,
    //   };
    // });
    setNroTab(filTabs);

    //Retrocede -1 tab
    const getPosition = tab - 1;

    const filTabVal = nroTab.find((a) => a.index === getPosition);

    //Si no existe ningun tab agregado el Modulo de Navleft se movera donde este selecciona o marcado en rojo
    if (!filTabVal) {
      setClicked(0);
      const filter = menus.map((a, i) => {
        return {
          ...a,
          item: { ...a.item, active: a.item.name === nameComponentInit },
        };
      });
      setMenus(filter);
      //Si existe tabs agregado y tienen un titulo diferente de tab se movera el Modulo de NavLeft donde corresponda
    } else if (filTabVal.title !== "Tab") {
      setClicked(getPosition);
      const { title } = filTabVal;
      const filter = menus.map((a, i) => {
        return {
          ...a,
          item: { ...a.item, active: a.item.name === title },
        };
      });
      setMenus(filter);
    } else {
      //Ingresa cuando se abre un Tab nuevo el Modulo de NavLeft no se movera
    }
  };

  useEffect(() => {
    if (userGlobal) {
      setNroTab([
        {
          index: 0,
          title: userGlobal.rol.modulos[0]?.nombre,
          component: <UserScreen />,
        },
      ]);
      setNameComponentInit(userGlobal.rol.modulos[0]?.nombre);
      setNameMenuInit(userGlobal.rol.modulos[0].menus[0]?.nombre);
      setModulesGlobal([
        {
          tab: 0,
          menu: 0,
          title: userGlobal.rol.modulos[0]?.nombre,
          component: userGlobal.rol.modulos[0].menus[0]?.nombre,
        },
      ]);
      const lengthMods = userGlobal.rol.modulos.map((a: any, i: number) => {
        return {
          item:
            i + 1 === 1
              ? {
                  name: a.nombre,
                  active: true,
                  subitem: {
                    menus: a.menus,
                  },
                }
              : {
                  name: a.nombre,
                  active: false,
                  subitem: {
                    menus: a.menus,
                  },
                },
        };
      });

      setMenus(lengthMods);
    }
  }, [userGlobal, setModulesGlobal]);

  return (
    <>
      <div className="flex absolute top-[60px] bottom-[10px] left-[10px] right-[10px]">
        <NavLeft
          menus={menus}
          handleTab={handleTab}
          setNroTab={setNroTab}
          nroTab={nroTab}
          clicked={clicked}
          setNameMenuInit={setNameMenuInit}
        />
        <div className="flex flex-[1_1_auto] relative">
          <div className="flex absolute h-full w-full top-0 left-0 flex-col">
            <div className="flex relative flex-col flex-[1_1_auto] pl-[8px] min-h-0">
              <div className="flex flex-[1_1_auto] min-h-0 flex-col">
                <ul className="m-0 flex-[0_0_auto] list-none after:block content-[' '] clear-both">
                  {/* <li className="select-none float-left ml-0 m-[0_0_8px_4px] cursor-pointer">
                    <a
                      onClick={() => handleToggle(0)}
                      className={`top-0 pr-[5px] hover:no-underline ${
                        clicked === 0
                          ? "bg-secondary hover:bg-secondary text-[#fff] hover:text-white"
                          : "bg-default text-[#000] hover:text-black"
                      } hover:bg-hover rounded-[4px] relative z-[2] pl-0 text-[12px] font-bold leading-[1.2] text-center no-underline	whitespace-nowrap block`}
                    >
                      <span className="flex justify-between items-center bg-none pl-[9px] p-[4px_0_4px_5px] w-auto h-auto min-w-0 min-h-[21px]">
                        <label className="align-middle cursor-pointer relative">
                          {nameComponentInit}
                        </label>
                        <label
                          className={`ml-[5px] align-middle ${
                            clicked === 0 ? "text-[#fff]" : "text-[#000]"
                          } mr-[3px] text-[18px] font-normal text-center after:content-['x'] cursor-pointer`}
                        ></label>
                      </span>
                    </a>
                  </li> */}
                  {nroTab.map((tab) => (
                    <TabItem
                      key={tab.index}
                      onclick={() => handleToggle(tab.index)}
                      active={clicked === tab.index}
                      onClose={() => removeTab(tab.index)}
                      entity={tab}
                      size={nroTab}
                    />
                  ))}
                  {nroTab.length <= 3 ? (
                    <li className="float-left m-[0_0_8px_8px] border-[1px] border-solid border-transparent rounded-[2px]">
                      <a className="bg-none top-0 pr-[5px] relative z-[2] pl-0 text-[12px] font-bold leading-[1.2] text-center no-underline	whitespace-nowrap block p-[0_8px]">
                        <label
                          onClick={addTab}
                          className="text-[24px] font-bold text-center	 align-middle cursor-pointer inline-block after:content-['+'] text-green-600"
                        ></label>
                      </a>
                    </li>
                  ) : null}
                </ul>
                <div className="flex flex-col min-h-0 min-w-0 flex-[1_1_auto] p-0 h-auto">
                  <div className="flex flex-col flex-[1_1_auto] relative text-[#000] overflow-hidden select-text">
                    {/* {clicked === 0 ? ComponentInit : Component} */}
                    {renderComponent()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {dialogState.open && (
        <div className="absolute transition-all duration-1000 ease-in-out overflow-hidden w-full h-full top-0 left-0 bg-dialog z-[11]"></div>
      )} */}
    </>
  );
};

export default Main;
