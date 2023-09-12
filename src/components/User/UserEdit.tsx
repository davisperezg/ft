/* eslint-disable no-useless-escape */
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { ModalContext } from "../../context/modalContext";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import DialogBasic from "../Dialog/DialogBasic";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { IUser } from "../../interface/user.interface";
import { useRolesAvailables } from "../../hooks/useRoles";
import { useReniec, useSunat } from "../../hooks/useServices";
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
import { IEmpresa } from "../../interface/empresa.interface";

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
    control,
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
      empresas: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "empresa.establecimientos",
  });

  const refInputserie = useRef<HTMLInputElement>(null);
  const refSelectDoc = useRef<HTMLSelectElement>(null);

  const {
    data: dataPersona,
    isFetching: isFetchingPersona,
    error: errorPersona,
    isError: isErrorPersona,
    refetch,
  } = useReniec(watch("tipDocument"), watch("nroDocument"));

  const {
    data: dataEmpresa,
    isFetching: isFetchingEmpresa,
    error: errorEmpresa,
    isError: isErrorEmpresa,
    refetch: refetchEmpresa,
  } = useSunat("RUC", watch("empresa.ruc"));

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
    if (newValue === 4) {
      setSize({
        heigth: 800,
        width: 1200,
      });
    } else if (newValue === 5) {
      setSize({
        width: 855,
        heigth: 652,
      });
    } else {
      setSize(initialSize);
    }

    setValue(newValue);
  };

  const getResources_users = watch("resources") as string[];
  const getResources_modules = watch("modules") as string[];

  const validateCheckBoxCategoryAndCheckAll = () => {
    //Recorremos los inputs x categoria para desmarcar categoria
    const allCategorys = memoPermisos?.map((a) => {
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
      (checkbox) => checkbox?.checked
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
  }, [dataModules, errorServicesUser, isErrorServicesUser]);

  const memoPermisos = useMemo(() => {
    if (!isErrorPermisosUser) {
      if (dataPermisos) {
        return dataPermisos;
      }
    } else {
      toast.error(errorPermisosUser.response.data.message);
    }

    return [];
  }, [dataPermisos, errorPermisosUser, isErrorPermisosUser]);

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

    if (isErrorEmpresa) {
      toast.error(errorEmpresa.response.data.message);

      setValueModel("empresa.razon_social", "");
      setValueModel("empresa.nombre_comercial", "");
      setValueModel("empresa.domicilio_fiscal", "");
      setValueModel("empresa.ruc", "");
    }

    if (dataEmpresa) {
      setValueModel("empresa.razon_social", dataEmpresa.razonSocial);
      setValueModel("empresa.nombre_comercial", dataEmpresa.nombre);
      setValueModel("empresa.ubigeo", dataEmpresa.ubigeo);
      setValueModel(
        "empresa.domicilio_fiscal",
        `${dataEmpresa.direccion} ${dataEmpresa.distrito} ${dataEmpresa.provincia} ${dataEmpresa.departamento}`
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataPersona,
    value,
    isRefetching2,
    isErrorPersona,
    isRefetching3,
    isErrorEmpresa,
    errorEmpresa,
    dataEmpresa,
    errorPersona?.response.data.message,
    setValueModel,
    //validateCheckBoxCategoryAndCheckAll,
    dataPermisosUser,
    dataServicesUser,
  ]);

  useLayoutEffect(() => {
    if (dataPermisosUser) {
      setValueModel("resources", dataPermisosUser);
    }

    if (dataServicesUser) {
      const idsModules = dataServicesUser.map((a: any) => a._id);
      setValueModel("modules", idsModules);
    }
  }, [dataPermisosUser, dataServicesUser]);

  const certRef = useRef<HTMLInputElement | null>(null);
  const certFoto = useRef<HTMLInputElement | null>(null);

  const { ref: refCert, ...cert } = register("empresa.cert", {
    required: {
      value:
        watch("empresa.modo") === 1 && !watch("empresa.cert") ? true : false,
      message: "Suba un certificado .pfx | .p12",
    },
    onChange: (e) => {
      const files = e.target.files as FileList;
      if (files.length > 0 && files[0].type !== "application/x-pkcs12") {
        alert("Por favor, selecciona un archivo PKCS12.");
        setValueModel("empresa.cert", "");
      }
    },
  });

  const { ref: refFoto, ...foto } = register("empresa.foto", {
    onChange: (e) => {
      const files = e.target.files as FileList;
      if (files.length > 0 && files[0].type !== "image/png") {
        alert("Por favor, selecciona un archivo PNG.");
        setValueModel("empresa.foto", "");
      }
    },
  });

  const handleBrowseCertButtonClick = () => {
    // Simula un click en el input de tipo file
    certRef?.current?.click();
  };

  const handleBrowseLogoButtonClick = () => {
    // Simula un click en el input de tipo file
    certFoto?.current?.click();
  };

  console.log(data);

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
            <TabModalItem value={5}>Empresa</TabModalItem>
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
            <TabModalPanel value={value} index={5}>
              <div className="flex flex-col mt-3">
                <div className="flex w-full gap-2">
                  {/* DATOS */}
                  <fieldset className="w-1/2 border rounded-sm p-[8px]">
                    <legend className="p-[0_12px] dark:text-white">
                      Datos
                    </legend>

                    {/* RUC */}
                    <div className="w-full flex flex-row">
                      <div className="w-1/3">
                        <label>Ruc:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.ruc`, {
                            pattern: {
                              value: /^(20|10)\d{9}$/,
                              message: "El RUC debe ser válido.",
                            },
                            maxLength: {
                              value: 11,
                              message: "El RUC debe contener 11 caracteres.",
                            },
                            minLength: {
                              value: 11,
                              message: "El RUC debe contener 11 caracteres.",
                            },

                            onChange: (e) => {
                              const value: string = e.target.value;
                              const maxLength = value.slice(0, 11);
                              if (value.length > 11) {
                                return setValueModel("empresa.ruc", maxLength);
                              }

                              if (value.length !== 11) {
                                setValueModel("empresa.razon_social", "");
                                setValueModel("empresa.nombre_comercial", "");
                                setValueModel("empresa.domicilio_fiscal", "");
                                setValueModel("empresa.ubigeo", "");
                                //setValueModel("empresa.urbanizacion", "");
                              }
                            },
                          })}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.ruc ? "border-primary" : ""
                          }`}
                          type="text"
                          disabled={isFetchingEmpresa}
                        />
                        {errors?.empresa?.ruc && (
                          <span className="text-primary">
                            {errors?.empresa?.ruc.message}
                          </span>
                        )}
                      </div>
                      <div className="w-2/12 overflow-hidden relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (getValues("empresa.ruc").length !== 0)
                              return refetchEmpresa();
                            toast.error("Ingrese ruc");
                          }}
                          className="flex items-center justify-center h-[20px] w-full hover:bg-hover text-center bg-default absolute"
                        >
                          {isFetchingEmpresa ? "..." : <FcSearch />}
                        </button>
                      </div>
                    </div>

                    {/* EMPRESA */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Empresa:</label>
                      </div>
                      <div className="w-2/3">
                        <input
                          {...register(`empresa.razon_social`)}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.razon_social
                              ? "border-primary"
                              : ""
                          }`}
                        />
                        {errors?.empresa?.razon_social && (
                          <span className="text-primary">
                            {errors?.empresa?.razon_social?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* NOMBRE COMERCIAL */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Nombre comercial:</label>
                      </div>
                      <div className="w-2/3">
                        <input
                          {...register(`empresa.nombre_comercial`)}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.nombre_comercial
                              ? "border-primary"
                              : ""
                          }`}
                        />
                        {errors?.empresa?.nombre_comercial && (
                          <span className="text-primary">
                            {errors?.empresa?.nombre_comercial?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DOMICILIO FISCAL */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Domicilio fiscal:</label>
                      </div>
                      <div className="w-2/3">
                        <input
                          {...register(`empresa.domicilio_fiscal`)}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.domicilio_fiscal
                              ? "border-primary"
                              : ""
                          }`}
                        />
                        {errors?.empresa?.domicilio_fiscal && (
                          <span className="text-primary">
                            {errors?.empresa?.domicilio_fiscal?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* FOTO */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Foto:</label>
                      </div>
                      <div className="w-2/3">
                        <input
                          {...foto}
                          type="file"
                          accept=".png"
                          name="empresa.foto"
                          ref={(e) => {
                            refFoto(e);
                            certFoto.current = e;
                          }}
                          className={`hidden text-[12px] ${
                            errors?.empresa?.foto ? "border-primary" : ""
                          }`}
                        />
                        <input
                          className="border border-black bg-hover px-2 cursor-pointer"
                          type="button"
                          value="Buscar logo"
                          onClick={handleBrowseLogoButtonClick}
                        />
                        <label>
                          &nbsp;
                          {String(
                            (watch("empresa.foto")?.[0] as any)?.name ??
                              "Ningún archivo seleccionado."
                          )}
                        </label>
                        {errors?.empresa?.foto && (
                          <span className="text-primary">
                            {errors?.empresa?.foto?.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  {/* CONFIGURACIONES */}
                  <fieldset className="w-1/2 border rounded-sm p-[8px]">
                    <legend className="p-[0_12px] dark:text-white">
                      Configuraciones
                    </legend>

                    {/* MODO 0 beta - 1 produccion */}
                    <div className="w-full flex flex-row">
                      <div className="w-1/3">
                        <label>
                          Modo: <strong className="text-primary">*</strong>
                        </label>
                      </div>
                      <div className="w-1/3">
                        <select
                          {...register(`empresa.modo`, {
                            valueAsNumber: true,
                            required: {
                              value: true,
                              message: "Ingrese Modo.",
                            },
                          })}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.modo ? "border-primary" : ""
                          }`}
                        >
                          <option value={0}>Beta</option>
                          <option value={1}>Produccion</option>
                        </select>

                        {errors?.empresa?.modo && (
                          <span className="text-primary">
                            {errors?.empresa?.modo?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SI ES MODO BETA SE DESACTIVA INPUTS */}

                    {/* HABILITAR OSE */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>
                          Habilitar OSE:{" "}
                          <strong className="text-primary"></strong>
                        </label>
                      </div>
                      <div className="w-1/3">
                        <input
                          type="checkbox"
                          {...register(`empresa.ose_enabled`)}
                          className={`text-[12px] ${
                            errors?.empresa?.ose_enabled ? "border-primary" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* SI HABILITAMOS OSE SE DEBE HABILITAR TAMBIEN EL LINK DEL OSE */}
                    {Boolean(watch("empresa.ose_enabled") === true) && (
                      <div className="w-full flex flex-row mt-3">
                        <div className="w-1/3">
                          <label>
                            Link OSE:{" "}
                            <strong className="text-primary">*</strong>
                          </label>
                        </div>
                        <div className="w-2/3">
                          <input
                            type="text"
                            {...register(`empresa.web_service`, {
                              pattern: {
                                value:
                                  /^(http|https):\/\/[\w\-\.]+\.\w{2,}(\/.*)?$/,
                                message:
                                  "El link del web_service debe ser valido.",
                              },
                              required: {
                                value:
                                  watch("empresa.ose_enabled") === true
                                    ? true
                                    : false,
                                message: "Ingrese link OSE.",
                              },
                            })}
                            className={`border w-full focus:outline-none pl-1 rounded-sm text-[12px] ${
                              errors?.empresa?.web_service
                                ? "border-primary"
                                : ""
                            }`}
                          />

                          {errors?.empresa?.web_service && (
                            <span className="text-primary">
                              {errors?.empresa?.web_service?.message}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {Number(watch("empresa.modo")) === 1 && (
                      <>
                        {/* CERTIFICADO */}
                        <div className="w-full flex flex-row mt-3">
                          <div className="w-1/3">
                            <label>
                              Certificado:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-2/3 ">
                            <input
                              {...cert}
                              type="file"
                              accept=".pfx;*.p12"
                              name="empresa.cert"
                              ref={(e) => {
                                refCert(e);
                                certRef.current = e;
                              }}
                              className={`hidden text-[12px] ${
                                errors?.empresa?.cert ? "border-primary" : ""
                              }`}
                            />

                            <div>
                              <input
                                className={`border ${
                                  errors?.empresa?.cert
                                    ? "border-primary"
                                    : "border-black"
                                } bg-hover px-2 cursor-pointer`}
                                type="button"
                                value="Buscar certificado"
                                onClick={handleBrowseCertButtonClick}
                              />
                              <label>
                                &nbsp;
                                {String(
                                  (watch("empresa.cert")?.[0] as any)?.name ??
                                    "Ningún archivo seleccionado."
                                )}
                              </label>
                            </div>
                            {errors?.empresa?.cert && (
                              <span className="text-primary">
                                {errors?.empresa?.cert?.message}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CERTIFICADO PASSWORD */}
                        <div className="w-full flex flex-row mt-3">
                          <div className="w-1/3">
                            <label>
                              Cert. password:{" "}
                              <strong className="text-primary">*</strong>
                            </label>
                          </div>
                          <div className="w-1/3">
                            <input
                              {...register(`empresa.cert_password`, {
                                required: {
                                  value:
                                    watch("empresa.modo") === 1 ||
                                    watch("empresa.cert")
                                      ? true
                                      : false,
                                  message:
                                    watch("empresa.modo") === 1 &&
                                    !watch("empresa.cert")
                                      ? "Suba un cert. para agregar el password"
                                      : "Ingrese password del certificado.",
                                },
                              })}
                              className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                errors?.empresa?.cert_password
                                  ? "border-primary"
                                  : ""
                              }`}
                            />
                            {errors?.empresa?.cert_password && (
                              <span className="text-primary">
                                {errors?.empresa?.cert_password?.message}
                              </span>
                            )}
                          </div>
                        </div>

                        {watch("empresa.ose_enabled") ? (
                          <>
                            {/* OSE USUSEC */}
                            <div className="w-full flex flex-row mt-3">
                              <div className="w-1/3">
                                <label>
                                  Usuario secundario username OSE:{" "}
                                  <strong className="text-primary">*</strong>
                                </label>
                              </div>
                              <div className="w-1/3">
                                <input
                                  {...register(
                                    `empresa.usu_secundario_ose_user`,
                                    {
                                      required: {
                                        value:
                                          watch("empresa.ose_enabled") === true
                                            ? true
                                            : false,
                                        message:
                                          "Ingrese usuario secundario del OSE",
                                      },
                                    }
                                  )}
                                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                    errors?.empresa?.usu_secundario_ose_user
                                      ? "border-primary"
                                      : ""
                                  }`}
                                />
                                {errors?.empresa?.usu_secundario_ose_user && (
                                  <span className="text-primary">
                                    {
                                      errors?.empresa?.usu_secundario_ose_user
                                        ?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* OSE USUSECPASSWORD */}
                            <div className="w-full flex flex-row mt-3">
                              <div className="w-1/3">
                                <label>
                                  Usuario secundario password OSE:{" "}
                                  <strong className="text-primary">*</strong>
                                </label>
                              </div>
                              <div className="w-1/3">
                                <input
                                  {...register(
                                    `empresa.usu_secundario_ose_password`,
                                    {
                                      required: {
                                        value:
                                          watch("empresa.ose_enabled") === true
                                            ? true
                                            : false,
                                        message:
                                          "Ingrese password del usuario secundario del OSE",
                                      },
                                    }
                                  )}
                                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                    errors?.empresa?.usu_secundario_ose_password
                                      ? "border-primary"
                                      : ""
                                  }`}
                                />
                                {errors?.empresa
                                  ?.usu_secundario_ose_password && (
                                  <span className="text-primary">
                                    {
                                      errors?.empresa
                                        ?.usu_secundario_ose_password?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </div>{" "}
                          </>
                        ) : (
                          <>
                            {/* SUNAT USUSECUSERNAME */}
                            <div className="w-full flex flex-row mt-3">
                              <div className="w-1/3">
                                <label>
                                  Usuario secundario username:{" "}
                                  <strong className="text-primary">*</strong>
                                </label>
                              </div>
                              <div className="w-1/3">
                                <input
                                  {...register(`empresa.usu_secundario_user`, {
                                    required: {
                                      value:
                                        watch("empresa.ose_enabled") === false
                                          ? true
                                          : false,
                                      message: "Ingrese usuario secundario",
                                    },
                                  })}
                                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                    errors?.empresa?.usu_secundario_user
                                      ? "border-primary"
                                      : ""
                                  }`}
                                />
                                {errors?.empresa?.usu_secundario_user && (
                                  <span className="text-primary">
                                    {
                                      errors?.empresa?.usu_secundario_user
                                        ?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* SUNAT USUSECPASSWORD */}
                            <div className="w-full flex flex-row mt-3">
                              <div className="w-1/3">
                                <label>
                                  Usuario secundario password:{" "}
                                  <strong className="text-primary">*</strong>
                                </label>
                              </div>
                              <div className="w-1/3">
                                <input
                                  {...register(
                                    `empresa.usu_secundario_password`,
                                    {
                                      required: {
                                        value:
                                          watch("empresa.ose_enabled") === false
                                            ? true
                                            : false,
                                        message:
                                          "Ingrese password del usuario secundario",
                                      },
                                    }
                                  )}
                                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                                    errors?.empresa?.usu_secundario_password
                                      ? "border-primary"
                                      : ""
                                  }`}
                                />
                                {errors?.empresa?.usu_secundario_password && (
                                  <span className="text-primary">
                                    {
                                      errors?.empresa?.usu_secundario_password
                                        ?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </fieldset>
                </div>

                <div className="flex w-full gap-2">
                  {/* SUNAT */}
                  <fieldset className="w-1/2 border rounded-sm p-[8px]">
                    <legend className="p-[0_12px] dark:text-white">
                      Sunat
                    </legend>

                    {/* UBIGEO */}
                    <div className="w-full flex flex-row">
                      <div className="w-1/3">
                        <label>Ubigeo:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.ubigeo`)}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.ubigeo ? "border-primary" : ""
                          }`}
                        />
                        {errors?.empresa?.ubigeo && (
                          <span className="text-primary">
                            {errors?.empresa?.ubigeo?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* REGIMEN */}
                    {/* <div className="w-full flex flex-row mt-3">
                    <div className="w-1/3">
                      <label>
                        Regimen sunat:{" "}
                        <strong className="text-primary">*</strong>
                      </label>
                    </div>
                    <div className="w-1/3">
                      <input
                        {...register(`empresa.regimen_id`, {
                          required: {
                            value: true,
                            message: "Ingrese Regimen sunat",
                          },
                        })}
                        className={`border w-full focus:outline-none pl-1 rounded-sm ${
                          errors?.empresa?.regimen_id ? "border-primary" : ""
                        }`}
                      />
                      {errors?.empresa?.regimen_id && (
                        <span className="text-primary">
                          {errors?.empresa?.regimen_id?.message}
                        </span>
                      )}
                    </div>
                  </div> */}

                    {/* URBANIZACION */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Urbanizacion:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.urbanizacion`)}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.urbanizacion
                              ? "border-primary"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* CONTACTOS */}
                  <fieldset className="w-1/2 border rounded-sm p-[8px]">
                    <legend className="p-[0_12px] dark:text-white">
                      Contacto
                    </legend>
                    {/* CORREO */}
                    <div className="w-full flex flex-row">
                      <div className="w-1/3">
                        <label>Correo:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.correo`, {
                            pattern: {
                              value:
                                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                              message: "El correo debe ser valido.",
                            },
                          })}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.correo ? "border-primary" : ""
                          }`}
                        />
                        {errors?.empresa?.correo && (
                          <span className="text-primary">
                            {errors?.empresa?.correo?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TELEFONO MOVIL 1 */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Telefono movil 1:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.telefono_movil_1`, {
                            pattern: {
                              value: /^9\d{8}$/,
                              message:
                                "Ingrese un número de telefono movil_1 válido.",
                            },
                          })}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.telefono_movil_1
                              ? "border-primary"
                              : ""
                          }`}
                        />
                        {errors?.empresa?.telefono_movil_1 && (
                          <span className="text-primary">
                            {errors?.empresa?.telefono_movil_1?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TELEFONO MOVIL 2 */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Telefono movil 2:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.telefono_movil_2`, {
                            pattern: {
                              value: /^9\d{8}$/,
                              message:
                                "Ingrese un número de telefono movil_2 válido.",
                            },
                          })}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.telefono_movil_2
                              ? "border-primary"
                              : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* TELEFONO FIJO 1 */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Telefono fijo 1:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.telefono_fijo_1`)}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.telefono_fijo_1
                              ? "border-primary"
                              : ""
                          }`}
                        />
                        {errors?.empresa?.telefono_fijo_1 && (
                          <span className="text-primary">
                            {errors?.empresa?.telefono_fijo_1?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TELEFONO FIJO 2 */}
                    <div className="w-full flex flex-row mt-3">
                      <div className="w-1/3">
                        <label>Telefono fijo 2:</label>
                      </div>
                      <div className="w-1/3">
                        <input
                          {...register(`empresa.telefono_fijo_2`)}
                          className={`border w-full focus:outline-none pl-1 rounded-sm ${
                            errors?.empresa?.telefono_fijo_2
                              ? "border-primary"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>

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
                        append({
                          nombre_establecimiento: "",
                          codigo_establecimiento_sunat: "",
                          nombre_comercial_establecimiento: watch(
                            "empresa.razon_social"
                          )
                            ? watch("empresa.razon_social")
                            : "",
                          allowedDocuments: [
                            {
                              documento: { tipo_documento: "Proforma" },
                              series: ["PRO001", "PRO002"],
                            },
                            {
                              documento: { tipo_documento: "Factura" },
                              series: ["F001"],
                            },
                            {
                              documento: { tipo_documento: "Boleta" },
                              series: ["B001", "B002"],
                            },
                          ],
                        });
                      }}
                      className="border px-2 hover:bg-hover"
                    >
                      Agregar establecimientos
                    </button>
                  </div>
                </fieldset>
                {fields.map((item, index) => {
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
                            {/* NOMBRE SUCURSAL SUNAT */}
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

                            {/* NOMBRE SUCURSAL SUNAT */}
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
                })}
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
