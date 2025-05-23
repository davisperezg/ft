import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ModalContext } from "../../../store/context/dialogContext";
import { useModulesAvailables } from "../../Modulos/hooks/useModuleS";
import { usePostRol } from "../hooks/useRoles";
import { isError } from "../../../utils/functions.utils";
import TabsModal from "../../../components/Material/Tabs/TabsModal";
import TabModal from "../../../components/Material/Tab/TabModal";
import TabModalPanel from "../../../components/Material/Tab/TabModalPanel";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { yupResolver } from "@hookform/resolvers/yup";
import InputCheckBox from "../../../components/Material/Input/InputCheckBox";
import { IRol } from "../../../interfaces/models/rol/rol.interface";
import { schemaFormRol } from "../validations/rol.schema";
import { FORM_INITIAL_ROL } from "../../../config/constants";

const RolCreate = () => {
  const [value, setValue] = useState(0);
  const { dispatch, dialogState } = useContext(ModalContext);
  const { mutateAsync, isPending: isLoadingPost } = usePostRol();

  const {
    data: dataModules,
    error: errorModules,
    isLoading: isLoadingModules,
  } = useModulesAvailables();

  const methods = useForm<IRol>({
    defaultValues: FORM_INITIAL_ROL,
    resolver: yupResolver(schemaFormRol),
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = methods;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onSubmit: SubmitHandler<IRol> = async (values) => {
    try {
      const response = await mutateAsync(values);
      dispatch({ type: "INIT" });
      toast.success(response.message);
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  const memoModulos = useMemo(() => {
    if (dataModules) {
      return dataModules;
    }

    return [];
  }, [dataModules]);

  return (
    <>
      <DialogBeta open={dialogState.open}>
        <DialogTitleBeta>Nuevo rol</DialogTitleBeta>
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
          <TabModal label="Modulos" index={1} />
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
                      errors.name ? "border-primary" : ""
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
                      errors.description ? "border-primary" : ""
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
                <strong>Modulos disponibles</strong>
              </div>

              {isLoadingModules ? (
                <span>Cargando modulos...</span>
              ) : errorModules ? (
                <span className="text-red-500 w-full">
                  {errorModules.response.data.message}
                </span>
              ) : (
                <div className="flex">
                  <div className="w-1/3 flex flex-col">
                    <Controller
                      control={control}
                      name={`module`}
                      render={({ field }) => (
                        <>
                          {memoModulos.map((modulo) => {
                            return (
                              <label
                                key={modulo.value}
                                className="cursor-pointer flex gap-2"
                              >
                                <InputCheckBox
                                  checked={field.value.includes(modulo.value)}
                                  onChange={() => {
                                    const modulos = field.value;
                                    const index = modulos.indexOf(modulo.value);
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
            disabled={isLoadingPost || !isDirty || !isValid}
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

export default RolCreate;
