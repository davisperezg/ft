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
  role: IRol | string;
  creator?: IUser | string;
  createdAt?: Date;
  restoredAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}
