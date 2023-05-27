interface Props {
  children: JSX.Element | JSX.Element[] | React.ReactNode;
  value: number;
  index: number;
}

const TabModalPanel = ({ value, index, children }: Props) => {
  return <>{value === index ? <>{children}</> : <></>}</>;
};

export default TabModalPanel;
