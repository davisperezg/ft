import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ModalContext } from "../../context/modalContext";
import { useModules, useModulesAvailables } from "../../hooks/useModuleS";
import { usePostRol } from "../../hooks/useRoles";
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

const RolCreate = () => {
  const [value, setValue] = useState(1);
  const handleTab = (newValue: number) => setValue(newValue);
  const { dispatch } = useContext(ModalContext);

  const {
    mutateAsync,
    error: errorPost,
    isLoading: isLoadingPost,
    isError: isErrorPost,
  } = usePostRol();

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
    register,
    handleSubmit,
    setValue: setValueModel,
    formState: { errors },
    watch,
  } = useForm<IRol>({
    defaultValues: {
      name: "",
      description: "",
      module: [],
    },
  });

  const getModulos = watch("module") as string[];

  const onSubmit: SubmitHandler<IRol> = async (values) => {
    await mutateAsync({ rol: values });
    dispatch({ type: "INIT" });
  };

  const memoModulos = useMemo(() => {
    if (dataModules) {
      return dataModules;
    }

    return [];
  }, [dataModules]);

  const handleCheck = (values: string[]) => setValueModel("module", values);

  return (
    <>
      <DialogBasic height={450} width={550}>
        <DialogTitle>Nuevo Rol</DialogTitle>
        <DialogBody>
          <TabModal value={value} onChange={handleTab}>
            <TabModalItem value={1}>General</TabModalItem>
            <TabModalItem value={2}>Modulos</TabModalItem>
          </TabModal>
          <form>
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
      <ToastError
        placeholder={isErrorPost}
        message={errorPost?.response.data.message}
      />
    </>
  );
};

export default RolCreate;
