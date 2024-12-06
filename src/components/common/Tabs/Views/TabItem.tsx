import { ITabItem } from "../../../../interfaces/components/tab-top/tab.interface";
import { convertirTitulo } from "../../../../utils/functions.utils";

interface Props {
  onclick: () => void;
  active: boolean;
  onClose: () => void;
  entity: ITabItem;
}

const TabItem = (props: Props) => {
  const { onclick, onClose, active, entity } = props;

  return (
    <li className={`select-none float-left m-[0_8px_4px_0] cursor-pointer`}>
      <a
        onClick={onclick}
        className={`flex justify-center items-center top-0 p-[4px_8px] hover:no-underline ${
          active
            ? "bg-primary hover:bg-primary text-[#fff] hover:text-white"
            : "bg-bgDefault text-secondary hover:text-secondary"
        } rounded-[4px] relative z-[2]  font-bold leading-[20px] text-center no-underline select-none whitespace-nowrap block`}
      >
        <span className="flex items-center bg-none w-auto h-auto">
          <label className="flex-[1_1_auto] align-middle cursor-pointer relative">
            {convertirTitulo(entity.modulo.nombre) ===
            convertirTitulo(entity.moduloAux.nombre)
              ? convertirTitulo(entity.modulo.nombre)
              : convertirTitulo(entity.moduloAux.nombre)}
          </label>
          <label
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`align-middle ${
              active
                ? "!text-[#fff] font-bold"
                : "text-secondary hover:text-primary"
            } text-center cursor-pointer icon-remove ml-[4px]`}
          ></label>
        </span>
      </a>
    </li>
  );
};

export default TabItem;
