import { IMenuAccess } from "./menu.interface";

export interface IModuloAccess extends IMenuAccess {
  menus: IMenuAccess[];
}
