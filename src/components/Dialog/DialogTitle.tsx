interface Props {
  children: React.ReactNode;
}

const DialogTitle = ({ children }: Props) => {
  const myType = typeof children;
  const isString = myType === "string";

  return (
    <div
      className={`flex items-center ${
        isString && "flex-row justify-between"
      } p-[5px_15px] bg-blue-900`}
    >
      {isString ? (
        <>
          <h1 className="text-[16px]">{children}</h1>
          <label>X</label>
        </>
      ) : (
        children
      )}
    </div>
  );
};

export default DialogTitle;
