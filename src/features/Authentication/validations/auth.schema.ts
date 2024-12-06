import * as yup from "yup";

export const schemaFormLogin = yup.object({
  username: yup.string().required("Por favor ingresa tu usuario."),
  password: yup.string().required("Por favor ingresa tu contraseña."),
  checkbox: yup.boolean(),
});
