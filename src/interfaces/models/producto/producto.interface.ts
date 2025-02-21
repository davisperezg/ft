import { ITipoIgv } from "../tipo-igv/tipo_igv.interface";
import { IUnidades } from "../unidades-medida/unidades.interface";

export interface IProducto {
  id?: number;
  codigo?: string; //Codigo interno (opcional)
  nombre: string;
  descripcion?: string; // Producto 1
  mtoValorUnitario: number; //100 (precio del producto sin igv)
  stock: number; //Cantidad disponible del producto
  min_stock: number; //Nivel mínimo de stock antes de una alerta.
  purchase_price: number; //Precio de compra incluido igv
  max_profit: number; //Porcentaje de ganancia máxima
  min_profit: number; //Porcentaje de ganancia mínima
  estado?: boolean; //Activo o Inactivo
  createdAt?: Date;
  updatedAt?: Date;
  unidad: IUnidades; //Unidad de medidad
  tipAfeIgv: ITipoIgv; //Operacion gravada
}
