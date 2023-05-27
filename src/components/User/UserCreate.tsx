import { useContext, useEffect, useMemo } from "react";
import { ModalContext } from "../../context/modalContext";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import DialogBasic from "../Dialog/DialogBasic";
import { SubmitHandler, useForm } from "react-hook-form";
import { IUser } from "../../interface/user.interface";
import { usePostUser } from "../../hooks/useUsers";
import { FcSearch } from "react-icons/fc";
import { useRolesAvailables } from "../../hooks/useRoles";
import { useReniec } from "../../hooks/useServices";
import { toast } from "react-toastify";

const UserCreate = () => {
  const { dispatch } = useContext(ModalContext);

  const { mutate, isLoading: isLoadingPost } = usePostUser();

  const {
    data: dataRoles,
    isLoading: isLoadingRoles,
    error: errorRoles,
    isError: isErrorRoles,
  } = useRolesAvailables();

  const memoRoles = useMemo(() => {
    if (dataRoles && dataRoles.length > 0) {
      return dataRoles;
    }

    return [{ name: "[SELECCIONE ROL]", _id: "null" }];
  }, [dataRoles]);

  const {
    register,
    handleSubmit,
    setValue: setValueModel,
    formState: { errors },
    watch,
    getValues,
  } = useForm<IUser>({
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      tipDocument: "DNI",
      nroDocument: "",
      role: memoRoles[0]._id,
    },
  });

  const {
    data: dataPersona,
    isFetching: isFetchingPersona,
    error: errorPersona,
    isError: isErrorPersona,
    refetch,
  } = useReniec(watch("tipDocument"), watch("nroDocument"));

  const onSubmit: SubmitHandler<IUser> = (values) => {
    mutate(values, {
      onSuccess: ({ message }) => {
        dispatch({ type: "INIT" });
        toast.success(message);
      },
      onError: (e) => {
        const message = e.response.data.message;
        const verifyMessage =
          typeof message === "object" ? message[0] : message;
        toast.error(verifyMessage);
      },
    });
  };

  const validateOption = (value: string) => {
    const tipDocumento = watch("tipDocument");

    if (tipDocumento === "DNI" && value.length !== 8) {
      return "El valor debe tener 8 caracteres";
    }
    if (tipDocumento === "RUC" && value.length !== 11) {
      return "El valor debe tener 11 caracteres";
    }
    return true;
  };

  useEffect(() => {
    if (isErrorPersona) {
      toast.error(errorPersona.response.data.message);
      setValueModel("nroDocument", "");
      setValueModel("name", "");
      setValueModel("lastname", "");
    }

    if (dataPersona) {
      setValueModel("name", dataPersona.nombres);
      setValueModel(
        "lastname",
        dataPersona.apellidoPaterno + " " + dataPersona.apellidoMaterno
      );
    }
  }, [dataPersona, isErrorPersona]);

  return (
    <>
      <DialogBasic>
        <DialogTitle>Nuevo Usuario</DialogTitle>
        <DialogBody>
          <form>
            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Rol: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <select
                  autoFocus
                  {...register("role", {
                    required: {
                      value: true,
                      message: "Ingrese rol",
                    },
                  })}
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.role || isErrorRoles ? "border-primary" : ""
                  }`}
                >
                  {isLoadingRoles ? (
                    <option>Cargando...</option>
                  ) : (
                    memoRoles.map((a) => {
                      return (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      );
                    })
                  )}
                </select>

                {errors.role && (
                  <span className="text-primary">{errors.role.message}</span>
                )}

                {isErrorRoles && (
                  <span className="text-primary">
                    {errorRoles.response.data.message}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Tipo de documento: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <select
                  {...register("tipDocument", {
                    required: {
                      value: true,
                      message: "Ingrese tipo de documento",
                    },
                  })}
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.tipDocument ? "border-primary" : ""
                  }`}
                >
                  <option value="DNI">DNI</option>
                  {/* <option value="RUC">RUC</option> */}
                </select>
                {errors.tipDocument && (
                  <span className="text-primary">
                    {errors.tipDocument.message}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Nro de documento: <strong className="text-primary">*</strong>
                </label>
              </div>

              <div className="w-1/3 flex flex-row gap-1">
                <div className="w-10/12 flex flex-col relative">
                  <input
                    {...register("nroDocument", {
                      required: {
                        value: true,
                        message: "Ingrese nro de documento",
                      },
                      validate: validateOption,
                      onChange: (e) => {
                        const value: string = e.target.value;
                        const maxLength = value.slice(0, 8);
                        if (value.length > 8) {
                          return setValueModel("nroDocument", maxLength);
                        }

                        if (value.length !== 8) {
                          setValueModel("name", "");
                          setValueModel("lastname", "");
                        }
                      },
                    })}
                    type="text"
                    disabled={isFetchingPersona}
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors.nroDocument ? "border-primary" : ""
                    }`}
                  />
                  {errors.nroDocument && (
                    <span className="text-primary">
                      {errors.nroDocument.message}
                    </span>
                  )}
                </div>
                <div className="w-2/12 overflow-hidden relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (getValues("nroDocument").length !== 0)
                        return refetch();
                      toast.error("Ingrese nro de documento");
                    }}
                    className="flex items-center justify-center h-[20px] w-full hover:bg-hover text-center bg-default absolute"
                  >
                    {isFetchingPersona ? "..." : <FcSearch />}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Nombres: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("name", {
                    required: { value: true, message: "Ingrese nombres" },
                    minLength: {
                      value: 3,
                      message: "Ingrese mínimo 3 caracteres",
                    },
                    maxLength: {
                      value: 45,
                      message: "Ingrese máximo 45 caracteres",
                    },
                  })}
                  type="text"
                  disabled={isFetchingPersona}
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.name ? "border-primary" : ""
                  }`}
                />
                {errors.name && (
                  <span className="text-primary">{errors.name.message}</span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Apellidos: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("lastname", {
                    required: { value: true, message: "Ingrese apellidos" },
                    minLength: {
                      value: 3,
                      message: "Ingrese mínimo 3 caracteres",
                    },
                    maxLength: {
                      value: 45,
                      message: "Ingrese máximo 45 caracteres",
                    },
                  })}
                  type="text"
                  disabled={isFetchingPersona}
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.lastname ? "border-primary" : ""
                  }`}
                />
                {errors.lastname && (
                  <span className="text-primary">
                    {errors.lastname.message}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Correo: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("email", {
                    required: { value: true, message: "Ingrese correo" },
                  })}
                  type="text"
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.email ? "border-primary" : ""
                  }`}
                />
                {errors.email && (
                  <span className="text-primary">{errors.email.message}</span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Usuario: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("username", {
                    required: { value: true, message: "Ingrese usuario" },
                    minLength: {
                      value: 5,
                      message: "Ingrese mínimo 5 caracteres",
                    },
                    maxLength: {
                      value: 15,
                      message: "Ingrese máximo 15 caracteres",
                    },
                  })}
                  type="text"
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.username ? "border-primary" : ""
                  }`}
                />
                {errors.username && (
                  <span className="text-primary">
                    {errors.username.message}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Contraseña: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("password", {
                    required: { value: true, message: "Ingrese password" },
                    minLength: {
                      value: 8,
                      message: "Ingrese mínimo 8 caracteres",
                    },
                    maxLength: {
                      value: 25,
                      message: "Ingrese máximo 25 caracteres",
                    },
                  })}
                  type="text"
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.password ? "border-primary" : ""
                  }`}
                />
                {errors.password && (
                  <span className="text-primary">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Confirmar contraseña:{" "}
                  <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("confirm_password", {
                    required: {
                      value: true,
                      message: "Ingrese contraseña nuevamente",
                    },
                    minLength: {
                      value: 8,
                      message: "Ingrese mínimo 8 caracteres",
                    },
                    maxLength: {
                      value: 25,
                      message: "Ingrese máximo 25 caracteres",
                    },
                  })}
                  type="text"
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.confirm_password ? "border-primary" : ""
                  }`}
                />
                {errors.confirm_password && (
                  <span className="text-primary">
                    {errors.confirm_password.message}
                  </span>
                )}
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogButtons>
          <button
            onClick={() => dispatch({ type: "INIT" })}
            className="min-w-[84px] min-h-[24px] mr-[8px] text-[#066397] cursor-pointer bg-transparent border border-solid rounded-md"
          >
            Cancelar
          </button>
          <button
            disabled={isLoadingPost}
            onClick={handleSubmit(onSubmit)}
            className={`min-w-[84px] min-h-[24px] text-white cursor-pointer  border border-solid rounded-md ${
              isLoadingPost ? "bg-red-500" : "bg-primary"
            }`}
          >
            OK
          </button>
        </DialogButtons>
      </DialogBasic>
    </>
  );
};

export default UserCreate;
