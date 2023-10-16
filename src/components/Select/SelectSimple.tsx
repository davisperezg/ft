/* eslint-disable @typescript-eslint/no-explicit-any */
import Select, { Props, GroupBase } from "react-select";
import { forwardRef } from "react";

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
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
  >(
    props: SelectProps<Option, IsMulti, Group>,
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
                  } !min-h-[28px] !shadow-none !pl-1`
                : `!min-h-[28px] ${
                    props.error ? "!border-[#d32f2f]" : "!border-inherit"
                  } !w-full !focus:outline-none !pl-1 !rounded-[4px] text-[14px]`,
            valueContainer: () => "!p-0 !m-0",
            option: () => "!p-0 !m-0 !pl-1",
            input: () => "!p-0 !m-0",
            indicatorsContainer: () => "!p-0 !m-0 !h-[18px]",
            loadingIndicator: () => "!p-0",
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
