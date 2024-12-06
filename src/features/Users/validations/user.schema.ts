import * as yup from "yup";

export const schemaFormUser = yup.object({
  name: yup
    .string()
    .min(3, "Ingrese mínimo 3 caracteres.")
    .max(45, "Ingrese máximo 45 caracteres.")
    .required("Ingresa nombres completos"),
  lastname: yup
    .string()
    .min(3, "Ingrese mínimo 3 caracteres.")
    .max(45, "Ingrese máximo 45 caracteres.")
    .required("Ingresa apellidos completos"),
  email: yup
    .string()
    .email("Ingresa un correo válido.")
    .required("Ingresa un correo electrónico"),
  tipDocument: yup.string().required("Seleccione un tipo de documento"),
  nroDocument: yup.string().required("Ingrese un número de documento"),
  role: yup.lazy((value) => {
    switch (typeof value) {
      case "object":
        return yup.object().required(); // schema for object
      case "string":
        return yup.string().required("Seleccione un rol"); // schema for string
      default:
        return yup.mixed().required(); // here you can decide what is the default
    }
  }),
  username: yup
    .string()
    .min(5, "Ingrese mínimo 5 caracteres.")
    .max(15, "Ingrese máximo 15 caracteres.")
    .required("Ingrese un nombre de usuario"),
  password: yup
    .string()
    .min(8, "Ingrese mínimo 8 caracteres.")
    .max(25, "Ingrese máximo 25 caracteres.")
    .required("Ingrese una contraseña"),
  confirm_password: yup
    .string()
    .min(8, "Ingrese mínimo 8 caracteres.")
    .max(25, "Ingrese máximo 25 caracteres.")
    .required("Confirme la contraseña"),
});
