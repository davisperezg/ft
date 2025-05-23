import { useState, useEffect, ChangeEvent } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { useModulesAvailables } from "../../Modulos/hooks/useModuleS";
import { useEditRol } from "../hooks/useRoles";
import { TfiReload } from "react-icons/tfi";
import {
  usePermisosAvailables,
  usePermisosXrole,
  usePostResourcesXRol,
} from "../../Permisos/hooks/useResources";
import { toast } from "sonner";
import { isError } from "../../../utils/functions.utils";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import TabsModal from "../../../components/Material/Tabs/TabsModal";
import TabModal from "../../../components/Material/Tab/TabModal";
import TabModalPanel from "../../../components/Material/Tab/TabModalPanel";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import InputCheckBox from "../../../components/Material/Input/InputCheckBox";
import { yupResolver } from "@hookform/resolvers/yup";
import { schemaFormRol } from "../validations/rol.schema";
import { IRol } from "../../../interfaces/models/rol/rol.interface";

interface Props {
  state: {
    visible: boolean;
    row: any;
  };
  closeEdit: () => void;
}

interface FormValues extends IRol {
  resources?: string[];
  [key: string]: any;
}

interface GroupCheckBox {
  name: string;
  checked: boolean;
}

const RolEdit = ({ state, closeEdit }: Props) => {
  const [value, setValue] = useState(0);
  const [categorys, setCategorys] = useState<GroupCheckBox[]>([]);
  const [checkAllCategorys, setCheckAllCategorys] = useState<boolean>(false);
  const [isRefreshModulos, setRefreshModulos] = useState(false);

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
  } = usePermisosXrole(state.row._id);

  const { mutateAsync: mutateResources, isPending: isLoadingResources } =
    usePostResourcesXRol();

  const methods = useForm<FormValues>({
    defaultValues: {
      name: state.row.name,
      description: state.row.description,
      module: state.row.module.map((a: any) => a._id),
      resources: [],
    },
    resolver: yupResolver(schemaFormRol),
    mode: "all",
  });

  const {
    control,
    register,
    handleSubmit,
    setValue: setValueModel,
    getValues,
    formState: { errors, isDirty, isValid },
  } = methods;

  const { mutateAsync, isPending: isLoadingEdit } = useEditRol();

  const handleRefresh = () => {
    refetch2();
  };

  const handleRefreshModules = () => {
    setRefreshModulos(true);
    setTimeout(() => {
      setValueModel(
        "module",
        state.row.module.map((a: any) => a._id)
      );
      setRefreshModulos(false);
    }, 1000);
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
        id: state.row._id as string,
      });

      await mutateResources({
        resources: values.resources ?? [],
        role: state.row._id,
      });
      toast.success(response.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const closeModal = () => {
    closeEdit();
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (dataPermisosRole || isRefetching2) {
      setValueModel("resources", dataPermisosRole);
    }

    if (
      dataPermisos &&
      dataPermisos?.length > 0 &&
      dataPermisosRole &&
      dataPermisosRole?.length > 0
    ) {
      //Si los recursos del rol incluyen todos de los recursos de la categoria, entonces la categoria estara marcada
      const defaultCategorys = dataPermisos.map((permiso) => {
        const categoryChecked =
          permiso.resources.every((a: any) =>
            getValues("resources")?.includes(a.value)
          ) || false;

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
    dataPermisosRole,
    setValueModel,
    isRefetching2,
    dataPermisos,
    getValues,
    state.row?.module,
  ]);

  return (
    <>
      <DialogBeta open={state.visible}>
        <DialogTitleBeta>{`Rol ${state.row.name}`}</DialogTitleBeta>
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
          <TabModal label="Modulos" index={1} />
          <TabModal label="Permisos" index={2} />
        </TabsModal>

        <DialogContentBeta>
          <form className="overflow-y-auto flex-[1_0_calc(100%-78px)]">
            <TabModalPanel value={value} index={0}>
              <div className="flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Nombre: <strong className="text-danger">*</strong>
                  </label>
                </div>
                <div className="w-2/3 flex flex-col">
                  <input
                    {...register("name")}
                    autoFocus
                    type="text"
                    className={`border w-8/12 focus:outline-none pl-1 rounded-sm ${
                      errors.name ? "border-danger" : ""
                    }`}
                  />
                  {errors.name && (
                    <span className="text-danger">{errors.name.message}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-row mt-3">
                <div className="w-1/3">
                  <label>Descripción:</label>
                </div>
                <div className="w-2/3 flex flex-col">
                  <textarea
                    {...register("description")}
                    cols={10}
                    rows={8}
                    className={`border w-8/12 focus:outline-none pl-1 rounded-sm ${
                      errors.description ? "border-danger" : ""
                    }`}
                  />
                  {errors.description && (
                    <span className="text-danger">
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>
            </TabModalPanel>
            <TabModalPanel value={value} index={1}>
              {isLoadingModules ? (
                <span>Cargando modulos...</span>
              ) : errorModules ? (
                <span className="text-red-500 w-full">
                  {errorModules.response.data.message}
                </span>
              ) : (
                <>
                  <div className="flex flex-row w-full justify-end">
                    <label
                      className="flex items-center gap-1 cursor-pointer text-default select-none"
                      onClick={handleRefreshModules}
                    >
                      <TfiReload
                        className={`${
                          isRefreshModulos
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
                        name={`module`}
                        render={({ field }) => (
                          <>
                            {dataModules?.map((modulo) => {
                              return (
                                <label
                                  key={modulo.value}
                                  className="cursor-pointer flex gap-2 select-none"
                                >
                                  <InputCheckBox
                                    checked={field.value.includes(modulo.value)}
                                    onChange={() => {
                                      const modulos = field.value;
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
            </TabModalPanel>
            <TabModalPanel value={value} index={2}>
              <div className="flex flex-col mr-[16px] mb-[10px]">
                {isLoadingPermisos || isLoadingPermisosRole ? (
                  "Cargando permisos disponibles..."
                ) : isErrorPermisos ? (
                  <span className="text-red-500 w-full">
                    {errorPermisos.response.data.message}
                  </span>
                ) : isErrorPermisosRole ? (
                  <span className="text-red-500 w-full">
                    {errorPermisosRole.response.data.message}
                  </span>
                ) : (
                  <>
                    <div className="flex flex-row w-full justify-end">
                      <label
                        className="flex items-center gap-1 cursor-pointer text-default select-none"
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
                                dataPermisos?.flatMap((a) =>
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
                      {dataPermisos?.map((permiso, index) => {
                        //Si los recursos del rol incluyen todos de los recursos de la categoria, entonces la categoria estara marcada
                        const categoryChecked =
                          permiso.resources.every((a: any) =>
                            getValues("resources")?.includes(a.value)
                          ) || false;

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
                                        if (cat.name === findCategory.name) {
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
                                          ...(getValues("resources") ?? []),
                                          ...permiso.resources.map(
                                            (a: any) => a.value
                                          ),
                                        ],
                                        {
                                          shouldDirty: true,
                                        }
                                      );

                                      const validTruesCategorys =
                                        mapCategorys.every((a) => a.checked);

                                      if (validTruesCategorys) {
                                        setCheckAllCategorys(true);
                                      }
                                    } else {
                                      //Si desmarco la categoria, quitamos todos los recursos de la categoria
                                      setValueModel(
                                        "resources",
                                        (getValues("resources") ?? []).filter(
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
                            <div className="ml-[5px]  mt-1 mb-1">
                              <Controller
                                control={control}
                                name="resources"
                                render={({ field }) => (
                                  <>
                                    {permiso.resources.map((resource: any) => {
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
                                              const checked = e.target.checked;
                                              const recursos =
                                                field.value ?? [];
                                              const index = recursos.indexOf(
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
                                                setCategorys(mapCategorys);
                                                setCheckAllCategorys(false);
                                              } else {
                                                //Validamos si todos los recursos de la categoria estan true, de ser asi actualizamos el estado de la categoria a true
                                                const findCategoryChecked =
                                                  permiso.resources.every(
                                                    (a: any) =>
                                                      getValues(
                                                        "resources"
                                                      )?.includes(a.value)
                                                  ) || false;

                                                if (findCategoryChecked) {
                                                  const mapCategorys =
                                                    categorys.map((cat) => {
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
                                                    });
                                                  setCategorys(mapCategorys);

                                                  //Validamos si todas las categorias estan true, de ser asi el checkAllCategorys sera true
                                                  const findTruesCategory =
                                                    mapCategorys.every(
                                                      (a) => a.checked
                                                    );
                                                  if (findTruesCategory) {
                                                    setCheckAllCategorys(true);
                                                  }
                                                }
                                              }
                                            }}
                                          />
                                          {resource.label}
                                        </label>
                                      );
                                    })}
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
          </form>
        </DialogContentBeta>
        <DialogActionsBeta>
          <Button
            size="small"
            className="text-default"
            variant="text"
            color="secondary"
            onClick={closeModal}
          >
            Cancelar
          </Button>
          <Button
            disabled={
              isLoadingEdit || isLoadingResources || !isDirty || !isValid
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

export default RolEdit;
