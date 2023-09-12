import { IModulosSystem } from "./modulo_system.interface";
import { IUser } from "./user.interface";

export interface IRol {
  _id?: string;
  name: string;
  description?: string;
  status?: boolean;
  creator?: IUser | string;
  module: IModulosSystem[] | string[];
  createdAt?: Date;
  restoredAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}
