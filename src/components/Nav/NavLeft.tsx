import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import { DialogActionKind } from "../../reducers/dialogReducer";
import { MODS } from "../../utils/const";
import UserCreate from "../User/UserCreate";
import NavModItem from "./NavModItem";

interface Props {
  setMenus: any;
  menus: any[];
  handleTab: (title: string, nameComponent: string) => void;
  setNroTab: any;
  nroTab: any;
  clicked: number;
  setNameMenuInit: any;
}

const NavLeft = (props: Props) => {
  const {
    setMenus,
    menus,
    handleTab,
    setNroTab,
    nroTab,
    clicked,
    setNameMenuInit,
  } = props;
  const { dialogState, dispatch } = useContext(ModalContext);

  return (
    <>
      {dialogState.open &&
        dialogState.nameDialog === DialogActionKind.DIALOG_USER && (
          <UserCreate />
        )}
      {dialogState.open &&
        dialogState.nameDialog === DialogActionKind.DIALOG_RESORUCE && (
          <UserCreate />
        )}
      <div className="flex flex-[0_0_300px] flex-col  relative dark:bg-slate  -700">
        <dl className="flex flex-[1_1_100%] min-h-0 flex-col">
          {MODS.map((a, i) => {
            return (
              <NavModItem
                key={i + 1}
                chupetin={a}
                setMenus={setMenus}
                menus={menus[i]}
                totalMenus={menus}
                handleTab={handleTab}
                setNroTab={setNroTab}
                nroTab={nroTab}
                clicked={clicked}
                setNameMenuInit={setNameMenuInit}
              />
            );
          })}
        </dl>
      </div>
    </>
  );
};

export default NavLeft;
