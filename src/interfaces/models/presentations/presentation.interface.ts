import { IProducto } from "../producto/producto.interface";
import { IUnidades } from "../unidades-medida/unidades.interface";

export interface IPresentation {
  id?: number;
  nombre: string; //1/2 Docena
  quantity: number; //factor conversion 6
  stock: number; //Cantidad disponible del producto
  unit_price: number; //Precio unitario incluido igv
  sales_price: number; //Precio de venta incluido igv
  min_price: number; //Precio mínimo de venta
  estado?: boolean; //Activo o Inactivo
  createdAt?: Date;
  updatedAt?: Date;
  product: IProducto; //Producto
  unidad: IUnidades; //Unidad de medidad
}
