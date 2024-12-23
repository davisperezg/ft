import * as yup from "yup";

export const schemaFormEmpresa = yup.object({
  usuario: yup.lazy((value) =>
    typeof value === "object"
      ? yup.object().required("Required field").typeError("Required field")
      : yup
          .number()
          .positive("Seleccione un usuario.")
          .required("El usuario es requerido.")
  ),
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
  web_service: yup.string().when("ose_enabled", ([ose_enabled], schema) => {
    return ose_enabled
      ? schema
          .required("Ingrese link OSE")
          .matches(
            /^(http|https):\/\/[\w\-\.]+\.\w{2,}(\/.*)?$/,
            "El link debe ser válido."
          )
      : schema.notRequired();
  }),
  cert_password: yup.string().when(["modo", "cert"], ([modo, cert], schema) => {
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
  establecimientos: yup.array().of(
    yup.object().shape({
      codigo: yup.string().required("Ingrese código."),
      denominacion: yup.string().required("Ingrese denominación."),
      direccion: yup.string().required("Ingrese dirección."),
      ubigeo: yup.string().required("Ingrese ubigeo."),
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
    })
  ),
});
