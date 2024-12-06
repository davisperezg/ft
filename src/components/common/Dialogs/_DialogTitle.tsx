import DialogTitle, { DialogTitleProps } from "@mui/material/DialogTitle";

export const DialogTitleBeta = (props: DialogTitleProps) => {
  const { children } = props;

  return (
    <DialogTitle
      sx={{
        cursor: "move",
        backgroundColor: "#5A626F",
        color: "#fff",
        padding: "5px 10px",
        fontSize: "16px",
        letterSpacing: "normal",
      }}
      {...props}
    >
      {children}
    </DialogTitle>
  );
};
