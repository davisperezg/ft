import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { ModalContext } from "../../context/modalContext";
import {
  SubmitHandler,
  useForm,
  FormProvider,
  Controller,
} from "react-hook-form";
import { IUserWithPassword, IUser } from "../../interface/user.interface";
import { useRolesAvailables } from "../../hooks/useRoles";
import { useReniec } from "../../hooks/useServices";
import { FcSearch } from "react-icons/fc";
import { useEditPassword, useEditUser } from "../../hooks/useUsers";
import { useModulesAvailables } from "../../hooks/useModuleS";
import {
  usePermisosAvailables,
  usePermisosXuser,
  usePostResourcesXuser,
  usePostServicesXuser,
  useServicesXuser,
} from "../../hooks/useResources";
import { TfiReload } from "react-icons/tfi";
import { toast } from "react-toastify";
import { toastError } from "../Toast/ToastNotify";
import { isError } from "../../utils/functions";
import TabsModal from "../Material/Tabs/TabsModal";
import TabModal from "../Material/Tab/TabModal";
import TabModalPanel from "../Material/Tab/TabModalPanel";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import { DialogBeta } from "../Dialog/DialogBasic";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import UserEditAsignarEmpresa from "./FormEdit/UserEditAsignarEmpresa";
import { useAsignEmpresasByIdPartner } from "../../hooks/useEmpresa";
import { FORM_EDIT_INITIAL_USER } from "../../utils/initials";
import InputCheckBox from "../Material/Input/InputCheckBox";

interface Props {
  data: any;
  closeEdit: () => void;
}

interface FormValues extends IUserWithPassword {
  resources?: string[];
  modules?: string[];
  [key: string]: any;
}

interface GroupCheckBox {
  name: string;
  checked: boolean;
}

