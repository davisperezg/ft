interface Props {
  children: JSX.Element[];
}

const DialogButtons = ({ children }: Props) => {
  return (
    <div className="flex absolute bottom-0 flex-row justify-end w-full p-[10px_15px]">
      {children}
    </div>
  );
};

export default DialogButtons;
