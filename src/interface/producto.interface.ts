export interface IProducto {
  tipAfeIgv: string; //Operacion gravada
  cantidad: number; //2
  unidad: string; //Unidad de medidad
  codigo?: string; //Codigo interno (opcional)
  descripcion: string; // Producto 1
  mtoValorUnitario: number | string; //100 (precio del producto sin igv)
  mtoValorVenta?: number | string; //MtoValorUnitario * cantidad = 200
  mtoBaseIgv: number | string; //MtoValorUnitario * cantidad = 200
  porcentajeIgv: number | string; //18
  igv: number | string; //mtoValorVenta * porcentajeIgv(%) = 36
  totalImpuestos: number | string; //Suma todos los impuestos = 36
  mtoTotalItem: number | string; //mtoValorVenta + totalImpuestos = 236(precio total del producto incluido IGV)
  mtoValorGratuito?: number | string; //Monto de productos gratuitos

  //Montos calculados unitarios
  igvUnitario: number | string; //100 * 18 / 100 = 18
  mtoPrecioUnitario: number | string; //MtoValorUnitario + igvUnitario = 118

  //opcionales
  posicionTabla?: number;
  mtoPrecioUnitarioGratuito?: number | string; //MtoValorUnitario + igvUnitario = 118 Gravados Gratuitos
}
