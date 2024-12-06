import { PageEnum } from "../../types/enums/page.enum";

export interface PageState {
  open?: boolean;
  namePage: string;
  pageComplete?: boolean;
  payload?: any;
}

export interface PageActions {
  type: PageEnum;
  payload?: any;
}
