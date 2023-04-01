import { useCallback, useContext, useEffect, useState } from "react";
import { ModalContext } from "../../context/modalContext";
import { initialMenuContext } from "../../utils/initials";
import NavMenuItem from "./NavMenuItem";

const NavModItem = ({
  totalMenus,
  menus,
  handleTab,
  chupetin,
  setNroTab,
  nroTab,
  clicked,
  setNameMenuInit,
}: any) => {
  const endObject = totalMenus[totalMenus.length - 1];
  const [index, setIndex] = useState(0);
  const { menuContext } = useContext(ModalContext);
  const [test, setTest] = useState("");

  const onClickMenu = (item: number) => {
    setIndex(item);
  };

  return (
    <>
      <dt
        onClick={() => {
          if (!menus?.item.active) {
            setIndex(0);
            return handleTab(chupetin.nombre, "UserList");
          }
        }}
        className={`flex-[0_0_auto] ${
          endObject?.item.name === chupetin.nombre ? "border-b " : ""
        }${
          menus?.item.active
            ? "bg-primary text-[#fff] font-bold cursor-default"
            : "bg-default hover:bg-hover text-[#000] cursor-pointer border-t border-l border-r border-solid"
        } leading-[20px]  p-[2px_10px] text-center select-none`}
      >
        {chupetin.nombre}
      </dt>
      <dd
        className={`transition-all ease-linear duration-[300ms] ${
          menus?.item.active ? "flex-[1_1_auto] h-[300px]" : "flex-none h-0"
        } w-full overflow-hidden bg-[url('https://cms.wialon.us/frontend/static/accounts_bg-0e7eac36bc526877ef2a6868d8250e04.svg')] bg-no-repeat bg-bottom hue-rotate-[0deg]`}
      >
        <div className="p-[5px]">
          <ol className="font-bold list-decimal pl-3">
            {menus?.item.subitem.menus.map((a: any, i: number) => {
              return (
                <NavMenuItem
                  index={i}
                  open={index === i}
                  key={i}
                  modulo={chupetin}
                  menu={a}
                  onClickMenu={() => onClickMenu(i)}
                  setNroTab={setNroTab}
                  nroTab={nroTab}
                  clicked={clicked}
                  setTest={setTest}
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
