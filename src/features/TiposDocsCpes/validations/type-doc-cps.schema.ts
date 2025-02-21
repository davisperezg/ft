import * as yup from "yup";
import { Infer, Shape } from "../../../types/yup.types";
import { IValidationCPEType } from "../../../interfaces/validations/type-doc-cpe/type-doc-cpe.interface";

export const schemaFormTypeDocCpe = yup
  .object()
  .shape<Shape<IValidationCPEType, true>>({
    nombre: yup.string().required(),
    abreviado: yup.string().required("Ingrese abreviado."),
    codigo: yup.string().required("Ingrese código."),
  });

export type TypeFormTypeDocCpe = Infer<typeof schemaFormTypeDocCpe>;
