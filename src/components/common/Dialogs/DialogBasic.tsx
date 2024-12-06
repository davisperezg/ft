// interface Props {
//   open: boolean;
//   setOpen: any;
// }

import { cloneElement, useContext, useRef } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import Paper, { PaperProps } from "@mui/material/Paper";
import Draggable from "react-draggable";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import { SxProps } from "@mui/material";
import { Theme } from "@mui/material/styles";

interface Props {
  children: JSX.Element[];
  width?: string | number;
  height?: string | number;
  handleClose?: () => void;
}

const PaperComponent = (props: PaperProps) => {
  const nodeRef = useRef(null);

  const defaultStyles: SxProps<Theme> = {
    backgroundColor: "transparent",
    overflow: "hidden",
    boxShadow: "none",
    borderRadius: "6px",
    "&.MuiDialog-paper": {
      overflow: "hidden",
      maxWidth: 855,
      width: 855,
      height: 652,
      maxHeight: 652,
    },
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <div ref={nodeRef}>
        <Paper sx={defaultStyles} {...props} />
      </div>
    </Draggable>
  );
};

export const DialogBeta = (props: DialogProps) => {
  const { children } = props;

  return (
    <Dialog
      {...props}
      scroll={"paper"}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      {children}
    </Dialog>
  );
};

const DialogBasic = ({ children, width, height, handleClose }: Props) => {
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
      {/* {children} */}
      {cloneElement(children[0], {
        handleClose: handleClose,
      })}
      {children[1]}
      {children[2]}
    </div>
  );
};

export default DialogBasic;
