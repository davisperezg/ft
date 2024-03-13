import { Button, ButtonProps } from "@mui/material";

const ButtonSimple = (props: ButtonProps) => {
  const { children } = props;
  return (
    <Button
      variant="outlined"
      color="secondary"
      {...props}
      sx={{
        borderRadius: 0,
        padding: 0,
        paddingX: 2,
        border: "none",
      }}
    >
      {children}
    </Button>
  );
};

export default ButtonSimple;
