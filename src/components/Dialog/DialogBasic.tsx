// interface Props {
//   open: boolean;
//   setOpen: any;
// }

import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";

interface Props {
  children: React.ReactNode[];
  width?: string | number;
  height?: string | number;
}

const DialogBasic = ({
  children,
  width = "630px",
  height = "440px",
}: Props) => {
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
      className={`flex flex-col z-[4] rounded-[3px] bg-[#ffefc6] text-white absolute left-0 top-0 bottom-0 right-0 m-auto w-[${
        isStringMyWidth ? width : width + "px"
      }] h-[${isStringMyHeight ? height : height + "px"}]`}
    >
      {children[0]}
      {children[1]}
      {children[2]}
    </div>
  );
};

export default DialogBasic;
