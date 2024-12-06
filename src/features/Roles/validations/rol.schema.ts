import * as yup from "yup";

export const schemaFormRol = yup.object({
  name: yup
    .string()
    .min(3, "Ingrese mínimo 3 caracteres.")
    .max(45, "Ingrese máximo 45 caracteres.")
    .required("Ingresa nombre del rol"),
  description: yup.string().max(150, "Ingrese máximo 150 caracteres."),
  module: yup.lazy((value) => {
    switch (typeof value) {
      case "object":
        return yup
          .array()
          .of(yup.string().required("Seleccione un modulo."))
          .min(1, "Debe seleccionar al menos un modulo.")
          .required("Los modulos son requeridos.");
      default:
        return yup
          .array()
          .of(
            yup.object().shape({
              name: yup.string().required("Seleccione un modulo"),
            })
          )
          .min(1, "Debe seleccionar al menos un documento.")
          .required("Los documentos a migrar son requeridos.");
    }
  }),
});
