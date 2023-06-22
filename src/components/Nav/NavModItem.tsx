import { useContext, useState, useEffect } from "react";
import { IModuloAccess } from "../../interface/modulo.interface";
import { NavLeftWithItem } from "../../interface/navleft_item.modulos.interface";

import NavMenuItem from "./NavMenuItem";
import { ModalContext } from "../../context/modalContext";

interface Props {
  totalMenus: any[];
  menus: NavLeftWithItem;
  handleTab: (name: string) => void;
  modulo: IModuloAccess;
  setNroTab: React.Dispatch<React.SetStateAction<any[]>>;
  nroTab: any[];
  clicked: number;
  setNameMenuInit: React.Dispatch<React.SetStateAction<string>>;
}

const NavModItem = ({
  totalMenus,
  menus,
  handleTab,
  modulo,
  setNroTab,
  nroTab,
  clicked,
  setNameMenuInit,
}: Props) => {
  const { modulesGlobal, clickedTab } = useContext(ModalContext);

  const endObject = totalMenus[totalMenus.length - 1];
  const [index, setIndex] = useState(0);
  const onClickMenu = (item: number) => setIndex(item);

  useEffect(() => {
    if (clicked !== clickedTab) {
      const find = modulesGlobal?.find((a: any) => a.tab === clicked);
      if (find) {
        setIndex(find?.menu);
      }
    } else if (clicked >= 0) {
      const find = modulesGlobal?.find((a: any) => a.tab === clickedTab);
      if (find) {
        setIndex(find?.menu);
      }
    }
  }, [clicked, clickedTab, modulesGlobal]);

  return (
    <>
      <dt
        onClick={() => {
          if (!menus?.item.active) {
            setIndex(0);
            return handleTab(modulo.nombre);
          }
        }}
        className={`flex-[0_0_auto] ${
          endObject?.item.name === modulo.nombre ? "border-b " : ""
        }${
          menus?.item.active
            ? "bg-primary text-[#fff] font-bold cursor-default"
            : "bg-default hover:bg-hover text-[#000] cursor-pointer border-t border-l border-r border-solid"
        } leading-[20px]  p-[2px_10px] text-center select-none`}
      >
        {modulo.nombre}
      </dt>
      <dd
        className={`transition-all ease-linear duration-[300ms] ${
          menus?.item.active ? "flex-[1_1_auto] h-[300px]" : "flex-none h-0"
        } w-full overflow-hidden bg-[url('https://cms.wialon.us/frontend/static/accounts_bg-6388b70e60291c855f5295c9db6353e0.svg')] bg-no-repeat bg-bottom hue-rotate-[0deg]`}
      >
        <div className="p-[5px]">
          <ol className="font-bold list-decimal pl-3">
            {menus?.item.subitem.menus.map((a: any, i: number) => {
              return (
                <NavMenuItem
                  index={i}
                  open={index === i}
                  key={i}
                  modulo={modulo}
                  menu={a}
                  onClickMenu={() => {
                    onClickMenu(i);
                  }}
                  setNroTab={setNroTab}
                  nroTab={nroTab}
                  handleTab={handleTab}
                  clicked={clicked}
                  setNameMenuInit={setNameMenuInit}
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
