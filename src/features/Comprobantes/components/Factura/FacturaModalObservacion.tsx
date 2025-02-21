import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";
import { forwardRef } from "react";
import Button from "@mui/material/Button";
import InputText from "../../../../components/Material/Input/InputText";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { IFeatureInvoice } from "../../../../interfaces/features/invoices/invoice.interface";

interface Props {
  errors: FieldErrors<IFeatureInvoice>;
  open: boolean;
  handleClose: () => void;
  control: Control<any, any>;
  agregarObservacion: () => void;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ModalObservacion = ({
  open,
  handleClose,
  control,
  agregarObservacion,
  errors,
}: Props) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      className="relative"
    >
      <DialogContent>
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <div className="w-[300px]">
              <Controller
                control={control}
                name="observacion"
                render={({ field }) => (
                  <InputText
                    {...field}
                    hiddenLabel
                    error={!!errors.observacion}
                    helperText={errors.observacion?.message}
                    variant="filled"
                    placeholder="Observación o nota"
                    autoComplete="off"
                  />
                )}
              />
            </div>
            <Button
              className="h-[33px]"
              variant="contained"
              onClick={agregarObservacion}
            >
              Agregar
            </Button>
          </div>
          <div className="w-full">
            <Button
              className="w-full"
              variant="contained"
              color="error"
              onClick={handleClose}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalObservacion;
