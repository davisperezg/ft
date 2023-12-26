import { useContext, useMemo } from "react";
import { ModalContext } from "../../context/modalContext";
import { useEditResource } from "../../hooks/useResources";
import { SubmitHandler, useForm } from "react-hook-form";
import { IPermisos } from "../../interface/permisos.interface";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import { useGroups } from "../../hooks/useGroups";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import { DialogBeta } from "../Dialog/DialogBasic";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

interface Props {
  data: any;
  closeEdit: () => void;
}

const ResourceEdit = ({ data, closeEdit }: Props) => {
  const { dispatch, dialogState } = useContext(ModalContext);

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  const { mutateAsync: mutateResources, isLoading: isLoadingEdit } =
    useEditResource();

  //GETS
  const {
    data: dataGroups,
    isLoading: isLoadingGroups,
    error: errorGroups,
    isError: isErrorGroups,
  } = useGroups();

  const methods = useForm<IPermisos>({
    defaultValues: {
      name: data.name,
      description: data.description,
      key: data.key,
      group_resource: data.group_resource._id,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
  } = methods;

  const memoGroups = useMemo(() => {
    if (dataGroups && dataGroups.length > 0) {
      setValue("group_resource", data.group_resource._id);
      return dataGroups;
    }

    return [{ name: "[SELECCIONE CATEGORÍA]", _id: "null" }];
  }, [data.group_resource._id, dataGroups, setValue]);

  const onSubmit: SubmitHandler<IPermisos> = async (values) => {
    try {
      const response = await mutateResources({
        body: values,
        id: data._id as string,
      });

      toast.success(response.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
  };

  return (
    <>
      <DialogBeta open={dialogState.open && !dialogState.nameDialog}>
        <DialogTitleBeta>{`Permiso ${data.name}`}</DialogTitleBeta>
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

        <DialogContentBeta>
          <form className="ml-3">
            <div className="flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Categoría: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-2/3 flex flex-col">
                {isErrorGroups ? (
                  <span className="text-primary w-full">
                    {errorGroups.response.data.message}
                  </span>
                ) : (
                  <select
                    autoFocus
                    {...register("group_resource", {
                      required: {
                        value: true,
                        message: "Ingrese categoría",
                      },
                    })}
                    className={`border w-8/12 focus:outline-none pl-1 rounded-sm ${
                      errors.group_resource ? "border-primary" : ""
                    }`}
                  >
                    {isLoadingGroups ? (
                      <option>Cargando...</option>
                    ) : (
                      memoGroups.map((a) => {
                        return (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        );
                      })
                    )}
                  </select>
                )}

                {errors.group_resource && (
                  <span className="text-primary">
                    {errors.group_resource.message}
                  </span>
                )}
              </div>
            </div>

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
                <label>
                  Key: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-2/3 flex flex-col">
                <input
                  {...register("key", {
                    required: { value: true, message: "Ingrese key" },
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
                  className={`border w-8/12 focus:outline-none pl-1 rounded-sm ${
                    errors.key ? "border-primary" : ""
                  }`}
                />
                {errors.key && (
                  <span className="text-primary">{errors.key.message}</span>
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

export default ResourceEdit;
