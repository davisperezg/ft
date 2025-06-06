import { useMemo } from "react";
import { useEditResource } from "../hooks/useResources";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { isError } from "../../../utils/functions.utils";
import { useGroups } from "../../Grupos/Permisos/hooks/useGroups";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import { IPermisos } from "../../../interfaces/models/permisos/permisos.interface";

interface Props {
  state: {
    visible: boolean;
    row: any;
  };
  closeEdit: () => void;
}

const ResourceEdit = ({ state, closeEdit }: Props) => {
  const closeModal = () => {
    closeEdit();
  };

  const { mutateAsync: mutateResources, isPending: isLoadingEdit } =
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
      name: state.row.name,
      description: state.row.description,
      key: state.row.key,
      group_resource: state.row.group_resource._id,
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
      setValue("group_resource", state.row.group_resource._id);
      return dataGroups;
    }

    return [{ name: "[SELECCIONE CATEGORÍA]", _id: "null" }];
  }, [state.row.group_resource._id, dataGroups, setValue]);

  const onSubmit: SubmitHandler<IPermisos> = async (values) => {
    try {
      const response = await mutateResources({
        body: values,
        id: state.row._id as string,
      });

      toast.success(response.message);
      closeModal();
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  return (
    <>
      <DialogBeta open={state.visible}>
        <DialogTitleBeta>{`Permiso ${state.row.name}`}</DialogTitleBeta>
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
                  Categoría: <strong className="text-danger">*</strong>
                </label>
              </div>
              <div className="w-2/3 flex flex-col">
                {isErrorGroups ? (
                  <span className="text-danger w-full">
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
                  <span className="text-danger">
                    {errors.group_resource.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Nombre: <strong className="text-danger">*</strong>
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
                  <span className="text-danger">{errors.name.message}</span>
                )}
              </div>
            </div>

            <div className="flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Key: <strong className="text-danger">*</strong>
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
                  <span className="text-danger">{errors.key.message}</span>
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
                  <span className="text-danger">
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
            className="text-default"
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
