interface Props {
  value: number;
}

const TabModalItem = (props: any) => {
  return (
    <div
      onClick={props.onClick}
      className={`select-none cursor-pointer float-left p-2 pl-4 pr-4 rounded-md ${
        props.active ? "bg-blue-50" : "bg-white border"
      } text-textDefault  `}
    >
      <strong className={`text-[14px] ${props.active ? "text-blue-400" : ""}`}>
        {props.children}
      </strong>
    </div>
  );
};

export default TabModalItem;
