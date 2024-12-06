import * as yup from "yup";

export const schemaFormComuBaja = yup.object({
  motivo: yup
    .string()
    .required("Por favor ingresa el motivo de la comunicación de baja.")
    .min(10, "Ingrese mínimo 10 caracteres."),
});
