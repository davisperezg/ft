import { Dispatch, createContext, useState } from "react";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

export const TableContext = createContext<{
  paginationSize: number;
  setPaginationSize: Dispatch<React.SetStateAction<number>>;
}>({
  paginationSize: 10,
  setPaginationSize: () => null,
});

export const TableProvider = ({ children }: Prop) => {
  const [paginationSize, setPaginationSize] = useState<number>(10);

  return (
    <TableContext.Provider value={{ paginationSize, setPaginationSize }}>
      {children}
    </TableContext.Provider>
  );
};
