import { IGroup } from "../grupos/grupo-permiso.interface";

export interface IPermisos {
  _id?: string;
  status?: boolean;
  name: string;
  key: string;
  description?: string;
  group_resource: IGroup | string;
  createdAt?: Date;
  updatedAt?: Date;
}
