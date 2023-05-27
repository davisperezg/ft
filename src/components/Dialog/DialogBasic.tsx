// interface Props {
//   open: boolean;
//   setOpen: any;
// }

import { cloneElement, useContext } from "react";
import { ModalContext } from "../../context/modalContext";

interface Props {
  children: JSX.Element[];
  width?: string | number;
  height?: string | number;
  handleClose?: () => void;
}

const DialogBasic = ({ children, handleClose, width, height }: Props) => {
  const { dialogState } = useContext(ModalContext);
  const isStringMyWidth = typeof width === "string";
  const isStringMyHeight = typeof height === "string";

  if (!dialogState.open) {
    return <></>;
  }

  //w-630px
  //h-440px

  return (
    <div
      style={{
        width: isStringMyWidth
          ? width + "px" //Aceptar ancho si es string
          : typeof width === "number" //condicional de number
          ? width //Aceptar ancho si es number
          : "630px", //ancho x defecto
        height: isStringMyHeight
          ? height + "px" //Aceptar altura si es string
          : typeof height === "number" //condicional de number
          ? height //Aceptar altura si es number
          : "440px", //altura x defecto
      }}
      className={`z-[12] overflow-hidden flex flex-col rounded-[10px] bg-white text-white fixed left-0 top-0 bottom-0 right-0 m-auto h-[${height}px]`}
    >
      {cloneElement(children[0], {
        handleClose: handleClose,
      })}
      {children[1]}
      {children[2]}
    </div>
  );
};

export default DialogBasic;
