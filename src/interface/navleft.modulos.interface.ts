import { IMenuAccess } from "./menu.interface";

export interface INavLeft {
  active: boolean;
  name: string;
  subitem: {
    menus: IMenuAccess[];
  };
}
