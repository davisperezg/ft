import { IMenuAccess } from "../recurso/menu.interface";

export interface IModuloAccess extends IMenuAccess {
  menus: IMenuAccess[];
}
