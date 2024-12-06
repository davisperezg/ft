import * as yup from "yup";

export const schemaFormProducto = yup.object({
  tipAfeIgv: yup
    .string()
    .required("El tipo de afectación del IGV es obligatorio"),
  cantidad: yup
    .number()
    .min(0.000001, "La cantidad debe ser al menos 0.000001")
    .required("La cantidad es obligatoria"),
  unidad: yup.string().required("La unidad es obligatoria"),
  descripcion: yup
    .string()
    .min(3, "Campo obligatorio [3-500 caracteres]")
    .max(500, "Campo obligatorio [3-500 caracteres]")
    .required("Campo obligatorio."),
  mtoValorUnitario: yup.lazy((value) =>
    typeof value === "string"
      ? yup
          .string()
          .typeError("Campo obligatorio")
          .required("Campo obligatorio")
      : yup
          .number()
          .positive("El valor unitario debe ser positivo")
          .required("Campo obligatorio")
  ),
  porcentajeIgv: yup.lazy((value) =>
    typeof value === "string"
      ? yup
          .string()
          .typeError("Campo obligatorio")
          .required("Campo obligatorio")
      : yup
          .number()
          .positive("El porcentaje debe ser positivo")
          .required("Campo obligatorio")
  ),
  codigo: yup.string().optional(),
  posicionTabla: yup.number().optional(),
});
