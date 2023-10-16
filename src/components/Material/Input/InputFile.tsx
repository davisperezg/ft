import { styled } from "@mui/material/styles";
import Button, { ButtonProps } from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { forwardRef, ForwardedRef } from "react";

const VisuallyHiddenInput = styled(TextField)({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface ExtendsProps extends ButtonProps {
  other: TextFieldProps;
}

const InputFile = forwardRef(
  (props: ExtendsProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        {...props}
      >
        {props.title}
        <VisuallyHiddenInput
          type="file"
          {...props.other}
          ref={ref}
          value={undefined}
        />
      </Button>
    );
  }
);

export default InputFile;
