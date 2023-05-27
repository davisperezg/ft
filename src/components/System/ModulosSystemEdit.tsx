import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ModalContext } from "../../context/modalContext";
import { useMenus } from "../../hooks/useMenus";
import { useEditModule } from "../../hooks/useModuleS";
import { IModulosSystem } from "../../interface/modulo_system.interface";
import { MOD_PRINCIPAL } from "../../utils/const";
import DialogBasic from "../Dialog/DialogBasic";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import CheckBoxItem from "../Input/CheckBoxItem";
import TabModal from "../Tab/Modal/TabModal";
import TabModalItem from "../Tab/Modal/TabModalItem";
import TabModalPanel from "../Tab/Modal/TabModalPanel";
import ToastError from "../Toast/ToastError";

interface Props {
  data?: any;
  closeEdit: () => void;
}

const ModulosSystemEdit = ({ data, closeEdit }: Props) => {
  const { dispatch } = useContext(ModalContext);

  const {
    data: dataMenus,
    error: errorMenu,
    isLoading: isLoadingMenu,
  } = useMenus();

  const {
    register,
    handleSubmit,
    setValue: setValueModel,
    formState: { errors },
    watch,
  } = useForm<IModulosSystem>({
    defaultValues: {
      name: data.name,
      description: data.description,
      menu: data.menu.map((a: any) => a._id),
    },
  });

  const [value, setValue] = useState(1);

  const getMenus = watch("menu") as string[];

  const memoMenus = useMemo(() => {
    if (dataMenus) {
      const list = dataMenus.map((a) => {
        return {
          label: a.name,
          value: a._id as string,
        };
      });

      return list;
    }

    return [];
  }, [dataMenus]);

  const handleTab = (newValue: number) => setValue(newValue);

  const handleCheck = (values: string[]) => setValueModel("menu", values);

  const {
    mutateAsync,
    error: errorEdit,
    isLoading: isLoadingEdit,
  } = useEditModule();

  const onSubmit: SubmitHandler<IModulosSystem> = async (values) => {
    await mutateAsync({ body: values, id: data._id as string });
    closeModal();
  };

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  return (
    <>
      <DialogBasic height={450} width={550} handleClose={closeEdit}>
        <DialogTitle>{`Modulo ${data.name}`}</DialogTitle>
        <DialogBody>
          <TabModal value={value} onChange={handleTab}>
            <TabModalItem value={1}>General</TabModalItem>
            <TabModalItem value={2}>Menu</TabModalItem>
          </TabModal>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                <strong>Menus disponibles</strong>
                {getMenus.length === 0 && (
                  <span className="text-primary">
                    Seleccione mínimo 1 menu disponible
                  </span>
                )}
              </div>

              {errorMenu ? (
                <label>{errorMenu.response.data.message}</label>
              ) : (
                <></>
              )}
              {isLoadingMenu ? (
                <span>Cargando menus...</span>
              ) : (
                <div className="flex mt-3">
                  <div className="w-1/3 flex flex-col">
                    <CheckBoxItem
                      options={memoMenus}
                      values={getMenus}
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
            type="button"
            onClick={closeModal}
            className="min-w-[84px] min-h-[24px] mr-[8px] text-[#066397] cursor-pointer bg-transparent border border-solid rounded-md"
          >
            Cancelar
          </button>
          <button
            disabled={isLoadingEdit}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className={`min-w-[84px] min-h-[24px] text-white cursor-pointer  border border-solid rounded-md ${
              isLoadingEdit ? "bg-red-500" : "bg-primary"
            }`}
          >
            OK
          </button>
        </DialogButtons>
      </DialogBasic>

      <ToastError
        className={`${
          errorEdit
            ? "opacity-[1] transform-none"
            : "opacity-0 translate-y-[20px]"
        }`}
        placeholder={errorEdit ? true : false}
        message={errorEdit?.response.data.message}
      />
    </>
  );
};

export default ModulosSystemEdit;
