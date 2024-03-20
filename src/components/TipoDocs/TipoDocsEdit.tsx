import { SubmitHandler, useForm } from "react-hook-form";
import { ModalContext } from "../../context/modalContext";
import { useContext } from "react";
import { ITipoDoc } from "../../interface/tipodocs.interface";
import { useEditTipDoc } from "../../hooks/useTipoDocs";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import { toastError } from "../Toast/ToastNotify";
import Button from "@mui/material/Button";
import { DialogContentBeta } from "../Dialog/_DialogContent";
import { DialogBeta } from "../Dialog/DialogBasic";
import { DialogActionsBeta } from "../Dialog/_DialogActions";
import { DialogTitleBeta } from "../Dialog/_DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  data: ITipoDoc;
  closeEdit: () => void;
}

const TipoDocsEdit = ({ data, closeEdit }: Props) => {
  const { dispatch, dialogState } = useContext(ModalContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<ITipoDoc>({
    defaultValues: {
      nombre: data.nombre,
      abreviado: data.abreviado,
      codigo: data.codigo,
    },
  });

  const closeModal = () => {
    closeEdit();
    dispatch({ type: "INIT" });
  };

  const { mutateAsync: mutateTipoDoc, isPending: isLoadingTipoDoc } =
    useEditTipDoc();

  const onSubmit: SubmitHandler<ITipoDoc> = async (values) => {
    try {
      const response = await mutateTipoDoc({
        body: values,
        id: data.id as number,
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
        <DialogTitleBeta>Editar {data.nombre}</DialogTitleBeta>
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

        <DialogContentBeta>
          <form className="ml-3">
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
                  <span className="text-primary">{errors.nombre.message}</span>
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
                  <span className="text-primary">{errors.codigo.message}</span>
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
            disabled={!isDirty || !isValid || isLoadingTipoDoc}
            onClick={handleSubmit(onSubmit)}
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

export default TipoDocsEdit;
