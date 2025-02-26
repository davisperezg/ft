import { IEstablecimiento } from "../establecimiento/establecimiento.interface";

export interface IPos {
  id?: number;
  nombre: string;
  codigo: string;
  establecimiento: IEstablecimiento;
  estado: boolean;
}

export interface IDTOPos extends IPos {
  establecimiento: Pick<IEstablecimiento, "id" | "codigo" | "denominacion">;
}
