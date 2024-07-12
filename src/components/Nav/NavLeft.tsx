import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { NavLeftWithItem } from "../../interface/navleft_item.modulos.interface";
import NavModItem from "./NavModItem";

interface Props {
  menus: NavLeftWithItem[];
  handleTab: (title: string) => void;
  setNroTab: React.Dispatch<React.SetStateAction<any[]>>;
  nroTab: any[];
  clicked: number;
}

const NavLeft = (props: Props) => {
  const { menus, handleTab, setNroTab, nroTab, clicked } = props;
  const { userGlobal } = useContext(ModalContext);

  return (
    <>
      {/* Renderiza todos los dialogs <ContentDialogs />*/}

      <div className="flex flex-[0_0_300px] flex-col  relative dark:bg-slate  -700">
        <dl className="flex flex-[1_1_100%] min-h-0 flex-col">
          {userGlobal?.rol?.modulos.map((a: any, i: number) => {
            return (
              <NavModItem
                key={i + 1}
                modulo={a}
                menus={menus[i]}
                totalMenus={menus}
                handleTab={handleTab}
                setNroTab={setNroTab}
                nroTab={nroTab}
                clicked={clicked}
              />
            );
          })}
        </dl>
      </div>
    </>
  );
};

export default NavLeft;
