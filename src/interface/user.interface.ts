import { IEmpresa, IEmpresaAsign } from "./empresa.interface";
import { IRol } from "./rol.interface";

type IRolWithoutCreator = Omit<IRol, "creator">;
//Partial<IRol & IRolWithoutCreator> | string;
export interface IUser {
  id?: number;
  _id?: string;
  name: string;
  lastname: string;
  tipDocument: string;
  nroDocument: string;
  email: string;
  username: string;
  status?: boolean;
  role: Partial<IRolWithoutCreator> | string;
  creator?: Omit<IUser, "creator"> | string;
  createdAt?: Date;
  restoredAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
  empresasAsign?: IEmpresaAsign[];
}

export interface IUserWithPassword extends IUser {
  password: string;
  confirm_password: string;
}

export interface IUserMysql {
  id?: number;
  nombres: string;
  apellidos: string;
  email: string;
}
