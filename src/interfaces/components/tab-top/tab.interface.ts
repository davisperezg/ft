export interface ITabItem {
  index: number;
  modulo: {
    nombre: string;
    estado: boolean;
  };
  menu: {
    nombre: string;
    estado: boolean;
    page: string;
  };
  menuAux: {
    nombre: string;
    estado: boolean;
    page: string;
  };
  moduloAux: {
    nombre: string;
    estado: boolean;
  };
}
