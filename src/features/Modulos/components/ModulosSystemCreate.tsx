import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ModalContext } from "../../../store/context/dialogContext";
import { useMenus } from "../../Recursos/hooks/useMenus";
import { usePostModule } from "../hooks/useModuleS";
import { IModulosSystem } from "../../../interfaces/features/modulo/modulo_system.interface";
import { isError } from "../../../utils/functions.utils";
import TabsModal from "../../../components/Material/Tabs/TabsModal";
import TabModal from "../../../components/Material/Tab/TabModal";
import TabModalPanel from "../../../components/Material/Tab/TabModalPanel";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import InputCheckBox from "../../../components/Material/Input/InputCheckBox";
import { yupResolver } from "@hookform/resolvers/yup";
import { IMenuSystem } from "../../../interfaces/features/recurso/menu_system.interface";
import { FORM_INITIAL_MODULO } from "../../../config/constants";
import { schemaFormModulo } from "../validations/modulo.schema";

const ModulosSystemCreate = () => {
  const { dispatch, dialogState } = useContext(ModalContext);

  const {
    data: dataMenus,
    error: errorMenu,
    isLoading: isLoadingMenu,
  } = useMenus();

  const methods = useForm<IModulosSystem>({
    defaultValues: FORM_INITIAL_MODULO,
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

  const { mutateAsync, isPending: isLoadingPost } = usePostModule();

  const memoMenus = useMemo(() => {
    if (dataMenus) {
      return dataMenus;
    }

    return [];
  }, [dataMenus]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onSubmit: SubmitHandler<IModulosSystem> = async (data) => {
    try {
      const responde = await mutateAsync(data);
      dispatch({ type: "INIT" });
      toast.success(responde.message);
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  return (
    <>
      <DialogBeta open={dialogState.open}>
        <DialogTitleBeta>Nuevo Modulo</DialogTitleBeta>
        <IconButton
          aria-label="close"
          onClick={() => dispatch({ type: "INIT" })}
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
          <TabModal label="Menu" index={1} />
        </TabsModal>

        <DialogContentBeta>
          <form>
            <TabModalPanel value={value} index={0}>
              <div className="flex flex-row">
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
            className="text-default"
            variant="text"
            color="secondary"
            onClick={() => dispatch({ type: "INIT" })}
          >
            Cancelar
          </Button>
          <Button
            disabled={!isDirty || !isValid || isLoadingPost}
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

export default ModulosSystemCreate;
