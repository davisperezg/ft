import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { ModalContext } from "../../context/modalContext";
import { useMenus } from "../../hooks/useMenus";
import { useEditModule } from "../../hooks/useModuleS";
import { IModulosSystem } from "../../interface/modulo_system.interface";
import { isError } from "../../utils/functions";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import { DialogBeta } from "../Dialog/DialogBasic";
import { toastError } from "../Toast/ToastNotify";
import TabsModal from "../Material/Tabs/TabsModal";
import TabModal from "../Material/Tab/TabModal";
import TabModalPanel from "../Material/Tab/TabModalPanel";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { FORM_INITIAL_MODULO } from "../../utils/initials";
import Button from "@mui/material/Button";
import InputCheckBox from "../Material/Input/InputCheckBox";
import { yupResolver } from "@hookform/resolvers/yup";
import { schemaFormModulo } from "../../utils/yup_validations";
import { IMenuSystem } from "../../interface/menu_system.interface";

interface Props {
  data?: any;
  closeEdit: () => void;
}

const ModulosSystemEdit = ({ data, closeEdit }: Props) => {
  const { dispatch, dialogState } = useContext(ModalContext);

  const {
    data: dataMenus,
    error: errorMenu,
    isLoading: isLoadingMenu,
  } = useMenus();

  const methods = useForm<IModulosSystem>({
    defaultValues: FORM_INITIAL_MODULO,
    values: {
      name: data.name,
      description: data.description,
      menu: data.menu.map((a: any) => a._id),
    },
    resolver: yupResolver(schemaFormModulo),
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = methods;

  const [value, setValue] = useState(0);

  const memoMenus = useMemo(() => {
    if (dataMenus) {
      return dataMenus;
    }

    return [];
  }, [dataMenus]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { mutateAsync, isLoading: isLoadingEdit } = useEditModule();

  const onSubmit: SubmitHandler<IModulosSystem> = async (values) => {
    try {
      const response = await mutateAsync({
        body: values,
        id: data._id as string,
      });
      closeModal();
      toast.success(response.message);
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
  };

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  return (
    <>
      <DialogBeta open={dialogState.open && !dialogState.nameDialog}>
        <DialogTitleBeta>{`Modulo ${data.name}`}</DialogTitleBeta>
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
          <TabModal label="Menus" index={1} />
        </TabsModal>

        <DialogContentBeta>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TabModalPanel value={value} index={0}>
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
            <TabModalPanel value={value} index={1}>
              <div className="flex flex-col">
                <strong>Menus disponibles</strong>
              </div>

              {isLoadingMenu ? (
                <span>Cargando menus...</span>
              ) : errorMenu ? (
                <span className="text-red-500 w-full">
                  {errorMenu.response.data.message}
                </span>
              ) : (
                <div className="flex">
                  <div className="grid grid-cols-[repeat(5,_1fr)] gap-[5px] w-full">
                    <Controller
                      control={control}
                      name="menu"
                      render={({ field }) => (
                        <>
                          {memoMenus.map((menu: IMenuSystem) => {
                            const values = field.value as string[];
                            return (
                              <label
                                key={menu._id}
                                className="cursor-pointer flex gap-2 select-none"
                              >
                                <InputCheckBox
                                  checked={values.includes(String(menu._id))}
                                  onChange={() => {
                                    const menus = values ?? [];
                                    const index = menus.indexOf(
                                      String(menu._id)
                                    );
                                    if (index === -1) {
                                      // Si no está presente, agrégalo
                                      field.onChange([...menus, menu._id]);
                                    } else {
                                      // Si está presente, quítalo
                                      field.onChange(
                                        menus.filter(
                                          (menuValue) => menuValue !== menu._id
                                        )
                                      );
                                    }
                                  }}
                                />
                                {menu.name}
                              </label>
                            );
                          })}
                        </>
                      )}
                    />
                  </div>
                </div>
              )}
            </TabModalPanel>
          </form>
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
            disabled={isLoadingEdit || !isDirty || !isValid}
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

export default ModulosSystemEdit;
