import * as yup from "yup";
import { Infer, Shape } from "../../../types/yup.types";
import { IFeatureInvoice } from "../../../interfaces/features/invoices/invoice.interface";
import { IValidationInvoiceDetails } from "../../../interfaces/validations/invoice/invoice-detail.interface";
import { IValidationProductInvoice } from "../../../interfaces/validations/product/product.interface";
import { IValidationInvoiceObservaciones } from "../../../interfaces/validations/invoice/invoice-observaciones.interface";

//string<'male' | 'female' | 'other'>().nullable().defined()
//https://stackoverflow.com/questions/73298804/yup-validationschema-type-with-objectschema-not-working
//https://claude.ai/chat/6e29510b-0e6d-43d6-8d22-e20aa5bec1cb
//SubmitHandler<Yup.InferType<typeof form>>

const schemaFormInvoiceObservacion = yup
  .object()
  .shape<Shape<IValidationInvoiceObservaciones, true>>({
    observacion: yup.string().required("Campo obligatorio."),
    uuid: yup.string().optional(),
  });
const SchemaFormInvoiceObservacion = schemaFormInvoiceObservacion as yup.Schema<
  Infer<typeof schemaFormInvoiceObservacion>
>;

const schemaFormProductInvoiceDetail = yup
  .object()
  .shape<Shape<IValidationProductInvoice, true>>({
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
    nombre: yup.string().optional(),
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
  });
const SchemaFormProductInvoiceDetail =
  schemaFormProductInvoiceDetail as yup.Schema<
    Infer<typeof schemaFormProductInvoiceDetail>
  >;

const schemaFormInvoiceDetail = yup
  .object()
  .shape<Shape<IValidationInvoiceDetails, true>>({
    id: yup.number().optional(),
    cantidad: yup.number().required("Ingrese cantidad."),
    codigo: yup.string().optional(),
    unidad: yup.string().required("Seleccione unidad."),
    tipAfeIgv: yup.string().required("Seleccione tipo de afectacion."),
    descripcion: yup.string().optional(),
    porcentajeIgv: yup.number().required("Seleccione porcentaje de IGV."),
    mtoValorUnitario: yup.string().required("Ingrese valor unitario."),
    producto: yup.number().optional(),
    presentation: yup.number().optional(),
    posicionTabla: yup.number().optional(),
  });
const SchemaFormInvoiceDetail = schemaFormInvoiceDetail as yup.Schema<
  Infer<typeof schemaFormInvoiceDetail>
>;

export const schemaFormInvoice = yup
  .object()
  .shape<Shape<IFeatureInvoice, true>>({
    id: yup.number().optional(),
    ruc: yup
      .string()
      .required("Ingrese RUC.")
      .matches(/^(20|10)\d{9}$/, "El RUC debe ser válido."),
    serie: yup.string().required("Ingrese serie."),
    numero: yup.string().required("Se requiere el numero de serie."),
    numeroConCeros: yup.string().optional(),
    borrador: yup.boolean().optional(),
    tipo_entidad: yup.string().required("Ingrese tipo de entidad."),
    forma_pago: yup.string().required("Ingrese forma de pago."),
    fecha_emision: yup.date().required("Ingrese fecha de emisión."),
    cliente: yup
      .string()
      .min(3, "Nombre inválido (min. 3 caracteres)")
      .required("Ingrese nombre."),
    tipo_operacion: yup.string().required("Seleccione tipo de operación."),
    moneda: yup.string().required("Por favor ingresa moneda."),
    direccion: yup.string().required("Ingrese dirección."),
    empresa: yup.number().required("Ingrese empresa."),
    establecimiento: yup.number().required("Ingrese establecimiento."),
    tipo_documento: yup.string().required("Ingrese tipo de documento."),
    fecha_vencimiento: yup.date().optional(),
    observacion: yup.string().when("$isModalObsOpen", {
      is: true,
      then: (schema) =>
        schema
          .min(3, "Observación (min. 3 caracteres)")
          .required("Campo obligatorio."),
      otherwise: (schema) => schema.optional(),
    }),
    observaciones: yup.array().of(SchemaFormInvoiceObservacion).optional(),
    details: yup
      .array()
      .of(SchemaFormInvoiceDetail)
      .min(1, "Debe agregar al menos un item")
      .required("El detalle del documento es requerido."),
    producto: SchemaFormProductInvoiceDetail.optional(),
  });
export type _schemaTypeFormInvoice = Infer<typeof schemaFormInvoice>;
