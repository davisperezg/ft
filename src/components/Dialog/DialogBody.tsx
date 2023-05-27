interface Props {
  children: React.ReactNode;
}

const DialogBody = ({ children }: Props) => {
  return (
    <div className="p-[8px_16px_0px_16px] text-black h-[calc(100%-78px)] flex">
      <div className="flex flex-col w-full">{children}</div>
    </div>
  );
};

export default DialogBody;
