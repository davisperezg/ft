import * as yup from "yup";
import { mySchemaTipoEntidad } from "../../TiposDocsIdentidad/validations/tipo-entidad.schema";
import { ITipoEntidades } from "../../../interfaces/models/tipo-docs-identidad/tipo_entidades.interface";

export const schemaFormEntidad = yup.object({
  entidad: yup
    .string()
    .min(3, "Nombre inválido (min. 3 caracteres)")
    .required("Ingrese nombre."),
  tipo_entidad: mySchemaTipoEntidad.optional(),
  numero_documento: yup
    .string()
    .required("Ingrese documento.")
    .when("tipo_entidad", {
      is: (tipo_entidad?: ITipoEntidades) => tipo_entidad?.codigo === "1",
      then: (schema) =>
        schema
          .matches(/^\d{8}$/, "Para DNI debe tener exactamente 8 dígitos")
          .test("solo-numeros", "El DNI solo debe contener números", (value) =>
            /^\d+$/.test(value || "")
          ),
      otherwise: (schema) =>
        schema.when("tipo_entidad", {
          is: (tipo_entidad?: ITipoEntidades) => tipo_entidad?.codigo === "6",
          then: (schema) =>
            schema
              .matches(/^(10|20)\d{9}$/, "El documento debe ser válido.")
              .test("validar-ruc", "RUC inválido", (value) => {
                if (!value) return false;
                return /^(10|20)\d{9}$/.test(value);
              }),
          otherwise: (schema) => schema,
        }),
    }),
  direccion: yup.string().required("Ingrese dirección."),
});
