import DialogContent, { DialogContentProps } from "@mui/material/DialogContent";

export const DialogContentBeta = (props: DialogContentProps) => {
  const { children } = props;

  return (
    <DialogContent
      dividers
      sx={{
        backgroundColor: "#fff",
        borderBottom: "0px",
        padding: 0,
      }}
      {...props}
    >
      {children}
    </DialogContent>
  );
};
