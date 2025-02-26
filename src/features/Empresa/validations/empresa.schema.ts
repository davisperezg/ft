import * as yup from "yup";
import { Infer, Shape } from "../../../types/yup.types";
import {
  IFeatureEmpresaCreate,
  IFeatureEmpresaUpdate,
} from "../../../interfaces/features/empresa/empresa.interface";
import { IFormSelectOption } from "../../../interfaces/forms/common/select.interface";
import {
  IValidationCPETypeEmpresaCreate,
  IValidationCPETypeEmpresaUpate,
} from "../../../interfaces/validations/type-doc-cpe/type-doc-cpe.interface";
import { IValidationEstablecimientoEmpresaUpdate } from "../../../interfaces/validations/establecimiento/establecimiento.interface";
import { IValidationPOSEmpresaUpdate } from "../../../interfaces/validations/pos/pos.interface";

const schemaFormEmpresaSelectOption = yup
  .object()
  .shape<Shape<IFormSelectOption, true>>({
    label: yup.string().optional(),
    value: yup.string().optional(),
  });
type TypeFormEmpresaSelectOption = Infer<typeof schemaFormEmpresaSelectOption>;
const SchemaFormEmpresaSelectOption =
  schemaFormEmpresaSelectOption as yup.Schema<TypeFormEmpresaSelectOption>;

const schemaFormEmpresaDocumentsCreate = yup
  .object()
  .shape<Shape<IValidationCPETypeEmpresaCreate, true>>({
    id: yup.number().required(),
    nombre: yup.string().required(),
  });

type TypeFormEmpresaDocumentsCreate = Infer<
  typeof schemaFormEmpresaDocumentsCreate
>;
const SchemaFormEmpresaDocumentsCreate =
  schemaFormEmpresaDocumentsCreate as yup.Schema<TypeFormEmpresaDocumentsCreate>;

export const schemaFormEmpresaCreate = yup
  .object()
  .shape<Shape<IFeatureEmpresaCreate, true>>({
    usuario: yup
      .number()
      .positive("Seleccione un usuario.")
      .required("El usuario es requerido."),
    ruc: yup
      .string()
      .required("Ingrese RUC.")
      .matches(/^(20|10)\d{9}$/, "El RUC debe ser válido."),
    razon_social: yup.string().required("Ingrese razon social."),
    nombre_comercial: yup.string().required("Ingrese nombre comercial."),
    domicilio_fiscal: yup.string().required("Ingrese domicilio fiscal."),
    ubigeo: yup.string().required("Ingrese ubigeo."),
    urbanizacion: yup.string().required("Ingrese urbanizacion."),
    modo: yup.number().required(),
    ose_enabled: yup.boolean().required(),
    web_service: yup.string().when("ose_enabled", ([ose_enabled], schema) => {
      return ose_enabled
        ? schema
            .required("Ingrese link OSE")
            .matches(
              /^(http|https):\/\/[\w-]+\.[a-z]{2,}(\/.*)?$/i,
              "El link debe ser válido."
            )
        : schema.optional();
    }),
    cert_password: yup
      .string()
      .when(["modo", "cert"], ([modo, cert], schema) => {
        return modo === 1 || cert
          ? schema.required(
              `${
                modo === 1 && !cert
                  ? "Suba un certificado para agregar el password."
                  : "Ingrese el password del certificado."
              }`
            )
          : schema.notRequired();
      }),
    usu_secundario_ose_user: yup
      .string()
      .when("ose_enabled", ([ose_enabled], schema) => {
        return ose_enabled
          ? schema.required("Ingrese el usuario secundario OSE.")
          : schema.notRequired();
      }),
    usu_secundario_ose_password: yup
      .string()
      .when("ose_enabled", ([ose_enabled], schema) => {
        return ose_enabled
          ? schema.required("Ingrese el password del usuario secundario OSE.")
          : schema.notRequired();
      }),
    usu_secundario_user: yup
      .string()
      .when(["ose_enabled", "modo"], ([ose_enabled, modo], schema) => {
        return !ose_enabled && modo === 1
          ? schema.required("Ingrese el usuario secundario SUNAT.")
          : schema.notRequired();
      }),
    usu_secundario_password: yup
      .string()
      .when(["ose_enabled", "modo"], ([ose_enabled, modo], schema) => {
        return !ose_enabled && modo === 1
          ? schema.required("Ingrese el password del usuario secundario SUNAT.")
          : schema.notRequired();
      }),
    correo: yup
      .string()
      .required("Ingrese correo.")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "El correo debe ser válido."
      ),
    telefono_movil_1: yup
      .string()
      .required("Ingrese telefono movil 1.")
      .matches(/^9\d{8}$/, "Ingrese un número de celular válido."),
    telefono_movil_2: yup.string().matches(/^9\d{8}$/, {
      message: "Ingrese un número de celular válido.",
      excludeEmptyString: true,
    }),
    telefono_fijo_1: yup.string().optional(),
    telefono_fijo_2: yup.string().optional(),
    departamento: SchemaFormEmpresaSelectOption.optional(),
    provincia: SchemaFormEmpresaSelectOption.optional(),
    distrito: SchemaFormEmpresaSelectOption.optional(),
    tip_documento: yup.number().optional(),
    logo: yup.mixed<FileList>().optional(),
    cert: yup.mixed<FileList>().optional(),
    documentos: yup.array().of(SchemaFormEmpresaDocumentsCreate).required(),
  });

