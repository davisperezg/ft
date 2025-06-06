import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { ModalContext } from "../../../store/context/dialogContext";
import { useContext } from "react";
import { isError } from "../../../utils/functions.utils";
import { toast } from "sonner";
import { usePostTipDoc } from "../hooks/useTipoDocs";
import { DialogTitleBeta } from "../../../components/common/Dialogs/_DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { DialogContentBeta } from "../../../components/common/Dialogs/_DialogContent";
import { DialogBeta } from "../../../components/common/Dialogs/DialogBasic";
import { DialogActionsBeta } from "../../../components/common/Dialogs/_DialogActions";
import Button from "@mui/material/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  TypeFormTypeDocCpe,
  schemaFormTypeDocCpe,
} from "../validations/type-doc-cps.schema";
import { IFormCPEType } from "../../../interfaces/forms/type-doc-cpe/type-doc-cpe.interface";

const TipoDocsCreate = () => {
  const { dispatch, dialogState } = useContext(ModalContext);

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty, isValid },
  } = useForm<IFormCPEType>({
    defaultValues: {
      nombre: "",
      abreviado: "",
      codigo: "",
    },
    resolver: yupResolver(schemaFormTypeDocCpe) as Resolver<TypeFormTypeDocCpe>,
  });

  const { mutateAsync: mutateTipoDoc, isPending: isLoadingTipoDoc } =
    usePostTipDoc();

  const onSubmit: SubmitHandler<IFormCPEType> = async (values) => {
    try {
      const response = await mutateTipoDoc(values);
      dispatch({ type: "INIT" });
      toast.success(response.message);
    } catch (e) {
      if (isError(e)) {
        toast.error(e.response.data.message);
      }
    }
  };

  return (
    <>
      <DialogBeta open={dialogState.open}>
        <DialogTitleBeta>Nuevo Tipo de documento</DialogTitleBeta>
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
                  Nombre: <strong className="text-danger">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("nombre")}
                  type="text"
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.nombre ? "border-danger" : ""
                  }`}
                />
                {errors.nombre && (
                  <span className="text-danger">{errors.nombre.message}</span>
                )}
              </div>
            </div>
            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Abreviado: <strong className="text-danger">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("abreviado")}
                  type="text"
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.abreviado ? "border-danger" : ""
                  }`}
                />
                {errors.abreviado && (
                  <span className="text-danger">
                    {errors.abreviado.message}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full flex flex-row mt-3">
              <div className="w-1/3">
                <label>
                  Código: <strong className="text-danger">*</strong>
                </label>
              </div>
              <div className="w-1/3">
                <input
                  {...register("codigo")}
                  type="text"
                  className={`border w-full focus:outline-none pl-1 rounded-sm ${
                    errors.codigo ? "border-danger" : ""
                  }`}
                />
                {errors.codigo && (
                  <span className="text-danger">{errors.codigo.message}</span>
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
            onClick={() => dispatch({ type: "INIT" })}
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

export default TipoDocsCreate;
