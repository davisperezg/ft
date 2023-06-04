import { ModalContext } from "../../context/modalContext";
import { usePostResources } from "../../hooks/useResources";
import DialogBasic from "../Dialog/DialogBasic";
import DialogBody from "../Dialog/DialogBody";
import DialogTitle from "../Dialog/DialogTitle";
import { useContext, useMemo } from "react";
import { useGroups } from "../../hooks/useGroups";
import { IPermisos } from "../../interface/permisos..interface";
import { SubmitHandler, useForm } from "react-hook-form";
import DialogButtons from "../Dialog/DialogButtons";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";

const ResourceCreate = () => {
  const { dispatch } = useContext(ModalContext);

  const { mutateAsync, isLoading: isLoadingPost } = usePostResources();

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
  } = useForm<IPermisos>({
    defaultValues: {
      name: "",
      description: "",
      key: "",
      group_resource: memoGroups[0]._id as string,
    },
  });

  const onSubmit: SubmitHandler<IPermisos> = async (values) => {
    try {
      const response = await mutateAsync(values);
      dispatch({ type: "INIT" });
      toast.success(response.message);
    } catch (e) {
      if (isError(e)) {
        toastError(e.response.data.message);
      }
    }
  };

  return (
    <>
      <DialogBasic>
        <DialogTitle>Nuevo Permiso</DialogTitle>
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
                      message: "Ingrese grupo",
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
            onClick={() => dispatch({ type: "INIT" })}
            className="min-w-[84px] min-h-[24px] mr-[8px] text-[#066397] cursor-pointer bg-transparent border border-solid rounded-md"
          >
            Cancelar
          </button>
          <button
            disabled={isLoadingPost}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className={`min-w-[84px] min-h-[24px] text-white cursor-pointer  border border-solid rounded-md ${
              isLoadingPost ? "bg-red-500" : "bg-primary"
            }`}
          >
            OK
          </button>
        </DialogButtons>
      </DialogBasic>
    </>
  );
};

export default ResourceCreate;
