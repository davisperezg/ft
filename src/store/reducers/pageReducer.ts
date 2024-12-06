import { INITIAL_VALUE_PAGE } from "../../config/constants";
import { PageActions, PageState } from "../../interfaces/common/page.interface";
import { PageEnum } from "../../types/enums/page.enum";

export const pageReducer = (state: PageState, action: PageActions) => {
  switch (action.type) {
    case PageEnum.INIT:
      return INITIAL_VALUE_PAGE;

    case PageEnum.SCREEN_FACTURA:
      return {
        ...state,
        payload: action.payload,
        pageComplete: true,
        namePage: "SCREEN_FACTURA",
      };

    case PageEnum.SCREEN_BOLETA:
      return {
        ...state,
        nameDialog: "SCREEN_BOLETA",
      };

    default:
      return state;
  }
};
