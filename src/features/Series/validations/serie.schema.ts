import * as yup from "yup";

export const schemaFormSeries = yup.object({
  empresa: yup
    .number()
    .positive("Seleccione una empresa.")
    .required("La empresa es requerida."),
  establecimiento: yup
    .number()
    .positive("Seleccione un establecimiento.")
    .required("El establecimiento es requerido."),
  pos: yup.object().shape({
    label: yup.string().required("El POS es requerido."),
    value: yup.lazy((value) =>
      typeof value === "string"
        ? yup
            .string()
            .required("El POS es requerido.")
            .typeError("El POS es requerido.")
        : typeof value === "number"
          ? yup
              .number()
              .positive("Seleccione un POS.")
              .required("El POS es requerido.")
          : yup.boolean().required("El POS es requerido.")
    ),
  }),
  documento: yup.object().shape({
    label: yup.string().required("El documento es requerido."),
    value: yup.lazy((value) =>
      typeof value === "string"
        ? yup
            .string()
            .required("El documento es requerido.")
            .typeError("El documento es requerido.")
        : typeof value === "number"
          ? yup
              .number()
              .positive("Seleccione un documento.")
              .required("El documento es requerido.")
          : yup.boolean().required("El documento es requerido.")
    ),
  }),
  serie: yup
    .string()
    .required("La serie es requerida.")
    .when(["documento"], ([documento], schema) => {
      const label = String(documento?.label).toLowerCase();

      if (label === "factura") {
        return schema.matches(
          /F[A-Z0-9]{3}/,
          "Serie inválida ([F]{1,1}[A-Z0-9]{3,3})."
        );
      }

      if (label === "boleta") {
        return schema.matches(
          /B[A-Z0-9]{3}/,
          "Serie inválida ([B]{1,1}[A-Z0-9]{3,3})."
        );
      }

      return schema;
    }),
});
