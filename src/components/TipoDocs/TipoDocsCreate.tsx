import { SubmitHandler, useForm } from "react-hook-form";
import { ModalContext } from "../../context/modalContext";
import DialogBasic from "../Dialog/DialogBasic";
import DialogBody from "../Dialog/DialogBody";
import DialogButtons from "../Dialog/DialogButtons";
import DialogTitle from "../Dialog/DialogTitle";
import TabModal from "../Tab/Modal/TabModal";
import TabModalItem from "../Tab/Modal/TabModalItem";
import TabModalPanel from "../Tab/Modal/TabModalPanel";
import { useContext, useMemo, useState } from "react";
import { ITipoDoc } from "../../interface/tipodocs.interface";
import { isError } from "../../utils/functions";
import { toast } from "react-toastify";
import { toastError } from "../Toast/ToastNotify";
import { usePostTipDoc } from "../../hooks/useTipoDocs";

const TipoDocsCreate = () => {
  const [value, setValue] = useState(1);
  const { dispatch } = useContext(ModalContext);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ITipoDoc>({
    defaultValues: {
      nombre: "",
      abreviado: "",
      codigo: "",
    },
  });

  const { mutateAsync: mutateTipoDoc, isLoading: isLoadingTipoDoc } =
    usePostTipDoc();

  const onSubmit: SubmitHandler<ITipoDoc> = async (values) => {
    try {
      const response = await mutateTipoDoc(values);
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
      <DialogBasic height={450} width={550}>
        <DialogTitle>Nuevo Tipo de documento</DialogTitle>
        <DialogBody>
          <form>
            <TabModalPanel value={value} index={1}>
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Nombre: <strong className="text-primary">*</strong>
                  </label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register("nombre", {
                      required: {
                        value: true,
                        message: "Ingrese nombre",
                      },
                    })}
                    type="text"
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors.nombre ? "border-primary" : ""
                    }`}
                  />
                  {errors.nombre && (
                    <span className="text-primary">
                      {errors.nombre.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Abreviado: <strong className="text-primary">*</strong>
                  </label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register("abreviado", {
                      required: {
                        value: true,
                        message: "Ingrese abreviado",
                      },
                    })}
                    type="text"
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors.abreviado ? "border-primary" : ""
                    }`}
                  />
                  {errors.abreviado && (
                    <span className="text-primary">
                      {errors.abreviado.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full flex flex-row mt-3">
                <div className="w-1/3">
                  <label>
                    Código: <strong className="text-primary">*</strong>
                  </label>
                </div>
                <div className="w-1/3">
                  <input
                    {...register("codigo", {
                      required: {
                        value: true,
                        message: "Ingrese codigo",
                      },
                    })}
                    type="text"
                    className={`border w-full focus:outline-none pl-1 rounded-sm ${
                      errors.codigo ? "border-primary" : ""
                    }`}
                  />
                  {errors.codigo && (
                    <span className="text-primary">
                      {errors.codigo.message}
                    </span>
                  )}
                </div>
              </div>
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
            onClick={handleSubmit(onSubmit)}
            className={`min-w-[84px] min-h-[24px] text-white cursor-pointer  border border-solid rounded-md ${
              isLoadingTipoDoc ? "bg-red-500" : "bg-primary"
            }`}
          >
            OK
          </button>
        </DialogButtons>
      </DialogBasic>
    </>
  );
};

export default TipoDocsCreate;
