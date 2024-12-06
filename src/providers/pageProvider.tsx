import { useReducer } from "react";
import { INITIAL_VALUE_PAGE } from "../config/constants";
import { pageReducer } from "../store/reducers/pageReducer";
import { PageContext } from "../store/context/pageContext";

interface Prop {
  children: JSX.Element | JSX.Element[];
}

export const PageProvider = ({ children }: Prop) => {
  const [dialogState, dispatch] = useReducer(pageReducer, INITIAL_VALUE_PAGE);

  return (
    <PageContext.Provider
      value={{
        dialogState,
        dispatch,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
