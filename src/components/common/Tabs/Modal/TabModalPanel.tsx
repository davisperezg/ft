import { JSX, memo } from "react";

interface Props {
  children: JSX.Element | JSX.Element[] | React.ReactNode;
  value: number;
  index: number;
}

const TabModalPanel = memo(
  ({ value, index, children }: Props) => {
    return <>{value === index ? <>{children}</> : <></>}</>;
    //return <>{value}</>;
  },
  (prev, next) => prev.value === next.value
);

export default TabModalPanel;
