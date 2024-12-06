import { IFeatureModule } from "../modulo/modulo.interface";

export interface IFeatureRol {
  nombre: string;
  modulos: IFeatureModule[];
}
