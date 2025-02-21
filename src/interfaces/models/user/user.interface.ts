import { IFeatureEmpresaAsign } from "../../features/empresa/empresa.interface";
import { IRol } from "../rol/rol.interface";

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
  empresasAsign?: IFeatureEmpresaAsign[];
}

export interface IUserWithPassword extends IUser {
  password: string;
  confirm_password: string;
}

export interface IUserMysql {
  id?: number;
  _id?: string;
  nombres: string;
  apellidos: string;
  email: string;
  username: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDTOUsuario extends Pick<IUserMysql, "nombres" | "apellidos"> {
  id_usuario?: number;
  nombre_completo: string;
}
