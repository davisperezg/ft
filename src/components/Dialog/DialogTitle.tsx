import { useContext } from "react";
import { ModalContext } from "../../context/modalContext";

interface Props {
  children: React.ReactNode;
}

const DialogTitle = (props: any) => {
  const { children, handleClose } = props;
  const myType = typeof children;
  const isString = myType === "string";

  const { dispatch } = useContext(ModalContext);

  const closeModal = () => {
    if (handleClose) {
      handleClose();
    }
    dispatch({ type: "INIT" });
  };

  return (
    <div
      className={`flex items-center ${
        isString && "flex-row justify-between"
      } p-[10px_15px] bg-secondary`}
    >
      {isString ? (
        <>
          <h1 className="text-[16px]">{children}</h1>
          <label className="cursor-pointer" onClick={closeModal}>
            X
          </label>
        </>
      ) : (
        children
      )}
    </div>
  );
};

export default DialogTitle;