export type _schemaFormEmpresaCreate = Infer<typeof schemaFormEmpresaCreate>;

const schemaFormEmpresaDocumentsUpdate = yup
  .object()
  .shape<Shape<IValidationCPETypeEmpresaUpate, true>>({
    id: yup.number().required(),
    estado: yup.boolean().optional(),
    nombre: yup.string().required(),
    new: yup.boolean().required(),
  });
type TypeFormEmpresaDocumentsUpdate = Infer<
  typeof schemaFormEmpresaDocumentsUpdate
>;
const SchemaFormEmpresaDocumentsUpdate =
  schemaFormEmpresaDocumentsUpdate as yup.Schema<TypeFormEmpresaDocumentsUpdate>;

const schemaFormEmpresaEstablecimientosUpdate = yup
  .object()
  .shape<Shape<IValidationEstablecimientoEmpresaUpdate, true>>({
    codigo: yup.string().required("Ingrese código."),
    denominacion: yup.string().required("Ingrese denominación."),
    direccion: yup.string().required("Ingrese dirección."),
    ubigeo: yup.string().required("Ingrese ubigeo."),
    departamento: SchemaFormEmpresaSelectOption.optional(),
    provincia: SchemaFormEmpresaSelectOption.optional(),
    distrito: SchemaFormEmpresaSelectOption.optional(),
    estado: yup.boolean().optional(),
    id: yup.number().optional(),
    logo: yup.mixed<FileList>().optional(),
    new: yup.boolean().optional(),
  });

type TypeFormEmpresaEstablecimientosUpdate = Infer<
  typeof schemaFormEmpresaEstablecimientosUpdate
>;
const SchemaFormEmpresaEstablecimientosUpdate =
  schemaFormEmpresaEstablecimientosUpdate as yup.Schema<TypeFormEmpresaEstablecimientosUpdate>;

const schemaFormPOSEstablecimientosUpdate = yup
  .object()
  .shape<Shape<IValidationPOSEmpresaUpdate, true>>({
    id: yup.number().optional(),
    codigo: yup
      .string()
      .required("Ingrese código.")
      .min(3, "Mínimo 3 caracteres."),
    nombre: yup
      .string()
      .required("Ingrese nombre.")
      .min(3, "Mínimo 3 caracteres."),
    establecimiento: yup
      .object({
        id: yup.number().required(),
        codigo: yup.string().required("Campo obligatorio."),
        denominacion: yup.string().required("Campo obligatorio."),
      })
      .optional(),
    new: yup.boolean().optional(),
    estado: yup.boolean().required(),
  });
type TypeFormPOSEstablecimientosUpdate = Infer<
  typeof schemaFormPOSEstablecimientosUpdate
>;
const SchemaFormPOSEstablecimientosUpdate =
  schemaFormPOSEstablecimientosUpdate as yup.Schema<TypeFormPOSEstablecimientosUpdate>;

