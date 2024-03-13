import TextField, { TextFieldProps } from "@mui/material/TextField";
import { forwardRef, ForwardedRef } from "react";
import { FilledInputProps } from "@mui/material/FilledInput";

const InputText = forwardRef(
  (props: TextFieldProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <TextField
        sx={{
          "&.MuiFormControl-root": {
            width: "100%",
          },
          ".MuiInputBase-root": {
            height: "28px",
            border: props.error ? "1px solid #d32f2f" : "none",
          },
          ".MuiInputBase-input": {
            padding: "4px 8px",
            minWidth: "43px",
            letterSpacing: "normal",
            fontSize: "14px",
          },
          ".MuiFormHelperText-root": {
            marginLeft: 0,
          },
          ".Mui-disabled": {
            cursor: "not-allowed",
          },
        }}
        InputProps={
          {
            disableUnderline: true,
            className: "rounded-bl-[4px] rounded-br-[4px]",
          } as Partial<FilledInputProps>
        }
        {...props}
        ref={ref}
        hiddenLabel
      />
    );
  }
);

export default InputText;
