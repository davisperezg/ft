import { SelectOption } from "../../common/select.interface";

export interface IFormSelectOption
  extends Omit<SelectOption, "value" | "label" | "disabled"> {
  value: string | undefined;
  label: string | undefined;
}
