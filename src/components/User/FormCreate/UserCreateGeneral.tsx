import { useFormContext } from "react-hook-form";
import { IUserWithPassword } from "../../../interface/user.interface";
import { useRolesAvailables } from "../../../hooks/useRoles";
import { useMemo, useEffect } from "react";
import { useReniec } from "../../../hooks/useServices";
import { toast } from "react-toastify";
import { FcSearch } from "react-icons/fc";
//import { Button, Grid, Stack } from "@mui/material";

const UserCreateGeneral = () => {
  const {
    getValues,
    setValue: setValueModel,
    register,
    watch,
    formState: { errors },
  } = useFormContext<IUserWithPassword>();

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

  const {
    data: dataPersona,
    isFetching: isFetchingPersona,
    error: errorPersona,
    isError: isErrorPersona,
    refetch,
  } = useReniec(watch("tipDocument"), watch("nroDocument"));

  useEffect(() => {
    if (isErrorPersona) {
      toast.error(errorPersona.response.data.message);

      setValueModel("name", "");
      setValueModel("lastname", "");
      setValueModel("nroDocument", "");
    }

    if (dataPersona) {
      setValueModel("name", dataPersona.nombres);
      setValueModel(
        "lastname",
        dataPersona.apellidoPaterno + " " + dataPersona.apellidoMaterno
      );
    }
  }, [
    dataPersona,
    errorPersona?.response.data.message,
    isErrorPersona,
    setValueModel,
  ]);

  return (
    <>
      <div className="w-full flex flex-row">
        <div className="w-1/3">
          <label>
            Rol: <strong className="text-primary">*</strong>
          </label>
        </div>
        <div className="w-1/3">
          {isErrorRoles ? (
            <span className="text-primary w-full">
              {errorRoles.response.data.message}
            </span>
          ) : (
            <select
              autoFocus
              {...register("role")}
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
          )}

          {errors.role && (
            <span className="text-primary">{errors.role.message}</span>
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
            {...register("tipDocument")}
            className={`border w-full focus:outline-none pl-1 rounded-sm ${
              errors.tipDocument ? "border-primary" : ""
            }`}
          >
            <option value="DNI">DNI</option>
            {/* <option value="RUC">RUC</option> */}
          </select>
          {errors.tipDocument && (
            <span className="text-primary">{errors.tipDocument.message}</span>
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
              <span className="text-primary">{errors.nroDocument.message}</span>
            )}
          </div>
          <div className="w-2/12 overflow-hidden relative">
            <button
              type="button"
              onClick={() => {
                if (getValues("nroDocument").length !== 0) return refetch();
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
            {...register("name")}
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
            {...register("lastname")}
            type="text"
            disabled={isFetchingPersona}
            className={`border w-full focus:outline-none pl-1 rounded-sm ${
              errors.lastname ? "border-primary" : ""
            }`}
          />
          {errors.lastname && (
            <span className="text-primary">{errors.lastname.message}</span>
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
            {...register("email")}
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
            {...register("username")}
            type="text"
            className={`border w-full focus:outline-none pl-1 rounded-sm ${
              errors.username ? "border-primary" : ""
            }`}
          />
          {errors.username && (
            <span className="text-primary">{errors.username.message}</span>
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
            {...register("password")}
            type="text"
            className={`border w-full focus:outline-none pl-1 rounded-sm ${
              errors.password ? "border-primary" : ""
            }`}
          />
          {errors.password && (
            <span className="text-primary">{errors.password.message}</span>
          )}
        </div>
      </div>

      <div className="w-full flex flex-row mt-3">
        <div className="w-1/3">
          <label>
            Confirmar contraseña: <strong className="text-primary">*</strong>
          </label>
        </div>
        <div className="w-1/3">
          <input
            {...register("confirm_password")}
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
    </>
  );
};

export default UserCreateGeneral;
