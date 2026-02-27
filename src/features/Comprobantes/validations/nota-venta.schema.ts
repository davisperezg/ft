import * as yup from "yup";
import { Infer, Shape } from "../../../types/yup.types";
import type {
  NotaVentaDetailFormValues,
  NotaVentaFormValues,
  NotaVentaObservacionFormValues,
  NotaVentaProductFormValues,
} from "../types/nota-venta.types";

const schemaObservacion = yup.object().shape<Shape<NotaVentaObservacionFormValues, true>>({
  observacion: yup.string().required("Campo obligatorio."),
  uuid: yup.string().optional(),
});

const schemaProduct = yup.object().shape<Shape<NotaVentaProductFormValues, true>>({
  id: yup.number().optional(),
  cantidad: yup.number().when("$isModalOpen", {
    is: true,
    then: (schema) => schema.required("Campo obligatorio."),
    otherwise: (schema) => schema.optional(),
  }),
  codigo: yup.string().optional(),
  descripcion: yup.string().when("$isModalOpen", {
    is: true,
    then: (schema) => schema.required("Campo obligatorio."),
    otherwise: (schema) => schema.optional(),
  }),
  mtoValorUnitario: yup.string().when("$isModalOpen", {
    is: true,
    then: (schema) => schema.required("Campo obligatorio."),
    otherwise: (schema) => schema.optional(),
  }),
  estado: yup.boolean().optional(),
  tipAfeIgv: yup.string().when("$isModalOpen", {
    is: true,
    then: (schema) => schema.required("Seleccione tipo afectacion."),
    otherwise: (schema) => schema.optional(),
  }),
  unidad: yup.string().when("$isModalOpen", {
    is: true,
    then: (schema) => schema.required("Seleccione unidad."),
    otherwise: (schema) => schema.optional(),
  }),
  posicionTabla: yup.number().optional(),
});

const schemaDetail = yup.object().shape<Shape<NotaVentaDetailFormValues, true>>({
  id: yup.number().optional(),
  cantidad: yup.number().required("Ingrese cantidad."),
  codigo: yup.string().optional(),
  descripcion: yup.string().required("Campo obligatorio."),
  mtoValorUnitario: yup.string().required("Ingrese valor unitario."),
  tipAfeIgv: yup.string().required("Seleccione tipo de afectacion."),
  unidad: yup.string().required("Seleccione unidad."),
  porcentajeIgv: yup.number().required("Seleccione porcentaje de IGV."),
  //producto: yup.number().optional(),
  //presentation: yup.number().optional(),
  posicionTabla: yup.number().optional(),
});

export const schemaFormNotaVenta = yup.object().shape<Shape<NotaVentaFormValues, true>>({
  id: yup.number().optional(),
  pos: yup.number().required("Seleccione POS."),
  numeroDocumento: yup
    .string()
    .required("Ingrese número de documento.")
    .when("tipoEntidad", ([tipoEntidad], schema) => {
      if (tipoEntidad === "6") {
        return schema.matches(/^(20|10)\d{9}$/, "El RUC debe ser válido.");
      }
      if (tipoEntidad === "1") {
        return schema.length(8, "El DNI debe tener 8 dígitos.");
      }
      return schema;
    }),
  serie: yup.string().required("Ingrese serie."),
  numero: yup.string().required("Se requiere el numero de serie."),
  numeroConCeros: yup.string().optional(),
  tipoEntidad: yup.string().required("Ingrese tipo de entidad."),
  fechaEmision: yup.date().required("Ingrese fecha de emisión."),
  nombreCliente: yup.string().min(3, "Nombre inválido (min. 3 caracteres)").required("Ingrese nombre."),
  moneda: yup.string().required("Por favor ingresa moneda."),
  empresa: yup.number().required("Ingrese empresa."),
  establecimiento: yup.number().required("Ingrese establecimiento."),
  tipoDocumento: yup.string().required("Ingrese tipo de documento."),
  observacion: yup.string().when("$isModalObsOpen", {
    is: true,
    then: (schema) => schema.min(3, "Observación (min. 3 caracteres)").required("Campo obligatorio."),
    otherwise: (schema) => schema.optional(),
  }),
  observaciones: yup
    .array()
    .of(schemaObservacion as yup.Schema<NotaVentaObservacionFormValues>)
    .optional(),
  detalles: yup
    .array()
    .of(schemaDetail as yup.Schema<NotaVentaDetailFormValues>)
    .min(1, "Debe agregar al menos un item")
    .required("El detalle del documento es requerido."),
  producto: (schemaProduct as yup.Schema<NotaVentaProductFormValues>).optional(),
});

export type NotaVentaSchemaType = Infer<typeof schemaFormNotaVenta>;
