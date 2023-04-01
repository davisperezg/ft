/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  createElement,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { ModalContext } from "../context/modalContext";
import { ComponentByName } from "../utils";
import {
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
  MODS,
} from "../utils/const";
import { ListComponents } from "../utils/ListComponents";
import ContentEmpty from "./Content/ContentEmpty";
import Header from "./Header/Index";
import NavLeft from "./Nav/NavLeft";
import TabItem from "./Tab/Views/TabItem";
import UserList from "./User/UserList";

const initial_tab = {
  index: 0,
  title: "Tab",
};

const Test1 = () => {
  return <h1>ga</h1>;
};

const Test2 = () => {
  return <h1>ga2</h1>;
};

//https://codesandbox.io/s/dynamic-components-ngtnx7
const Main = () => {
  //tab-create
  const [nameComponent, setNameComponent] = useState("Tab");

  //tab-init
  const [nameComponentInit, setNameComponentInit] = useState(MODS[0].nombre);
  const [nameMenuInit, setNameMenuInit] = useState(MODS[0].menus[0].nombre);

  const [nroTab, setNroTab] = useState<any[]>([]);

  const [menus, setMenus] = useState<any[]>([]);
  const [clicked, setClicked] = useState(0);
  const { dialogState, menuContext, setMenuContext } = useContext(ModalContext);

  //Controlamos los tabs que se encuentran en el top(TabItem)
  const handleToggle = (index: number) => {
    if (index !== 0) {
      const findIndex = nroTab.find((a) => a.index === index);
      const { title } = findIndex;
      if (title !== "Tab") {
        const filter = menus.map((a, i) => {
          return {
            ...a,
            item: { ...a.item, active: a.item.name === title },
          };
        });
        setMenus(filter);
      }
    } else {
      const filter = menus.map((a, i) => {
        return {
          ...a,
          item: { ...a.item, active: a.item.name === nameComponentInit },
        };
      });
      setMenus(filter);
    }

    setClicked(index);
  };

  //Render components
  const renderComponent = (props?: any) => {
    const justNamesMods = MODS.map((a) => a.nombre);

    if (clicked === 0) {
      if (justNamesMods.includes(nameComponentInit)) {
        return ComponentByName(nameMenuInit);
      }
    } else {
      const TabSelected = nroTab.find((a) => a.index === clicked);

      return TabSelected.component;
    }
  };

  //Controlamos los tabs del Modulo que se encuentra en el NavLeft
  const handleTab = (name: string, component: string) => {
    const findModuleSelectedNavLeft = MODS.find((a) => a.nombre === name);
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
    const getTab = nroTab.length + 1;
    setClicked(getTab);
    setNroTab([
      ...nroTab,
      { ...initial_tab, index: getTab, component: <ContentEmpty /> },
    ]);
  };

  const removeTab = (tab: number) => {
    //Eliminando el tab seleccionado
    const filTabs = nroTab
      .filter((a) => a.index !== tab)
      .map((_, i) => {
        return {
          ..._,
          index: i + 1,
        };
      });
    setNroTab(filTabs);

    //Retrocede -1 tab
    const getPosition = tab - 1;
    setClicked(getPosition);

    const filTabVal = nroTab.find((a) => a.index === getPosition);

    //Si no existe ningun tab agregado el Modulo de Navleft se movera donde este selecciona o marcado en rojo
    if (!filTabVal) {
      const filter = menus.map((a, i) => {
        return {
          ...a,
          item: { ...a.item, active: a.item.name === nameComponentInit },
        };
      });
      setMenus(filter);
      //Si existe tabs agregado y tienen un titulo diferente de tab se movera el Modulo de NavLeft donde corresponda
    } else if (filTabVal.title !== "Tab") {
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
    const lengthMods = MODS.map((a, i) => {
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
  }, []);

  return (
    <>
      <Header />
      <div className="flex absolute top-[60px] bottom-[10px] left-[10px] right-[10px]">
        <NavLeft
          setMenus={setMenus}
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
                  <li className="select-none float-left ml-0 m-[0_0_8px_4px] cursor-pointer">
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
                  </li>
                  {nroTab.map((tab) => (
                    <TabItem
                      key={tab.index}
                      onclick={() => handleToggle(tab.index)}
                      active={clicked === tab.index}
                      onClose={() => removeTab(tab.index)}
                      entity={tab}
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
      {dialogState.open && (
        <div className="absolute transition-all duration-1000 ease-in-out overflow-hidden w-full h-full top-0 left-0 bg-dialog z-[3]"></div>
      )}
    </>
  );
};

export default Main;
