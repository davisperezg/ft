import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";
import { forwardRef } from "react";
import Button from "@mui/material/Button";
import InputText from "../../../../components/Material/Input/InputText";
import { Control, Controller } from "react-hook-form";

interface Props {
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
}: Props) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogContent>
        <div className="flex gap-6">
          <div className="w-[300px]">
            <Controller
              control={control}
              name="observacion"
              render={({ field }) => (
                <InputText
                  {...field}
                  hiddenLabel
                  variant="filled"
                  placeholder="Observación o nota"
                />
              )}
            />
          </div>
          <Button variant="contained" onClick={() => agregarObservacion()}>
            Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalObservacion;