//#### million-ignore
const UserEdit = ({ data, closeEdit }: Props) => {
  const { dispatch, dialogState, userGlobal } = useContext(ModalContext);

  //POST
  const { mutateAsync: mutateEditUser, isLoading: isLoadingEdit } =
    useEditUser();

  const { mutateAsync: mutateEditPassword, isLoading: isLoadingPassword } =
    useEditPassword();

  const { mutateAsync: mutateEditResources, isLoading: isLoadingResources } =
    usePostResourcesXuser();

  const { mutateAsync: mutateEditServices, isLoading: isLoadingServices } =
    usePostServicesXuser();

  //GETS
  const {
    data: dataRoles,
    isLoading: isLoadingRoles,
    error: errorRoles,
    isError: isErrorRoles,
  } = useRolesAvailables();

  const {
    data: dataModules,
    isLoading: isLoadingModules,
    error: errorModules,
    isError: isErrorModules,
  } = useModulesAvailables();

  const {
    data: dataPermisos,
    isLoading: isLoadingPermisos,
    error: errorPermisos,
    isError: isErrorPermisos,
  } = usePermisosAvailables();

  const {
    data: dataEmpresasAsign,
    error,
    isLoading: isLoadingAsignEmpresas,
  } = useAsignEmpresasByIdPartner(userGlobal?.id);

  const methods = useForm<FormValues>({
    defaultValues: {
      ...FORM_EDIT_INITIAL_USER,
      resources: [],
      modules: [],
      empresas: [],
    },
    values: {
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      tipDocument: data.tipDocument,
      nroDocument: data.nroDocument,
      role: data.role._id,
      username: data.username,
      password: "",
      confirm_password: "",
      resources: [],
      modules: [],
      empresas: [],
      empresasAsign: dataEmpresasAsign?.map((item) => {
        return {
          ...item,
          checked: data.empresasAsign.some((a: any) => a.id === item.id),
          establecimientos: item.establecimientos.map((est) => {
            const empresaAsign = data.empresasAsign.find(
              (asign: any) => asign.id === item.id
            ) as any;
            const establecimientoAsignado = empresaAsign?.establecimientos.find(
              (b: any) => b.id === est.id
            );

            return {
              ...est,
              idEntidad: establecimientoAsignado
                ? establecimientoAsignado.idEntidad
                : null,
              checked: establecimientoAsignado
                ? establecimientoAsignado.checked
                : false,
            };
          }),
        };
      }),
    },
    mode: "onTouched",
  });

  const {
    control,
    register,
    handleSubmit,
    setValue: setValueModel,
    formState: { errors, isDirty, isValid },
    watch,
    getValues,
  } = methods;

  const {
    data: dataPersona,
    isFetching: isFetchingPersona,
    error: errorPersona,
    isError: isErrorPersona,
    refetch,
  } = useReniec(watch("tipDocument"), watch("nroDocument"));

  const {
    data: dataPermisosUser,
    error: errorPermisosUser,
    isError: isErrorPermisosUser,
    isLoading: isLoadingPermisosUser,
    isRefetching: isRefetching2,
    refetch: refetch2,
  } = usePermisosXuser(data._id);

  const {
    data: dataServicesUser,
    error: errorServicesUser,
    isError: isErrorServicesUser,
    isLoading: isLoadingServicesUser,
    isRefetching: isRefetching3,
    refetch: refetch3,
  } = useServicesXuser(data._id);

  const [value, setValue] = useState(0);
  const [categorys, setCategorys] = useState<GroupCheckBox[]>([]);
  const [checkAllCategorys, setCheckAllCategorys] = useState<boolean>(false);

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

  const handleRefresh = () => {
    refetch2();
  };

  const handleRefreshModules = () => {
    refetch3();
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    //Enviar data para usuarios
    const sendUser: IUser = {
      role: values.role as string,
      tipDocument: values.tipDocument,
      nroDocument: values.nroDocument,
      name: values.name,
      lastname: values.lastname,
      email: values.email,
      username: values.username,
      empresasAsign: values.empresasAsign,
    };

    try {
      const response = await mutateEditUser({ id: data._id, body: sendUser });
      await mutateEditPassword({
        body: {
          password: values.password,
          confirm_password: values.confirm_password,
        },
        id: data._id,
      });
      await mutateEditServices({
        modules: values.modules as string[],
        user: data._id,
      });
      await mutateEditResources({
        resources: values.resources as string[],
        user: data._id,
      });
      toast.success(response.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }

    //closeModal();
  };

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const memoModulos = useMemo(() => {
    if (dataModules) {
      return dataModules;
    }

    return [];
  }, [dataModules]);

  const memoPermisos = useMemo(() => {
    if (dataPermisos) {
      return dataPermisos;
    }

    return [];
  }, [dataPermisos]);

  const memoRoles = useMemo(() => {
    if (dataRoles && dataRoles.length > 0) {
      return dataRoles;
    }

    return [{ name: "[SELECCIONE ROL]", _id: "null" }];
  }, [dataRoles]);

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

    if (dataPermisosUser || isRefetching2) {
      setValueModel("resources", dataPermisosUser);
    }

    if (dataServicesUser || isRefetching3) {
      const idsModules = dataServicesUser.map((a: any) => a._id);
      setValueModel("modules", idsModules);
    }

    if (
      dataPermisos &&
      dataPermisos?.length > 0 &&
      dataPermisosUser &&
      dataPermisosUser?.length > 0
    ) {
      //Si los recursos del rol incluyen todos de los recursos de la categoria, entonces la categoria estara marcada
      const defaultCategorys = dataPermisos.map((permiso) => {
        const categoryChecked =
          permiso.resources.every((a: any) =>
            getValues("resources")?.includes(a.value)
          ) ?? false;

        if (categoryChecked) {
          return {
            name: String(permiso.category),
            checked: true,
          };
        } else {
          return {
            name: String(permiso.category),
            checked: false,
          };
        }
      });

      //Si todas las categorias estan marcadas, entonces marcamos todos los permisos
      if (defaultCategorys.every((a) => a.checked)) {
        setCheckAllCategorys(true);
      } else {
        setCheckAllCategorys(false);
      }

      setCategorys(defaultCategorys);
    }
  }, [
    dataPermisos,
    dataPermisosUser,
    dataPersona,
    dataServicesUser,
    errorPersona?.response.data.message,
    getValues,
    isErrorPersona,
    isRefetching2,
    isRefetching3,
    setValueModel,
  ]);

  return (
    <>
      <DialogBeta open={dialogState.open && !dialogState.nameDialog}>
        <DialogTitleBeta>{`Editar ${
          data.name + " " + data.lastname
        }`}</DialogTitleBeta>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            padding: "3px",
            height: 18,
            fontSize: "16px",
            color: "#fff",
          }}
        >
          <CloseIcon sx={{ width: "16px", height: "16px" }} />
        </IconButton>

        <TabsModal aria-label="BasicTabs" value={value} onChange={handleChange}>
          <TabModal label="General" index={0} />
          <TabModal label="Cambiar contraseña" index={1} />
          <TabModal label="Modulos" index={2} />
          <TabModal label="Permisos" index={3} />
          {data && data?.length > 0 && (
            <TabModal label="Asignar empresas" index={4} />
          )}
        </TabsModal>

        <DialogContentBeta>
          <Box sx={{ width: "100%", padding: 0 }}>
            <FormProvider {...methods}>
              <form>
                <TabModalPanel value={value} index={0}>
                  <div className="w-full flex flex-row">
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
                            if (getValues("nroDocument").length !== 0) {
                              return refetch();
                            }

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
                          required: {
                            value: true,
                            message: "Ingrese apellidos",
                          },
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
                </TabModalPanel>
                <TabModalPanel value={value} index={1}>
                  <div className="w-full flex flex-row">
                    <div className="w-1/3">
                      <label>Contraseña:</label>
                    </div>
                    <div className="w-1/3">
                      <input
                        {...register("password", {
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
                      <label>Confirmar contraseña:</label>
                    </div>
                    <div className="w-1/3">
                      <input
                        {...register("confirm_password", {
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
                          {errors?.confirm_password?.message}
                        </span>
                      )}
                    </div>
                  </div>
                </TabModalPanel>
                <TabModalPanel value={value} index={2}>
                  <div className="">
                    {isLoadingModules || isLoadingServicesUser ? (
                      "Cargando modulos..."
                    ) : isErrorModules ? (
                      <span className="text-primary w-full">
                        {errorModules.response.data.message}
                      </span>
                    ) : isErrorServicesUser ? (
                      <span className="text-red-500 w-full">
                        {errorServicesUser.response.data.message}
                      </span>
                    ) : (
                      <>
                        <div className="flex flex-row w-full justify-end">
                          <label
                            className="flex items-center gap-1 cursor-pointer text-textDefault select-none"
                            onClick={handleRefreshModules}
                          >
                            <TfiReload
                              className={`${
                                isRefetching3
                                  ? "animate-[spin_2s_linear_infinite]"
                                  : ""
                              }`}
                            />
                            Refrescar modulos
                          </label>
                        </div>

                        <div className="flex flex-col">
                          <strong>Modulos disponibles</strong>
                        </div>

                        <div className="flex">
                          <div className="w-1/3 flex flex-col">
                            <Controller
                              control={control}
                              name="modules"
                              render={({ field }) => (
                                <>
                                  {memoModulos.map((modulo) => {
                                    return (
                                      <label
                                        key={modulo.value}
                                        className="cursor-pointer flex gap-2 select-none"
                                      >
                                        <InputCheckBox
                                          checked={field.value?.includes(
                                            modulo.value
                                          )}
                                          onChange={() => {
                                            const modulos = field.value ?? [];
                                            const index = modulos.indexOf(
                                              modulo.value
                                            );
                                            if (index === -1) {
                                              // Si no está presente, agrégalo
                                              field.onChange([
                                                ...modulos,
                                                modulo.value,
                                              ]);
                                            } else {
                                              // Si está presente, quítalo
                                              field.onChange(
                                                modulos.filter(
                                                  (moduloValue) =>
                                                    moduloValue !== modulo.value
                                                )
                                              );
                                            }
                                          }}
                                        />
                                        {modulo.label}
                                      </label>
                                    );
                                  })}
                                </>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabModalPanel>
                <TabModalPanel value={value} index={3}>
                  <div className="flex flex-col mr-[16px] mb-[10px]">
                    {isLoadingPermisos || isLoadingPermisosUser ? (
                      "Cargando permisos disponiles..."
                    ) : isErrorPermisos ? (
                      <label className="text-primary">
                        {errorPermisos.response.data.message}
                      </label>
                    ) : isErrorPermisosUser ? (
                      <label>{errorPermisosUser.response.data.message}</label>
                    ) : (
                      <>
                        <div className="flex flex-row w-full justify-end">
                          <label
                            className="flex items-center gap-1 cursor-pointer text-textDefault select-none"
                            onClick={handleRefresh}
                          >
                            <TfiReload
                              className={`${
                                isRefetching2
                                  ? "animate-[spin_2s_linear_infinite]"
                                  : ""
                              }`}
                            />
                            Refrescar permisos
                          </label>
                        </div>
                        <div className="flex w-1/2">
                          <label className="cursor-pointer flex gap-2 ml-[5px] select-none font-bold">
                            <InputCheckBox
                              checked={checkAllCategorys}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const checked = e.target.checked;
                                setCheckAllCategorys(checked);

                                if (checked) {
                                  //Si todos las categorias estan marcadas entonces marcamos todos los recursos
                                  setValueModel(
                                    "resources",
                                    memoPermisos.flatMap((a) =>
                                      a.resources.map((a: any) => a.value)
                                    ),
                                    {
                                      shouldDirty: true,
                                    }
                                  );
                                  //Todas las categorias seran true
                                  setCategorys(
                                    categorys.map((cat) => {
                                      return {
                                        ...cat,
                                        checked: true,
                                      };
                                    })
                                  );
                                } else {
                                  //Todas las categorias seran false y los recursos deesactivados
                                  setValueModel("resources", [], {
                                    shouldDirty: true,
                                  });

                                  setCategorys(
                                    categorys.map((cat) => {
                                      return {
                                        ...cat,
                                        checked: false,
                                      };
                                    })
                                  );
                                }
                              }}
                            />
                            Marcar todos los permisos
                          </label>
                        </div>
                        <div className="grid grid-cols-[repeat(4,_1fr)] gap-[15px]">
                          {memoPermisos.map((permiso, index) => {
                            //Si los recursos del rol incluyen todos de los recursos de la categoria, entonces la categoria estara marcada
                            const categoryChecked =
                              permiso.resources.every((a: any) =>
                                getValues("resources")?.includes(a.value)
                              ) ?? false;

                            return (
                              <div key={index + 1} className="border">
                                <div className="border-b-[1px]">
                                  <label className="cursor-pointer flex gap-2 ml-[5px] select-none">
                                    <InputCheckBox
                                      checked={categoryChecked}
                                      onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                      ) => {
                                        const checked = e.target.checked;
                                        const findCategory = categorys[index];
                                        const mapCategorys = categorys.map(
                                          (cat) => {
                                            if (
                                              cat.name === findCategory.name
                                            ) {
                                              return {
                                                ...cat,
                                                checked: checked,
                                              };
                                            }
                                            return cat;
                                          }
                                        );
                                        setCategorys(mapCategorys);

                                        if (checked) {
                                          //Si marco la categoria, agregamos todos los recursos de la categoria
                                          setValueModel(
                                            "resources",
                                            [
                                              ...(getValues("resources") || []),
                                              ...permiso.resources.map(
                                                (a: any) => a.value
                                              ),
                                            ],
                                            {
                                              shouldDirty: true,
                                            }
                                          );

                                          const validTruesCategorys =
                                            mapCategorys.every(
                                              (a) => a.checked
                                            );

                                          if (validTruesCategorys) {
                                            setCheckAllCategorys(true);
                                          }
                                        } else {
                                          //Si desmarco la categoria, quitamos todos los recursos de la categoria
                                          setValueModel(
                                            "resources",
                                            (
                                              getValues("resources") || []
                                            ).filter(
                                              (a: any) =>
                                                !permiso.resources
                                                  .map((a: any) => a.value)
                                                  .includes(a)
                                            ),
                                            {
                                              shouldDirty: true,
                                            }
                                          );
                                          setCheckAllCategorys(false);
                                        }
                                      }}
                                    />
                                    {permiso.category}
                                  </label>
                                </div>
                                <div className="ml-[5px] text-[12px] mt-1 mb-1">
                                  <Controller
                                    control={control}
                                    name="resources"
                                    render={({ field }) => (
                                      <>
                                        {permiso.resources.map(
                                          (resource: any) => {
                                            return (
                                              <label
                                                className="cursor-pointer flex gap-2 select-none"
                                                key={resource.value}
                                              >
                                                <InputCheckBox
                                                  checked={field.value?.includes(
                                                    resource.value
                                                  )}
                                                  onChange={(
                                                    e: ChangeEvent<HTMLInputElement>
                                                  ) => {
                                                    const checked =
                                                      e.target.checked;
                                                    const recursos =
                                                      field.value ?? [];
                                                    const index =
                                                      recursos.indexOf(
                                                        resource.value
                                                      );
                                                    if (index === -1) {
                                                      // Si no está presente, agrégalo
                                                      field.onChange([
                                                        ...recursos,
                                                        resource.value,
                                                      ]);
                                                    } else {
                                                      // Si está presente, quítalo
                                                      field.onChange(
                                                        recursos.filter(
                                                          (recursoValue) =>
                                                            recursoValue !==
                                                            resource.value
                                                        )
                                                      );
                                                    }

                                                    if (!checked) {
                                                      //Controlamos el estado de la categoria al realizar un cambio en los recursos
                                                      const mapCategorys =
                                                        categorys.map((cat) => {
                                                          if (
                                                            cat.name ===
                                                            permiso.category
                                                          ) {
                                                            return {
                                                              ...cat,
                                                              checked: checked,
                                                            };
                                                          }
                                                          return cat;
                                                        });
                                                      setCategorys(
                                                        mapCategorys
                                                      );
                                                      setCheckAllCategorys(
                                                        false
                                                      );
                                                    } else {
                                                      //Validamos si todos los recursos de la categoria estan true, de ser asi actualizamos el estado de la categoria a true
                                                      const findCategoryChecked =
                                                        permiso.resources.every(
                                                          (a: any) =>
                                                            getValues(
                                                              "resources"
                                                            )?.includes(a.value)
                                                        ) ?? false;

                                                      if (findCategoryChecked) {
                                                        const mapCategorys =
                                                          categorys.map(
                                                            (cat) => {
                                                              if (
                                                                cat.name ===
                                                                permiso.category
                                                              ) {
                                                                return {
                                                                  ...cat,
                                                                  checked: true,
                                                                };
                                                              }
                                                              return cat;
                                                            }
                                                          );
                                                        setCategorys(
                                                          mapCategorys
                                                        );

                                                        //Validamos si todas las categorias estan true, de ser asi el checkAllCategorys sera true
                                                        const findTruesCategory =
                                                          mapCategorys.every(
                                                            (a) => a.checked
                                                          );
                                                        if (findTruesCategory) {
                                                          setCheckAllCategorys(
                                                            true
                                                          );
                                                        }
                                                      }
                                                    }
                                                  }}
                                                />
                                                {resource.label}
                                              </label>
                                            );
                                          }
                                        )}
                                      </>
                                    )}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </TabModalPanel>
                {data && data?.length > 0 && (
                  <TabModalPanel value={value} index={4}>
                    <UserEditAsignarEmpresa
                      isLoading={isLoadingAsignEmpresas}
                      error={error}
                    />
                  </TabModalPanel>
                )}
              </form>
            </FormProvider>
          </Box>
        </DialogContentBeta>
        <DialogActionsBeta>
          <Button
            size="small"
            className="text-textDefault"
            variant="text"
            color="secondary"
            onClick={closeModal}
          >
            Cancelar
          </Button>
          <Button
            disabled={
              !isDirty ||
              !isValid ||
              isLoadingEdit ||
              isLoadingPassword ||
              isLoadingServices ||
              isLoadingResources
            }
            onClick={(e) => handleSubmit(onSubmit)(e)}
            size="small"
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActionsBeta>
      </DialogBeta>
    </>
  );
};

export default UserEdit;
