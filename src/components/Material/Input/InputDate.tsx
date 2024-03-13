import { forwardRef, ForwardedRef } from "react";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";

interface InputDatePicker extends DatePickerProps<any> {
  error?: boolean;
}

const InputDate = forwardRef(
  (props: InputDatePicker, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <LocalizationProvider adapterLocale="es" dateAdapter={AdapterDayjs}>
        <DatePicker
          sx={{
            "&.MuiFormControl-root": {
              width: "100%",
            },
            ".MuiInputBase-root": {
              height: "28px",
              outline: "none",
              //border: props.error ? "1px solid #d32f2f" : "none",
              border: "1px solid #e3e4e6",
            },
            ".MuiOutlinedInput-notchedOutline": {
              outline: "none",
              display: "none",
            },
            ".MuiInputBase-input": {
              padding: "4px 8px",
              minWidth: "43px",
              letterSpacing: "normal",
              fontSize: "14px",
              outline: "none",
              //color: "transparent",
            },
            ".MuiInputBase-input::placeholder": {
              //color: "transparent",
              //display: "none",
            },
            ".MuiInputLabel-root": {
              lineHeight: "2em",
              transform: "none",
              marginLeft: "8px",
            },
            ".MuiFormHelperText-root": {
              marginLeft: 0,
            },
            ".Mui-disabled": {
              cursor: "not-allowed",
            },
          }}
          {...props}
          ref={ref}
          //format="YYYY-MM-DD"
        />
      </LocalizationProvider>
    );
  }
);

export default InputDate;
