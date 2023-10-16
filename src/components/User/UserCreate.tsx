/* eslint-disable no-useless-escape */
import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { ModalContext } from "../../context/modalContext";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import DialogBasic from "../Dialog/DialogBasic";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { IUser } from "../../interface/user.interface";
import { usePostUser } from "../../hooks/useUsers";
import { FcSearch } from "react-icons/fc";
import { useRolesAvailables } from "../../hooks/useRoles";
import { useReniec, useSunat } from "../../hooks/useServices";
import { toast } from "react-toastify";
import TabModal from "../Tab/Modal/TabModal";
import TabModalItem from "../Tab/Modal/TabModalItem";
import TabModalPanel from "../Tab/Modal/TabModalPanel";
import { IEmpresa } from "../../interface/empresa.interface";
import { IoMdClose } from "react-icons/io";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import { usePostEmpresa } from "../../hooks/useEmpresa";

const UserCreate = () => {
  const { dispatch } = useContext(ModalContext);

  const { mutateAsync, isLoading: isLoadingPost } = usePostUser();

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

  const refInputserie = useRef<HTMLInputElement>(null);
  const refSelectDoc = useRef<HTMLSelectElement>(null);

  const onSubmit: SubmitHandler<IUser> = async (values) => {
    try {
      const res = await mutateAsync(values);
      toast.success(res.message);
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }

    dispatch({ type: "INIT" });
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

  const [value, setValue] = useState(1);

  const handleTab = (newValue: number) => setValue(newValue);

  return (
    <>
      <DialogBasic width={855} height={652}>
        <DialogTitle>Nuevo Usuario</DialogTitle>
        <DialogBody>
          <TabModal value={value} onChange={handleTab}>
            <TabModalItem value={1}>General</TabModalItem>
            <TabModalItem value={2}>Empresa</TabModalItem>
          </TabModal>

          <form className="overflow-y-auto flex-[1_0_calc(100%-78px)]">
            <TabModalPanel value={value} index={1}>
              <div>
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
                      <span className="text-primary">
                        {errors.role.message}
                      </span>
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
                      Tipo de documento:{" "}
                      <strong className="text-primary">*</strong>
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
                      Nro de documento:{" "}
                      <strong className="text-primary">*</strong>
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
                      <span className="text-primary">
                        {errors.name.message}
                      </span>
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
                      <span className="text-primary">
                        {errors.email.message}
                      </span>
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
              </div>
            </TabModalPanel>
            <TabModalPanel value={value} index={2}>
              <div className="flex flex-col mt-3">
                <fieldset className="w-full border rounded-sm p-[8px]">
                  <legend className="p-[0_12px] dark:text-white">
                    Establecimientos
                  </legend>
                  <p>
                    Un establecimiento es una copia de tu empresa a la que
                    puedes ponerle su propia dirección, logo, usuarios, etc.
                    Puedes usar un establecimiento para otro local, punto de
                    venta o para otro negocio que use el mismo RUC.
                  </p>
                  <div className={`flex justify-end mt-2`}>
                    <button
                      type="button"
                      onClick={() => {
                        // append({
                        //   nombre_establecimiento: "",
                        //   codigo_establecimiento_sunat: "",
                        //   nombre_comercial_establecimiento: watch(
                        //     "empresa.razon_social"
                        //   )
                        //     ? watch("empresa.razon_social")
                        //     : "",
                        //   allowedDocuments: [
                        //     {
                        //       documento: { tipo_documento: "Proforma" },
                        //       series: ["PRO001", "PRO002"],
                        //     },
                        //     {
                        //       documento: { tipo_documento: "Factura" },
                        //       series: ["F001"],
                        //     },
                        //     {
                        //       documento: { tipo_documento: "Boleta" },
                        //       series: ["B001", "B002"],
                        //     },
                        //   ],
                        // });
                      }}
                      className="border px-2 hover:bg-hover"
                    >
                      Agregar establecimientos
                    </button>
                  </div>
                </fieldset>
                {/* {fields.map((item, index) => {
                  return (
                    <div key={item.id} className="w-full">
                      <div className="flex justify-between mt-2">
                        <strong className="underline">
                          Establecimiento {index + 1}
                        </strong>
                        <a
                          type="button"
                          onClick={() => remove(index)}
                          className="text-primary cursor-pointer"
                        >
                          Eliminar
                        </a>
                      </div>
                      <div className="border rounded-sm p-[8px] mb-5 mt-2">
                        <div>
                          <div className="w-full flex flex-row gap-2">
                            <div className="flex w-1/2">
                              <div className="w-1/3">
                                <label>
                                  Nombre Sucursal:{" "}
                                  <strong className="text-primary">*</strong>
                                </label>
                              </div>
                              <div className="w-2/3">
                                <input
                                  {...register(
                                    `empresa.establecimientos.${index}.nombre_establecimiento`,
                                    {
                                      required: {
                                        value: true,
                                        message:
                                          "Ingrese nombre del establecimiento.",
                                      },
                                    }
                                  )}
                                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                    errors?.empresa?.establecimientos?.[index]
                                      ?.nombre_establecimiento
                                      ? "border-primary"
                                      : ""
                                  }`}
                                />
                                {errors?.empresa?.establecimientos?.[index]
                                  ?.nombre_establecimiento && (
                                  <span className="text-primary">
                                    {
                                      errors?.empresa?.establecimientos?.[index]
                                        ?.nombre_establecimiento?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex w-1/2">
                              <div className="w-1/3">
                                <label>
                                  Cod. Establecimiento sunat:{" "}
                                  <strong className="text-primary">*</strong>
                                </label>
                              </div>
                              <div className="w-2/3">
                                <input
                                  {...register(
                                    `empresa.establecimientos.${index}.codigo_establecimiento_sunat`,
                                    {
                                      required: {
                                        value: true,
                                        message:
                                          "Ingrese Cod. Establecimiento Sunat.",
                                      },
                                    }
                                  )}
                                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                    errors?.empresa?.establecimientos?.[index]
                                      ?.codigo_establecimiento_sunat
                                      ? "border-primary"
                                      : ""
                                  }`}
                                />
                                {errors?.empresa?.establecimientos?.[index]
                                  ?.codigo_establecimiento_sunat && (
                                  <span className="text-primary">
                                    {
                                      errors?.empresa?.establecimientos?.[index]
                                        ?.codigo_establecimiento_sunat?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="w-full flex flex-row gap-2 mt-2">
                            <div className="flex w-1/2">
                              <div className="w-1/3">
                                <label>
                                  Nombre Comercial:{" "}
                                  <strong className="text-primary">*</strong>
                                </label>
                              </div>
                              <div className="w-2/3">
                                <input
                                  {...register(
                                    `empresa.establecimientos.${index}.nombre_comercial_establecimiento`,
                                    {
                                      required: {
                                        value: true,
                                        message: "Ingrese nombre comercial.",
                                      },
                                    }
                                  )}
                                  //className={`border w-full focus:outline-none pl-1 rounded-sm`}
                                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                    errors?.empresa?.establecimientos?.[index]
                                      ?.nombre_comercial_establecimiento
                                      ? "border-primary"
                                      : ""
                                  }`}
                                />
                                {errors?.empresa?.establecimientos?.[index]
                                  ?.nombre_comercial_establecimiento && (
                                  <span className="text-primary">
                                    {
                                      errors?.empresa?.establecimientos?.[index]
                                        ?.nombre_comercial_establecimiento
                                        ?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex w-1/2 "></div>
                          </div>
                          <div className="mt-5 w-full">
                            <label>Documentos y series</label>
                            <div className="w-full mt-2 flex gap-2">
                              <select
                                ref={refSelectDoc}
                                className="focus:outline-none border w-1/3 h-6 rounded-sm"
                              >
                                <option defaultChecked>
                                  Tipo de documento
                                </option>
                                <option value="Factura">Factura</option>
                                <option value="Boleta">Boleta</option>
                              </select>
                              <input
                                className="focus:outline-none border w-1/3 h-6 pl-1 rounded-sm uppercase"
                                placeholder="Serie"
                                ref={refInputserie}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const allowedDocuments = watch(
                                    `empresa.establecimientos.${index}.allowedDocuments`
                                  );

                                  if (refInputserie.current) {
                                    const documento =
                                      refSelectDoc.current?.value;
                                    const serie =
                                      refInputserie.current.value.toUpperCase();

                                    //Verificamos si ya existe una serie agregada
                                    const validExists = allowedDocuments.filter(
                                      (b) => {
                                        return b.series.some((n) => {
                                          return n === serie;
                                        });
                                      }
                                    );

                                    console.log(validExists);
                                    if (validExists.length > 0) {
                                      alert("La serie ya esta agregada.");
                                      return;
                                    }

                                    const res = allowedDocuments.map((x) => {
                                      if (
                                        x.documento.tipo_documento === documento
                                      ) {
                                        return {
                                          ...x,
                                          series: x.series.some(
                                            (s) => s === serie
                                          )
                                            ? x.series
                                            : [...x.series, serie],
                                        };
                                      }
                                      return x;
                                    });

                                    return setValueModel(
                                      `empresa.establecimientos.${index}.allowedDocuments`,
                                      res
                                    );
                                  }
                                }}
                                className="border w-1/3 h-6 rounded-sm hover:border-blue-400 hover:text-blue-400"
                              >
                                Agregar serie
                              </button>
                            </div>
                            {watch(
                              `empresa.establecimientos.${index}.allowedDocuments`
                            ).map((a, i) => {
                              return (
                                <div
                                  key={i + 1}
                                  className={`w-full flex gap-1 ${
                                    i === 0 ? "mt-5 py-2" : "py-2"
                                  } border-t`}
                                >
                                  <div className="w-1/3 flex justify-center items-center">
                                    <strong>
                                      {a.documento.tipo_documento}
                                    </strong>
                                  </div>
                                  <div className="w-2/3">
                                    {a.series.map((b, i) => (
                                      <div
                                        className="flex gap-2 mb-1"
                                        key={i + 1}
                                      >
                                        <div className="w-1/2 flex justify-center items-center">
                                          <span className="">
                                            <small>Serie: </small>
                                            {b}
                                          </span>
                                        </div>
                                        <div className="w-1/2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const res = watch(
                                                `empresa.establecimientos.${index}.allowedDocuments`
                                              ).map((x) => {
                                                return {
                                                  ...x,
                                                  series: x.series.filter(
                                                    (xx) => xx !== b
                                                  ),
                                                };
                                              });
                                              return setValueModel(
                                                `empresa.establecimientos.${index}.allowedDocuments`,
                                                res
                                              );
                                            }}
                                            className="w-full h-8 border border-primary text-primary"
                                          >
                                            Eliminar
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })} */}
              </div>
            </TabModalPanel>
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
