import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import DialogBasic from "../Dialog/DialogBasic";

const UserCreate = () => {
  const { dispatch } = useContext(ModalContext);

  return (
    <DialogBasic>
      <DialogTitle>Nuevo Usuario</DialogTitle>
      <DialogBody>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat
        blanditiis sed sapiente officia itaque, cum tenetur, id nesciunt aperiam
        ullam deleniti,
      </DialogBody>
      <DialogButtons>
        <button
          onClick={() => dispatch({ type: "INIT" })}
          className="min-w-[84px] min-h-[24px] mr-[8px] text-[#066397] cursor-pointer bg-transparent border border-solid border-black"
        >
          Cancelar
        </button>
        <button className="min-w-[84px] min-h-[24px] text-[#066397] cursor-pointer bg-transparent border border-solid border-black">
          OK
        </button>
      </DialogButtons>
    </DialogBasic>
  );
};

export default UserCreate;
