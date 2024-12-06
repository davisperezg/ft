import { IMenuAccess } from "../../models/recurso/menu.interface";

export interface INavLeft {
  active: boolean;
  name: string;
  subitem: {
    menus: IMenuAccess[];
  };
}