export const schemaFormEmpresaUpdate = yup
  .object()
  .shape<Shape<IFeatureEmpresaUpdate, true>>({
    nombre_comercial: yup.string().required("Ingrese nombre comercial."),
    domicilio_fiscal: yup.string().required("Ingrese domicilio fiscal."),
    ubigeo: yup.string().required("Ingrese ubigeo."),
    urbanizacion: yup.string().required("Ingrese urbanizacion."),
    modo: yup.number().required(),
    ose_enabled: yup.boolean().required(),
    web_service: yup.string().when("ose_enabled", ([ose_enabled], schema) => {
      return ose_enabled
        ? schema
            .required("Ingrese link OSE")
            .matches(
              /^(http|https):\/\/[\w-]+\.[a-z]{2,}(\/.*)?$/i,
              "El link debe ser válido."
            )
        : schema.optional();
    }),
    cert_password: yup
      .string()
      .when(["modo", "cert"], ([modo, cert], schema) => {
        return modo === 1 || cert
          ? schema.required(
              `${
                modo === 1 && !cert
                  ? "Suba un certificado para agregar el password."
                  : "Ingrese el password del certificado."
              }`
            )
          : schema.notRequired();
      }),
    usu_secundario_ose_user: yup
      .string()
      .when("ose_enabled", ([ose_enabled], schema) => {
        return ose_enabled
          ? schema.required("Ingrese el usuario secundario OSE.")
          : schema.notRequired();
      }),
    usu_secundario_ose_password: yup
      .string()
      .when("ose_enabled", ([ose_enabled], schema) => {
        return ose_enabled
          ? schema.required("Ingrese el password del usuario secundario OSE.")
          : schema.notRequired();
      }),
    usu_secundario_user: yup
      .string()
      .when(["ose_enabled", "modo"], ([ose_enabled, modo], schema) => {
        return !ose_enabled && modo === 1
          ? schema.required("Ingrese el usuario secundario SUNAT.")
          : schema.notRequired();
      }),
    usu_secundario_password: yup
      .string()
      .when(["ose_enabled", "modo"], ([ose_enabled, modo], schema) => {
        return !ose_enabled && modo === 1
          ? schema.required("Ingrese el password del usuario secundario SUNAT.")
          : schema.notRequired();
      }),
    correo: yup
      .string()
      .required("Ingrese correo.")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "El correo debe ser válido."
      ),
    telefono_movil_1: yup
      .string()
      .required("Ingrese telefono movil 1.")
      .matches(/^9\d{8}$/, "Ingrese un número de celular válido."),
    telefono_movil_2: yup.string().matches(/^9\d{8}$/, {
      message: "Ingrese un número de celular válido.",
      excludeEmptyString: true,
    }),
    telefono_fijo_1: yup.string().optional(),
    telefono_fijo_2: yup.string().optional(),
    logo: yup.mixed<FileList>().optional(),
    cert: yup.mixed<FileList>().optional(),
    documentos: yup.array().of(SchemaFormEmpresaDocumentsUpdate).required(),
    establecimientos: yup
      .array()
      .of(SchemaFormEmpresaEstablecimientosUpdate)
      .required(),
    pos: yup.array().of(SchemaFormPOSEstablecimientosUpdate).required(),
  });

export type _schemaFormEmpresaUpdate = Infer<typeof schemaFormEmpresaUpdate>;

/**
 * 
        departamento: yup.object({
          label: yup.string().required(),
          value: yup.lazy((value) => {
            return value === "-"
              ? yup
                  .string()
                  .matches(/^[^-]*$/, 'No puede ser igual a "-"')
                  .required()
              : yup.string().required();
          }),
        }),
        provincia: yup.object({
          label: yup.string().required(),
          value: yup.lazy((value) => {
            return value === "-"
              ? yup
                  .string()
                  .matches(/^[^-]*$/, 'No puede ser igual a "-"')
                  .required()
              : yup.string().required();
          }),
        }),
        distrito: yup.object({
          label: yup.string().required(),
          value: yup.lazy((value) => {
            return value === "-"
              ? yup
                  .string()
                  .matches(/^[^-]*$/, 'No puede ser igual a "-"')
                  .required()
              : yup.string().required();
          }),
        }),
 */
