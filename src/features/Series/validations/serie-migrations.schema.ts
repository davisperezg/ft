import * as yup from "yup";

export const schemaFormSeriesMigrate = yup.object({
  empresa: yup
    .number()
    .positive("Seleccione una empresa.")
    .required("La empresa es requerida."),
  establecimiento: yup
    .number()
    .positive("Seleccione un establecimiento origen.")
    .required("El establecimiento origen es requerido."),
  establecimiento_destino: yup
    .number()
    .positive("Seleccione un establecimiento destino.")
    .required("El establecimiento destino es requerido."),
  pos_origen: yup
    .number()
    .positive("Seleccione un POS origen.")
    .required("El POS origen es requerido."),
  pos_destino: yup
    .number()
    .positive("Seleccione un POS destino.")
    .required("El POS destino es requerido."),
  documentos: yup
    .array()
    .of(
      yup.object().shape({
        establecimiento: yup.string().required("Seleccione establecimiento."),
        idDocumento: yup
          .number()
          .positive("Seleccione un documento.")
          .required("El documento es requerido."),
        serie: yup.string().required("Seleccione serie."),
      })
    )
    .min(1, "Debe seleccionar al menos un documento.")
    .required("Los documentos a migrar son requeridos."),
});
