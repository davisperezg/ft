import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
} from "react";
import { ModalContext } from "../../context/modalContext";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import DialogBasic from "../Dialog/DialogBasic";
import { SubmitHandler, useForm } from "react-hook-form";
import { IUser } from "../../interface/user.interface";
import { useRolesAvailables } from "../../hooks/useRoles";
import { useReniec } from "../../hooks/useServices";
import { FcSearch } from "react-icons/fc";
import { useEditPassword, useEditUser } from "../../hooks/useUsers";
import TabModal from "../Tab/Modal/TabModal";
import TabModalItem from "../Tab/Modal/TabModalItem";
import TabModalPanel from "../Tab/Modal/TabModalPanel";
import CheckBoxItem from "../Input/CheckBoxItem";
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
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  data: any;
  closeEdit: () => void;
}

interface FormValues extends IUser {
  resources?: string[];
  modules?: string[];
  [key: string]: any;
}

const initialSize = {
  heigth: 440,
  width: 630,
};

const UserEdit = ({ data, closeEdit }: Props) => {
  const { dispatch } = useContext(ModalContext);
  const queryClient = useQueryClient();

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
    register,
    handleSubmit,
    setValue: setValueModel,
    formState: { errors },
    watch,
    getValues,
  } = useForm<FormValues>({
    defaultValues: {
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      tipDocument: data.tipDocument,
      nroDocument: data.nroDocument,
      role: data.role._id,
      username: data.username,
      resources: [],
      modules: [],
    },
  });

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

  const [value, setValue] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const [size, setSize] = useState(initialSize);

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
    setRefresh(true);
    refetch2();
  };

  const handleRefreshModules = () => {
    setRefresh(true);
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
    };

    try {
      const response = await mutateEditUser({ id: data._id, body: sendUser });
      await mutateEditPassword({
        body: {
          password: values.password!,
          confirm_password: values.confirm_password!,
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

  const handleTab = (newValue: number) => {
    if (newValue !== 4) {
      setSize(initialSize);
    } else {
      setSize({
        heigth: 800,
        width: 1200,
      });
    }

    setValue(newValue);
  };

  const getResources_users = watch("resources") as string[];
  const getResources_modules = watch("modules") as string[];

  const validateCheckBoxCategoryAndCheckAll = () => {
    //Recorremos los inputs x categoria para desmarcar categoria
    const allCategorys = memoPermisos.map((a) => {
      //Obtenemos todos los inputs con la misma clase de la categoria
      const checkboxesResource = document.querySelectorAll(
        `.group-${a.category}`
      ) as NodeListOf<HTMLInputElement>;

      //Validamos que todos los inputs deben ser marcados, de no ser retorna false
      const resourcesCheckeds = Array.from(checkboxesResource).every(
        (checkbox) => checkbox.checked
      );

      //Si se encuentra 1 input desmarcado, anulamos la categoria a false actualizando su estado de lo contrario(todos marcados) actualizamos el estado de la categoria a true
      if (!resourcesCheckeds) setValueModel(`${a.category}`, false);
      else setValueModel(`${a.category}`, true);

      //Una vez revisado el estado por inputs ahora retornamos todos los inputs que son categoria
      return document.querySelector(`#all-${a.category}`) as HTMLInputElement;
    });

    //Validamos que todos los inputs deben ser marcados, de no ser retorna false
    const categorysCheckeds = Array.from(allCategorys).every(
      (checkbox) => checkbox.checked
    );

    //Si de todas las categorias encontramos un desmarcado o false actualizamos el estado del CHECK-ALL a false de no ser asi actualizamos CHECK-ALL a true es decir que todos los inputs categorias estan marcados
    if (!categorysCheckeds) setValueModel("check-all", false);
    else setValueModel("check-all", true);
  };

  const handleCheckResources = (values: string[]) => {
    //Actualizamos el estado de los recursos marcados y desmarcados
    setValueModel("resources", values);

    validateCheckBoxCategoryAndCheckAll();
  };

  const handleCheckServices = (values: string[]) => {
    setValueModel("modules", values);
  };

  const memoModulos = useMemo(() => {
    if (!isErrorServicesUser) {
      if (dataModules) {
        return dataModules;
      }
    } else {
      toast.error(errorServicesUser.response.data.message);
    }

    return [];
  }, [dataModules]);

  const memoPermisos = useMemo(() => {
    if (!isErrorPermisosUser) {
      if (dataPermisos) {
        return dataPermisos;
      }
    } else {
      toast.error(errorPermisosUser.response.data.message);
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
      queryClient.setQueryData(
        ["ext_person", getValues("tipDocument"), getValues("nroDocument")],
        null
      );
    }

    if (value === 4) {
      validateCheckBoxCategoryAndCheckAll();
    }

    if (isRefetching2) {
      setValueModel("resources", dataPermisosUser);
    } else {
      if (value === 4) {
        validateCheckBoxCategoryAndCheckAll();
        setTimeout(() => {
          setRefresh(false);
        }, 2000);
      }
    }

    if (isRefetching3) {
      const idsModules = dataServicesUser.map((a: any) => a._id);
      setValueModel("modules", idsModules);
    } else {
      if (value === 3) {
        setTimeout(() => {
          setRefresh(false);
        }, 2000);
      }
    }
  }, [dataPersona, value, isRefetching2, isErrorPersona, isRefetching3]);

  useLayoutEffect(() => {
    if (dataPermisosUser) {
      setValueModel("resources", dataPermisosUser);
    }

    if (dataServicesUser) {
      const idsModules = dataServicesUser.map((a: any) => a._id);
      setValueModel("modules", idsModules);
    }
  }, [dataPermisosUser, dataServicesUser]);

  return (
    <>
      <DialogBasic
        height={size.heigth}
        width={size.width}
        handleClose={closeEdit}
      >
        <DialogTitle>{`Editar ${data.name + " " + data.lastname}`}</DialogTitle>
        <DialogBody>
          <TabModal value={value} onChange={handleTab}>
            <TabModalItem value={1}>General</TabModalItem>
            <TabModalItem value={2}>Cambiar contraseña</TabModalItem>
            <TabModalItem value={3}>Modulos</TabModalItem>
            <TabModalItem value={4}>Permisos</TabModalItem>
          </TabModal>
          <form className="overflow-y-auto flex-[1_0_calc(100%-78px)]">
            <TabModalPanel value={value} index={1}>
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
            </TabModalPanel>
            <TabModalPanel value={value} index={2}>
              <div className="w-full flex flex-row mt-3">
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
            <TabModalPanel value={value} index={3}>
              <div className="mt-2">
                {isLoadingModules || isLoadingServicesUser ? (
                  "Cargando modulos..."
                ) : isErrorModules ? (
                  <label className="text-primary">
                    {errorModules.response.data.message}
                  </label>
                ) : isErrorServicesUser ? (
                  <label>{errorServicesUser.response.data.message}</label>
                ) : (
                  <>
                    <div className="flex flex-row w-full justify-end pr-5">
                      <label
                        className="flex items-center gap-1 cursor-pointer text-textDefault select-none"
                        onClick={handleRefreshModules}
                      >
                        <TfiReload
                          className={`${
                            refresh ? "animate-[spin_2s_linear_infinite]" : ""
                          }`}
                        />
                        Refresh modulos
                      </label>
                    </div>

                    <CheckBoxItem
                      options={memoModulos}
                      values={getResources_modules}
                      handleChange={handleCheckServices}
                    />
                  </>
                )}
              </div>
            </TabModalPanel>
            <TabModalPanel value={value} index={4}>
              <div className="mt-2 flex flex-col mr-[16px] mb-[10px]">
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
                    <div className="flex flex-row w-full justify-end pr-5">
                      <label
                        className="flex items-center gap-1 cursor-pointer text-textDefault select-none"
                        onClick={handleRefresh}
                      >
                        <TfiReload
                          className={`${
                            refresh ? "animate-[spin_2s_linear_infinite]" : ""
                          }`}
                        />
                        Refresh permisos
                      </label>
                    </div>

                    <div className="flex w-1/2 mt-2">
                      <input
                        className="border w-1/12 focus:outline-none pl-1 rounded-sm cursor-pointer"
                        type="checkbox"
                        id="check-all"
                        {...register("check-all", {
                          onChange: (e) => {
                            const value = e.target.checked;
                            let keys: string[] = [];

                            if (!value) {
                              memoPermisos.map((a) => {
                                //Desmarcamos todas las categorias
                                setValueModel(`${a.category}`, false);

                                //Buscamores todos los inputs x categoria
                                const checkboxesCategory =
                                  document.querySelectorAll(
                                    `.group-${a.category}`
                                  );

                                //Desmarcamos inputs x categoria y almacenamos array para el estado
                                Array.from(checkboxesCategory).map((a: any) => {
                                  a.checked = false;
                                  keys = [...keys, a.name];
                                });
                              });

                              //Quitamos todos los permisos x categoria y actualizamos estado
                              const filter = getResources_users.filter(
                                (x) => !keys.includes(x)
                              );
                              setValueModel("resources", filter);
                            } else {
                              memoPermisos.map((a) => {
                                //Marcamos todas las categorias
                                setValueModel(`${a.category}`, true);

                                //Buscamores todos los inputs x categoria
                                const checkboxesCategory =
                                  document.querySelectorAll(
                                    `.group-${a.category}`
                                  );

                                //Marcamos inputs x categoria y almacenamos array para el estado
                                Array.from(checkboxesCategory).map((a: any) => {
                                  a.checked = true;
                                  keys = [...keys, a.name];
                                });
                              });

                              //Agregamos todos los permisos x categoria y actualizamos estado
                              const filter = getResources_users.concat(keys);
                              setValueModel("resources", filter);
                            }
                          },
                          value: false,
                        })}
                      />

                      <label
                        htmlFor="check-all"
                        className="ml-2 cursor-pointer select-none font-bold"
                      >
                        Marcar todos los permisos
                      </label>
                    </div>

                    <div className="mt-2 grid grid-cols-[repeat(4,_1fr)] gap-[15px]">
                      {memoPermisos.map((a, i: number) => {
                        //Mostraremos todos los recursos x categoria
                        const resources = memoPermisos.find(
                          (b) => b.category === a.category
                        ).resources;

                        return (
                          <div key={i} className="border p-2 pr-2">
                            <div className="flex">
                              <label
                                htmlFor={`all-${a.category}`}
                                className="flex items-center font-bold underline cursor-pointer gap-2"
                              >
                                <input
                                  {...register(`${a.category}`, {
                                    value: false,
                                  })}
                                  onChange={(e) => {
                                    //Obtenemos todos los inputs con la misma clase de la categoria
                                    const checkboxesResource =
                                      document.querySelectorAll(
                                        `.group-${a.category}`
                                      );

                                    let keys: string[] = [];

                                    //Si el checkbox es true
                                    if (e.target.checked) {
                                      //Marcamos inputs x categoria y almacenamos array para el estado
                                      Array.from(checkboxesResource).map(
                                        (a: any) => {
                                          a.checked = true;
                                          keys = [...keys, a.name];
                                        }
                                      );

                                      //Agregamos todos los permisos x categoria al estado resources
                                      const append =
                                        getResources_users.concat(keys);
                                      setValueModel("resources", append);

                                      //CHECK-ALL

                                      //Revisar que todas las categorias son true para marcar true el check-all
                                      const allCategorys = memoPermisos.map(
                                        (x) => {
                                          return document.querySelector(
                                            `#all-${x.category}`
                                          );
                                        }
                                      ) as HTMLInputElement[];

                                      //Buscamos si todas las categorias son trues
                                      const categorysCheckeds = Array.from(
                                        allCategorys
                                      ).every((checkbox) => checkbox.checked);

                                      //Si son trues actualizamos el estado de check-all como true
                                      if (categorysCheckeds)
                                        setValueModel("check-all", true);
                                    } else {
                                      //Desmarcamos inputs x categoria y almacenamos array para el estado
                                      Array.from(checkboxesResource).map(
                                        (a: any) => {
                                          a.checked = false;
                                          keys = [...keys, a.name];
                                        }
                                      );

                                      //Quitamos todos los permisos x categoria y actualizamos estado
                                      const filter = getResources_users.filter(
                                        (x) => !keys.includes(x)
                                      );
                                      setValueModel("resources", filter);

                                      //CHECK-ALL

                                      //Si se desmarca una sola categoria el estado check-all sera false
                                      setValueModel("check-all", false);
                                    }
                                  }}
                                  className="border w-[21px] h-[18px] focus:outline-none pl-1 rounded-sm cursor-pointer"
                                  type="checkbox"
                                  id={`all-${a.category}`}
                                />

                                {a.category}
                              </label>
                            </div>
                            <CheckBoxItem
                              className="mt-2"
                              options={resources}
                              values={getResources_users}
                              handleChange={handleCheckResources}
                              category={a.category}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </TabModalPanel>
          </form>
        </DialogBody>
        <DialogButtons>
          <button
            onClick={closeModal}
            className="min-w-[84px] min-h-[24px] mr-[8px] text-[#066397] cursor-pointer bg-transparent border border-solid rounded-md"
          >
            Cancelar
          </button>
          <button
            disabled={
              isLoadingEdit ||
              isLoadingPassword ||
              isLoadingServices ||
              isLoadingResources
            }
            onClick={handleSubmit(onSubmit)}
            className={`min-w-[84px] min-h-[24px] text-white cursor-pointer  border border-solid rounded-md ${
              isLoadingEdit ||
              isLoadingPassword ||
              isLoadingServices ||
              isLoadingResources
                ? "bg-red-500"
                : "bg-primary"
            }`}
          >
            OK
          </button>
        </DialogButtons>
      </DialogBasic>
    </>
  );
};

export default UserEdit;
