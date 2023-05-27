import { IMenuSystem } from "./menu_system.interface";

export interface IModulosSystem {
  _id?: string;
  name: string;
  description?: string;
  status?: boolean;
  menu?: IMenuSystem[] | string[];
  color?: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}
