/* eslint-disable jsx-a11y/anchor-is-valid */
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../../context/modalContext";
import {
  MENU_MODULOS,
  MENU_PERMISOS,
  MENU_ROLES,
  MENU_USUARIOS,
} from "../../../utils/const";
import { initialMenuContext } from "../../../utils/initials";
import ContentEmpty from "../../Content/ContentEmpty";
import UserList from "../../User/UserList";

interface Props {
  onclick: any;
  active: any;
  onClose: any;
  entity: any;
}

const init = {
  index: 0,
  title: "Tab",
  content: "Empty",
};

const TabItem = (props: Props) => {
  const { onclick, onClose, active, entity } = props;
  const [tab, setTab] = useState(init);
  const { setMenuContext, menuContext } = useContext(ModalContext);
  const [componentInit, setComponentInit] = useState(<ContentEmpty />);

  useEffect(() => {
    if (entity) {
      setTab(entity);
    }
  }, [entity]);

  return (
    <li className={`select-none float-left m-[0_0_8px_8px] cursor-pointer`}>
      <a
        onClick={onclick}
        className={`top-0 pr-[5px] hover:no-underline ${
          active
            ? "bg-secondary hover:bg-secondary text-[#fff] hover:text-white"
            : "bg-default text-[#000] hover:text-black"
        } hover:bg-hover rounded-[4px] relative z-[2] pl-0 text-[12px] font-bold leading-[1.2] text-center no-underline select-none whitespace-nowrap block`}
      >
        <span className="flex justify-between items-center bg-none pl-[9px] p-[4px_0_4px_5px] w-auto h-auto min-w-[3rem] min-h-[21px]">
          <label className="align-middle cursor-pointer relative">
            {tab.title}
          </label>
          <label
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`ml-[5px] align-middle ${
              active ? "text-[#fff]" : "text-[#000]"
            } mr-[3px] text-[18px] font-normal text-center after:content-['x'] cursor-pointer`}
          ></label>
        </span>
      </a>
    </li>
  );
};

export default TabItem;
