interface Props {
  children: JSX.Element;
}

const ContentList = ({ children }: Props) => {
  return (
    <div className="flex flex-col flex-[1_1_auto] overflow-hidden border border-solid relative">
      {children}
    </div>
  );
};

export default ContentList;
