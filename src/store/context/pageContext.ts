import { createContext } from "react";
import { INITIAL_VALUE_PAGE } from "../../config/constants";
import { PageState } from "../../interfaces/common/page.interface";

export const PageContext = createContext<{
  dialogState: PageState;
  dispatch: React.Dispatch<any>;
}>({
  dialogState: INITIAL_VALUE_PAGE,
  dispatch: () => null,
});
