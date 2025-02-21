import * as yup from "yup";
import { ITipoEntidades } from "../../../interfaces/models/tipo-docs-identidad/tipo_entidades.interface";
import { Shape } from "../../../types/yup.types";

export const schemaFormTipoEntidad = yup
  .object()
  .shape<Shape<ITipoEntidades, true>>({
    tipo_entidad: yup.string().required("Ingrese tipo de entidad."),
    codigo: yup.string().required("Ingrese el codigo de entidad"),
    descripcion: yup.string().required("Ingrese descripción de entidad"),
    abreviatura: yup.string().required("Ingrese abreviatura de entidad"),
  });

export const mySchemaTipoEntidad =
  schemaFormTipoEntidad as yup.Schema<ITipoEntidades>;
