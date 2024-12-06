import * as yup from "yup";
import { schemaFormProducto } from "../../Productos/validations/producto.schema";
import { IInvoice } from "../../../interfaces/models/invoices/invoice.interface";
import { Infer, Shape } from "../../../types/yup";

//string<'male' | 'female' | 'other'>().nullable().defined()
//https://stackoverflow.com/questions/73298804/yup-validationschema-type-with-objectschema-not-working
//https://claude.ai/chat/6e29510b-0e6d-43d6-8d22-e20aa5bec1cb
//SubmitHandler<Yup.InferType<typeof form>>

export const schemaFormInvoice = yup.object().shape<Shape<IInvoice, true>>({
  ruc: yup
    .string()
    .required("Ingrese RUC.")
    .matches(/^(20|10)\d{9}$/, "El RUC debe ser válido."),
  serie: yup.string().required("Ingrese serie."),
  numero: yup.string().required("Se requiere el numero de serie."),
  tipo_entidad: yup.string().required("Ingrese tipo de entidad."),
  forma_pago: yup.string().required("Ingrese forma de pago."),
  fecha_emision: yup.date().required("Ingrese fecha de emisión."),
  cliente: yup
    .string()
    .min(3, "Nombre inválido (min. 3 caracteres)")
    .required("Ingrese nombre."),
  tipo_operacion: yup.string().required("Por favor tipo de operación."),
  moneda: yup.string().required("Por favor ingresa moneda."),
  producto: schemaFormProducto,
  productos: yup
    .array()
    .of(schemaFormProducto)
    .min(1, "Debe agregar al menos un item")
    .required("El detalle del documento es requerido"),
});

export type mySchemaType = Infer<typeof schemaFormInvoice>;
export const mySchema = schemaFormInvoice as yup.Schema<mySchemaType>;
