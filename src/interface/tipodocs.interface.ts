export interface ITipoDoc {
  id?: number;
  codigo: string;
  nombre: string;
  abreviado: string;
  estado?: boolean;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deleteAt?: Date;
  restoreAt?: Date;
}
