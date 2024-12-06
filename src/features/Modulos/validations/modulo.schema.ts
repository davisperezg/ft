import * as yup from "yup";

export const schemaFormModulo = yup.object({
  name: yup
    .string()
    .min(3, "Ingrese mínimo 3 caracteres.")
    .max(45, "Ingrese máximo 45 caracteres.")
    .required("Ingresa nombre del modulo"),
  description: yup.string().max(150, "Ingrese máximo 150 caracteres."),
  menu: yup.lazy((value) => {
    switch (typeof value) {
      case "object":
        return yup
          .array()
          .of(yup.string().required("Seleccione un menu."))
          .min(1, "Debe seleccionar al menos un menu.");
      //.required("Los menus son requeridos.");
      default:
        return yup
          .array()
          .of(
            yup.object().shape({
              name: yup.string().required("Seleccione un menu."),
            })
          )
          .min(1, "Debe seleccionar al menos un menu.");
      //.required("Los menus a migrar son requeridos.");
    }
  }),
});
