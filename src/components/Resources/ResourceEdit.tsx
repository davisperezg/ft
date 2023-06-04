import DialogBasic from "../Dialog/DialogBasic";
import { useEffect, useContext, useMemo } from "react";
import DialogTitle from "../Dialog/DialogTitle";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import { ModalContext } from "../../context/modalContext";
import { useEditResource } from "../../hooks/useResources";
import { SubmitHandler, useForm } from "react-hook-form";
import { IPermisos } from "../../interface/permisos..interface";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import { useGroups } from "../../hooks/useGroups";

interface Props {
  data: any;
  closeEdit: () => void;
}

interface FormValues extends IPermisos {}

const ResourceEdit = ({ data, closeEdit }: Props) => {
  const { dispatch } = useContext(ModalContext);

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

  const memoGroups = useMemo(() => {
    if (dataGroups && dataGroups.length > 0) {
      return dataGroups;
    }

    return [{ name: "[SELECCIONE CATEGORÍA]", _id: "null" }];
  }, [dataGroups]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: data.name,
      description: data.description,
      key: data.key,
      group_resource: data.group_resource._id,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
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

  useEffect(() => {
    if (memoGroups.length > 0) {
      setValue("group_resource", data.group_resource._id);
    }
  }, [data, memoGroups]);

  return (
    <>
      <DialogBasic handleClose={closeEdit}>
        <DialogTitle>{`Permiso - ${data.name}`}</DialogTitle>
        <DialogBody>
          <form className="overflow-y-auto flex-[1_0_calc(100%-78px)]">
            <div className="flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Categoría: <strong className="text-primary">*</strong>
                </label>
              </div>
              <div className="w-2/3 flex flex-col">
                <select
                  autoFocus
                  {...register("group_resource", {
                    required: {
                      value: true,
                      message: "Ingrese categoría",
                    },
                  })}
                  className={`border w-8/12 focus:outline-none pl-1 rounded-sm ${
                    errors.group_resource || isErrorGroups
                      ? "border-primary"
                      : ""
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
                {errors.group_resource && (
                  <span className="text-primary">
                    {errors.group_resource.message}
                  </span>
                )}

                {isErrorGroups && (
                  <span className="text-primary">
                    {errorGroups.response.data.message}
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
    </>
  );
};

export default ResourceEdit;
