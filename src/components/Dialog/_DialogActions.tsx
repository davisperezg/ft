import DialogActions, { DialogActionsProps } from "@mui/material/DialogActions";

export const DialogActionsBeta = (props: DialogActionsProps) => {
  const { children } = props;
  return (
    <DialogActions className="bg-white" {...props}>
      {children}
    </DialogActions>
  );
};
