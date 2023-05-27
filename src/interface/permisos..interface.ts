import { IGroup } from "./group.interface";

export interface IPermisos {
  _id?: string;
  status?: boolean;
  name: string;
  key: string;
  description?: string;
  group_resource: IGroup;
  createdAt?: Date;
  updatedAt?: Date;
}
