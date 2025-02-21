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
            height: "31px",
            //border: props.error ? "1px solid #d32f2f" : "none",
          },
          ".MuiInputBase-input": {
            padding: "6px 8px",
            minWidth: "43px",
            letterSpacing: "normal",
            fontSize: "14px",
          },
          ".MuiFormHelperText-root": {
            marginLeft: 0,
          },
          ".MuiFormHelperText-root.Mui-error": {
            color: "#FF0000",
          },
          ".Mui-disabled": {
            cursor: "not-allowed",
          },
          ".MuiFilledInput-root": {
            backgroundColor: "#fff",
            border: props.error ? "1px solid #d32f2f" : "1px solid #E3E4E6",
          },
          ".MuiFilledInput-root:hover": {
            border: props.error ? "1px solid #d32f2f" : "1px solid #B4B4B4",
            backgroundColor: "#fff",
          },
          ".MuiFilledInput-root-focused": {
            backgroundColor: "#fff",
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
