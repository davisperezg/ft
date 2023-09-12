import {
  useContext,
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ModalContext } from "../../context/modalContext";
import { useModules, useModulesAvailables } from "../../hooks/useModuleS";
import { useEditRol } from "../../hooks/useRoles";
import { IRol } from "../../interface/rol.interface";
import DialogBasic from "../Dialog/DialogBasic";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import CheckBoxItem from "../Input/CheckBoxItem";
import TabModal from "../Tab/Modal/TabModal";
import TabModalItem from "../Tab/Modal/TabModalItem";
import TabModalPanel from "../Tab/Modal/TabModalPanel";
import ToastError from "../Toast/ToastError";
import { TfiReload } from "react-icons/tfi";
import {
  usePermisosAvailables,
  usePermisosXrole,
  usePostResourcesXRol,
} from "../../hooks/useResources";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";

interface Props {
  data: any;
  closeEdit: () => void;
}

interface FormValues extends IRol {
  resources?: string[];
  [key: string]: any;
}

const initialSize = {
  heigth: 440,
  width: 630,
};

const RolEdit = ({ data, closeEdit }: Props) => {
  const { dispatch } = useContext(ModalContext);
  const [value, setValue] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const [size, setSize] = useState(initialSize);

  const handleTab = (newValue: number) => {
    if (newValue !== 3) {
      setSize(initialSize);
    } else {
      setSize({
        heigth: 800,
        width: 1200,
      });
    }

    setValue(newValue);
  };

  //CRUD
  // const {
  //   data: dataModules,
  //   error: errorModules,
  //   isLoading: isLoadingModules,
  // } = useModules();

  const {
    data: dataModules,
    error: errorModules,
    isLoading: isLoadingModules,
  } = useModulesAvailables();

  const {
    data: dataPermisos,
    isLoading: isLoadingPermisos,
    error: errorPermisos,
    isError: isErrorPermisos,
  } = usePermisosAvailables();

  const {
    data: dataPermisosRole,
    error: errorPermisosRole,
    isError: isErrorPermisosRole,
    isLoading: isLoadingPermisosRole,
    isRefetching: isRefetching2,
    refetch: refetch2,
  } = usePermisosXrole(data._id);

  const { mutateAsync: mutateResources, isLoading: isLoadingResources } =
    usePostResourcesXRol();

  const {
    register,
    handleSubmit,
    setValue: setValueModel,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: data.name,
      description: data.description,
      module: data.module.map((a: any) => a._id),
      resources: [],
    },
  });

  const getModulos = watch("module") as string[];

  const { mutateAsync, isLoading: isLoadingEdit } = useEditRol();

  const getResources_users = watch("resources") as string[];

  const handleRefresh = () => {
    setRefresh(true);
    refetch2();
  };

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

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const sendRol: IRol = {
      name: values.name,
      description: values.description,
      module: values.module,
    };

    try {
      const response = await mutateAsync({
        body: sendRol,
        id: data._id as string,
      });

      await mutateResources({
        resources: values.resources as string[],
        role: data._id,
      });
      toast.success(response.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
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

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  const handleCheck = (values: string[]) => setValueModel("module", values);

  useEffect(() => {
    if (value === 3) {
      validateCheckBoxCategoryAndCheckAll();
    }

    if (isRefetching2) {
      setValueModel("resources", dataPermisosRole);
    } else {
      if (value === 3) {
        validateCheckBoxCategoryAndCheckAll();
        setTimeout(() => {
          setRefresh(false);
        }, 2000);
      }
    }
  }, [value, isRefetching2]);

  useLayoutEffect(() => {
    if (dataPermisosRole) {
      setValueModel("resources", dataPermisosRole);
    }
  }, [dataPermisosRole]);

  return (
    <>
      <DialogBasic
        height={size.heigth}
        width={size.width}
        handleClose={closeEdit}
      >
        <DialogTitle>{`Rol ${data.name}`}</DialogTitle>
        <DialogBody>
          <TabModal value={value} onChange={handleTab}>
            <TabModalItem value={1}>General</TabModalItem>
            <TabModalItem value={2}>Modulos</TabModalItem>
            <TabModalItem value={3}>Permisos</TabModalItem>
          </TabModal>
          <form className="overflow-y-auto flex-[1_0_calc(100%-78px)]">
            <TabModalPanel value={value} index={1}>
              <div className="flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Nombre: <strong className="text-primary">*</strong>
                  </label>
                </div>
                <div className="w-2/3 flex flex-col">
                  <input
                    {...register("name", {
                      required: { value: true, message: "Ingrese nombre" },
                      minLength: {
                        value: 3,
                        message: "Ingrese mínimo 3 caracteres",
                      },
                      maxLength: {
                        value: 45,
                        message: "Ingrese máximo 45 caracteres",
                      },
                    })}
                    autoFocus
                    type="text"
                    className={`border w-8/12 focus:outline-none pl-1 rounded-sm ${
                      errors.name ? "border-primary" : ""
                    }`}
                  />
                  {errors.name && (
                    <span className="text-primary">{errors.name.message}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Descripción:</label>
                </div>
                <div className="w-2/3 flex flex-col">
                  <textarea
                    {...register("description", {
                      maxLength: {
                        value: 150,
                        message: "Ingrese máximo 150 caracteres permitidos",
                      },
                    })}
                    cols={10}
                    rows={8}
                    className={`border w-8/12 focus:outline-none pl-1 rounded-sm ${
                      errors.description ? "border-primary" : ""
                    }`}
                  />
                  {errors.description && (
                    <span className="text-primary">
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>
            </TabModalPanel>
            <TabModalPanel value={value} index={2}>
              <div className="mt-3 flex flex-col">
                <strong>Modulos disponibles</strong>
                {getModulos.length === 0 && (
                  <span className="text-primary">
                    Seleccione mínimo 1 módulo disponible
                  </span>
                )}
              </div>

              {errorModules ? (
                <label>{errorModules.response.data.message}</label>
              ) : (
                <></>
              )}
              {isLoadingModules ? (
                <span>Cargando modulos...</span>
              ) : (
                <div className="flex mt-3">
                  <div className="w-1/3 flex flex-col">
                    <CheckBoxItem
                      options={memoModulos}
                      values={getModulos}
                      handleChange={handleCheck}
                    />
                  </div>
                </div>
              )}
            </TabModalPanel>
            <TabModalPanel value={value} index={3}>
              <div className="mt-2 flex flex-col mr-[16px] mb-[10px]">
                {isLoadingPermisos || isLoadingPermisosRole ? (
                  "Cargando permisos disponibles..."
                ) : isErrorPermisos ? (
                  <label className="text-primary">
                    {errorPermisos.response.data.message}
                  </label>
                ) : isErrorPermisosRole ? (
                  <label>{errorPermisosRole.response.data.message}</label>
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
            type="button"
            onClick={closeModal}
            className="min-w-[84px] min-h-[24px] mr-[8px] text-[#066397] cursor-pointer bg-transparent border border-solid rounded-md"
          >
            Cancelar
          </button>
          <button
            disabled={isLoadingEdit || isLoadingResources}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className={`min-w-[84px] min-h-[24px] text-white cursor-pointer  border border-solid rounded-md ${
              isLoadingEdit || isLoadingResources ? "bg-red-500" : "bg-primary"
            }`}
          >
            OK
          </button>
        </DialogButtons>
      </DialogBasic>
    </>
  );
};

export default RolEdit;
