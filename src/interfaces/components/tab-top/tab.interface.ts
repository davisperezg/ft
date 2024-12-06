export interface ITabItem {
  index: number;
  modulo: {
    nombre: string;
    estado: boolean;
  };
  menu: {
    nombre: string;
    estado: boolean;
  };
  menuAux: {
    nombre: string;
    estado: boolean;
  };
  moduloAux: {
    nombre: string;
    estado: boolean;
  };
}
