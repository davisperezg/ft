import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { storage } from "../../../utils/storage.utils";
//import { v4 as uuidv4 } from "uuid";
import { yupResolver } from "@hookform/resolvers/yup";
import { schemaFormLogin } from "../validations/auth.schema";
import { IAuthUser } from "../../../interfaces/features/auth/auth.interface";
import { postLogin } from "../services/auth.service";
import { toast } from "sonner";

const LoginForm = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IAuthUser>({
    defaultValues: {
      username: storage.getItem("username", "LOCAL") ?? "",
      password: storage.getItem("password", "LOCAL") ?? "",
      checkbox: storage.getItem("username", "LOCAL") ? true : false,
    },
    resolver: yupResolver(schemaFormLogin),
  });

  const [disabled, setDisabled] = useState(false);

  const onSubmit: SubmitHandler<IAuthUser> = async (data) => {
    setDisabled(true);

    //const uid = uuidv4();
    try {
      const res = await postLogin(data.username, data.password);
      const access_token = res.data.user.access_token;
      const refresh_token = res.data.user.refresh_token;
      storage.setItem("access_token", access_token, "SESSION");
      storage.setItem("refresh_token", refresh_token, "SESSION");
      //storage.setItem("uid", uid, "SESSION");
      storage.removeItem("c_session", "LOCAL");
      // if (data.checkbox) {
      //   storage.setItem("username", data.username, "LOCAL");
      //   storage.setItem("password", data.password, "LOCAL");
      //   storage.setItem("uuid", uid, "LOCAL");
      // } else {
      //   storage.removeItem("username", "LOCAL");
      //   storage.removeItem("password", "LOCAL");
      //   storage.removeItem("uuid", "LOCAL");
      // }

      storage.removeItem("c_server", "LOCAL");
      location.reload();
    } catch (error: any) {
      setDisabled(false);

      if (!error.response) {
        return toast.error("Conexión rechazada");
      }

      toast.error(error.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-[45px] text-center">
        <h1 className="text-[20px] font-[700] overflow-hidden whitespace-nowrap text-ellipsis">
          Acceso al sistema
        </h1>
      </div>
      <div className="flex flex-[1_1_auto] flex-col mt-10">
        <div>
          <div className="p-[0px_30px_5px_30px] flex flex-row w-full">
            <div className="w-[50%]">
              <label
                htmlFor="label-username"
                className=" font-[700] tracking-tight leading-6 select-none cursor-pointer"
              >
                Usuario:
              </label>
            </div>
            <div className="w-[50%]">
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="label-username"
                    autoComplete="username"
                    disabled={disabled}
                    type="text"
                    className={`autofill:shadow-[0_0_0_30px_white_inset] w-full p-1 rounded-sm border border-hover focus:outline-none pl-2 text-[14px] ${
                      errors.username ? "border-danger" : "hover:border-borders"
                    }`}
                    placeholder="Usuario"
                  />
                )}
              />
            </div>
          </div>
          <div className="p-[0px_30px_15px_30px] flex flex-row w-full">
            <div className="w-[50%]">
              <label
                htmlFor="label-password"
                className=" font-[700] tracking-tight leading-6 select-none cursor-pointer"
              >
                Contraseña:
              </label>
            </div>
            <div className="w-[50%]">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="label-password"
                    disabled={disabled}
                    type="password"
                    autoComplete="current-password"
                    className={`autofill:shadow-[0_0_0_30px_white_inset] w-full p-1 rounded-sm border border-hover focus:outline-none pl-2 text-[14px] ${
                      errors.password ? "border-danger" : "hover:border-borders"
                    }`}
                    placeholder="Contraseña"
                  />
                )}
              />
            </div>
          </div>
          <div className="p-[0px_30px_8px_30px] flex flex-row w-full">
            <a className="text-[12  px] text-default cursor-pointer select-none">
              Olvidaste tu contraseña?
            </a>
          </div>
          <div className="p-[0px_30px_8px_30px] flex flex-row w-full">
            <a className=" text-default cursor-pointer select-none">
              ©&nbsp;davisperezg
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center mt-5">
        <button
          type="submit"
          className="p-[4px_20px] mb-[20px] rounded-[4px] border hover:bg-hoverPrimary text-white outline-none bg-primary"
        >
          Ingresar
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
