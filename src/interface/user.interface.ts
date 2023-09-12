import { IEmpresa } from "./empresa.interface";
import { IRol } from "./rol.interface";

export interface IUser {
  _id?: string;
  name: string;
  lastname: string;
  tipDocument: string;
  nroDocument: string;
  email: string;
  password?: string;
  confirm_password?: string;
  username: string;
  status?: boolean;
  role: Omit<IRol, "creator"> | string;
  creator?: Omit<IUser, "creator"> | string;
  createdAt?: Date;
  restoredAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
  empresa?: IEmpresa;
}
