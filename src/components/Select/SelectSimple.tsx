import Select, { Props, GroupBase } from "react-select";
import { forwardRef } from "react";
//https://stackoverflow.com/questions/73678700/react-select-typescript-not-working-properly-when-i-substitute-select-with-a-com
//https://codesandbox.io/s/react-typescript-forked-q3z9mv?file=/src/CustomSelect.tsx:1398-1405

type IOption = {
  value: number;
  label: string;
  text?: string;
  disabled?: boolean;
};

type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Props<Option, IsMulti, Group> & {
  error?: boolean;
  helperText?: string;
};

export const SelectSimple = forwardRef(
  <
    IsMulti extends boolean = false,
    Group extends GroupBase<IOption> = GroupBase<IOption>
  >(
    props: SelectProps<IOption, IsMulti, Group>,
    ref: any
  ) => {
    return (
      <>
        <Select
          {...props}
          ref={ref}
          theme={(theme) => ({ ...theme })}
          classNames={{
            control: (state) =>
              state.isFocused
                ? `${
                    props.error ? "!border-[#d32f2f]" : "!border-inherit"
                  } !min-h-[28px] !shadow-none !pl-1 !cursor-pointer`
                : `!cursor-pointer !min-h-[28px] ${
                    props.error ? "!border-[#d32f2f]" : "!border-inherit"
                  } !w-full !focus:outline-none !pl-1 !rounded-[4px] text-[14px]`,
            valueContainer: () => "!p-0 !m-0",
            option: () => "!p-0 !m-0 !pl-1",
            input: () => "!p-0 !m-0",
            indicatorsContainer: () => "!p-0 !m-0",
            loadingIndicator: () => "!p-0 !text-[4px]",
            dropdownIndicator: () => "!p-0 !m-0",
            menu: () => "mt-[5px]",
            menuList: () => "!p-0",
          }}
        />
        {props.error && <p className="text-[#d32f2f]">{props.helperText}</p>}
      </>
    );
  }
);
